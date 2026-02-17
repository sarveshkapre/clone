#!/usr/bin/env python3
"""Clone Control Plane

Local-first monitoring web app for Clone runs.
- No auth by default (single-machine operator tool)
- Cross-platform (Python stdlib + git)
- Live updates over Server-Sent Events (SSE)
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import shutil
import signal
import subprocess
import sys
import threading
import time
from collections import deque
from dataclasses import dataclass
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError


RUN_STATUS_PATTERN = re.compile(r"run-(\d{8}-\d{6})-status\.txt$")
CYCLE_PATTERN = re.compile(r"^--- Cycle (\d+) ---$")
REPO_FIELD_PATTERN = re.compile(r"\brepo=([^ ]+)")
REASON_FIELD_PATTERN = re.compile(r"\breason=([^ ]+)")
CYCLE_QUEUE_PATTERN = re.compile(
    r"^CYCLE_QUEUE cycle=(\d+) repos_seen=(\d+) spawned=(\d+) skipped_lock=(\d+)$"
)
LOCK_SWEEP_PATTERN = re.compile(r"^LOCK_SWEEP cycle=(\d+) cleared=(\d+)$")
NO_WORKERS_PATTERN = re.compile(r"^NO_WORKERS cycle=(\d+)$")
COMMIT_LINE_PATTERN = re.compile(r"^\[[^\]]+ ([0-9a-f]{7,40})\] (.+)$")
SEVERITY_RANK = {
    "ok": 0,
    "info": 1,
    "warn": 2,
    "critical": 3,
}
NOTIFIABLE_ALERT_IDS = [
    "run_stalled",
    "lock_contention",
    "no_workers_cycle",
    "no_commits_long_run",
    "duplicate_loop_groups",
    "healthy",
]
DEFAULT_ENABLED_ALERT_IDS = [alert_id for alert_id in NOTIFIABLE_ALERT_IDS if alert_id != "healthy"]
AGENT_ALLOWED_ALERT_IDS = [
    "run_stalled",
    "lock_contention",
    "duplicate_loop_groups",
    "no_workers_cycle",
    "no_commits_long_run",
]


def utc_now() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


def iso_utc(value: dt.datetime) -> str:
    return value.astimezone(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def parse_iso(value: str | None) -> dt.datetime | None:
    if not value:
        return None
    text = value.strip()
    if not text:
        return None
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    try:
        return dt.datetime.fromisoformat(text)
    except ValueError:
        return None


def parse_run_id_utc(run_id: str) -> str | None:
    try:
        parsed = dt.datetime.strptime(run_id, "%Y%m%d-%H%M%S")
    except ValueError:
        return None
    return iso_utc(parsed.replace(tzinfo=dt.timezone.utc))


def read_key_value_file(path: Path) -> dict[str, str]:
    data: dict[str, str] = {}
    if not path.exists():
        return data
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        if ": " not in line:
            continue
        key, value = line.split(": ", 1)
        data[key.strip()] = value.strip()
    return data


def safe_int(value: Any, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def to_bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    if isinstance(value, (int, float)):
        return bool(value)
    text = str(value).strip().lower()
    return text in {"1", "true", "yes", "y", "on"}


def pid_is_alive(pid: int) -> bool:
    if pid <= 0:
        return False
    try:
        os.kill(pid, 0)
        return True
    except OSError:
        return False


def normalize_effective_run_state(state: Any, pid: Any = 0, pid_alive_hint: bool | None = None) -> str:
    raw_state = str(state or "unknown").strip() or "unknown"
    run_pid = safe_int(pid, 0)
    run_pid_alive = pid_alive_hint if isinstance(pid_alive_hint, bool) else pid_is_alive(run_pid)

    # If the status file still says running but the process is gone, surface the truthful state.
    if not run_pid_alive and (raw_state.startswith("running") or raw_state == "starting"):
        return "stopped"
    return raw_state


def run_is_online(state: Any, pid: Any = 0, pid_alive_hint: bool | None = None) -> bool:
    effective_state = normalize_effective_run_state(state, pid=pid, pid_alive_hint=pid_alive_hint)
    return effective_state.startswith("running") or effective_state == "starting"


def with_effective_run_fields(run: dict[str, Any] | None) -> dict[str, Any] | None:
    if not isinstance(run, dict):
        return None
    payload = dict(run)
    raw_state = str(payload.get("state") or "unknown")
    run_pid = safe_int(payload.get("pid"), 0)
    run_pid_alive = pid_is_alive(run_pid)
    effective_state = normalize_effective_run_state(raw_state, pid=run_pid, pid_alive_hint=run_pid_alive)
    payload["state_raw"] = raw_state
    payload["state"] = effective_state
    payload["run_online"] = run_is_online(effective_state, pid=run_pid, pid_alive_hint=run_pid_alive)
    payload["pid_alive"] = run_pid_alive
    return payload


def tail_lines(path: Path, limit: int) -> list[str]:
    if not path.exists() or limit <= 0:
        return []
    window = deque(maxlen=limit)
    with path.open("r", encoding="utf-8", errors="replace") as handle:
        for line in handle:
            window.append(line.rstrip("\n"))
    return list(window)


def age_seconds(now: dt.datetime, value: str | None) -> int:
    parsed = parse_iso(value)
    if not parsed:
        return 0
    return max(0, int((now - parsed).total_seconds()))


def parse_etime_seconds(text: str) -> int:
    raw = text.strip()
    if not raw:
        return 0

    days = 0
    clock = raw
    if "-" in raw:
        day_part, _, rest = raw.partition("-")
        days = safe_int(day_part, 0)
        clock = rest

    parts = clock.split(":")
    if len(parts) == 3:
        hours = safe_int(parts[0], 0)
        minutes = safe_int(parts[1], 0)
        seconds = safe_int(parts[2], 0)
    elif len(parts) == 2:
        hours = 0
        minutes = safe_int(parts[0], 0)
        seconds = safe_int(parts[1], 0)
    elif len(parts) == 1:
        hours = 0
        minutes = 0
        seconds = safe_int(parts[0], 0)
    else:
        return 0

    return max(0, days * 86400 + hours * 3600 + minutes * 60 + seconds)


def severity_rank(level: str) -> int:
    return SEVERITY_RANK.get(str(level or "").strip().lower(), 1)


def _parse_yaml_scalar(text: str) -> str:
    value = text.strip()
    if not value:
        return ""
    if value[0] in ("'", '"') and value[-1] == value[0] and len(value) >= 2:
        return value[1:-1]
    if " #" in value:
        value = value.split(" #", 1)[0].rstrip()
    if value in {"null", "~"}:
        return ""
    return value


def parse_repos_from_yaml_like(content: str) -> list[dict[str, Any]]:
    repos: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None
    in_repos = False

    for raw_line in content.splitlines():
        if not raw_line.strip() or raw_line.lstrip().startswith("#"):
            continue
        stripped = raw_line.lstrip()
        indent = len(raw_line) - len(stripped)

        if not in_repos:
            if stripped.startswith("repos:"):
                in_repos = True
            continue

        if indent == 0 and not stripped.startswith("- "):
            break

        if stripped.startswith("- "):
            if current:
                repos.append(current)
            current = {}
            inline = stripped[2:].strip()
            if inline and ":" in inline:
                key, value = inline.split(":", 1)
                key = key.strip()
                if key:
                    current[key] = _parse_yaml_scalar(value)
            continue

        if current is None or ":" not in stripped:
            continue

        key, value = stripped.split(":", 1)
        key = key.strip()
        if not key:
            continue
        current[key] = _parse_yaml_scalar(value)

    if current:
        repos.append(current)

    return repos


def read_repos_payload(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {"repos": []}
    content = path.read_text(encoding="utf-8", errors="replace")
    parsed: dict[str, Any] = {}
    try:
        decoded = json.loads(content)
        if isinstance(decoded, dict):
            parsed = decoded
    except json.JSONDecodeError:
        parsed = {"repos": parse_repos_from_yaml_like(content)}
    repos = [item for item in parsed.get("repos", []) if isinstance(item, dict)]
    parsed["repos"] = repos
    return parsed


def resolve_default_code_root(clone_root: Path, repos_file: Path) -> Path:
    payload = read_repos_payload(repos_file)
    payload_root = str(payload.get("code_root") or "").strip()
    if payload_root:
        return Path(payload_root).expanduser().resolve()
    env_path = str(os.environ.get("CODE_ROOT") or os.environ.get("CLONE_CODE_ROOT") or "").strip()
    if env_path:
        return Path(env_path).expanduser().resolve()
    clone_parent = clone_root.parent
    if clone_parent != clone_root and clone_parent.exists():
        return clone_parent.resolve()
    return (Path.home() / "code").resolve()


def git_default_branch(repo_path: Path, fallback: str = "main") -> str:
    try:
        proc = subprocess.run(
            ["git", "-C", str(repo_path), "symbolic-ref", "--short", "refs/remotes/origin/HEAD"],
            capture_output=True,
            text=True,
            check=False,
            timeout=20,
        )
    except (OSError, subprocess.TimeoutExpired):
        proc = None
    if proc and proc.returncode == 0 and proc.stdout.strip():
        out = proc.stdout.strip()
        branch = out.split("/", 1)[1] if out.startswith("origin/") else out
        branch = branch.strip()
        if branch:
            return branch

    try:
        proc = subprocess.run(
            ["git", "-C", str(repo_path), "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True,
            text=True,
            check=False,
            timeout=20,
        )
    except (OSError, subprocess.TimeoutExpired):
        proc = None
    if proc and proc.returncode == 0:
        out = proc.stdout.strip()
        if out and out != "HEAD":
            return out
    return fallback


def discover_local_git_repos(
    code_root: Path,
    max_depth: int = 8,
    limit: int = 10000,
    catalog_paths: set[str] | None = None,
) -> list[dict[str, Any]]:
    ignored_dirs = {
        ".git",
        ".hg",
        ".svn",
        "node_modules",
        ".next",
        ".cache",
        "__pycache__",
        ".mypy_cache",
        ".pytest_cache",
        ".venv",
        "venv",
        "dist",
        "build",
        "target",
        ".idea",
        ".vscode",
    }
    root_depth = len(code_root.parts)
    discovered: list[dict[str, Any]] = []
    seen: set[str] = set()

    for raw_root, dirs, _files in os.walk(code_root, topdown=True):
        root_path = Path(raw_root)
        depth = len(root_path.parts) - root_depth

        if depth > max_depth:
            dirs[:] = []
            continue

        has_git_dir = ".git" in dirs or root_path.joinpath(".git").is_dir()
        dirs[:] = [name for name in dirs if name not in ignored_dirs and not name.startswith(".")]

        if not has_git_dir:
            continue

        repo_path = str(root_path.resolve())
        if repo_path in seen:
            dirs[:] = []
            continue
        seen.add(repo_path)
        discovered.append(
            {
                "name": root_path.name or repo_path,
                "path": repo_path,
                "branch": git_default_branch(root_path, fallback="main"),
                "objective": "",
                "in_catalog": repo_path in (catalog_paths or set()),
                "source": "local_scan",
            }
        )
        dirs[:] = []
        if len(discovered) >= limit:
            break

    discovered.sort(key=lambda item: str(item.get("name") or "").lower())
    return discovered


@dataclass
class RunSummary:
    run_id: str
    pid: int
    run_started_at: str | None
    state: str
    updated_at: str
    status_run_log: str
    status_events_log: str
    first_ts: str | None
    last_ts: str | None
    duration_seconds: int
    cycles_seen: int
    latest_cycle: int
    repos_started: int
    repos_running: int
    repos_ended: int
    repos_no_change: int
    repos_changed_est: int
    repos_skipped_lock: int
    spawned_workers: int
    latest_cycle_queue: dict[str, int] | None
    latest_lock_sweep: dict[str, int] | None
    no_workers_events: int
    latest_no_workers_cycle: int
    repo_states: dict[str, str]

    def as_dict(self) -> dict[str, Any]:
        return {
            "run_id": self.run_id,
            "pid": self.pid,
            "run_started_at": self.run_started_at,
            "state": self.state,
            "updated_at": self.updated_at,
            "status_run_log": self.status_run_log,
            "status_events_log": self.status_events_log,
            "first_ts": self.first_ts,
            "last_ts": self.last_ts,
            "duration_seconds": self.duration_seconds,
            "cycles_seen": self.cycles_seen,
            "latest_cycle": self.latest_cycle,
            "repos_started": self.repos_started,
            "repos_running": self.repos_running,
            "repos_ended": self.repos_ended,
            "repos_no_change": self.repos_no_change,
            "repos_changed_est": self.repos_changed_est,
            "repos_skipped_lock": self.repos_skipped_lock,
            "spawned_workers": self.spawned_workers,
            "latest_cycle_queue": self.latest_cycle_queue,
            "latest_lock_sweep": self.latest_lock_sweep,
            "no_workers_events": self.no_workers_events,
            "latest_no_workers_cycle": self.latest_no_workers_cycle,
            "repo_states": self.repo_states,
        }


class CloneMonitor:
    def __init__(self, clone_root: Path, repos_file: Path, logs_dir: Path):
        self.clone_root = clone_root
        self.repos_file = repos_file
        self.logs_dir = logs_dir
        self._cache_lock = threading.Lock()
        self._run_summary_cache: dict[str, tuple[tuple[int, int], RunSummary]] = {}
        self._repos_cache: tuple[int, list[dict[str, Any]]] | None = None
        self._commit_cache: dict[tuple[int, int], tuple[float, list[dict[str, Any]]]] = {}
        self._run_detailed_commits_cache: dict[tuple[str, int, int, int, int], list[dict[str, Any]]] = {}

    def _run_status_files(self) -> list[Path]:
        status_files = list(self.logs_dir.glob("run-*-status.txt"))
        status_files.sort(key=lambda p: p.stat().st_mtime, reverse=True)
        return status_files

    def _run_paths(self, run_id: str) -> tuple[Path, Path, Path]:
        status_path = self.logs_dir / f"run-{run_id}-status.txt"
        events_path = self.logs_dir / f"run-{run_id}-events.log"
        run_log_path = self.logs_dir / f"run-{run_id}.log"
        return status_path, events_path, run_log_path

    def _load_events(self, path: Path) -> list[dict[str, Any]]:
        if not path.exists():
            return []
        events: list[dict[str, Any]] = []
        with path.open("r", encoding="utf-8", errors="replace") as handle:
            for line in handle:
                text = line.strip()
                if not text:
                    continue
                try:
                    payload = json.loads(text)
                except json.JSONDecodeError:
                    # Ignore partial line writes from active runs.
                    continue
                if isinstance(payload, dict):
                    events.append(payload)
        return events

    def _summarize_run(self, run_id: str) -> RunSummary:
        status_path, events_path, _ = self._run_paths(run_id)
        status_mtime_ns = status_path.stat().st_mtime_ns if status_path.exists() else 0
        events_mtime_ns = events_path.stat().st_mtime_ns if events_path.exists() else 0
        cache_key = (status_mtime_ns, events_mtime_ns)

        with self._cache_lock:
            cached = self._run_summary_cache.get(run_id)
            if cached and cached[0] == cache_key:
                return cached[1]

        status_data = read_key_value_file(status_path)
        run_pid = safe_int(status_data.get("pid"), 0)
        state = status_data.get("state", "unknown")
        updated_at = status_data.get("updated_at", "")
        status_run_log = status_data.get("run_log", "")
        status_events_log = status_data.get("events_log", "")
        events = self._load_events(events_path)

        first_ts = events[0].get("ts") if events else None
        last_ts = events[-1].get("ts") if events else None
        first_dt = parse_iso(first_ts)
        last_dt = parse_iso(last_ts)
        duration_seconds = 0
        if first_dt and last_dt:
            duration_seconds = max(0, int((last_dt - first_dt).total_seconds()))

        cycles_seen = 0
        latest_cycle = 0
        repos_started = 0
        repos_running = 0
        repos_ended = 0
        repos_no_change = 0
        repos_skipped_lock = 0
        spawned_workers = 0
        latest_cycle_queue: dict[str, int] | None = None
        latest_lock_sweep: dict[str, int] | None = None
        no_workers_events = 0
        latest_no_workers_cycle = 0
        repo_states: dict[str, str] = {}

        for event in events:
            message = str(event.get("message", ""))

            cycle_match = CYCLE_PATTERN.match(message)
            if cycle_match:
                cycles_seen += 1
                latest_cycle = max(latest_cycle, safe_int(cycle_match.group(1)))
                continue

            if message.startswith("START repo="):
                repos_started += 1
                repo_match = REPO_FIELD_PATTERN.search(message)
                if repo_match:
                    repo_states[repo_match.group(1)] = "starting"
                continue

            if message.startswith("RUN repo="):
                repos_running += 1
                repo_match = REPO_FIELD_PATTERN.search(message)
                if repo_match:
                    repo_states[repo_match.group(1)] = "running"
                continue

            if message.startswith("END repo="):
                repos_ended += 1
                repo_match = REPO_FIELD_PATTERN.search(message)
                if repo_match:
                    current = repo_states.get(repo_match.group(1))
                    if current != "no_change":
                        repo_states[repo_match.group(1)] = "ended"
                continue

            if message.startswith("NO_CHANGE repo="):
                repos_no_change += 1
                repo_match = REPO_FIELD_PATTERN.search(message)
                if repo_match:
                    repo_states[repo_match.group(1)] = "no_change"
                continue

            if message.startswith("SPAWN cycle="):
                spawned_workers += 1
                continue

            if message.startswith("SKIP repo="):
                repo_match = REPO_FIELD_PATTERN.search(message)
                reason_match = REASON_FIELD_PATTERN.search(message)
                reason = reason_match.group(1) if reason_match else "unknown"
                if reason == "repo_lock_active":
                    repos_skipped_lock += 1
                if repo_match:
                    repo_states[repo_match.group(1)] = f"skipped:{reason}"
                continue

            queue_match = CYCLE_QUEUE_PATTERN.match(message)
            if queue_match:
                latest_cycle_queue = {
                    "cycle": safe_int(queue_match.group(1)),
                    "repos_seen": safe_int(queue_match.group(2)),
                    "spawned": safe_int(queue_match.group(3)),
                    "skipped_lock": safe_int(queue_match.group(4)),
                }
                continue

            sweep_match = LOCK_SWEEP_PATTERN.match(message)
            if sweep_match:
                latest_lock_sweep = {
                    "cycle": safe_int(sweep_match.group(1)),
                    "cleared": safe_int(sweep_match.group(2)),
                }
                continue

            no_workers_match = NO_WORKERS_PATTERN.match(message)
            if no_workers_match:
                no_workers_events += 1
                latest_no_workers_cycle = max(latest_no_workers_cycle, safe_int(no_workers_match.group(1)))

        summary = RunSummary(
            run_id=run_id,
            pid=run_pid,
            run_started_at=parse_run_id_utc(run_id),
            state=state,
            updated_at=updated_at,
            status_run_log=status_run_log,
            status_events_log=status_events_log,
            first_ts=first_ts,
            last_ts=last_ts,
            duration_seconds=duration_seconds,
            cycles_seen=cycles_seen,
            latest_cycle=latest_cycle,
            repos_started=repos_started,
            repos_running=repos_running,
            repos_ended=repos_ended,
            repos_no_change=repos_no_change,
            repos_changed_est=max(0, repos_ended - repos_no_change),
            repos_skipped_lock=repos_skipped_lock,
            spawned_workers=spawned_workers,
            latest_cycle_queue=latest_cycle_queue,
            latest_lock_sweep=latest_lock_sweep,
            no_workers_events=no_workers_events,
            latest_no_workers_cycle=latest_no_workers_cycle,
            repo_states=repo_states,
        )

        with self._cache_lock:
            self._run_summary_cache[run_id] = (cache_key, summary)

        return summary

    def list_runs(self, limit: int = 25) -> list[dict[str, Any]]:
        summaries: list[dict[str, Any]] = []
        for status_file in self._run_status_files()[: max(limit, 1)]:
            match = RUN_STATUS_PATTERN.search(status_file.name)
            if not match:
                continue
            summary = self._summarize_run(match.group(1))
            summaries.append(summary.as_dict())
        return summaries

    def latest_run(self) -> dict[str, Any] | None:
        runs = self.list_runs(limit=1)
        return runs[0] if runs else None

    def _load_repos(self) -> list[dict[str, Any]]:
        if self.repos_file.exists():
            mtime_ns = self.repos_file.stat().st_mtime_ns
        else:
            # No repos file: refresh fallback scan periodically.
            mtime_ns = -1 - int(time.time() // 60)
        with self._cache_lock:
            if self._repos_cache and self._repos_cache[0] == mtime_ns:
                return self._repos_cache[1]

        payload = read_repos_payload(self.repos_file)
        repos = [entry for entry in payload.get("repos", []) if isinstance(entry, dict)]
        if not repos:
            code_root = resolve_default_code_root(self.clone_root, self.repos_file)
            if code_root.exists() and code_root.is_dir():
                repos = discover_local_git_repos(code_root=code_root, max_depth=8, limit=10000, catalog_paths=None)

        with self._cache_lock:
            self._repos_cache = (mtime_ns, repos)
        return repos

    def repos_catalog(self) -> list[dict[str, Any]]:
        catalog: list[dict[str, Any]] = []
        seen_paths: set[str] = set()
        for repo_entry in self._load_repos():
            raw_path = str(repo_entry.get("path") or "").strip()
            if not raw_path or raw_path in seen_paths:
                continue
            seen_paths.add(raw_path)
            name = str(repo_entry.get("name") or Path(raw_path).name).strip() or Path(raw_path).name or raw_path
            branch = str(repo_entry.get("branch") or "main").strip() or "main"
            objective = str(repo_entry.get("objective") or "").strip()
            tasks_per_repo_raw = repo_entry.get("tasks_per_repo")
            tasks_per_repo = safe_int(tasks_per_repo_raw, -1)
            max_cycles_raw = repo_entry.get("max_cycles_per_run")
            max_cycles = safe_int(max_cycles_raw, -1)
            max_commits_raw = repo_entry.get("max_commits_per_run")
            max_commits = safe_int(max_commits_raw, -1)
            record: dict[str, Any] = {
                "name": name,
                "path": raw_path,
                "branch": branch,
                "objective": objective,
            }
            if tasks_per_repo >= 0:
                record["tasks_per_repo"] = max(0, min(tasks_per_repo, 1000))
            if max_cycles >= 0:
                record["max_cycles_per_run"] = max(0, min(max_cycles, 10000))
            if max_commits >= 0:
                record["max_commits_per_run"] = max(0, min(max_commits, 10000))
            catalog.append(record)
        catalog.sort(key=lambda item: str(item.get("name") or "").lower())
        return catalog

    def recent_commits(self, hours: int = 2, limit: int = 250) -> list[dict[str, Any]]:
        key = (hours, limit)
        now = time.time()

        with self._cache_lock:
            cached = self._commit_cache.get(key)
            if cached and (now - cached[0]) < 15:
                return cached[1]

        results: list[dict[str, Any]] = []
        seen: set[tuple[str, str]] = set()

        for repo_entry in self._load_repos():
            repo_path = Path(str(repo_entry.get("path", ""))).expanduser()
            repo_name = str(repo_entry.get("name") or repo_path.name)
            if not repo_path.joinpath(".git").exists():
                continue

            cmd = [
                "git",
                "-C",
                str(repo_path),
                "log",
                f"--since={hours} hours ago",
                "--pretty=format:%ct%x09%h%x09%s",
            ]

            try:
                proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
            except OSError:
                continue

            if proc.returncode != 0:
                continue

            for line in proc.stdout.splitlines():
                parts = line.split("\t", 2)
                if len(parts) != 3:
                    continue
                ts_raw, commit_hash, subject = parts
                ts = safe_int(ts_raw)
                commit_hash = commit_hash.strip()
                subject = subject.strip()
                if not ts or not commit_hash:
                    continue
                identity = (repo_name, commit_hash)
                if identity in seen:
                    continue
                seen.add(identity)
                results.append(
                    {
                        "ts": ts,
                        "time_utc": iso_utc(dt.datetime.fromtimestamp(ts, tz=dt.timezone.utc)),
                        "repo": repo_name,
                        "hash": commit_hash,
                        "subject": subject,
                    }
                )

        results.sort(key=lambda item: item["ts"], reverse=True)
        results = results[: max(limit, 1)]

        with self._cache_lock:
            self._commit_cache[key] = (now, results)
        return results

    def latest_events(self, run_id: str, limit: int = 250) -> list[dict[str, Any]]:
        _, events_path, _ = self._run_paths(run_id)
        lines = tail_lines(events_path, max(limit, 1))
        events: list[dict[str, Any]] = []
        for line in lines:
            text = line.strip()
            if not text:
                continue
            try:
                payload = json.loads(text)
            except json.JSONDecodeError:
                continue
            if isinstance(payload, dict):
                events.append(payload)
        return events

    def latest_commit_lines_from_run_log(self, run_id: str, limit: int = 80) -> list[dict[str, str]]:
        _, _, run_log_path = self._run_paths(run_id)
        lines = tail_lines(run_log_path, 12000)
        commits: list[dict[str, str]] = []
        seen_hashes: set[str] = set()
        for line in reversed(lines):
            match = COMMIT_LINE_PATTERN.match(line)
            if not match:
                continue
            commit_hash = match.group(1)
            if commit_hash in seen_hashes:
                continue
            seen_hashes.add(commit_hash)
            commits.append({"hash": commit_hash, "subject": match.group(2)})
            if len(commits) >= limit:
                break
        commits.reverse()
        return commits

    def _run_started_dt(self, run_id: str) -> dt.datetime | None:
        status_path, _, _ = self._run_paths(run_id)
        if not status_path.exists():
            return None
        status_data = read_key_value_file(status_path)
        started = status_data.get("run_started_at")
        parsed = parse_iso(started)
        if parsed:
            return parsed
        run_id_ts = parse_run_id_utc(run_id)
        if run_id_ts:
            parsed = parse_iso(run_id_ts)
            if parsed:
                return parsed
        return None

    def _run_recent_repo_commits(self, run_id: str, limit: int = 120) -> list[dict[str, Any]]:
        if limit <= 0:
            return []
        run_started = self._run_started_dt(run_id)
        repo_names = list(self._run_repo_candidates(run_id))

        repo_map = self._repo_entries_by_name()
        candidate_repos = []
        for repo_name in repo_names:
            repo_path = repo_map.get(repo_name)
            if repo_path:
                candidate_repos.append((repo_name, repo_path))
        if not candidate_repos:
            candidate_repos = list(repo_map.items())
        if not candidate_repos:
            return []

        if run_started:
            since = run_started.astimezone(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
        else:
            since = ""

        max_repos = max(1, len(candidate_repos))
        per_repo_limit = max(1, min(limit, max(1, limit // max_repos + 8)))
        commits: list[dict[str, Any]] = []
        seen: set[str] = set()

        for repo_name, repo_path in candidate_repos:
            cmd = ["git", "-C", str(repo_path), "log", "--pretty=format:%H%x09%ct%x09%s", f"--max-count={per_repo_limit}"]
            if since:
                cmd.insert(-1, f"--since={since}")

            try:
                proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
            except OSError:
                continue
            if proc.returncode != 0:
                continue

            for line in proc.stdout.splitlines():
                parts = line.split("\t", 2)
                if len(parts) != 3:
                    continue
                full_hash, ts_raw, subject = parts
                ts = safe_int(ts_raw)
                full_hash = str(full_hash).strip()
                subject = str(subject).strip()
                if not ts or not full_hash:
                    continue
                if full_hash in seen:
                    continue
                seen.add(full_hash)
                commits.append(
                    {
                        "ts": ts,
                        "time_utc": iso_utc(dt.datetime.fromtimestamp(ts, tz=dt.timezone.utc)),
                        "repo": repo_name,
                        "hash": full_hash[:12],
                        "subject": subject,
                    }
                )

        commits.sort(key=lambda item: item["ts"], reverse=True)
        return commits[: max(1, limit)]

    def run_log_tail(self, run_id: str, limit: int = 220) -> dict[str, Any] | None:
        status_path, events_path, run_log_path = self._run_paths(run_id)
        if not status_path.exists():
            return None
        if not run_log_path.exists():
            return None

        status_data = read_key_value_file(status_path)
        lines = tail_lines(run_log_path, max(1, limit))
        commits = self._run_recent_repo_commits(run_id, limit=max(1, min(120, limit)))

        return {
            "run_id": run_id,
            "run_log_lines": lines,
            "run_log_line_count": len(lines),
            "run_commits": commits,
            "status_run_log": status_data.get("run_log", "") if status_data else "",
            "status_events_log": status_data.get("events_log", "") if status_data else "",
            "run_started_at": status_data.get("run_started_at", "") if status_data else "",
            "events_path": str(events_path),
            "run_log_path": str(run_log_path),
        }

    def _repo_entries_by_name(self) -> dict[str, Path]:
        results: dict[str, Path] = {}
        for repo_entry in self._load_repos():
            repo_path = Path(str(repo_entry.get("path", ""))).expanduser()
            repo_name = str(repo_entry.get("name") or repo_path.name)
            if not repo_name or not repo_path.joinpath(".git").exists():
                continue
            results[repo_name] = repo_path
        return results

    def _extract_run_commit_hashes(self, run_id: str) -> list[dict[str, str]]:
        _, _, run_log_path = self._run_paths(run_id)
        if not run_log_path.exists():
            return []
        commits: list[dict[str, str]] = []
        seen_hashes: set[str] = set()
        with run_log_path.open("r", encoding="utf-8", errors="replace") as handle:
            for line in handle:
                match = COMMIT_LINE_PATTERN.match(line.rstrip("\n"))
                if not match:
                    continue
                commit_hash = match.group(1)
                if commit_hash in seen_hashes:
                    continue
                seen_hashes.add(commit_hash)
                commits.append({"hash": commit_hash, "subject": match.group(2).strip()})
        return commits

    def _run_repo_candidates(self, run_id: str) -> list[str]:
        _, events_path, _ = self._run_paths(run_id)
        events = self._load_events(events_path)
        repos: set[str] = set()
        for event in events:
            message = str(event.get("message", ""))
            match = REPO_FIELD_PATTERN.search(message)
            if match:
                repos.add(match.group(1))
        return sorted(repos)

    def _resolve_commit_in_repo(self, repo_path: Path, commit_hash: str) -> str | None:
        cmd = ["git", "-C", str(repo_path), "rev-parse", "--verify", "--quiet", f"{commit_hash}^{{commit}}"]
        try:
            proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
        except OSError:
            return None
        if proc.returncode != 0:
            # Fallback for short hashes that rev-parse may reject as ambiguous.
            if len(commit_hash) >= 7:
                try:
                    fallback = subprocess.run(
                        ["git", "-C", str(repo_path), "log", "--all", "--format=%H", "--max-count=20000"],
                        capture_output=True,
                        text=True,
                        check=False,
                    )
                except OSError:
                    return None
                if fallback.returncode == 0:
                    for line in fallback.stdout.splitlines():
                        full_hash = line.strip()
                        if full_hash.startswith(commit_hash):
                            return full_hash
            return None
        resolved = proc.stdout.strip()
        return resolved or None

    def _resolve_commit_metadata(self, repo_path: Path, commit_hash: str) -> tuple[int, str, str] | None:
        cmd = ["git", "-C", str(repo_path), "show", "-s", "--format=%ct%x09%H%x09%s", commit_hash]
        try:
            proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
        except OSError:
            return None
        if proc.returncode != 0:
            return None
        parts = proc.stdout.strip().split("\t", 2)
        if len(parts) != 3:
            return None
        ts = safe_int(parts[0])
        full_hash = parts[1].strip()
        subject = parts[2].strip()
        if not ts or not full_hash:
            return None
        return ts, full_hash, subject

    def run_commits_detailed(self, run_id: str) -> list[dict[str, Any]]:
        status_path, events_path, run_log_path = self._run_paths(run_id)
        if not run_log_path.exists():
            return []
        repos_mtime_ns = self.repos_file.stat().st_mtime_ns if self.repos_file.exists() else -1
        cache_key = (
            run_id,
            status_path.stat().st_mtime_ns if status_path.exists() else 0,
            events_path.stat().st_mtime_ns if events_path.exists() else 0,
            run_log_path.stat().st_mtime_ns,
            repos_mtime_ns,
        )

        with self._cache_lock:
            cached = self._run_detailed_commits_cache.get(cache_key)
            if cached is not None:
                return cached

        raw_commits = self._extract_run_commit_hashes(run_id)
        if not raw_commits:
            with self._cache_lock:
                self._run_detailed_commits_cache[cache_key] = []
            return []

        repo_map = self._repo_entries_by_name()
        candidate_repo_names = self._run_repo_candidates(run_id)
        candidate_repos: list[tuple[str, Path]] = []
        for repo_name in candidate_repo_names:
            repo_path = repo_map.get(repo_name)
            if repo_path:
                candidate_repos.append((repo_name, repo_path))
        if not candidate_repos:
            candidate_repos = list(repo_map.items())

        detailed: list[dict[str, Any]] = []
        for item in raw_commits:
            commit_hash = item["hash"]
            subject = item["subject"]
            matches: list[tuple[str, Path, str]] = []

            for repo_name, repo_path in candidate_repos:
                resolved_hash = self._resolve_commit_in_repo(repo_path, commit_hash)
                if resolved_hash:
                    matches.append((repo_name, repo_path, resolved_hash))

            if not matches:
                detailed.append(
                    {
                        "ts": 0,
                        "time_utc": "",
                        "repo": "unknown",
                        "hash": commit_hash,
                        "subject": subject,
                        "ambiguous": False,
                        "repo_candidates": [],
                    }
                )
                continue

            primary_repo_name, primary_repo_path, primary_hash = matches[0]
            metadata = self._resolve_commit_metadata(primary_repo_path, primary_hash)

            if metadata:
                ts, full_hash, resolved_subject = metadata
                detailed.append(
                    {
                        "ts": ts,
                        "time_utc": iso_utc(dt.datetime.fromtimestamp(ts, tz=dt.timezone.utc)),
                        "repo": primary_repo_name,
                        "hash": full_hash,
                        "subject": resolved_subject or subject,
                        "ambiguous": len(matches) > 1,
                        "repo_candidates": [name for name, _, _ in matches],
                    }
                )
            else:
                detailed.append(
                    {
                        "ts": 0,
                        "time_utc": "",
                        "repo": primary_repo_name,
                        "hash": primary_hash,
                        "subject": subject,
                        "ambiguous": len(matches) > 1,
                        "repo_candidates": [name for name, _, _ in matches],
                    }
                )

        detailed.sort(key=lambda item: item.get("ts", 0))

        with self._cache_lock:
            self._run_detailed_commits_cache[cache_key] = detailed

        return detailed

    def repo_insights(self, history_limit: int = 40, commit_hours: int = 24, top: int = 80) -> list[dict[str, Any]]:
        runs = self.list_runs(limit=max(1, history_limit))
        repos_from_config = {str(item.get("name") or Path(str(item.get("path", ""))).name) for item in self._load_repos()}
        stats: dict[str, dict[str, Any]] = {
            repo: {
                "repo": repo,
                "seen_runs": 0,
                "latest_state": "unknown",
                "changed_runs": 0,
                "no_change_runs": 0,
                "lock_skip_runs": 0,
                "commits_recent": 0,
                "last_commit_ts": 0,
                "last_commit_time_utc": "",
                "last_commit_hash": "",
                "last_commit_subject": "",
                "active_in_latest_run": False,
            }
            for repo in repos_from_config
        }

        latest_run_repo_states: dict[str, str] = {}
        if runs:
            latest_run_repo_states = dict(runs[0].get("repo_states") or {})

        for run in runs:
            repo_states = dict(run.get("repo_states") or {})
            for repo, state in repo_states.items():
                entry = stats.setdefault(
                    repo,
                    {
                        "repo": repo,
                        "seen_runs": 0,
                        "latest_state": "unknown",
                        "changed_runs": 0,
                        "no_change_runs": 0,
                        "lock_skip_runs": 0,
                        "commits_recent": 0,
                        "last_commit_ts": 0,
                        "last_commit_time_utc": "",
                        "last_commit_hash": "",
                        "last_commit_subject": "",
                        "active_in_latest_run": False,
                    },
                )
                entry["seen_runs"] += 1
                if entry["latest_state"] == "unknown":
                    entry["latest_state"] = state
                if state == "no_change":
                    entry["no_change_runs"] += 1
                if state == "ended":
                    entry["changed_runs"] += 1
                if str(state).startswith("skipped:repo_lock_active"):
                    entry["lock_skip_runs"] += 1

        for repo in latest_run_repo_states:
            entry = stats.setdefault(
                repo,
                {
                    "repo": repo,
                    "seen_runs": 0,
                    "latest_state": "unknown",
                    "changed_runs": 0,
                    "no_change_runs": 0,
                    "lock_skip_runs": 0,
                    "commits_recent": 0,
                    "last_commit_ts": 0,
                    "last_commit_time_utc": "",
                    "last_commit_hash": "",
                    "last_commit_subject": "",
                    "active_in_latest_run": False,
                },
            )
            entry["active_in_latest_run"] = True

        for commit in self.recent_commits(hours=max(1, commit_hours), limit=3000):
            repo = str(commit.get("repo") or "")
            if not repo:
                continue
            entry = stats.setdefault(
                repo,
                {
                    "repo": repo,
                    "seen_runs": 0,
                    "latest_state": "unknown",
                    "changed_runs": 0,
                    "no_change_runs": 0,
                    "lock_skip_runs": 0,
                    "commits_recent": 0,
                    "last_commit_ts": 0,
                    "last_commit_time_utc": "",
                    "last_commit_hash": "",
                    "last_commit_subject": "",
                    "active_in_latest_run": False,
                },
            )
            entry["commits_recent"] += 1
            ts = safe_int(commit.get("ts"), 0)
            if ts >= entry["last_commit_ts"]:
                entry["last_commit_ts"] = ts
                entry["last_commit_time_utc"] = str(commit.get("time_utc") or "")
                entry["last_commit_hash"] = str(commit.get("hash") or "")
                entry["last_commit_subject"] = str(commit.get("subject") or "")

        results = list(stats.values())
        results.sort(
            key=lambda item: (
                -safe_int(item.get("commits_recent"), 0),
                -safe_int(item.get("changed_runs"), 0),
                -safe_int(item.get("seen_runs"), 0),
                str(item.get("repo") or "").lower(),
            )
        )
        return results[: max(1, top)]

    def repo_details(
        self,
        repo_name: str,
        commit_hours: int = 72,
        commit_limit: int = 120,
        run_history: int = 80,
    ) -> dict[str, Any] | None:
        target = repo_name.strip()
        if not target:
            return None

        repo_map = self._repo_entries_by_name()
        repo_path = repo_map.get(target)

        if not repo_path:
            lowered = {name.lower(): (name, path) for name, path in repo_map.items()}
            match = lowered.get(target.lower())
            if match:
                target, repo_path = match
            else:
                return None

        commits: list[dict[str, Any]] = []
        cmd = [
            "git",
            "-C",
            str(repo_path),
            "log",
            f"--since={max(1, commit_hours)} hours ago",
            f"--max-count={max(1, commit_limit)}",
            "--pretty=format:%ct%x09%H%x09%s",
        ]
        try:
            proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
        except OSError:
            proc = None

        if proc and proc.returncode == 0:
            for line in proc.stdout.splitlines():
                parts = line.split("\t", 2)
                if len(parts) != 3:
                    continue
                ts = safe_int(parts[0], 0)
                full_hash = parts[1].strip()
                subject = parts[2].strip()
                if not ts or not full_hash:
                    continue
                commits.append(
                    {
                        "ts": ts,
                        "time_utc": iso_utc(dt.datetime.fromtimestamp(ts, tz=dt.timezone.utc)),
                        "hash": full_hash,
                        "subject": subject,
                    }
                )

        timeline: list[dict[str, Any]] = []
        counts = {
            "seen_runs": 0,
            "changed_runs": 0,
            "no_change_runs": 0,
            "lock_skip_runs": 0,
            "latest_state": "unknown",
        }

        for run in self.list_runs(limit=max(1, run_history)):
            repo_states = dict(run.get("repo_states") or {})
            state = repo_states.get(target)
            if state is None:
                continue
            timeline.append(
                {
                    "run_id": run.get("run_id"),
                    "run_started_at": run.get("run_started_at"),
                    "state": state,
                    "duration_seconds": run.get("duration_seconds", 0),
                    "latest_cycle": run.get("latest_cycle", 0),
                }
            )
            counts["seen_runs"] += 1
            if counts["latest_state"] == "unknown":
                counts["latest_state"] = str(state)
            if state == "ended":
                counts["changed_runs"] += 1
            elif state == "no_change":
                counts["no_change_runs"] += 1
            elif str(state).startswith("skipped:repo_lock_active"):
                counts["lock_skip_runs"] += 1

        latest_commit = commits[0] if commits else {}
        return {
            "generated_at": iso_utc(utc_now()),
            "repo": target,
            "path": str(repo_path),
            "summary": {
                **counts,
                "commits_recent": len(commits),
                "last_commit_time_utc": str(latest_commit.get("time_utc") or ""),
                "last_commit_hash": str(latest_commit.get("hash") or ""),
                "last_commit_subject": str(latest_commit.get("subject") or ""),
            },
            "commits": commits,
            "timeline": timeline,
        }

    def build_alerts(
        self,
        latest_run: dict[str, Any] | None,
        latest_run_commit_count: int,
        stall_minutes: int = 15,
        no_commit_minutes: int = 60,
        lock_skip_threshold: int = 25,
    ) -> list[dict[str, Any]]:
        if not latest_run:
            return []

        alerts: list[dict[str, Any]] = []
        now = utc_now()
        run_id = str(latest_run.get("run_id") or "")
        state_raw = str(latest_run.get("state_raw") or latest_run.get("state") or "unknown")
        state = normalize_effective_run_state(
            state_raw,
            pid=latest_run.get("pid"),
            pid_alive_hint=latest_run.get("pid_alive") if isinstance(latest_run.get("pid_alive"), bool) else None,
        )
        run_online = run_is_online(state, pid=latest_run.get("pid"))
        duration_seconds = safe_int(latest_run.get("duration_seconds"), 0)

        if run_online:
            idle_seconds = age_seconds(now, str(latest_run.get("last_ts") or latest_run.get("updated_at") or ""))
            if idle_seconds >= max(1, stall_minutes) * 60:
                alerts.append(
                    {
                        "id": "run_stalled",
                        "severity": "critical",
                        "run_id": run_id,
                        "title": "Run appears stalled",
                        "detail": f"No structured events for {idle_seconds // 60}m while state={state}.",
                    }
                )

            total_skips = safe_int(latest_run.get("repos_skipped_lock"), 0)
            queue = latest_run.get("latest_cycle_queue") or {}
            cycle_spawned = safe_int(queue.get("spawned"), 0)
            cycle_skipped = safe_int(queue.get("skipped_lock"), 0)
            queue_total = cycle_spawned + cycle_skipped
            lock_ratio = (cycle_skipped / queue_total) if queue_total else 0.0
            if total_skips >= max(1, lock_skip_threshold) or (queue_total >= 5 and lock_ratio >= 0.7):
                alerts.append(
                    {
                        "id": "lock_contention",
                        "severity": "warn",
                        "run_id": run_id,
                        "title": "High lock contention",
                        "detail": f"skip_lock={total_skips} total; latest cycle skip ratio={lock_ratio:.0%}.",
                    }
                )

            no_workers = safe_int(latest_run.get("no_workers_events"), 0)
            if no_workers > 0:
                alerts.append(
                    {
                        "id": "no_workers_cycle",
                        "severity": "warn",
                        "run_id": run_id,
                        "title": "Cycle had no runnable repos",
                        "detail": f"Detected {no_workers} NO_WORKERS events in this run.",
                    }
                )

            if duration_seconds >= max(1, no_commit_minutes) * 60 and latest_run_commit_count == 0:
                alerts.append(
                    {
                        "id": "no_commits_long_run",
                        "severity": "warn",
                        "run_id": run_id,
                        "title": "No commits in long-running run",
                        "detail": f"Run duration is {duration_seconds // 60}m with no commit lines detected.",
                    }
                )

        if not alerts:
            alerts.append(
                {
                    "id": "healthy",
                    "severity": "ok",
                    "run_id": run_id,
                    "title": "No active alerts",
                    "detail": "Reactor telemetry looks healthy for the selected thresholds.",
                }
            )

        return alerts

    def snapshot(
        self,
        history_limit: int = 20,
        commit_hours: int = 2,
        commit_limit: int = 150,
        event_limit: int = 200,
        alert_stall_minutes: int = 15,
        alert_no_commit_minutes: int = 60,
        alert_lock_skip_threshold: int = 25,
    ) -> dict[str, Any]:
        runs = self.list_runs(limit=history_limit)
        latest_raw = runs[0] if runs else None
        latest = with_effective_run_fields(latest_raw)
        runs_with_effective = [with_effective_run_fields(item) or item for item in runs]
        events: list[dict[str, Any]] = []
        run_commits: list[dict[str, str]] = []
        if latest:
            events = self.latest_events(latest["run_id"], limit=event_limit)
            run_commits = self.latest_commit_lines_from_run_log(latest["run_id"], limit=80)

        reactor_online = bool(latest and run_is_online(latest.get("state"), pid=latest.get("pid"), pid_alive_hint=latest.get("pid_alive")))

        recent_commits = self.recent_commits(hours=commit_hours, limit=commit_limit)
        alerts = self.build_alerts(
            latest_run=latest,
            latest_run_commit_count=len(run_commits),
            stall_minutes=alert_stall_minutes,
            no_commit_minutes=alert_no_commit_minutes,
            lock_skip_threshold=alert_lock_skip_threshold,
        )

        return {
            "generated_at": iso_utc(utc_now()),
            "config": {
                "clone_root": str(self.clone_root),
                "repos_file": str(self.repos_file),
                "logs_dir": str(self.logs_dir),
                "alert_stall_minutes": max(1, alert_stall_minutes),
                "alert_no_commit_minutes": max(1, alert_no_commit_minutes),
                "alert_lock_skip_threshold": max(1, alert_lock_skip_threshold),
            },
            "overview": {
                "reactor_online": reactor_online,
                "runs_total": len(self._run_status_files()),
                "repos_total": len(self._load_repos()),
            },
            "alerts": alerts,
            "latest_run": latest,
            "run_history": runs_with_effective,
            "recent_commits": recent_commits,
            "run_commits": run_commits,
            "latest_events": events,
        }

    def run_details(
        self,
        run_id: str,
        commit_limit: int = 120,
        run_log_limit: int = 220,
        event_limit: int = 300,
        alert_stall_minutes: int = 15,
        alert_no_commit_minutes: int = 60,
        alert_lock_skip_threshold: int = 25,
    ) -> dict[str, Any] | None:
        status_path, _, _ = self._run_paths(run_id)
        if not status_path.exists():
            return None
        run = self._summarize_run(run_id).as_dict()
        detailed_commits = self.run_commits_detailed(run_id)
        capped_commits = detailed_commits[-max(1, commit_limit) :]
        run_log_payload = self.run_log_tail(run_id, max(1, min(500, run_log_limit)))

        if not capped_commits and run_log_payload:
            fallback_commits = [
                {
                    "ts": 0,
                    "time_utc": "",
                    "repo": "unknown",
                    "hash": str(item.get("hash") or ""),
                    "subject": str(item.get("subject") or ""),
                    "ambiguous": False,
                    "repo_candidates": [],
                }
                for item in run_log_payload.get("run_commits", [])
            ]
            capped_commits = fallback_commits[-max(1, commit_limit) :]

        alerts = self.build_alerts(
            latest_run=run,
            latest_run_commit_count=len(capped_commits),
            stall_minutes=alert_stall_minutes,
            no_commit_minutes=alert_no_commit_minutes,
            lock_skip_threshold=alert_lock_skip_threshold,
        )
        return {
            "generated_at": iso_utc(utc_now()),
            "run": run,
            "alerts": alerts,
            "run_commits": self.latest_commit_lines_from_run_log(run_id, limit=max(1, commit_limit)),
            "run_commits_detailed": capped_commits,
            "latest_events": self.latest_events(run_id, limit=max(1, event_limit)),
            "run_log_tail": {
                "run_id": run_id,
                "run_log_lines": run_log_payload["run_log_lines"] if run_log_payload else [],
                "run_log_line_count": run_log_payload["run_log_line_count"] if run_log_payload else 0,
                "run_commits": run_log_payload["run_commits"] if run_log_payload else [],
                "status_run_log": run_log_payload["status_run_log"] if run_log_payload else "",
                "status_events_log": run_log_payload["status_events_log"] if run_log_payload else "",
                "run_started_at": run_log_payload["run_started_at"] if run_log_payload else "",
                "events_path": str((self._run_paths(run_id))[1]),
                "run_log_path": str((self._run_paths(run_id))[2]),
            },
        }


class TaskQueueStore:
    VALID_STATUSES = {"QUEUED", "CLAIMED", "DONE", "BLOCKED", "CANCELED"}

    def __init__(self, queue_file: Path):
        self.queue_file = queue_file
        self._lock = threading.Lock()
        self._ensure_file_exists()

    def _default_payload(self) -> dict[str, Any]:
        return {"generated_at": iso_utc(utc_now()), "tasks": []}

    def _ensure_file_exists(self) -> None:
        if self.queue_file.exists():
            return
        self.queue_file.parent.mkdir(parents=True, exist_ok=True)
        self.queue_file.write_text(json.dumps(self._default_payload(), indent=2) + "\n", encoding="utf-8")

    def _read_payload(self) -> dict[str, Any]:
        self._ensure_file_exists()
        try:
            parsed = json.loads(self.queue_file.read_text(encoding="utf-8", errors="replace"))
        except (OSError, json.JSONDecodeError):
            parsed = self._default_payload()
        if not isinstance(parsed, dict):
            parsed = self._default_payload()
        tasks = parsed.get("tasks")
        if not isinstance(tasks, list):
            parsed["tasks"] = []
        return parsed

    def _write_payload(self, payload: dict[str, Any]) -> None:
        self.queue_file.parent.mkdir(parents=True, exist_ok=True)
        tmp_path = self.queue_file.with_suffix(".tmp")
        tmp_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
        tmp_path.replace(self.queue_file)

    def _normalize_task(self, task: dict[str, Any]) -> dict[str, Any]:
        status = str(task.get("status") or "QUEUED").upper()
        if status not in self.VALID_STATUSES:
            status = "QUEUED"
        priority = max(1, min(safe_int(task.get("priority"), 3), 5))
        return {
            "id": str(task.get("id") or "").strip(),
            "status": status,
            "repo": str(task.get("repo") or "*").strip() or "*",
            "repo_path": str(task.get("repo_path") or "").strip(),
            "title": str(task.get("title") or "").strip(),
            "details": str(task.get("details") or "").strip(),
            "priority": priority,
            "source": str(task.get("source") or "operator").strip() or "operator",
            "created_at": str(task.get("created_at") or ""),
            "updated_at": str(task.get("updated_at") or ""),
            "claimed_at": str(task.get("claimed_at") or ""),
            "done_at": str(task.get("done_at") or ""),
            "blocked_at": str(task.get("blocked_at") or ""),
            "route_model": str(task.get("route_model") or ""),
            "route_mode": str(task.get("route_mode") or ""),
            "route_reason": str(task.get("route_reason") or ""),
            "route_claimed_count": max(0, safe_int(task.get("route_claimed_count"), 0)),
            "route_updated_at": str(task.get("route_updated_at") or ""),
            "is_interrupt": bool(to_bool(task.get("is_interrupt"))),
        }

    def _task_sort_key(self, task: dict[str, Any]) -> tuple[int, str, str]:
        return (
            max(1, min(safe_int(task.get("priority"), 3), 5)),
            str(task.get("created_at") or ""),
            str(task.get("id") or ""),
        )

    def _make_task_id(self, title: str, tasks: list[dict[str, Any]]) -> str:
        slug = re.sub(r"[^a-z0-9]+", "-", str(title or "").lower()).strip("-")
        if not slug:
            slug = "task"
        slug = slug[:24]
        base = f"q-{dt.datetime.now(dt.timezone.utc).strftime('%Y%m%d-%H%M%S')}-{slug}"
        existing = {str(item.get("id") or "") for item in tasks}
        if base not in existing:
            return base
        return f"{base}-{int(time.time())}"

    def summary(self, limit: int = 20) -> dict[str, Any]:
        with self._lock:
            payload = self._read_payload()
            tasks = [self._normalize_task(item) for item in payload.get("tasks", []) if isinstance(item, dict)]

        counts: dict[str, int] = {status: 0 for status in self.VALID_STATUSES}
        for task in tasks:
            counts[task["status"]] = counts.get(task["status"], 0) + 1

        queued = [item for item in tasks if item["status"] == "QUEUED"]
        queued.sort(key=self._task_sort_key)
        claimed = [item for item in tasks if item["status"] == "CLAIMED"]
        claimed.sort(key=self._task_sort_key)

        return {
            "generated_at": iso_utc(utc_now()),
            "path": str(self.queue_file),
            "counts": counts,
            "queued": queued[: max(1, limit)],
            "claimed": claimed[: max(1, limit)],
            "total": len(tasks),
        }

    def list_tasks(self, status: str = "", repo: str = "", limit: int = 100) -> list[dict[str, Any]]:
        with self._lock:
            payload = self._read_payload()
            tasks = [self._normalize_task(item) for item in payload.get("tasks", []) if isinstance(item, dict)]

        status_filter = str(status or "").upper().strip()
        repo_filter = str(repo or "").lower().strip()
        filtered: list[dict[str, Any]] = []
        for task in tasks:
            if status_filter and task["status"] != status_filter:
                continue
            if repo_filter:
                task_repo = str(task.get("repo") or "").lower()
                task_path = str(task.get("repo_path") or "").lower()
                if repo_filter not in task_repo and repo_filter not in task_path:
                    continue
            filtered.append(task)

        filtered.sort(key=self._task_sort_key)
        return filtered[: max(1, limit)]

    def add_task(
        self,
        *,
        title: str,
        details: str = "",
        repo: str = "*",
        repo_path: str = "",
        priority: int = 3,
        route_model: str = "",
        route_mode: str = "",
        route_reason: str = "",
        route_claimed_count: int = 0,
        route_updated_at: str = "",
        is_interrupt: bool = False,
        source: str = "control_plane",
        task_id: str = "",
    ) -> dict[str, Any]:
        task_title = str(title or "").strip()
        if not task_title:
            raise ValueError("title is required")

        task_details = str(details or "").strip()
        task_repo = str(repo or "*").strip() or "*"
        task_repo_path = str(repo_path or "").strip()
        task_source = str(source or "control_plane").strip() or "control_plane"
        task_priority = max(1, min(safe_int(priority, 3), 5))

        with self._lock:
            payload = self._read_payload()
            tasks = [item for item in payload.get("tasks", []) if isinstance(item, dict)]
            resolved_id = str(task_id or "").strip()
            if not resolved_id:
                resolved_id = self._make_task_id(task_title, tasks)
            else:
                known_ids = {str(item.get("id") or "") for item in tasks}
                if resolved_id in known_ids:
                    resolved_id = f"{resolved_id}-{int(time.time())}"

            now = iso_utc(utc_now())
            task = {
                "id": resolved_id,
                "status": "QUEUED",
                "repo": task_repo,
                "repo_path": task_repo_path,
                "title": task_title,
                "details": task_details,
                "priority": task_priority,
                "route_model": str(route_model or "").strip(),
                "route_mode": str(route_mode or "").strip(),
                "route_reason": str(route_reason or "").strip(),
                "route_claimed_count": max(0, safe_int(route_claimed_count, 0)),
                "route_updated_at": str(route_updated_at or "").strip(),
                "source": task_source,
                "is_interrupt": bool(to_bool(is_interrupt)),
                "created_at": now,
                "updated_at": now,
            }
            tasks.append(task)
            payload["generated_at"] = now
            payload["tasks"] = tasks
            self._write_payload(payload)
            return self._normalize_task(task)

    def update_task(self, task_id: str, status: str, note: str = "") -> dict[str, Any] | None:
        normalized_id = str(task_id or "").strip()
        if not normalized_id:
            raise ValueError("task id is required")

        normalized_status = str(status or "").upper().strip()
        if normalized_status not in self.VALID_STATUSES:
            raise ValueError(f"invalid status: {status}")

        note_text = str(note or "").strip()
        with self._lock:
            payload = self._read_payload()
            tasks = [item for item in payload.get("tasks", []) if isinstance(item, dict)]
            now = iso_utc(utc_now())
            updated_task: dict[str, Any] | None = None
            for task in tasks:
                if str(task.get("id") or "") != normalized_id:
                    continue
                task["status"] = normalized_status
                task["updated_at"] = now
                if note_text:
                    task["operator_note"] = note_text
                if normalized_status == "DONE":
                    task["done_at"] = now
                elif normalized_status == "BLOCKED":
                    task["blocked_at"] = now
                elif normalized_status == "CLAIMED":
                    task["claimed_at"] = now
                updated_task = dict(task)
                break
            if updated_task is None:
                return None
            payload["generated_at"] = now
            payload["tasks"] = tasks
            self._write_payload(payload)
            return self._normalize_task(updated_task)


class LaunchPresetStore:
    VALID_MODES = {"auto", "custom"}

    def __init__(self, preset_file: Path):
        self.preset_file = preset_file
        self._lock = threading.Lock()

    def _read_payload(self) -> dict[str, Any]:
        if not self.preset_file.exists():
            return {"generated_at": iso_utc(utc_now()), "items": []}
        try:
            payload = json.loads(self.preset_file.read_text(encoding="utf-8", errors="replace"))
        except json.JSONDecodeError:
            return {"generated_at": iso_utc(utc_now()), "items": []}
        if not isinstance(payload, dict):
            return {"generated_at": iso_utc(utc_now()), "items": []}
        items = payload.get("items")
        if not isinstance(items, list):
            payload["items"] = []
        return payload

    def _write_payload(self, payload: dict[str, Any]) -> None:
        self.preset_file.parent.mkdir(parents=True, exist_ok=True)
        self.preset_file.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    def _normalize_item(self, item: dict[str, Any]) -> dict[str, Any]:
        mode = str(item.get("mode") or "auto").strip().lower()
        if mode not in self.VALID_MODES:
            mode = "auto"
        payload = {
            "id": str(item.get("id") or "").strip(),
            "name": str(item.get("name") or "").strip(),
            "code_root": str(item.get("code_root") or "").strip(),
            "mode": mode,
            "parallel_repos": max(1, min(safe_int(item.get("parallel_repos"), 5), 64)),
            "max_cycles": max(1, min(safe_int(item.get("max_cycles"), 30), 10000)),
            "tasks_per_repo": max(0, min(safe_int(item.get("tasks_per_repo"), 0), 1000)),
            "selected_repos": item.get("selected_repos") if isinstance(item.get("selected_repos"), list) else [],
            "created_at": str(item.get("created_at") or ""),
            "updated_at": str(item.get("updated_at") or ""),
        }
        return payload

    def list_presets(self, limit: int = 200) -> list[dict[str, Any]]:
        with self._lock:
            payload = self._read_payload()
            items = [self._normalize_item(item) for item in payload.get("items", []) if isinstance(item, dict)]
            items.sort(key=lambda item: str(item.get("updated_at") or ""), reverse=True)
            return items[: max(1, min(limit, 5000))]

    def upsert_preset(self, request: dict[str, Any]) -> dict[str, Any]:
        name = str(request.get("name") or "").strip()
        code_root = str(request.get("code_root") or "").strip()
        if not name:
            raise ValueError("name is required")
        if not code_root:
            raise ValueError("code_root is required")

        mode = str(request.get("mode") or "auto").strip().lower()
        if mode not in self.VALID_MODES:
            mode = "auto"
        selected_repos = request.get("selected_repos") if isinstance(request.get("selected_repos"), list) else []

        with self._lock:
            payload = self._read_payload()
            items = [item for item in payload.get("items", []) if isinstance(item, dict)]
            existing_ids = {str(item.get("id") or "").strip() for item in items}
            preset_id = str(request.get("id") or "").strip()
            if not preset_id:
                seed = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") or "preset"
                candidate = seed
                suffix = 1
                while candidate in existing_ids:
                    suffix += 1
                    candidate = f"{seed}-{suffix}"
                preset_id = candidate

            now = iso_utc(utc_now())
            normalized = {
                "id": preset_id,
                "name": name,
                "code_root": code_root,
                "mode": mode,
                "parallel_repos": max(1, min(safe_int(request.get("parallel_repos"), 5), 64)),
                "max_cycles": max(1, min(safe_int(request.get("max_cycles"), 30), 10000)),
                "tasks_per_repo": max(0, min(safe_int(request.get("tasks_per_repo"), 0), 1000)),
                "selected_repos": selected_repos[:5000],
                "created_at": now,
                "updated_at": now,
            }

            replaced = False
            for idx, item in enumerate(items):
                if str(item.get("id") or "").strip() != preset_id:
                    continue
                normalized["created_at"] = str(item.get("created_at") or now)
                items[idx] = normalized
                replaced = True
                break
            if not replaced:
                items.append(normalized)

            payload["generated_at"] = now
            payload["items"] = items
            self._write_payload(payload)
            return self._normalize_item(normalized)

    def delete_preset(self, preset_id: str) -> bool:
        normalized_id = str(preset_id or "").strip()
        if not normalized_id:
            return False
        with self._lock:
            payload = self._read_payload()
            items = [item for item in payload.get("items", []) if isinstance(item, dict)]
            next_items = [item for item in items if str(item.get("id") or "").strip() != normalized_id]
            if len(next_items) == len(items):
                return False
            payload["generated_at"] = iso_utc(utc_now())
            payload["items"] = next_items
            self._write_payload(payload)
            return True


class RunController:
    def __init__(self, clone_root: Path, logs_dir: Path, monitor: CloneMonitor):
        self.clone_root = clone_root
        self.logs_dir = logs_dir
        self.monitor = monitor
        self.script_path = clone_root / "scripts" / "run_clone_loop.sh"
        self.managed_state_path = logs_dir / "control-plane-managed.json"

    def _load_managed_state(self) -> dict[str, Any]:
        if not self.managed_state_path.exists():
            return {}
        try:
            payload = json.loads(self.managed_state_path.read_text(encoding="utf-8", errors="replace"))
        except json.JSONDecodeError:
            return {}
        if isinstance(payload, dict):
            return payload
        return {}

    def _save_managed_state(self, payload: dict[str, Any]) -> None:
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        self.managed_state_path.write_text(
            json.dumps(payload, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )

    def _pid_alive(self, pid: int) -> bool:
        if pid <= 0:
            return False
        try:
            os.kill(pid, 0)
            return True
        except OSError:
            return False

    def _pid_command(self, pid: int) -> str:
        if pid <= 0:
            return ""
        try:
            proc = subprocess.run(
                ["ps", "-o", "command=", "-p", str(pid)],
                capture_output=True,
                text=True,
                check=False,
            )
        except OSError:
            return ""
        if proc.returncode != 0:
            return ""
        return proc.stdout.strip()

    def _pid_is_loop(self, pid: int) -> bool:
        command = self._pid_command(pid)
        return "run_clone_loop.sh" in command

    def _all_loop_processes(self) -> list[dict[str, Any]]:
        try:
            proc = subprocess.run(
                ["ps", "-axo", "pid=,pgid=,etime=,command="],
                capture_output=True,
                text=True,
                check=False,
            )
        except OSError:
            return []
        if proc.returncode != 0:
            return []
        processes: list[dict[str, Any]] = []
        for line in proc.stdout.splitlines():
            raw = line.strip()
            if not raw:
                continue
            parts = raw.split(None, 3)
            if len(parts) < 4:
                continue
            pid = safe_int(parts[0], 0)
            pgid = safe_int(parts[1], 0)
            etimes = parse_etime_seconds(parts[2])
            command = parts[3]
            if pid > 0 and "run_clone_loop.sh" in command:
                processes.append(
                    {
                        "pid": pid,
                        "pgid": pgid,
                        "etimes": etimes,
                        "command": command,
                    }
                )
        processes.sort(key=lambda item: (safe_int(item.get("etimes"), 0), safe_int(item.get("pid"), 0)))
        return processes

    def _all_loop_pids(self) -> list[int]:
        return [safe_int(item.get("pid"), 0) for item in self._all_loop_processes()]

    def _signal_pgid(self, pgid: int, sig: int) -> bool:
        if pgid <= 0:
            return False
        try:
            os.killpg(pgid, sig)
            return True
        except OSError:
            return False

    def _signal_pid(self, pid: int, sig: int) -> bool:
        if pid <= 0:
            return False
        # Prefer signaling the process group. For non-leader processes, fall back to direct PID.
        try:
            os.killpg(pid, sig)
            return True
        except OSError:
            pass
        try:
            os.kill(pid, sig)
            return True
        except OSError:
            return False

    def _to_bool(self, value: Any) -> bool:
        if isinstance(value, bool):
            return value
        if isinstance(value, (int, float)):
            return value != 0
        text = str(value).strip().lower()
        return text in {"1", "true", "yes", "y", "on"}

    def _resolve_requested_repos(self, request: dict[str, Any]) -> tuple[list[dict[str, Any]], str | None]:
        raw_requested = request.get("repos")
        if raw_requested is None:
            return [], None
        if not isinstance(raw_requested, list):
            return [], "repos must be a list"
        if not raw_requested:
            return [], "at least one repo must be selected"

        catalog = self.monitor.repos_catalog()
        catalog_by_name = {str(item.get("name") or ""): item for item in catalog}
        catalog_by_path = {str(item.get("path") or ""): item for item in catalog}

        resolved: list[dict[str, Any]] = []
        seen_paths: set[str] = set()
        for item in raw_requested:
            candidate_name = ""
            candidate_path = ""
            candidate_branch = ""
            candidate_objective = ""
            candidate_tasks_raw: Any = None
            candidate_max_cycles_raw: Any = None
            candidate_max_commits_raw: Any = None

            if isinstance(item, dict):
                candidate_name = str(item.get("name") or "").strip()
                candidate_path = str(item.get("path") or "").strip()
                candidate_branch = str(item.get("branch") or "").strip()
                candidate_objective = str(item.get("objective") or "").strip()
                candidate_tasks_raw = item.get("tasks_per_repo")
                candidate_max_cycles_raw = item.get("max_cycles_per_run")
                candidate_max_commits_raw = item.get("max_commits_per_run")
            elif isinstance(item, str):
                token = item.strip()
                if not token:
                    continue
                candidate_name = token
                candidate_path = token
            else:
                continue

            base = None
            if candidate_path and candidate_path in catalog_by_path:
                base = catalog_by_path[candidate_path]
            elif candidate_name and candidate_name in catalog_by_name:
                base = catalog_by_name[candidate_name]

            if isinstance(item, str):
                path = str((base or {}).get("path") or "").strip()
            else:
                path = candidate_path or str((base or {}).get("path") or "").strip()
            if not path or path in seen_paths:
                continue
            seen_paths.add(path)

            name = candidate_name or str((base or {}).get("name") or Path(path).name).strip() or Path(path).name or path
            branch = candidate_branch or str((base or {}).get("branch") or "main").strip() or "main"
            objective = candidate_objective or str((base or {}).get("objective") or "").strip()

            entry: dict[str, Any] = {
                "name": name,
                "path": path,
                "branch": branch,
                "objective": objective,
            }
            tasks_value = candidate_tasks_raw
            if tasks_value is None and isinstance(base, dict):
                tasks_value = base.get("tasks_per_repo")
            tasks_per_repo = safe_int(tasks_value, -1)
            if tasks_per_repo >= 0:
                entry["tasks_per_repo"] = max(0, min(tasks_per_repo, 1000))

            max_cycles_value = candidate_max_cycles_raw
            if max_cycles_value is None and isinstance(base, dict):
                max_cycles_value = base.get("max_cycles_per_run")
            max_cycles_per_run = safe_int(max_cycles_value, -1)
            if max_cycles_per_run >= 0:
                entry["max_cycles_per_run"] = max(0, min(max_cycles_per_run, 10000))

            max_commits_value = candidate_max_commits_raw
            if max_commits_value is None and isinstance(base, dict):
                max_commits_value = base.get("max_commits_per_run")
            max_commits_per_run = safe_int(max_commits_value, -1)
            if max_commits_per_run >= 0:
                entry["max_commits_per_run"] = max(0, min(max_commits_per_run, 10000))
            resolved.append(entry)

        if not resolved:
            return [], "no valid repos resolved from selection"
        return resolved, None

    def _default_code_root(self) -> Path:
        return resolve_default_code_root(self.clone_root, self.monitor.repos_file)

    def _resolve_code_root(self, raw_value: Any) -> Path:
        value = str(raw_value or "").strip()
        if not value:
            return self._default_code_root()
        path = Path(value).expanduser()
        if not path.is_absolute():
            path = self.clone_root / path
        return path.resolve()

    def _run_command(
        self,
        args: list[str],
        cwd: Path | None = None,
        timeout: int = 120,
    ) -> tuple[int, str, str, str]:
        try:
            proc = subprocess.run(
                args,
                cwd=str(cwd) if cwd else None,
                capture_output=True,
                text=True,
                check=False,
                timeout=timeout,
            )
            return proc.returncode, proc.stdout.strip(), proc.stderr.strip(), ""
        except subprocess.TimeoutExpired:
            return 124, "", "", f"command timed out: {' '.join(args)}"
        except OSError as exc:
            return 127, "", "", str(exc)

    def _git_default_branch(self, repo_path: Path, fallback: str = "main") -> str:
        return git_default_branch(repo_path, fallback=fallback)

    def _normalize_repo_identifier(self, raw_value: str, fallback_owner: str = "") -> tuple[str, str] | None:
        value = str(raw_value or "").strip()
        if not value:
            return None
        if value.startswith("https://github.com/"):
            value = value[len("https://github.com/") :]
        elif value.startswith("http://github.com/"):
            value = value[len("http://github.com/") :]
        elif value.startswith("git@github.com:"):
            value = value[len("git@github.com:") :]
        value = value.strip().strip("/")
        if value.endswith(".git"):
            value = value[: -4]
        if not value:
            return None
        if "/" not in value:
            if not fallback_owner:
                return None
            value = f"{fallback_owner}/{value}"
        owner, _, repo = value.partition("/")
        owner = owner.strip()
        repo = repo.strip()
        if not owner or not repo:
            return None
        return f"{owner}/{repo}", repo

    def _read_repos_payload(self) -> dict[str, Any]:
        return read_repos_payload(self.monitor.repos_file)

    def _write_repos_payload(self, payload: dict[str, Any]) -> None:
        self.monitor.repos_file.parent.mkdir(parents=True, exist_ok=True)
        tmp_path = self.monitor.repos_file.with_suffix(".tmp")
        tmp_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
        tmp_path.replace(self.monitor.repos_file)
        with self.monitor._cache_lock:
            self.monitor._repos_cache = None
            self.monitor._commit_cache.clear()
            self.monitor._run_detailed_commits_cache.clear()

    def _upsert_catalog_entries(self, entries: list[dict[str, Any]], code_root: Path) -> tuple[int, int]:
        payload = self._read_repos_payload()
        repos = [dict(item) for item in payload.get("repos", []) if isinstance(item, dict)]
        by_path: dict[str, int] = {}
        for idx, item in enumerate(repos):
            key = str(item.get("path") or "").strip()
            if key:
                by_path[key] = idx

        added = 0
        updated = 0
        changed = False
        for entry in entries:
            raw_path = str(entry.get("path") or "").strip()
            if not raw_path:
                continue
            normalized: dict[str, Any] = {
                "name": str(entry.get("name") or Path(raw_path).name).strip() or Path(raw_path).name or raw_path,
                "path": raw_path,
                "branch": str(entry.get("branch") or "main").strip() or "main",
            }
            objective = str(entry.get("objective") or "").strip()
            if objective:
                normalized["objective"] = objective
            for field, clamp_max in (("tasks_per_repo", 1000), ("max_cycles_per_run", 10000), ("max_commits_per_run", 10000)):
                value = safe_int(entry.get(field), -1)
                if value >= 0:
                    normalized[field] = max(0, min(value, clamp_max))

            existing_idx = by_path.get(raw_path)
            if existing_idx is None:
                repos.append(normalized)
                by_path[raw_path] = len(repos) - 1
                added += 1
                changed = True
                continue

            merged = dict(repos[existing_idx])
            merged["name"] = normalized["name"]
            merged["path"] = normalized["path"]
            merged["branch"] = normalized["branch"]
            if "objective" in normalized:
                merged["objective"] = normalized["objective"]
            elif "objective" not in merged:
                merged["objective"] = ""
            for field in ("tasks_per_repo", "max_cycles_per_run", "max_commits_per_run"):
                if field in normalized:
                    merged[field] = normalized[field]
            if merged != repos[existing_idx]:
                repos[existing_idx] = merged
                updated += 1
                changed = True

        code_root_text = str(code_root)
        if payload.get("code_root") != code_root_text:
            payload["code_root"] = code_root_text
            changed = True
        if payload.get("repos") != repos:
            repos.sort(key=lambda item: str(item.get("name") or "").lower())
            payload["repos"] = repos
            changed = True
        if changed:
            payload["generated_at"] = iso_utc(utc_now())
            self._write_repos_payload(payload)
        return added, updated

    def local_repos(self, request: dict[str, Any] | None = None) -> dict[str, Any]:
        request = request or {}
        code_root = self._resolve_code_root(request.get("code_root"))
        max_depth = max(1, min(safe_int(request.get("max_depth"), 6), 16))
        limit = max(1, min(safe_int(request.get("limit"), 5000), 25000))
        if not code_root.exists():
            return {
                "ok": False,
                "error": f"code_root does not exist: {code_root}",
                "code_root": str(code_root),
                "count": 0,
                "repos": [],
            }
        if not code_root.is_dir():
            return {
                "ok": False,
                "error": f"code_root is not a directory: {code_root}",
                "code_root": str(code_root),
                "count": 0,
                "repos": [],
            }

        catalog_payload = self._read_repos_payload()
        catalog_paths = {str(item.get("path") or "").strip() for item in catalog_payload.get("repos", []) if isinstance(item, dict)}
        repos = discover_local_git_repos(
            code_root=code_root,
            max_depth=max_depth,
            limit=limit,
            catalog_paths=catalog_paths,
        )
        return {
            "ok": True,
            "code_root": str(code_root),
            "count": len(repos),
            "repos": repos,
        }

    def github_status(self, request: dict[str, Any] | None = None) -> dict[str, Any]:
        request = request or {}
        code_root = self._resolve_code_root(request.get("code_root"))
        gh_path = shutil.which("gh") or ""
        repos_file = str(self.monitor.repos_file)
        if not gh_path:
            return {
                "ok": False,
                "gh_available": False,
                "authenticated": False,
                "login": "",
                "code_root": str(code_root),
                "code_root_exists": code_root.exists(),
                "repos_file": repos_file,
                "error": "GitHub CLI (gh) is not installed",
            }

        rc, out, err, command_error = self._run_command(["gh", "auth", "status", "--hostname", "github.com"], timeout=20)
        if command_error:
            return {
                "ok": False,
                "gh_available": True,
                "authenticated": False,
                "login": "",
                "code_root": str(code_root),
                "code_root_exists": code_root.exists(),
                "repos_file": repos_file,
                "error": command_error,
            }
        authenticated = rc == 0
        login = ""
        if authenticated:
            user_rc, user_out, _, _ = self._run_command(["gh", "api", "user", "--jq", ".login"], timeout=20)
            if user_rc == 0 and user_out:
                login = user_out.strip()
        error = ""
        if not authenticated:
            error = err or out or "not authenticated"
        return {
            "ok": authenticated,
            "gh_available": True,
            "authenticated": authenticated,
            "login": login,
            "code_root": str(code_root),
            "code_root_exists": code_root.exists(),
            "repos_file": repos_file,
            "error": error,
        }

    def github_repos(self, request: dict[str, Any] | None = None) -> dict[str, Any]:
        request = request or {}
        status = self.github_status(request)
        if not status.get("gh_available"):
            return {
                "ok": False,
                "error": str(status.get("error") or "GitHub CLI (gh) is not installed"),
                "github": status,
                "repos": [],
            }
        if not status.get("authenticated"):
            return {
                "ok": False,
                "error": str(status.get("error") or "Run `gh auth login` first"),
                "github": status,
                "repos": [],
            }

        owner = str(request.get("owner") or status.get("login") or "").strip()
        if not owner:
            return {"ok": False, "error": "unable to determine GitHub owner", "github": status, "repos": []}
        limit = max(1, min(safe_int(request.get("limit"), 150), 500))
        rc, out, err, command_error = self._run_command(
            [
                "gh",
                "repo",
                "list",
                owner,
                "--limit",
                str(limit),
                "--json",
                "name,nameWithOwner,owner,isPrivate,isFork,description,updatedAt,defaultBranchRef,url",
            ],
            timeout=60,
        )
        if command_error:
            return {"ok": False, "error": command_error, "github": status, "repos": []}
        if rc != 0:
            return {"ok": False, "error": err or out or "failed to list GitHub repos", "github": status, "repos": []}

        try:
            decoded = json.loads(out or "[]")
        except json.JSONDecodeError:
            decoded = []
        raw_repos = decoded if isinstance(decoded, list) else []
        code_root = Path(str(status.get("code_root") or ""))
        catalog = self.monitor.repos_catalog()
        catalog_paths = {str(item.get("path") or "") for item in catalog}

        repos: list[dict[str, Any]] = []
        for item in raw_repos:
            if not isinstance(item, dict):
                continue
            name = str(item.get("name") or "").strip()
            owner_obj = item.get("owner") if isinstance(item.get("owner"), dict) else {}
            owner_login = str(owner_obj.get("login") or owner).strip() or owner
            name_with_owner = str(item.get("nameWithOwner") or f"{owner_login}/{name}").strip()
            if not name or not name_with_owner:
                continue
            local_path = (code_root / name).resolve()
            local_git = local_path.joinpath(".git").exists()
            in_catalog = str(local_path) in catalog_paths
            default_branch_ref = item.get("defaultBranchRef") if isinstance(item.get("defaultBranchRef"), dict) else {}
            default_branch = str(default_branch_ref.get("name") or "main").strip() or "main"
            repos.append(
                {
                    "name": name,
                    "name_with_owner": name_with_owner,
                    "owner": owner_login,
                    "description": str(item.get("description") or "").strip(),
                    "is_private": bool(item.get("isPrivate")),
                    "is_fork": bool(item.get("isFork")),
                    "updated_at": str(item.get("updatedAt") or "").strip(),
                    "default_branch": default_branch,
                    "url": str(item.get("url") or "").strip(),
                    "path_candidate": str(local_path),
                    "local_exists": local_git,
                    "in_catalog": in_catalog,
                    "imported": in_catalog or local_git,
                }
            )
        repos.sort(key=lambda item: str(item.get("updated_at") or ""), reverse=True)
        return {
            "ok": True,
            "github": status,
            "owner": owner,
            "count": len(repos),
            "repos": repos,
        }

    def github_import(self, request: dict[str, Any] | None = None) -> dict[str, Any]:
        request = request or {}
        status = self.github_status(request)
        if not status.get("gh_available"):
            return {"ok": False, "error": str(status.get("error") or "GitHub CLI (gh) is not installed")}
        if not status.get("authenticated"):
            return {"ok": False, "error": str(status.get("error") or "Run `gh auth login` first")}

        raw_repos = request.get("repos")
        if not isinstance(raw_repos, list) or not raw_repos:
            return {"ok": False, "error": "repos must be a non-empty list"}

        code_root = self._resolve_code_root(request.get("code_root"))
        code_root.mkdir(parents=True, exist_ok=True)
        fallback_owner = str(status.get("login") or "").strip()

        imported: list[dict[str, Any]] = []
        failed: list[dict[str, Any]] = []
        upserts: list[dict[str, Any]] = []

        for raw_item in raw_repos:
            raw_identifier = ""
            requested_name = ""
            requested_branch = ""
            requested_objective = ""
            if isinstance(raw_item, dict):
                raw_identifier = str(
                    raw_item.get("name_with_owner")
                    or raw_item.get("nameWithOwner")
                    or raw_item.get("full_name")
                    or raw_item.get("repo")
                    or ""
                ).strip()
                requested_name = str(raw_item.get("name") or "").strip()
                requested_branch = str(raw_item.get("default_branch") or raw_item.get("branch") or "").strip()
                requested_objective = str(raw_item.get("objective") or "").strip()
            elif isinstance(raw_item, str):
                raw_identifier = raw_item.strip()
            else:
                continue

            normalized = self._normalize_repo_identifier(raw_identifier, fallback_owner=fallback_owner)
            if normalized is None:
                failed.append({"repo": raw_identifier, "error": "invalid repository identifier"})
                continue
            name_with_owner, repo_name = normalized
            local_name = requested_name or repo_name
            target_path = (code_root / local_name).resolve()

            if target_path.exists() and not target_path.joinpath(".git").exists():
                failed.append(
                    {
                        "repo": name_with_owner,
                        "path": str(target_path),
                        "error": "target path exists but is not a git repository",
                    }
                )
                continue

            clone_performed = False
            clone_error = ""
            if not target_path.exists():
                rc, out, err, command_error = self._run_command(
                    ["gh", "repo", "clone", name_with_owner, str(target_path)],
                    timeout=600,
                )
                clone_performed = rc == 0
                if command_error:
                    clone_error = command_error
                elif rc != 0:
                    clone_error = err or out or "clone failed"
                if clone_error:
                    failed.append({"repo": name_with_owner, "path": str(target_path), "error": clone_error})
                    continue

            branch = requested_branch or self._git_default_branch(target_path, fallback="main")
            upserts.append(
                {
                    "name": local_name,
                    "path": str(target_path),
                    "branch": branch,
                    "objective": requested_objective,
                }
            )
            imported.append(
                {
                    "repo": name_with_owner,
                    "name": local_name,
                    "path": str(target_path),
                    "branch": branch,
                    "status": "cloned" if clone_performed else "already_local",
                }
            )

        added = 0
        updated = 0
        if upserts:
            added, updated = self._upsert_catalog_entries(upserts, code_root=code_root)

        return {
            "ok": len(imported) > 0 and len(failed) == 0,
            "code_root": str(code_root),
            "repos_file": str(self.monitor.repos_file),
            "imported_count": len(imported),
            "failed_count": len(failed),
            "added_to_catalog": added,
            "updated_in_catalog": updated,
            "imported": imported,
            "failed": failed,
            "repos": self.monitor.repos_catalog(),
        }

    def status_payload(self, latest_run: dict[str, Any] | None = None) -> dict[str, Any]:
        if latest_run is None:
            latest_run = self.monitor.latest_run()

        run_id = str((latest_run or {}).get("run_id") or "")
        run_state_raw = str((latest_run or {}).get("state") or "unknown")
        run_pid = safe_int((latest_run or {}).get("pid"), 0)
        run_pid_alive = self._pid_alive(run_pid)
        run_command = self._pid_command(run_pid) if run_pid_alive else ""
        run_state = normalize_effective_run_state(run_state_raw, pid=run_pid, pid_alive_hint=run_pid_alive)
        active = bool(latest_run and run_is_online(run_state, pid=run_pid, pid_alive_hint=run_pid_alive))

        managed = self._load_managed_state()
        launcher_pid = safe_int(managed.get("launcher_pid"), 0)
        launcher_alive = self._pid_alive(launcher_pid)
        launcher_command = self._pid_command(launcher_pid) if launcher_alive else ""
        loop_processes = self._all_loop_processes()
        loop_pids = [safe_int(item.get("pid"), 0) for item in loop_processes]
        loop_group_ids = sorted({safe_int(item.get("pgid"), 0) for item in loop_processes if safe_int(item.get("pgid"), 0) > 0})

        return {
            "active": active,
            "script_exists": self.script_path.exists(),
            "run_id": run_id,
            "run_state": run_state,
            "run_state_raw": run_state_raw,
            "run_pid": run_pid,
            "run_pid_alive": run_pid_alive,
            "run_pid_command": run_command,
            "managed_launcher_pid": launcher_pid,
            "managed_launcher_alive": launcher_alive,
            "managed_launcher_command": launcher_command,
            "managed_launcher_log": str(managed.get("launcher_log") or ""),
            "managed_started_at": str(managed.get("started_at") or ""),
            "managed_settings": managed.get("settings") if isinstance(managed.get("settings"), dict) else {},
            "loop_processes": loop_processes,
            "loop_pids": loop_pids,
            "loop_group_ids": loop_group_ids,
            "loop_groups_count": len(loop_group_ids),
            "multiple_loops_detected": len(loop_group_ids) > 1,
        }

    def start_run(self, request: dict[str, Any] | None = None) -> dict[str, Any]:
        request = request or {}
        if not self.script_path.exists():
            return {"ok": False, "error": f"missing script: {self.script_path}"}
        if not os.access(self.script_path, os.X_OK):
            return {"ok": False, "error": f"script is not executable: {self.script_path}"}

        current = self.status_payload()
        if current.get("active"):
            return {"ok": False, "error": "a run is already active", "control_status": current}

        parallel_repos = max(1, min(safe_int(request.get("parallel_repos"), 5), 64))
        max_cycles = max(1, min(safe_int(request.get("max_cycles"), 30), 10000))
        tasks_per_repo = max(0, min(safe_int(request.get("tasks_per_repo"), 0), 1000))
        model = str(request.get("model") or "").strip()
        selected_repos, selected_repos_error = self._resolve_requested_repos(request)
        if selected_repos_error:
            return {"ok": False, "error": selected_repos_error, "control_status": current}
        run_tag = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%d-%H%M%S")
        self.logs_dir.mkdir(parents=True, exist_ok=True)

        env = os.environ.copy()
        env["PARALLEL_REPOS"] = str(parallel_repos)
        env["MAX_CYCLES"] = str(max_cycles)
        env["TASKS_PER_REPO"] = str(tasks_per_repo)
        env["REPOS_FILE"] = str(self.monitor.repos_file)
        selected_repos_file = ""
        if selected_repos:
            selected_repos_path = self.logs_dir / f"run-{run_tag}-repos.json"
            selected_repos_path.write_text(json.dumps({"repos": selected_repos}, indent=2) + "\n", encoding="utf-8")
            selected_repos_file = str(selected_repos_path)
            env["REPOS_FILE"] = selected_repos_file
        if model:
            env["MODEL"] = model

        launcher_log = self.logs_dir / f"control-plane-launcher-{run_tag}.log"

        handle = launcher_log.open("ab")
        try:
            proc = subprocess.Popen(
                [str(self.script_path)],
                cwd=str(self.clone_root),
                env=env,
                stdout=handle,
                stderr=subprocess.STDOUT,
                start_new_session=True,
            )
        finally:
            handle.close()

        settings: dict[str, Any] = {
            "parallel_repos": parallel_repos,
            "max_cycles": max_cycles,
            "tasks_per_repo": tasks_per_repo,
            "selected_repos_count": len(selected_repos) if selected_repos else len(self.monitor.repos_catalog()),
            "repos_file": env.get("REPOS_FILE", ""),
        }
        if model:
            settings["model"] = model

        self._save_managed_state(
            {
                "started_at": iso_utc(utc_now()),
                "launcher_pid": proc.pid,
                "launcher_log": str(launcher_log),
                "settings": settings,
            }
        )

        # Let the run initialize status files before responding.
        time.sleep(0.35)
        return {
            "ok": True,
            "message": "run started",
            "launcher_pid": proc.pid,
            "launcher_log": str(launcher_log),
            "repos_file": env.get("REPOS_FILE", ""),
            "selected_repos_count": len(selected_repos) if selected_repos else len(self.monitor.repos_catalog()),
            "selected_repos_file": selected_repos_file,
            "control_status": self.status_payload(),
        }

    def stop_run(self, request: dict[str, Any] | None = None) -> dict[str, Any]:
        request = request or {}
        force = self._to_bool(request.get("force", False))
        wait_seconds = max(2, min(safe_int(request.get("wait_seconds"), 12), 30))

        status = self.status_payload()
        candidate_pids: list[int] = []
        candidate_groups: set[int] = set()

        run_pid = safe_int(status.get("run_pid"), 0)
        if run_pid and status.get("run_pid_alive") and self._pid_is_loop(run_pid):
            candidate_pids.append(run_pid)
            try:
                candidate_groups.add(os.getpgid(run_pid))
            except OSError:
                candidate_groups.add(run_pid)

        launcher_pid = safe_int(status.get("managed_launcher_pid"), 0)
        if launcher_pid and status.get("managed_launcher_alive") and self._pid_is_loop(launcher_pid):
            if launcher_pid not in candidate_pids:
                candidate_pids.append(launcher_pid)
            try:
                candidate_groups.add(os.getpgid(launcher_pid))
            except OSError:
                candidate_groups.add(launcher_pid)

        for item in status.get("loop_processes", []) or []:
            loop_pid = safe_int(item.get("pid"), 0)
            if not loop_pid or loop_pid in candidate_pids:
                continue
            if self._pid_is_loop(loop_pid) and self._pid_alive(loop_pid):
                candidate_pids.append(loop_pid)
                try:
                    candidate_groups.add(os.getpgid(loop_pid))
                except OSError:
                    candidate_groups.add(loop_pid)

        if not candidate_pids:
            return {"ok": False, "error": "no active run loop process found", "control_status": status}

        for pid in candidate_pids:
            self._signal_pid(pid, signal.SIGTERM)
        for group_id in list(candidate_groups):
            self._signal_pgid(group_id, signal.SIGTERM)

        deadline = time.time() + wait_seconds
        while time.time() < deadline:
            if not any(self._pid_alive(pid) for pid in candidate_pids):
                break
            time.sleep(0.25)

        still_alive = [pid for pid in candidate_pids if self._pid_alive(pid)]
        if still_alive and force:
            for group_id in list(candidate_groups):
                self._signal_pgid(group_id, signal.SIGKILL)
            for pid in still_alive:
                self._signal_pid(pid, signal.SIGKILL)
            time.sleep(0.2)
            still_alive = [pid for pid in candidate_pids if self._pid_alive(pid)]

        return {
            "ok": len(still_alive) == 0,
            "message": "run stopped" if not still_alive else "run still active after stop request",
            "signaled_pids": candidate_pids,
            "signaled_groups": sorted(candidate_groups),
            "still_alive_pids": still_alive,
            "control_status": self.status_payload(),
        }

    def restart_run(self, request: dict[str, Any] | None = None) -> dict[str, Any]:
        request = request or {}
        stop_payload = self.stop_run({"force": True, "wait_seconds": request.get("wait_seconds", 12)})
        start_payload = self.start_run(request)
        return {
            "ok": bool(start_payload.get("ok")),
            "stop": stop_payload,
            "start": start_payload,
            "control_status": self.status_payload(),
        }

    def normalize_loops(self, request: dict[str, Any] | None = None) -> dict[str, Any]:
        request = request or {}
        force = self._to_bool(request.get("force", True))
        wait_seconds = max(2, min(safe_int(request.get("wait_seconds"), 8), 30))
        explicit_keep_pgid = safe_int(request.get("keep_pgid"), 0)

        status = self.status_payload()
        loop_processes = list(status.get("loop_processes") or [])
        if not loop_processes:
            return {"ok": False, "error": "no loop processes found", "control_status": status}

        groups: dict[int, list[int]] = {}
        for item in loop_processes:
            pgid = safe_int(item.get("pgid"), 0)
            pid = safe_int(item.get("pid"), 0)
            if pgid <= 0 or pid <= 0:
                continue
            groups.setdefault(pgid, []).append(pid)

        if len(groups) <= 1:
            only_group = next(iter(groups.keys()), 0)
            return {
                "ok": True,
                "message": "already normalized",
                "kept_group": only_group,
                "stopped_groups": [],
                "control_status": self.status_payload(),
            }

        keep_pgid = 0
        if explicit_keep_pgid and explicit_keep_pgid in groups:
            keep_pgid = explicit_keep_pgid
        else:
            run_pid = safe_int(status.get("run_pid"), 0)
            for item in loop_processes:
                if safe_int(item.get("pid"), 0) == run_pid:
                    keep_pgid = safe_int(item.get("pgid"), 0)
                    break
            if keep_pgid <= 0:
                # Keep the newest loop group (smallest elapsed time).
                keep_pgid = safe_int(loop_processes[0].get("pgid"), 0)

        groups_to_stop = [pgid for pgid in groups.keys() if pgid != keep_pgid and pgid > 0]
        if not groups_to_stop:
            return {
                "ok": True,
                "message": "nothing to normalize",
                "kept_group": keep_pgid,
                "stopped_groups": [],
                "control_status": self.status_payload(),
            }

        for pgid in groups_to_stop:
            if not self._signal_pgid(pgid, signal.SIGTERM):
                for pid in groups.get(pgid, []):
                    self._signal_pid(pid, signal.SIGTERM)

        deadline = time.time() + wait_seconds
        while time.time() < deadline:
            current = self._all_loop_processes()
            alive_groups = {safe_int(item.get("pgid"), 0) for item in current if safe_int(item.get("pgid"), 0) > 0}
            if not any(pgid in alive_groups for pgid in groups_to_stop):
                break
            time.sleep(0.2)

        current = self._all_loop_processes()
        alive_groups = {safe_int(item.get("pgid"), 0) for item in current if safe_int(item.get("pgid"), 0) > 0}
        still_alive_groups = [pgid for pgid in groups_to_stop if pgid in alive_groups]

        if still_alive_groups and force:
            for pgid in still_alive_groups:
                if not self._signal_pgid(pgid, signal.SIGKILL):
                    for pid in groups.get(pgid, []):
                        self._signal_pid(pid, signal.SIGKILL)
            time.sleep(0.25)
            current = self._all_loop_processes()
            alive_groups = {safe_int(item.get("pgid"), 0) for item in current if safe_int(item.get("pgid"), 0) > 0}
            still_alive_groups = [pgid for pgid in groups_to_stop if pgid in alive_groups]

        return {
            "ok": len(still_alive_groups) == 0,
            "message": "normalized" if not still_alive_groups else "some loop groups still alive",
            "kept_group": keep_pgid,
            "stopped_groups": groups_to_stop,
            "still_alive_groups": still_alive_groups,
            "control_status": self.status_payload(),
        }


class NotificationManager:
    def __init__(self, logs_dir: Path):
        self.logs_dir = logs_dir
        self.config_path = logs_dir / "control-plane-notifications-config.json"
        self.state_path = logs_dir / "control-plane-notifications-state.json"
        self._lock = threading.Lock()

    def _to_bool(self, value: Any) -> bool:
        if isinstance(value, bool):
            return value
        if isinstance(value, (int, float)):
            return value != 0
        text = str(value).strip().lower()
        return text in {"1", "true", "yes", "y", "on"}

    def _coerce_alert_id_list(self, value: Any, fallback: list[str] | None = None) -> list[str]:
        fallback = list(fallback or DEFAULT_ENABLED_ALERT_IDS)
        candidates: list[str] = []
        if isinstance(value, str):
            text = value.strip()
            if text.lower() in {"all", "*"}:
                candidates = list(NOTIFIABLE_ALERT_IDS)
            elif text:
                candidates = [part.strip() for part in re.split(r"[, ]+", text) if part.strip()]
        elif isinstance(value, list):
            for item in value:
                text = str(item).strip()
                if text:
                    candidates.append(text)

        valid = [item for item in candidates if item in NOTIFIABLE_ALERT_IDS]
        if not valid:
            valid = [item for item in fallback if item in NOTIFIABLE_ALERT_IDS]
        if not valid:
            valid = list(DEFAULT_ENABLED_ALERT_IDS)

        # Keep canonical order and drop duplicates.
        valid_set = set(valid)
        return [item for item in NOTIFIABLE_ALERT_IDS if item in valid_set]

    def _default_config(self) -> dict[str, Any]:
        min_severity = str(os.environ.get("CLONE_NOTIFY_MIN_SEVERITY", "warn")).strip().lower()
        if min_severity not in SEVERITY_RANK:
            min_severity = "warn"
        enabled_alert_ids = self._coerce_alert_id_list(
            os.environ.get("CLONE_NOTIFY_ALERT_IDS", ""),
            fallback=DEFAULT_ENABLED_ALERT_IDS,
        )
        return {
            "enabled": self._to_bool(os.environ.get("CLONE_NOTIFY_ENABLED", "0")),
            "webhook_url": str(os.environ.get("CLONE_NOTIFY_WEBHOOK_URL", "")).strip(),
            "min_severity": min_severity,
            "cooldown_seconds": max(30, min(safe_int(os.environ.get("CLONE_NOTIFY_COOLDOWN_SECONDS", "600"), 600), 86400)),
            "send_ok": self._to_bool(os.environ.get("CLONE_NOTIFY_SEND_OK", "0")),
            "enabled_alert_ids": enabled_alert_ids,
        }

    def _load_json_file(self, path: Path, default: dict[str, Any]) -> dict[str, Any]:
        if not path.exists():
            return dict(default)
        try:
            payload = json.loads(path.read_text(encoding="utf-8", errors="replace"))
        except json.JSONDecodeError:
            return dict(default)
        if isinstance(payload, dict):
            merged = dict(default)
            merged.update(payload)
            return merged
        return dict(default)

    def _save_json_file(self, path: Path, payload: dict[str, Any]) -> None:
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    def _sanitize_config(self, payload: dict[str, Any], current: dict[str, Any] | None = None) -> dict[str, Any]:
        current = current or self._default_config()
        merged = dict(current)
        merged.update(payload)

        min_severity = str(merged.get("min_severity", "warn")).strip().lower()
        if min_severity not in SEVERITY_RANK:
            min_severity = str(current.get("min_severity", "warn"))

        return {
            "enabled": self._to_bool(merged.get("enabled", current.get("enabled", False))),
            "webhook_url": str(merged.get("webhook_url", current.get("webhook_url", ""))).strip(),
            "min_severity": min_severity,
            "cooldown_seconds": max(30, min(safe_int(merged.get("cooldown_seconds", current.get("cooldown_seconds", 600)), 600), 86400)),
            "send_ok": self._to_bool(merged.get("send_ok", current.get("send_ok", False))),
            "enabled_alert_ids": self._coerce_alert_id_list(
                merged.get("enabled_alert_ids", current.get("enabled_alert_ids", DEFAULT_ENABLED_ALERT_IDS)),
                fallback=list(current.get("enabled_alert_ids", DEFAULT_ENABLED_ALERT_IDS)),
            ),
        }

    def get_config(self) -> dict[str, Any]:
        with self._lock:
            return self._get_config_unlocked()

    def _get_config_unlocked(self) -> dict[str, Any]:
        defaults = self._default_config()
        loaded = self._load_json_file(self.config_path, defaults)
        return self._sanitize_config(loaded, defaults)

    def update_config(self, payload: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            current = self._get_config_unlocked()
            updated = self._sanitize_config(payload, current)
            self._save_json_file(self.config_path, updated)
            return updated

    def _default_state(self) -> dict[str, Any]:
        return {
            "last_sent_by_key": {},
            "events": [],
            "last_missing_webhook_event_at": "",
        }

    def _load_state(self) -> dict[str, Any]:
        state = self._load_json_file(self.state_path, self._default_state())
        if not isinstance(state.get("last_sent_by_key"), dict):
            state["last_sent_by_key"] = {}
        if not isinstance(state.get("events"), list):
            state["events"] = []
        if not isinstance(state.get("last_missing_webhook_event_at"), str):
            state["last_missing_webhook_event_at"] = ""
        return state

    def _append_event(self, state: dict[str, Any], event: dict[str, Any]) -> None:
        events = list(state.get("events") or [])
        events.append(event)
        state["events"] = events[-500:]

    def recent_events(self, limit: int = 50) -> list[dict[str, Any]]:
        with self._lock:
            state = self._load_state()
            events = list(state.get("events") or [])
            return events[-max(1, min(limit, 500)) :]

    def status_payload(self) -> dict[str, Any]:
        with self._lock:
            config = self._get_config_unlocked()
            state = self._load_state()
            events = list(state.get("events") or [])
            last_event = events[-1] if events else None
            return {
                "enabled": bool(config.get("enabled")),
                "webhook_configured": bool(config.get("webhook_url")),
                "min_severity": str(config.get("min_severity") or "warn"),
                "cooldown_seconds": safe_int(config.get("cooldown_seconds"), 600),
                "send_ok": bool(config.get("send_ok")),
                "enabled_alert_ids": self._coerce_alert_id_list(config.get("enabled_alert_ids"), fallback=DEFAULT_ENABLED_ALERT_IDS),
                "known_alert_ids": list(NOTIFIABLE_ALERT_IDS),
                "events_count": len(events),
                "last_event": last_event,
            }

    def _can_send_for_alert(self, config: dict[str, Any], alert: dict[str, Any], state: dict[str, Any]) -> tuple[bool, str]:
        enabled_alert_ids = set(self._coerce_alert_id_list(config.get("enabled_alert_ids"), fallback=DEFAULT_ENABLED_ALERT_IDS))
        alert_id = str(alert.get("id") or "").strip()
        if alert_id and alert_id not in enabled_alert_ids:
            return False, "alert_disabled"

        severity = str(alert.get("severity") or "info").strip().lower()
        if severity == "ok" and not self._to_bool(config.get("send_ok", False)):
            return False, "ok_suppressed"
        if severity_rank(severity) < severity_rank(str(config.get("min_severity") or "warn")):
            return False, "below_threshold"

        alert_key = f"{alert.get('run_id','')}|{alert.get('id','')}|{alert.get('detail','')}"
        last_sent_raw = str((state.get("last_sent_by_key") or {}).get(alert_key) or "")
        last_sent = parse_iso(last_sent_raw)
        if last_sent:
            cooldown = max(30, safe_int(config.get("cooldown_seconds"), 600))
            elapsed = max(0, int((utc_now() - last_sent).total_seconds()))
            if elapsed < cooldown:
                return False, "cooldown"
        return True, "eligible"

    def _post_webhook(self, webhook_url: str, payload: dict[str, Any]) -> tuple[bool, str]:
        body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        request = Request(
            webhook_url,
            data=body,
            headers={
                "Content-Type": "application/json; charset=utf-8",
                "User-Agent": "clone-control-plane/1.0",
            },
            method="POST",
        )
        try:
            with urlopen(request, timeout=8) as response:
                code = safe_int(response.status, 0)
                if 200 <= code < 300:
                    return True, f"http_{code}"
                return False, f"http_{code}"
        except HTTPError as exc:
            return False, f"http_{safe_int(exc.code, 0)}"
        except URLError as exc:
            return False, f"url_error:{exc.reason}"
        except OSError as exc:
            return False, f"os_error:{exc}"

    def process_alerts(self, alerts: list[dict[str, Any]], context: dict[str, Any] | None = None) -> dict[str, Any]:
        context = context or {}
        with self._lock:
            config = self._get_config_unlocked()
            state = self._load_state()

            summary = {
                "checked": len(alerts),
                "eligible": 0,
                "sent": 0,
                "suppressed": 0,
                "errors": 0,
            }
            if not alerts:
                return summary

            webhook_url = str(config.get("webhook_url") or "").strip()
            if not config.get("enabled"):
                summary["suppressed"] = len(alerts)
                return summary
            if not webhook_url:
                summary["errors"] = len(alerts)
                now = utc_now()
                cooldown = max(300, safe_int(config.get("cooldown_seconds"), 600))
                last_missing = parse_iso(str(state.get("last_missing_webhook_event_at") or ""))
                should_log = True
                if last_missing:
                    elapsed = max(0, int((now - last_missing).total_seconds()))
                    should_log = elapsed >= cooldown
                if should_log:
                    self._append_event(
                        state,
                        {
                            "ts": iso_utc(now),
                            "status": "error",
                            "reason": "missing_webhook_url",
                            "alert_id": "",
                            "severity": "warn",
                            "run_id": str((context.get("latest_run") or {}).get("run_id") or ""),
                        },
                    )
                    state["last_missing_webhook_event_at"] = iso_utc(now)
                    self._save_json_file(self.state_path, state)
                return summary

            for raw_alert in alerts:
                alert = dict(raw_alert or {})
                can_send, reason = self._can_send_for_alert(config, alert, state)
                if not can_send:
                    summary["suppressed"] += 1
                    continue
                summary["eligible"] += 1
                payload = {
                    "kind": "clone_alert",
                    "sent_at": iso_utc(utc_now()),
                    "alert": alert,
                    "context": {
                        "latest_run": context.get("latest_run"),
                        "control_status": context.get("control_status"),
                    },
                }
                ok, transport = self._post_webhook(webhook_url, payload)

                event = {
                    "ts": iso_utc(utc_now()),
                    "status": "sent" if ok else "error",
                    "reason": transport,
                    "alert_id": str(alert.get("id") or ""),
                    "severity": str(alert.get("severity") or ""),
                    "run_id": str(alert.get("run_id") or ""),
                    "title": str(alert.get("title") or ""),
                    "detail": str(alert.get("detail") or ""),
                }
                self._append_event(state, event)

                if ok:
                    summary["sent"] += 1
                    alert_key = f"{alert.get('run_id','')}|{alert.get('id','')}|{alert.get('detail','')}"
                    state.setdefault("last_sent_by_key", {})[alert_key] = iso_utc(utc_now())
                else:
                    summary["errors"] += 1

            self._save_json_file(self.state_path, state)
            return summary

    def send_test_notification(self, message: str, severity: str = "warn") -> dict[str, Any]:
        severity_value = str(severity or "warn").strip().lower()
        if severity_value not in SEVERITY_RANK:
            severity_value = "warn"

        with self._lock:
            config = self._get_config_unlocked()
            webhook_url = str(config.get("webhook_url") or "").strip()
            if not webhook_url:
                return {"ok": False, "error": "webhook_url is not configured"}

            payload = {
                "kind": "clone_alert_test",
                "sent_at": iso_utc(utc_now()),
                "alert": {
                    "id": "notification_test",
                    "severity": severity_value,
                    "run_id": "",
                    "title": "Test notification",
                    "detail": message or "Clone control plane notification test.",
                },
                "context": {
                    "source": "control_plane_test",
                },
            }
            ok, transport = self._post_webhook(webhook_url, payload)
            state = self._load_state()
            self._append_event(
                state,
                {
                    "ts": iso_utc(utc_now()),
                    "status": "sent" if ok else "error",
                    "reason": transport,
                    "alert_id": "notification_test",
                    "severity": severity_value,
                    "run_id": "",
                    "title": "Test notification",
                    "detail": message or "Clone control plane notification test.",
                },
            )
            self._save_json_file(self.state_path, state)

            return {"ok": ok, "reason": transport}


class AgentManager:
    def __init__(self, logs_dir: Path, controller: RunController):
        self.logs_dir = logs_dir
        self.controller = controller
        self.config_path = logs_dir / "control-plane-agent-config.json"
        self.state_path = logs_dir / "control-plane-agent-state.json"
        self._lock = threading.Lock()

    def _default_config(self) -> dict[str, Any]:
        return {
            "enabled": False,
            "mode": "safe",
            "interval_seconds": 60,
            "max_restarts_per_hour": 2,
            "max_normalizes_per_hour": 4,
            "allowed_alert_ids": list(AGENT_ALLOWED_ALERT_IDS),
        }

    def _default_state(self) -> dict[str, Any]:
        return {
            "last_tick_at": "",
            "last_action_at": "",
            "last_action_key": "",
            "recent_actions": [],
            "last_plan": [],
        }

    def _to_bool(self, value: Any) -> bool:
        if isinstance(value, bool):
            return value
        if isinstance(value, (int, float)):
            return value != 0
        text = str(value).strip().lower()
        return text in {"1", "true", "yes", "y", "on"}

    def _load_json_file(self, path: Path, default: dict[str, Any]) -> dict[str, Any]:
        if not path.exists():
            return dict(default)
        try:
            payload = json.loads(path.read_text(encoding="utf-8", errors="replace"))
        except json.JSONDecodeError:
            return dict(default)
        if isinstance(payload, dict):
            merged = dict(default)
            merged.update(payload)
            return merged
        return dict(default)

    def _save_json_file(self, path: Path, payload: dict[str, Any]) -> None:
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    def _sanitize_config(self, payload: dict[str, Any], current: dict[str, Any] | None = None) -> dict[str, Any]:
        current = current or self._default_config()
        merged = dict(current)
        merged.update(payload)

        mode = str(merged.get("mode", current.get("mode", "safe"))).strip().lower()
        if mode not in {"safe", "assertive"}:
            mode = "safe"

        interval_seconds = max(30, min(safe_int(merged.get("interval_seconds", current.get("interval_seconds", 60)), 60), 1800))
        max_restarts_per_hour = max(0, min(safe_int(merged.get("max_restarts_per_hour", current.get("max_restarts_per_hour", 2)), 2), 20))
        max_normalizes_per_hour = max(0, min(safe_int(merged.get("max_normalizes_per_hour", current.get("max_normalizes_per_hour", 4)), 4), 40))

        raw_alert_ids = merged.get("allowed_alert_ids", current.get("allowed_alert_ids", AGENT_ALLOWED_ALERT_IDS))
        if isinstance(raw_alert_ids, str):
            candidates = [part.strip() for part in re.split(r"[, ]+", raw_alert_ids) if part.strip()]
        elif isinstance(raw_alert_ids, list):
            candidates = [str(item).strip() for item in raw_alert_ids if str(item).strip()]
        else:
            candidates = list(AGENT_ALLOWED_ALERT_IDS)
        valid_set = {item for item in candidates if item in AGENT_ALLOWED_ALERT_IDS}
        if not valid_set:
            valid_set = set(AGENT_ALLOWED_ALERT_IDS)
        allowed_alert_ids = [item for item in AGENT_ALLOWED_ALERT_IDS if item in valid_set]

        return {
            "enabled": self._to_bool(merged.get("enabled", current.get("enabled", False))),
            "mode": mode,
            "interval_seconds": interval_seconds,
            "max_restarts_per_hour": max_restarts_per_hour,
            "max_normalizes_per_hour": max_normalizes_per_hour,
            "allowed_alert_ids": allowed_alert_ids,
        }

    def _sanitize_state(self, payload: dict[str, Any], current: dict[str, Any] | None = None) -> dict[str, Any]:
        current = current or self._default_state()
        merged = dict(current)
        merged.update(payload)
        events = merged.get("recent_actions")
        if not isinstance(events, list):
            events = []
        events = [item for item in events if isinstance(item, dict)][-500:]
        plan = merged.get("last_plan")
        if not isinstance(plan, list):
            plan = []
        plan = [item for item in plan if isinstance(item, dict)][:40]
        return {
            "last_tick_at": str(merged.get("last_tick_at") or ""),
            "last_action_at": str(merged.get("last_action_at") or ""),
            "last_action_key": str(merged.get("last_action_key") or ""),
            "recent_actions": events,
            "last_plan": plan,
        }

    def _get_config_unlocked(self) -> dict[str, Any]:
        defaults = self._default_config()
        loaded = self._load_json_file(self.config_path, defaults)
        return self._sanitize_config(loaded, defaults)

    def _get_state_unlocked(self) -> dict[str, Any]:
        defaults = self._default_state()
        loaded = self._load_json_file(self.state_path, defaults)
        return self._sanitize_state(loaded, defaults)

    def get_config(self) -> dict[str, Any]:
        with self._lock:
            return self._get_config_unlocked()

    def update_config(self, payload: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            current = self._get_config_unlocked()
            updated = self._sanitize_config(payload, current)
            self._save_json_file(self.config_path, updated)
            return updated

    def _append_action_event(self, state: dict[str, Any], event: dict[str, Any]) -> None:
        events = list(state.get("recent_actions") or [])
        events.append(event)
        state["recent_actions"] = events[-500:]

    def _action_count_last_hour(self, state: dict[str, Any], action: str) -> int:
        now = utc_now()
        count = 0
        for event in list(state.get("recent_actions") or []):
            if str(event.get("action") or "") != action:
                continue
            ts = parse_iso(str(event.get("ts") or ""))
            if not ts:
                continue
            if (now - ts).total_seconds() <= 3600:
                count += 1
        return count

    def build_plan(self, snapshot: dict[str, Any], config: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        cfg = config or self._default_config()
        control_status = snapshot.get("control_status") if isinstance(snapshot, dict) else {}
        alerts = snapshot.get("alerts") if isinstance(snapshot, dict) else []
        alerts = [item for item in (alerts or []) if isinstance(item, dict)]
        allowed_alerts = set(cfg.get("allowed_alert_ids") or AGENT_ALLOWED_ALERT_IDS)
        alert_ids = {str(item.get("id") or "") for item in alerts}
        steps: list[dict[str, Any]] = []

        multiple_groups = bool(control_status.get("multiple_loops_detected")) or safe_int(control_status.get("loop_groups_count"), 0) > 1
        if multiple_groups and "duplicate_loop_groups" in allowed_alerts:
            steps.append(
                {
                    "key": "normalize_loops",
                    "action": "normalize_loops",
                    "label": "Normalize duplicate loop groups",
                    "reason": "Multiple loop process groups are active.",
                    "priority": 100,
                    "safe_auto_allowed": True,
                }
            )

        if "run_stalled" in alert_ids and "run_stalled" in allowed_alerts:
            steps.append(
                {
                    "key": "restart_run",
                    "action": "restart_run",
                    "label": "Restart stalled run",
                    "reason": "Latest run appears stalled with no fresh events.",
                    "priority": 95,
                    "safe_auto_allowed": True,
                }
            )

        if "lock_contention" in alert_ids and "lock_contention" in allowed_alerts and multiple_groups:
            steps.append(
                {
                    "key": "normalize_for_lock_contention",
                    "action": "normalize_loops",
                    "label": "Normalize loops to reduce lock contention",
                    "reason": "High lock contention with multiple loop groups.",
                    "priority": 90,
                    "safe_auto_allowed": True,
                }
            )

        if "no_workers_cycle" in alert_ids and "no_workers_cycle" in allowed_alerts:
            steps.append(
                {
                    "key": "observe_no_workers",
                    "action": "observe",
                    "label": "Observe no-worker cycles",
                    "reason": "No-worker cycles typically need repo/runtime investigation.",
                    "priority": 50,
                    "safe_auto_allowed": False,
                }
            )

        if "no_commits_long_run" in alert_ids and "no_commits_long_run" in allowed_alerts:
            steps.append(
                {
                    "key": "observe_no_commits",
                    "action": "observe",
                    "label": "Inspect long run without commits",
                    "reason": "No commits in long run usually needs manual inspection.",
                    "priority": 55,
                    "safe_auto_allowed": False,
                }
            )

        if not steps:
            steps.append(
                {
                    "key": "monitor_only",
                    "action": "observe",
                    "label": "No immediate action",
                    "reason": "No executable high-priority agent actions detected.",
                    "priority": 10,
                    "safe_auto_allowed": False,
                }
            )

        dedup: dict[str, dict[str, Any]] = {}
        for item in sorted(steps, key=lambda entry: -safe_int(entry.get("priority"), 0)):
            key = str(item.get("key") or item.get("action") or "")
            if key and key not in dedup:
                dedup[key] = item
        return list(dedup.values())

    def _can_execute_step(
        self, step: dict[str, Any], snapshot: dict[str, Any], config: dict[str, Any], state: dict[str, Any]
    ) -> tuple[bool, str]:
        action = str(step.get("action") or "")
        control_status = snapshot.get("control_status") if isinstance(snapshot, dict) else {}

        if action == "normalize_loops":
            if safe_int(control_status.get("loop_groups_count"), 0) <= 1:
                return False, "single_loop_group"
            limit = safe_int(config.get("max_normalizes_per_hour"), 4)
            if limit >= 0 and self._action_count_last_hour(state, action) >= limit:
                return False, "normalize_rate_limited"
            return True, "ok"

        if action == "restart_run":
            if not self._to_bool(control_status.get("active")):
                return False, "run_not_active"
            limit = safe_int(config.get("max_restarts_per_hour"), 2)
            if limit >= 0 and self._action_count_last_hour(state, action) >= limit:
                return False, "restart_rate_limited"
            return True, "ok"

        return False, "non_executable_action"

    def _execute_step(self, step: dict[str, Any]) -> dict[str, Any]:
        action = str(step.get("action") or "")
        if action == "normalize_loops":
            return self.controller.normalize_loops({"force": True, "wait_seconds": 8})
        if action == "restart_run":
            return self.controller.restart_run({"wait_seconds": 12})
        return {"ok": False, "error": "unsupported_action"}

    def _choose_next_step(
        self, plan: list[dict[str, Any]], snapshot: dict[str, Any], config: dict[str, Any], state: dict[str, Any], source: str
    ) -> tuple[dict[str, Any] | None, str]:
        mode = str(config.get("mode") or "safe").lower()
        for step in plan:
            safe_auto = self._to_bool(step.get("safe_auto_allowed"))
            if source == "autopilot" and mode != "assertive" and not safe_auto:
                continue
            can_run, reason = self._can_execute_step(step, snapshot, config, state)
            if can_run:
                return step, "ok"
            if reason in {"normalize_rate_limited", "restart_rate_limited"}:
                return None, reason
        return None, "no_runnable_step"

    def status_payload(self, snapshot: dict[str, Any] | None = None) -> dict[str, Any]:
        with self._lock:
            config = self._get_config_unlocked()
            state = self._get_state_unlocked()
            plan = self.build_plan(snapshot or {}, config=config) if snapshot else list(state.get("last_plan") or [])
            state["last_plan"] = plan
            self._save_json_file(self.state_path, state)
            return {
                "config": config,
                "state": state,
                "plan": plan,
            }

    def run_next(self, snapshot: dict[str, Any], source: str = "manual") -> dict[str, Any]:
        with self._lock:
            config = self._get_config_unlocked()
            state = self._get_state_unlocked()
            plan = self.build_plan(snapshot, config=config)
            state["last_plan"] = plan

            step, reason = self._choose_next_step(plan, snapshot, config, state, source=source)
            if not step:
                now_iso = iso_utc(utc_now())
                state["last_tick_at"] = now_iso
                event = {
                    "ts": now_iso,
                    "source": source,
                    "status": "skipped",
                    "action": "",
                    "label": "",
                    "reason": reason,
                    "detail": "No runnable step selected.",
                    "ok": False,
                }
                self._append_action_event(state, event)
                self._save_json_file(self.state_path, state)
                return {
                    "ok": False,
                    "executed": False,
                    "reason": reason,
                    "event": event,
                    "plan": plan,
                    "config": config,
                    "state": state,
                }

            result = self._execute_step(step)
            ok = self._to_bool(result.get("ok"))
            now_iso = iso_utc(utc_now())
            state["last_tick_at"] = now_iso
            state["last_action_at"] = now_iso
            state["last_action_key"] = str(step.get("key") or step.get("action") or "")
            event = {
                "ts": now_iso,
                "source": source,
                "status": "sent" if ok else "error",
                "action": str(step.get("action") or ""),
                "label": str(step.get("label") or ""),
                "reason": "executed" if ok else str(result.get("error") or "action_failed"),
                "detail": str(step.get("reason") or ""),
                "ok": ok,
            }
            self._append_action_event(state, event)
            self._save_json_file(self.state_path, state)
            return {
                "ok": ok,
                "executed": True,
                "step": step,
                "event": event,
                "result": result,
                "plan": plan,
                "config": config,
                "state": state,
            }

    def run_plan(self, snapshot: dict[str, Any], source: str = "manual", max_steps: int = 2) -> dict[str, Any]:
        executed: list[dict[str, Any]] = []
        attempted = max(1, min(max_steps, 8))
        for _ in range(attempted):
            payload = self.run_next(snapshot=snapshot, source=source)
            if not payload.get("executed"):
                return {
                    "ok": len(executed) > 0 and all(self._to_bool(item.get("ok")) for item in executed),
                    "executed_steps": executed,
                    "stopped_reason": payload.get("reason"),
                    "last": payload,
                }
            executed.append(
                {
                    "ok": self._to_bool(payload.get("ok")),
                    "step": payload.get("step"),
                    "event": payload.get("event"),
                }
            )
            if not self._to_bool(payload.get("ok")):
                break
        return {
            "ok": len(executed) > 0 and all(self._to_bool(item.get("ok")) for item in executed),
            "executed_steps": executed,
            "stopped_reason": "",
            "last": executed[-1] if executed else {},
        }

    def tick(self, snapshot: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            config = self._get_config_unlocked()
            state = self._get_state_unlocked()
            if not self._to_bool(config.get("enabled")):
                return {"ok": True, "executed": False, "reason": "disabled"}

            now = utc_now()
            interval = max(30, safe_int(config.get("interval_seconds"), 60))
            last_tick = parse_iso(str(state.get("last_tick_at") or ""))
            if last_tick and (now - last_tick).total_seconds() < interval:
                return {"ok": True, "executed": False, "reason": "interval_not_reached"}

        # run_next acquires the lock internally; keep this outside to avoid nested locking.
        return self.run_next(snapshot=snapshot, source="autopilot")


class APIHandler(SimpleHTTPRequestHandler):
    monitor: CloneMonitor
    controller: RunController
    notifier: NotificationManager
    agent: AgentManager
    task_queue: TaskQueueStore
    preset_store: LaunchPresetStore
    static_dir: Path
    launch_info: dict[str, Any]

    def __init__(self, *args: Any, directory: str | None = None, **kwargs: Any):
        super().__init__(*args, directory=directory or str(self.static_dir), **kwargs)

    def log_message(self, format: str, *args: Any) -> None:  # noqa: A003
        # Keep terminal noise low; preserve default behavior under DEBUG.
        if os.environ.get("CLONE_CONTROL_PLANE_DEBUG"):
            super().log_message(format, *args)

    def _send_json(self, payload: dict[str, Any], status: int = 200) -> None:
        body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        try:
            self.end_headers()
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError):
            # Client disconnected before body flush; avoid noisy traceback spam.
            return

    def _launch_diagnostics_payload(self) -> dict[str, Any]:
        launch = dict(self.launch_info or {})
        ui_log_path = Path(str(launch.get("ui_log") or self.monitor.logs_dir / "control-plane-ui.log"))
        pid_file_path = Path(str(launch.get("pid_file") or self.monitor.logs_dir / "control-plane-ui-8787.pid"))
        status = self.controller.status_payload()
        latest_run = with_effective_run_fields(self.monitor.latest_run())
        log_tail = tail_lines(ui_log_path, 80)
        error_pattern = re.compile(r"(Traceback|Exception|Error|Failed|BrokenPipe|ConnectionReset)", re.IGNORECASE)
        error_lines = [line for line in log_tail if error_pattern.search(line)]
        return {
            "generated_at": iso_utc(utc_now()),
            "server": {
                "pid": os.getpid(),
                "started_at": str(launch.get("started_at") or ""),
                "host": str(launch.get("host") or ""),
                "port": safe_int(launch.get("port"), 0),
                "python": sys.version.split()[0],
            },
            "paths": {
                "clone_root": str(self.monitor.clone_root),
                "logs_dir": str(self.monitor.logs_dir),
                "ui_log": str(ui_log_path),
                "pid_file": str(pid_file_path),
                "repos_file": str(self.monitor.repos_file),
                "task_queue_file": str(self.task_queue.queue_file),
            },
            "files": {
                "ui_log_exists": ui_log_path.exists(),
                "ui_log_size_bytes": ui_log_path.stat().st_size if ui_log_path.exists() else 0,
                "pid_file_exists": pid_file_path.exists(),
            },
            "control_status": status,
            "latest_run": latest_run,
            "recent_log_errors": error_lines[-20:],
        }

    def _v1_system_status_payload(self) -> dict[str, Any]:
        status = self.controller.status_payload()
        return {
            "active": bool(status.get("active")),
            "run_state": str(status.get("run_state") or "unknown"),
            "run_state_raw": str(status.get("run_state_raw") or ""),
            "run_id": str(status.get("run_id") or ""),
            "run_pid": safe_int(status.get("run_pid"), 0),
            "updated_at": iso_utc(utc_now()),
        }

    def _v1_repos_payload(self, query: dict[str, list[str]]) -> dict[str, Any]:
        source = str(query.get("source", ["all"])[0] or "all").strip().lower()
        if source not in {"all", "local", "managed"}:
            source = "all"
        limit = max(1, min(safe_int(query.get("limit", ["200"])[0], 200), 5000))
        page = max(1, safe_int(query.get("page", ["1"])[0], 1))
        code_root = str(query.get("code_root", [""])[0] or "").strip()

        merged: dict[str, dict[str, Any]] = {}
        if source in {"all", "managed"}:
            for item in self.monitor.repos_catalog():
                if not isinstance(item, dict):
                    continue
                key = str(item.get("path") or item.get("name") or "")
                if not key:
                    continue
                payload = dict(item)
                payload["source"] = "managed"
                merged[key] = payload
        if source in {"all", "local"}:
            local_payload = self.controller.local_repos(
                {
                    "code_root": code_root,
                    "max_depth": query.get("max_depth", ["8"])[0],
                    "limit": query.get("scan_limit", ["15000"])[0],
                }
            )
            for item in local_payload.get("repos", []):
                if not isinstance(item, dict):
                    continue
                key = str(item.get("path") or item.get("name") or "")
                if not key:
                    continue
                payload = dict(item)
                payload["source"] = "local"
                if key in merged:
                    base = dict(merged[key])
                    base.update(payload)
                    payload = base
                    if source == "all":
                        payload["source"] = "all"
                merged[key] = payload

        items = list(merged.values())
        items.sort(key=lambda item: str(item.get("name") or "").lower())
        total = len(items)
        start = (page - 1) * limit
        paged_items = items[start : start + limit]
        return {
            "items": paged_items,
            "total": total,
            "page": page,
            "limit": limit,
            "has_more": start + limit < total,
            "source": source,
            "generated_at": iso_utc(utc_now()),
        }

    def _v1_runs_payload(self, query: dict[str, list[str]]) -> dict[str, Any]:
        limit = max(1, min(safe_int(query.get("limit", ["60"])[0], 60), 500))
        runs = self.monitor.list_runs(limit=limit)
        items: list[dict[str, Any]] = []
        for item in runs:
            run = with_effective_run_fields(item) or item
            items.append(
                {
                    "id": str(run.get("run_id") or ""),
                    "state": str(run.get("state") or "unknown"),
                    "state_raw": str(run.get("state_raw") or run.get("state") or "unknown"),
                    "started_at": str(run.get("started_at") or ""),
                    "ended_at": str(run.get("ended_at") or ""),
                    "duration_seconds": safe_int(run.get("duration_seconds"), 0),
                    "repo_count": safe_int(run.get("repo_count"), 0),
                    "repos_changed": safe_int(run.get("repos_changed_est"), 0),
                    "repos_no_change": safe_int(run.get("repos_no_change"), 0),
                    "run_online": bool(run.get("run_online")),
                }
            )
        return {"items": items, "limit": limit, "generated_at": iso_utc(utc_now())}

    def _v1_tasks_payload(self, query: dict[str, list[str]]) -> dict[str, Any]:
        status = str(query.get("status", [""])[0] or "")
        repo = str(query.get("repo", [""])[0] or "")
        limit = max(1, min(safe_int(query.get("limit", ["200"])[0], 200), 1000))
        return {
            "items": self.task_queue.list_tasks(status=status, repo=repo, limit=limit),
            "summary": self.task_queue.summary(limit=20),
            "generated_at": iso_utc(utc_now()),
        }

    def _send_v1_sse(self, parsed_query: dict[str, list[str]]) -> None:
        poll = float(parsed_query.get("poll", ["5"])[0])
        poll = max(1.0, min(poll, 60.0))
        cursor = 0

        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "keep-alive")
        self.end_headers()

        while True:
            snapshot = self.monitor.snapshot(
                history_limit=safe_int(parsed_query.get("history_limit", ["25"])[0], 25),
                commit_hours=safe_int(parsed_query.get("commit_hours", ["2"])[0], 2),
                commit_limit=safe_int(parsed_query.get("commit_limit", ["180"])[0], 180),
                event_limit=safe_int(parsed_query.get("event_limit", ["240"])[0], 240),
            )
            snapshot = self._attach_runtime_payload(snapshot, send_notifications=False)
            cursor += 1
            envelope = {
                "topic": "system",
                "type": "snapshot",
                "ts": iso_utc(utc_now()),
                "cursor": str(cursor),
                "payload": snapshot,
            }
            frame = f"data: {json.dumps(envelope, separators=(',', ':'))}\n\n".encode("utf-8")
            try:
                self.wfile.write(frame)
                self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError):
                break
            time.sleep(poll)

    def _read_json_body(self) -> dict[str, Any]:
        raw_len = safe_int(self.headers.get("Content-Length"), 0)
        if raw_len <= 0:
            return {}
        raw_len = min(raw_len, 1024 * 1024)
        body = self.rfile.read(raw_len).decode("utf-8", errors="replace")
        if not body.strip():
            return {}
        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            return {}
        if isinstance(payload, dict):
            return payload
        return {}

    def _attach_runtime_payload(self, payload: dict[str, Any], send_notifications: bool) -> dict[str, Any]:
        control_status = self.controller.status_payload(payload.get("latest_run"))
        payload["control_status"] = control_status
        payload["task_queue"] = self.task_queue.summary(limit=12)
        alerts = list(payload.get("alerts") or [])

        if bool(control_status.get("multiple_loops_detected")):
            run_id = str((payload.get("latest_run") or {}).get("run_id") or "")
            loop_count = len(list(control_status.get("loop_pids") or []))
            loop_groups = safe_int(control_status.get("loop_groups_count"), 0)
            duplicate_alert = {
                "id": "duplicate_loop_groups",
                "severity": "critical",
                "run_id": run_id,
                "title": "Multiple loop groups active",
                "detail": f"{loop_count} run_clone_loop.sh processes across {loop_groups} process groups.",
            }
            alerts = [item for item in alerts if str(item.get("id") or "") != "healthy"]
            if not any(str(item.get("id") or "") == "duplicate_loop_groups" for item in alerts):
                alerts.append(duplicate_alert)

        payload["alerts"] = alerts
        if send_notifications:
            delivery = self.notifier.process_alerts(
                alerts=alerts,
                context={
                    "latest_run": payload.get("latest_run"),
                    "control_status": control_status,
                },
            )
            payload["notification_delivery"] = delivery
        payload["notification_status"] = self.notifier.status_payload()
        if send_notifications:
            payload["agent_tick"] = self.agent.tick(payload)
        payload["agent_status"] = self.agent.status_payload(payload)
        return payload

    def _send_sse(self, parsed_query: dict[str, list[str]]) -> None:
        poll = float(parsed_query.get("poll", ["5"])[0])
        poll = max(1.0, min(poll, 60.0))
        commit_hours = safe_int(parsed_query.get("commit_hours", ["2"])[0], 2)
        alert_stall_minutes = safe_int(parsed_query.get("alert_stall_minutes", ["15"])[0], 15)
        alert_no_commit_minutes = safe_int(parsed_query.get("alert_no_commit_minutes", ["60"])[0], 60)
        alert_lock_skip_threshold = safe_int(parsed_query.get("alert_lock_skip_threshold", ["25"])[0], 25)

        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "keep-alive")
        self.end_headers()

        while True:
            payload = self.monitor.snapshot(
                history_limit=25,
                commit_hours=commit_hours,
                commit_limit=150,
                event_limit=220,
                alert_stall_minutes=alert_stall_minutes,
                alert_no_commit_minutes=alert_no_commit_minutes,
                alert_lock_skip_threshold=alert_lock_skip_threshold,
            )
            payload = self._attach_runtime_payload(payload, send_notifications=True)
            frame = f"data: {json.dumps(payload, separators=(',', ':'))}\n\n".encode("utf-8")
            try:
                self.wfile.write(frame)
                self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError):
                break
            time.sleep(poll)

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        query = parse_qs(parsed.query)
        normalized_path = parsed.path if parsed.path == "/" else parsed.path.rstrip("/")

        if normalized_path == "/api/health":
            self._send_json({"ok": True, "time": iso_utc(utc_now())})
            return

        if normalized_path == "/api/v1/system/status":
            self._send_json(self._v1_system_status_payload())
            return

        if normalized_path in {"/api/v1/system/launch-diagnostics", "/api/v1/system/launch_diagnostics"}:
            self._send_json(self._launch_diagnostics_payload())
            return

        if normalized_path == "/api/v1/repos":
            self._send_json(self._v1_repos_payload(query))
            return

        if normalized_path == "/api/v1/presets":
            limit = max(1, min(safe_int(query.get("limit", ["200"])[0], 200), 5000))
            self._send_json({"items": self.preset_store.list_presets(limit=limit), "generated_at": iso_utc(utc_now())})
            return

        if normalized_path == "/api/v1/runs":
            self._send_json(self._v1_runs_payload(query))
            return

        if normalized_path.startswith("/api/v1/runs/"):
            segments = [segment for segment in normalized_path.split("/") if segment]
            if len(segments) == 4:
                run_id = segments[3].strip()
                if not run_id:
                    self._send_json({"error": "run_id is required"}, status=400)
                    return
                payload = self.monitor.run_details(
                    run_id=run_id,
                    commit_limit=safe_int(query.get("commit_limit", ["120"])[0], 120),
                    run_log_limit=safe_int(query.get("run_log_limit", ["220"])[0], 220),
                    event_limit=safe_int(query.get("event_limit", ["300"])[0], 300),
                    alert_stall_minutes=safe_int(query.get("alert_stall_minutes", ["15"])[0], 15),
                    alert_no_commit_minutes=safe_int(query.get("alert_no_commit_minutes", ["60"])[0], 60),
                    alert_lock_skip_threshold=safe_int(query.get("alert_lock_skip_threshold", ["25"])[0], 25),
                )
                if payload is None:
                    self._send_json({"error": f"run not found: {run_id}"}, status=404)
                    return
                self._send_json(payload)
                return

        if normalized_path == "/api/v1/tasks":
            self._send_json(self._v1_tasks_payload(query))
            return

        if normalized_path == "/api/v1/stream":
            self._send_v1_sse(query)
            return

        if normalized_path in {"/api/launch_diagnostics", "/api/system/launch_diagnostics"}:
            self._send_json(self._launch_diagnostics_payload())
            return

        if normalized_path == "/api/snapshot":
            payload = self.monitor.snapshot(
                history_limit=safe_int(query.get("history_limit", ["25"])[0], 25),
                commit_hours=safe_int(query.get("commit_hours", ["2"])[0], 2),
                commit_limit=safe_int(query.get("commit_limit", ["180"])[0], 180),
                event_limit=safe_int(query.get("event_limit", ["250"])[0], 250),
                alert_stall_minutes=safe_int(query.get("alert_stall_minutes", ["15"])[0], 15),
                alert_no_commit_minutes=safe_int(query.get("alert_no_commit_minutes", ["60"])[0], 60),
                alert_lock_skip_threshold=safe_int(query.get("alert_lock_skip_threshold", ["25"])[0], 25),
            )
            payload = self._attach_runtime_payload(payload, send_notifications=True)
            self._send_json(payload)
            return

        if normalized_path == "/api/control/status":
            self._send_json({"control_status": self.controller.status_payload()})
            return

        if normalized_path == "/api/notifications/config":
            self._send_json({"config": self.notifier.get_config(), "status": self.notifier.status_payload()})
            return

        if normalized_path == "/api/notifications/events":
            self._send_json(
                {
                    "events": self.notifier.recent_events(limit=safe_int(query.get("limit", ["50"])[0], 50)),
                    "status": self.notifier.status_payload(),
                }
            )
            return

        if normalized_path == "/api/task_queue":
            status = query.get("status", [""])[0]
            repo = query.get("repo", [""])[0]
            limit = max(1, min(safe_int(query.get("limit", ["120"])[0], 120), 1000))
            tasks = self.task_queue.list_tasks(status=status, repo=repo, limit=limit)
            self._send_json(
                {
                    "generated_at": iso_utc(utc_now()),
                    "tasks": tasks,
                    "summary": self.task_queue.summary(limit=20),
                }
            )
            return

        if normalized_path == "/api/task_queue/summary":
            self._send_json(self.task_queue.summary(limit=max(1, min(safe_int(query.get("limit", ["20"])[0], 20), 200))))
            return

        if normalized_path == "/api/agent/status":
            payload = self.monitor.snapshot(
                history_limit=safe_int(query.get("history_limit", ["25"])[0], 25),
                commit_hours=safe_int(query.get("commit_hours", ["2"])[0], 2),
                commit_limit=safe_int(query.get("commit_limit", ["180"])[0], 180),
                event_limit=safe_int(query.get("event_limit", ["240"])[0], 240),
                alert_stall_minutes=safe_int(query.get("alert_stall_minutes", ["15"])[0], 15),
                alert_no_commit_minutes=safe_int(query.get("alert_no_commit_minutes", ["60"])[0], 60),
                alert_lock_skip_threshold=safe_int(query.get("alert_lock_skip_threshold", ["25"])[0], 25),
            )
            payload = self._attach_runtime_payload(payload, send_notifications=False)
            self._send_json(
                {
                    "generated_at": iso_utc(utc_now()),
                    "agent_status": payload.get("agent_status") or self.agent.status_payload(payload),
                    "control_status": payload.get("control_status") or self.controller.status_payload(),
                }
            )
            return

        if normalized_path == "/api/repo_insights":
            payload = {
                "generated_at": iso_utc(utc_now()),
                "repo_insights": self.monitor.repo_insights(
                    history_limit=safe_int(query.get("history_limit", ["40"])[0], 40),
                    commit_hours=safe_int(query.get("commit_hours", ["24"])[0], 24),
                    top=safe_int(query.get("top", ["80"])[0], 80),
                ),
            }
            self._send_json(payload)
            return

        if normalized_path in {
            "/api/repos_catalog",
            "/api/repos-catalog",
            "/api/repos/catalog",
            "/api/repos",
            "/api/repos-list",
            "/api/repos/list",
            "/api/repositories",
        }:
            self._send_json({"generated_at": iso_utc(utc_now()), "repos": self.monitor.repos_catalog()})
            return

        if normalized_path in {"/api/local_repos", "/api/repos_local", "/api/repos/local"}:
            payload = self.controller.local_repos(
                {
                    "code_root": query.get("code_root", [""])[0],
                    "max_depth": query.get("max_depth", ["6"])[0],
                    "limit": query.get("limit", ["5000"])[0],
                }
            )
            payload["generated_at"] = iso_utc(utc_now())
            self._send_json(payload, status=200 if payload.get("ok") else 400)
            return

        if normalized_path == "/api/github/status":
            payload = self.controller.github_status({"code_root": query.get("code_root", [""])[0]})
            self._send_json({"generated_at": iso_utc(utc_now()), "ok": bool(payload.get("ok")), "github": payload})
            return

        if normalized_path == "/api/github/repos":
            payload = self.controller.github_repos(
                {
                    "code_root": query.get("code_root", [""])[0],
                    "owner": query.get("owner", [""])[0],
                    "limit": query.get("limit", ["150"])[0],
                }
            )
            payload["generated_at"] = iso_utc(utc_now())
            self._send_json(payload)
            return

        if normalized_path == "/api/repo_details":
            repo = query.get("repo", [""])[0].strip()
            if not repo:
                self._send_json({"error": "repo is required"}, status=400)
                return
            payload = self.monitor.repo_details(
                repo_name=repo,
                commit_hours=safe_int(query.get("commit_hours", ["72"])[0], 72),
                commit_limit=safe_int(query.get("commit_limit", ["120"])[0], 120),
                run_history=safe_int(query.get("run_history", ["80"])[0], 80),
            )
            if payload is None:
                self._send_json({"error": f"repo not found: {repo}"}, status=404)
                return
            self._send_json(payload)
            return

        if normalized_path == "/api/run_details":
            run_id = query.get("run_id", [""])[0].strip()
            if not run_id:
                self._send_json({"error": "run_id is required"}, status=400)
                return
            payload = self.monitor.run_details(
                run_id=run_id,
                commit_limit=safe_int(query.get("commit_limit", ["120"])[0], 120),
                run_log_limit=safe_int(query.get("run_log_limit", ["220"])[0], 220),
                event_limit=safe_int(query.get("event_limit", ["300"])[0], 300),
                alert_stall_minutes=safe_int(query.get("alert_stall_minutes", ["15"])[0], 15),
                alert_no_commit_minutes=safe_int(query.get("alert_no_commit_minutes", ["60"])[0], 60),
                alert_lock_skip_threshold=safe_int(query.get("alert_lock_skip_threshold", ["25"])[0], 25),
            )
            if payload is None:
                self._send_json({"error": f"run not found: {run_id}"}, status=404)
                return
            payload["control_status"] = self.controller.status_payload()
            payload["notification_status"] = self.notifier.status_payload()
            self._send_json(payload)
            return

        if normalized_path == "/api/run_log_tail":
            run_id = query.get("run_id", [""])[0].strip()
            if not run_id:
                self._send_json({"error": "run_id is required"}, status=400)
                return
            payload = self.monitor.run_log_tail(
                run_id=run_id,
                limit=safe_int(query.get("run_log_limit", ["220"])[0], 220),
            )
            if payload is None:
                self._send_json({"error": f"run not found: {run_id}"}, status=404)
                return
            payload["run_commits_detailed"] = payload.get("run_commits", [])
            payload["run_id"] = run_id
            self._send_json(payload)
            return

        if normalized_path == "/api/stream":
            self._send_sse(query)
            return

        # Static UI.
        static_routes = {"/", "/runs", "/repos", "/alerts", "/controls", "/launch"}
        if normalized_path in static_routes or normalized_path.startswith("/runs/") or normalized_path.startswith("/repos/"):
            self.path = "/index.html"
        return super().do_GET()

    def do_DELETE(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        parsed_path = parsed.path if parsed.path == "/" else parsed.path.rstrip("/")
        if parsed_path.startswith("/api/v1/presets/"):
            segments = [segment for segment in parsed_path.split("/") if segment]
            if len(segments) == 4:
                preset_id = segments[3].strip()
                deleted = self.preset_store.delete_preset(preset_id)
                if not deleted:
                    self._send_json({"ok": False, "error": f"preset not found: {preset_id}"}, status=404)
                    return
                self._send_json({"ok": True, "deleted_id": preset_id, "generated_at": iso_utc(utc_now())})
                return
        self._send_json({"error": "not found"}, status=404)

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        parsed_path = parsed.path if parsed.path == "/" else parsed.path.rstrip("/")
        request = self._read_json_body()

        if parsed_path == "/api/v1/runs":
            payload = self.controller.start_run(request)
            status_code = 201 if payload.get("ok") else 409
            if payload.get("ok"):
                latest = with_effective_run_fields(self.monitor.latest_run()) or {}
                response_payload = {
                    "ok": True,
                    "run": {
                        "id": str(latest.get("run_id") or ""),
                        "state": str(latest.get("state") or "starting"),
                        "state_raw": str(latest.get("state_raw") or latest.get("state") or "starting"),
                        "started_at": str(latest.get("started_at") or ""),
                        "repo_count": safe_int(latest.get("repo_count"), 0),
                    },
                    "control_status": payload.get("control_status") or self.controller.status_payload(),
                }
                self._send_json(response_payload, status=status_code)
            else:
                self._send_json(payload, status=status_code)
            return

        if parsed_path.startswith("/api/v1/runs/"):
            segments = [segment for segment in parsed_path.split("/") if segment]
            if len(segments) == 5:
                run_id = segments[3].strip()
                action = segments[4].strip().lower()
                if action == "stop":
                    payload = self.controller.stop_run({"force": False, "wait_seconds": request.get("wait_seconds", 12)})
                    if not payload.get("ok") and str(payload.get("error") or "").startswith("no active run loop process found"):
                        payload = {
                            "ok": True,
                            "already_stopped": True,
                            "run_id": run_id,
                            "control_status": self.controller.status_payload(),
                        }
                    self._send_json(payload, status=200 if payload.get("ok") else 409)
                    return
                if action == "force-stop":
                    payload = self.controller.stop_run({"force": True, "wait_seconds": request.get("wait_seconds", 20)})
                    if not payload.get("ok") and str(payload.get("error") or "").startswith("no active run loop process found"):
                        payload = {
                            "ok": True,
                            "already_stopped": True,
                            "run_id": run_id,
                            "control_status": self.controller.status_payload(),
                        }
                    self._send_json(payload, status=200 if payload.get("ok") else 409)
                    return
                if action == "restart":
                    payload = self.controller.restart_run(request)
                    self._send_json(payload, status=200 if payload.get("ok") else 409)
                    return

        if parsed_path == "/api/v1/tasks":
            title = str(request.get("title") or "").strip()
            if not title:
                self._send_json({"ok": False, "error": "title is required"}, status=400)
                return
            try:
                task = self.task_queue.add_task(
                    title=title,
                    details=str(request.get("details") or ""),
                    repo=str(request.get("repo") or "*"),
                    repo_path=str(request.get("repo_path") or ""),
                    priority=safe_int(request.get("priority"), 3),
                    is_interrupt=to_bool(request.get("is_interrupt")),
                    source=str(request.get("source") or "api_v1"),
                    task_id=str(request.get("id") or ""),
                )
            except ValueError as exc:
                self._send_json({"ok": False, "error": str(exc)}, status=400)
                return
            self._send_json({"ok": True, "item": task, "summary": self.task_queue.summary(limit=20)}, status=201)
            return

        if parsed_path == "/api/v1/presets":
            try:
                preset = self.preset_store.upsert_preset(request)
            except ValueError as exc:
                self._send_json({"ok": False, "error": str(exc)}, status=400)
                return
            self._send_json({"ok": True, "preset": preset, "generated_at": iso_utc(utc_now())}, status=200)
            return

        if parsed_path.startswith("/api/v1/presets/"):
            segments = [segment for segment in parsed_path.split("/") if segment]
            if len(segments) == 5 and segments[4].strip().lower() == "delete":
                preset_id = segments[3].strip()
                deleted = self.preset_store.delete_preset(preset_id)
                if not deleted:
                    self._send_json({"ok": False, "error": f"preset not found: {preset_id}"}, status=404)
                    return
                self._send_json({"ok": True, "deleted_id": preset_id, "generated_at": iso_utc(utc_now())}, status=200)
                return

        if parsed_path == "/api/control/start":
            payload = self.controller.start_run(request)
            self._send_json(payload, status=200 if payload.get("ok") else 409)
            return

        if parsed_path == "/api/control/stop":
            payload = self.controller.stop_run(request)
            self._send_json(payload, status=200 if payload.get("ok") else 409)
            return

        if parsed_path == "/api/control/restart":
            payload = self.controller.restart_run(request)
            self._send_json(payload, status=200 if payload.get("ok") else 409)
            return

        if parsed_path == "/api/control/normalize":
            payload = self.controller.normalize_loops(request)
            self._send_json(payload, status=200 if payload.get("ok") else 409)
            return

        if parsed_path == "/api/notifications/config":
            updated = self.notifier.update_config(request)
            self._send_json({"ok": True, "config": updated, "status": self.notifier.status_payload()})
            return

        if parsed_path == "/api/notifications/test":
            message = str(request.get("message") or "Clone control plane notification test.")
            severity = str(request.get("severity") or "warn")
            payload = self.notifier.send_test_notification(message=message, severity=severity)
            payload["status"] = self.notifier.status_payload()
            self._send_json(payload, status=200 if payload.get("ok") else 400)
            return

        if parsed_path == "/api/task_queue/add":
            title = str(request.get("title") or "").strip()
            if not title:
                self._send_json({"ok": False, "error": "title is required"}, status=400)
                return
            try:
                task = self.task_queue.add_task(
                    title=title,
                    details=str(request.get("details") or ""),
                    repo=str(request.get("repo") or "*"),
                    repo_path=str(request.get("repo_path") or ""),
                    priority=safe_int(request.get("priority"), 3),
                    route_model=str(request.get("route_model") or ""),
                    route_mode=str(request.get("route_mode") or ""),
                    route_reason=str(request.get("route_reason") or ""),
                    route_claimed_count=safe_int(request.get("route_claimed_count"), 0),
                    route_updated_at=str(request.get("route_updated_at") or ""),
                    is_interrupt=to_bool(request.get("is_interrupt")),
                    source=str(request.get("source") or "control_plane"),
                    task_id=str(request.get("id") or ""),
                )
            except ValueError as exc:
                self._send_json({"ok": False, "error": str(exc)}, status=400)
                return
            self._send_json({"ok": True, "task": task, "summary": self.task_queue.summary(limit=20)})
            return

        if parsed_path == "/api/task_queue/update":
            task_id = str(request.get("id") or "").strip()
            status = str(request.get("status") or "").strip().upper()
            if not task_id or not status:
                self._send_json({"ok": False, "error": "id and status are required"}, status=400)
                return
            try:
                task = self.task_queue.update_task(task_id=task_id, status=status, note=str(request.get("note") or ""))
            except ValueError as exc:
                self._send_json({"ok": False, "error": str(exc)}, status=400)
                return
            if task is None:
                self._send_json({"ok": False, "error": f"task not found: {task_id}"}, status=404)
                return
            self._send_json({"ok": True, "task": task, "summary": self.task_queue.summary(limit=20)})
            return

        if parsed_path == "/api/github/import":
            payload = self.controller.github_import(request)
            payload["generated_at"] = iso_utc(utc_now())
            status = 200 if payload.get("ok") else 400
            if payload.get("imported_count", 0) > 0:
                status = 200
            self._send_json(payload, status=status)
            return

        if parsed_path == "/api/agent/config":
            updated = self.agent.update_config(request)
            self._send_json({"ok": True, "config": updated, "status": self.agent.status_payload()})
            return

        if parsed_path == "/api/agent/run_next":
            snapshot = self.monitor.snapshot(
                history_limit=25,
                commit_hours=2,
                commit_limit=180,
                event_limit=240,
                alert_stall_minutes=safe_int(request.get("alert_stall_minutes"), 15),
                alert_no_commit_minutes=safe_int(request.get("alert_no_commit_minutes"), 60),
                alert_lock_skip_threshold=safe_int(request.get("alert_lock_skip_threshold"), 25),
            )
            snapshot = self._attach_runtime_payload(snapshot, send_notifications=False)
            payload = self.agent.run_next(snapshot=snapshot, source=str(request.get("source") or "manual"))
            payload["agent_status"] = self.agent.status_payload(snapshot)
            self._send_json(payload, status=200 if payload.get("ok") else 409)
            return

        if parsed_path == "/api/agent/run_plan":
            snapshot = self.monitor.snapshot(
                history_limit=25,
                commit_hours=2,
                commit_limit=180,
                event_limit=240,
                alert_stall_minutes=safe_int(request.get("alert_stall_minutes"), 15),
                alert_no_commit_minutes=safe_int(request.get("alert_no_commit_minutes"), 60),
                alert_lock_skip_threshold=safe_int(request.get("alert_lock_skip_threshold"), 25),
            )
            snapshot = self._attach_runtime_payload(snapshot, send_notifications=False)
            payload = self.agent.run_plan(
                snapshot=snapshot,
                source=str(request.get("source") or "manual"),
                max_steps=safe_int(request.get("max_steps"), 2),
            )
            payload["agent_status"] = self.agent.status_payload(snapshot)
            self._send_json(payload, status=200 if payload.get("ok") else 409)
            return

        if parsed_path == "/api/agent/tick":
            snapshot = self.monitor.snapshot(
                history_limit=25,
                commit_hours=2,
                commit_limit=180,
                event_limit=240,
                alert_stall_minutes=safe_int(request.get("alert_stall_minutes"), 15),
                alert_no_commit_minutes=safe_int(request.get("alert_no_commit_minutes"), 60),
                alert_lock_skip_threshold=safe_int(request.get("alert_lock_skip_threshold"), 25),
            )
            snapshot = self._attach_runtime_payload(snapshot, send_notifications=False)
            payload = self.agent.tick(snapshot)
            payload["agent_status"] = self.agent.status_payload(snapshot)
            self._send_json(payload, status=200 if payload.get("ok") else 409)
            return

        self._send_json({"error": "not found"}, status=404)


def make_handler(
    monitor: CloneMonitor,
    controller: RunController,
    notifier: NotificationManager,
    agent: AgentManager,
    task_queue: TaskQueueStore,
    preset_store: LaunchPresetStore,
    static_dir: Path,
    launch_info: dict[str, Any] | None = None,
):
    class BoundHandler(APIHandler):
        pass

    BoundHandler.monitor = monitor
    BoundHandler.controller = controller
    BoundHandler.notifier = notifier
    BoundHandler.agent = agent
    BoundHandler.task_queue = task_queue
    BoundHandler.preset_store = preset_store
    BoundHandler.static_dir = static_dir
    BoundHandler.launch_info = dict(launch_info or {})
    return BoundHandler


def build_arg_parser() -> argparse.ArgumentParser:
    default_clone_root = Path(__file__).resolve().parents[2]
    parser = argparse.ArgumentParser(description="Clone Control Plane server")
    parser.add_argument("--host", default=os.environ.get("CLONE_CONTROL_PLANE_HOST", "127.0.0.1"), help="Bind host")
    parser.add_argument("--port", type=int, default=int(os.environ.get("CLONE_CONTROL_PLANE_PORT", "8787")), help="Bind port")
    parser.add_argument(
        "--clone-root",
        default=os.environ.get("CLONE_ROOT", str(default_clone_root)),
        help="Path to Clone workspace root",
    )
    parser.add_argument(
        "--repos-file",
        default=os.environ.get("REPOS_FILE", ""),
        help="Optional repos metadata file path (absolute or relative to clone root)",
    )
    parser.add_argument(
        "--logs-dir",
        default=os.environ.get("CLONE_LOGS_DIR", "logs"),
        help="Logs directory path (absolute or relative to clone root)",
    )
    parser.add_argument(
        "--task-queue-file",
        default=os.environ.get("TASK_QUEUE_FILE", "logs/task_queue.json"),
        help="Task queue file path (absolute or relative to clone root)",
    )
    return parser


def main() -> int:
    parser = build_arg_parser()
    args = parser.parse_args()

    clone_root = Path(args.clone_root).expanduser().resolve()
    if args.repos_file:
        repos_file = Path(args.repos_file)
    else:
        repos_file = clone_root / "repos.runtime.yaml"
    logs_dir = Path(args.logs_dir)
    task_queue_file = Path(args.task_queue_file)

    if not repos_file.is_absolute():
        repos_file = clone_root / repos_file
    if not logs_dir.is_absolute():
        logs_dir = clone_root / logs_dir
    if not task_queue_file.is_absolute():
        task_queue_file = clone_root / task_queue_file

    static_dir = Path(__file__).resolve().parent / "static"
    if not static_dir.exists():
        print(f"Missing static directory: {static_dir}", file=sys.stderr)
        return 1

    monitor = CloneMonitor(clone_root=clone_root, repos_file=repos_file, logs_dir=logs_dir)
    controller = RunController(clone_root=clone_root, logs_dir=logs_dir, monitor=monitor)
    notifier = NotificationManager(logs_dir=logs_dir)
    agent = AgentManager(logs_dir=logs_dir, controller=controller)
    task_queue = TaskQueueStore(queue_file=task_queue_file)
    preset_store = LaunchPresetStore(preset_file=logs_dir / "launch-presets.json")
    launch_info = {
        "started_at": iso_utc(utc_now()),
        "host": str(args.host),
        "port": int(args.port),
        "ui_log": str(logs_dir / "control-plane-ui.log"),
        "pid_file": str(logs_dir / f"control-plane-ui-{args.port}.pid"),
    }
    handler = make_handler(monitor, controller, notifier, agent, task_queue, preset_store, static_dir, launch_info=launch_info)

    server = ThreadingHTTPServer((args.host, args.port), handler)
    print(f"Clone Control Plane listening on http://{args.host}:{args.port}")
    print(f"clone_root={clone_root}")
    print(f"repos_file={repos_file}")
    print(f"logs_dir={logs_dir}")
    print(f"task_queue_file={task_queue_file}")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
