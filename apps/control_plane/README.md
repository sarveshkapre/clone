# Clone Control Plane

Local-first monitoring UI for Clone runs.

- System agnostic: works on macOS/Linux/Windows (Python 3 + git).
- Auth agnostic: no login required for local usage.
- Live updates: run events, queue/lock health, commit stream, run history.
- Calm-first command deck with progressive drilldown into run/repo details.

## Run

Recommended launcher (cross-device):

```bash
cd /path/to/Clone
./scripts/control_plane.sh precheck
./scripts/control_plane.sh start
./scripts/control_plane.sh status
```

Open: [http://127.0.0.1:8787](http://127.0.0.1:8787)

Stop / restart:

```bash
./scripts/control_plane.sh stop
./scripts/control_plane.sh restart
```

Log tail helpers:

```bash
./scripts/control_plane.sh tail ui
./scripts/control_plane.sh tail run
./scripts/control_plane.sh tail events
./scripts/control_plane.sh tail launcher
```

Direct Python run (fallback):

```bash
python3 apps/control_plane/server.py --host 127.0.0.1 --port 8787
```

Defaults:
- `--clone-root` auto-detects this repository root.
- `--repos-file` defaults to `repos.runtime.yaml` (optional).
- `--logs-dir` defaults to `logs`.
- `--task-queue-file` defaults to `logs/task_queue.json`.

## What It Shows

- Reactor online/offline status and latest run metadata
- Live stream status rail (live/reconnecting/paused) with pause/resume + refresh controls
- Timestamp mode toggle (UTC/local) with persisted preference
- Compact mode toggle for denser monitoring views
- Operations Center with health score, lock hotspots, and one-click recovery actions
- Command Deck (Now/Flow/Issues/Next Action) for low-noise first glance
- Density mode toggle (calm/dense) to control telemetry verbosity
- Inspector Drawer (Summary/Commits/Events/Repos) for focused click-through analysis
- Agent Pilot with stepwise remediation plan, run-next/run-plan controls, and optional autopilot loop
- Agent Pilot state/config persisted under `logs/control-plane-agent-*.json` for durable operation history
- Structured events auto-scroll toggle for live tailing vs manual inspection
- Keyboard shortcuts (`/`, `space`, `r`, `o`, `n`, `p`, `t`, `a`, `c`, `g`, `?`, `esc`)
- Command palette (`Cmd/Ctrl+K`) for quick actions and control commands
- URL-synced filters and selected run/repo state for shareable deep links
- URL-synced inspector state/tab (open + summary/commits/events/repos) for shareable drilldown links
- Section jump navigator for fast movement across dashboard areas (with arrow-key navigation)
- Collapsible panels with persisted collapsed/expanded state
- Alert strip for stalled runs, lock contention, and no-commit long runs
- Smart alert action buttons (normalize/restart/inspect/controls) for faster remediation
- Critical alert when duplicate `run_clone_loop.sh` process groups are detected
- Live toast notifications for new warn/critical alerts
- Run controls (start/stop/restart) for `scripts/run_clone_loop.sh`
- Live Execution Board for active repos, latest events, and latest commits in one real-time panel
- Run Launcher GitHub import flow (detect `gh` auth, fetch owner repos, select/import into chosen code root, auto-upsert managed catalog when enabled)
- Run Launcher local scan flow (scan selected `Code Root` for git repos and include them in launch selection)
- `Normalize Loops` control to collapse duplicate loop process groups safely
- Live commit stream (last N hours)
- Repo states (running/no-change/skipped) for selected run
- Run history table
- Run history filters (search + running/finished)
- Per-run commit inspector (time/repo/hash/subject with repo + text filters)
- Structured events tail for selected run
- Repo insights table (recent commits + run-state trends)
- Repo insights filters (search + focus modes: active/changed/no-change/lock-skip)
- Repo drilldown (click insights row -> repo commits + run timeline)
- Loop-process counter with warning when multiple run loops are active
- Queue telemetry (`CYCLE_QUEUE`) and lock sweep signals (`LOCK_SWEEP`)
- Live task queue intake/dispatch panel for adding and managing operator tasks while runs are active
- Notification panel for webhook delivery rules (enable/disable, severity threshold, cooldown, test send)
- Notification event history table (delivery/suppression/error trail)

## Webhook Notifications

Configure from UI (`Notifications` panel) or environment variables:

- `CLONE_NOTIFY_ENABLED` (`0`/`1`)
- `CLONE_NOTIFY_WEBHOOK_URL` (HTTP endpoint to receive JSON POST alerts)
- `CLONE_NOTIFY_MIN_SEVERITY` (`ok`, `info`, `warn`, `critical`; default `warn`)
- `CLONE_NOTIFY_COOLDOWN_SECONDS` (default `600`, min `30`)
- `CLONE_NOTIFY_SEND_OK` (`0`/`1`, default `0`)
- `CLONE_NOTIFY_ALERT_IDS` (CSV of alert IDs, or `all`; default includes all non-healthy alerts)

Runtime files under `logs/`:

- `control-plane-notifications-config.json`
- `control-plane-notifications-state.json`

## Notes

- This app reads local files under `logs/` and optional repo metadata from `repos.runtime.yaml` (or custom `REPOS_FILE`).
- If managed repo metadata is missing, the app falls back to local filesystem repo discovery under `Code Root`.
- Commit stream uses local `git log` calls per discovered repositories.
- GitHub import in Run Launcher uses local `gh` CLI (`gh auth login` required) and works with any writable code-root path.
- Local discovery in Run Launcher scans filesystem git repositories under `Code Root`; repository lists are dynamic (no hardcoded repo names).
- No authentication is required for local use.
- Non-JSON repos files are parsed with a built-in YAML-like fallback parser (no `jq` needed).
- Control actions are local-only and target the run loop script in this Clone workspace.
- Webhook delivery is optional; local monitoring works without any remote integration.
