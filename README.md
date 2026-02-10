# Clone

Autonomous Codex orchestrator that runs a repeatable “plan -> implement -> verify -> push -> fix CI” loop across many repos.

## What It Does (High Level)

- Builds a queue of active repositories (`repos.runtime.yaml` by default).
- Iterates repos (optionally in parallel), shipping small, verified improvements.
- Pushes directly to `main` (no PRs) and uses GitHub Actions as a correctness signal (auto-fix when safe).
- Persists durable context in per-repo docs: `AGENTS.md`, `PROJECT_MEMORY.md`, `INCIDENTS.md`.

## Features

- Parallel execution across repos (`PARALLEL_REPOS`).
- Per-repo task planning with a cap (`TASKS_PER_REPO`, may do fewer).
- Local verification when feasible (tests/lint/build/smoke checks).
- CI self-healing loop (bounded retries).
- Structured logs and status files under `logs/`.

## Quickstart (Local)

Prereqs: `codex` CLI, `jq`, `git`, and (on macOS) `caffeinate`. Optional: `gh` for GitHub signals/CI auto-fix.

```bash
CLONE_ROOT="${CLONE_ROOT:-$HOME/code/Clone}"
WORK_ROOT="${WORK_ROOT:-$HOME/code}"

cd "$CLONE_ROOT"
git pull --rebase

# 1) Discover active repos (writes repos.runtime.yaml by default)
"$CLONE_ROOT/scripts/discover_active_repos.sh" "$WORK_ROOT"

# 2) Run a few full passes (3 repos in parallel)
RUN_TAG="$(date +%Y%m%d-%H%M%S)"
nohup caffeinate -dimsu /bin/zsh -lc "cd '$CLONE_ROOT' && MODEL=gpt-5.3-codex PARALLEL_REPOS=3 MAX_CYCLES=3 '$CLONE_ROOT/scripts/run_clone_loop.sh'" \
  > "$CLONE_ROOT/logs/launcher-${RUN_TAG}.log" 2>&1 &
```

## Deploy / Run Headless

Clone is a local-first orchestrator. “Deploy” usually means running it on a dedicated Mac/Linux box via `nohup`, `tmux`, or a system service.

- macOS: use `caffeinate` to prevent sleep.
- Linux: prefer `tmux`/`screen` or `systemd`.

## Monitor / Debug

See `docs/observability.md` for:
- tailing logs
- “nerdy runtime telemetry”
- commit tables + live commit watcher

## Docs

- `docs/observability.md`
- `docs/readme_policy.md`
- `prompts/` (agent behavior)
- `scripts/` (discovery + loop)

- Use `IGNORED_REPOS_CSV` for durable and one-off overrides.
- Refresh the queue after edits:

```bash
cd /Users/sarvesh/code/Clone
/Users/sarvesh/code/Clone/scripts/discover_active_repos.sh /Users/sarvesh/code
```

## New Idea Intake

Use `/Users/sarvesh/code/Clone/ideas.yaml` to introduce brand-new projects (even if no repo exists yet).

Minimal flow:

1) Add an idea entry with `status: "NEW"`:

```json
{
  "id": "voice-notes-v1",
  "title": "Voice Notes Assistant",
  "summary": "Capture voice notes, summarize, and tag them quickly.",
  "status": "NEW",
  "repo_name": "voice-notes-assistant"
}
```

2) Run the loop. It will automatically:
- triage and bootstrap local project files in `/Users/sarvesh/code/<repo_name>`
- initialize git + commit
- attempt private GitHub repo creation/push via `gh` (if authenticated)
- append/update that project in `/Users/sarvesh/code/Clone/repos.yaml`
- mark idea status to `ACTIVE` when successful (or `BLOCKED` on failure)

Status meanings:
- `NEW`: pending idea, ready for incubator
- `TRIAGED`: already assessed, still eligible for bootstrap
- `ACTIVE`: bootstrapped/enrolled in normal autonomous loop
- `BLOCKED`: incubator failed; check `last_error`

## Safety Notes

- This loop uses direct pushes to `main`.
- It runs Codex with `--dangerously-bypass-approvals-and-sandbox`.
- Use a dedicated bot account/tokens and enforce repository guardrails for production use.
