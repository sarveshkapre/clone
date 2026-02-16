# Clone

Autonomous Codex orchestrator that runs a repeatable "plan -> implement -> verify -> push -> fix CI" loop across many repos.

## What It Does (High Level)

- Builds a queue of active repositories (`repos.yaml` by default).
- Iterates repos in parallel (defaults to `5` repos at a time).
- Pushes directly to `main` (no PRs).
- Runs no-auth by default; GitHub-dependent automation is opt-in.
- Persists durable context per repo in `AGENTS.md`, `CLONE_CONTEXT.md`, `PRODUCT_ROADMAP.md`, `PROJECT_MEMORY.md`, and `INCIDENTS.md`.

## Features

- Parallel execution across repos (`PARALLEL_REPOS`, default `5`).
- Per-repo task planning with optional target (`TASKS_PER_REPO`; `0` means unlimited planning scope).
- Roadmap-first delivery loop with milestones and done criteria.
- Mandatory brainstorming and goal-alignment checkpoint before implementation.
- Local verification when feasible (tests/lint/build/smoke checks).
- Dedicated UI/UX playbook integrated into repo prompts (`prompts/uiux_principles.md`).
- Live operator task queue intake (`task_queue.json`) with per-repo dispatch each pass.
- Idea queue bootstrap (new projects auto-created from `ideas.yaml`).
- Optional cleanup/refactor pass after a burst of commits (`CLEANUP_TRIGGER_COMMITS`).
- Optional CI self-healing loop (disabled by default).
- Structured logs and status files under `logs/`.
- No artificial commit cap; commit count should follow missing work and implementation needs.
- Backlog depth policy: keep a large aligned pending queue to avoid drift and idle cycles.

## Quickstart (Local)

Prereqs: `codex` CLI, `jq`, `git`, and (on macOS) `caffeinate`.

```bash
CLONE_ROOT="${CLONE_ROOT:-$HOME/code/Clone}"
WORK_ROOT="${WORK_ROOT:-$HOME/code}"

cd "$CLONE_ROOT"
git pull --rebase

# 1) Discover active repos (writes repos.yaml by default)
"$CLONE_ROOT/scripts/discover_active_repos.sh" "$WORK_ROOT"

# 2) Run full passes (5 repos in parallel)
RUN_TAG="$(date +%Y%m%d-%H%M%S)"
nohup caffeinate -dimsu /bin/zsh -lc "cd '$CLONE_ROOT' && MODEL=gpt-5.3-codex PARALLEL_REPOS=5 MAX_CYCLES=3 '$CLONE_ROOT/scripts/run_clone_loop.sh'" \
  > "$CLONE_ROOT/logs/launcher-${RUN_TAG}.log" 2>&1 &
```

For continuous operation, use `MAX_CYCLES=0` (unlimited cycles).

## Product Loop (Default)

Each repo session follows this loop:
1) create/update roadmap and goals
2) start implementing features
3) iterate on implementation
4) fix bugs
5) refactor
6) continue feature delivery
7) improve UI/UX
8) update documentation
9) verify product behavior
10) identify missing features
11) continue until done

`PRODUCT_ROADMAP.md` is the source of truth for milestones, pending features, and done criteria.

## UI/UX Tuning

Clone now injects `prompts/uiux_principles.md` into repo execution and cleanup prompts.
For UI-facing repos, Clone also enforces a session gate that requires a new
`UIUX_CHECKLIST` entry in `PROJECT_MEMORY.md` with required same-line fields:
`flow=`, `desktop=`, `mobile=`, `a11y=`.

Override at runtime when needed:

```bash
UIUX_PROMPT_FILE="prompts/uiux_principles.md" ./scripts/run_clone_loop.sh
```

Disable the gate (not recommended) for emergency runs:

```bash
UIUX_GATE_ENABLED=0 ./scripts/run_clone_loop.sh
```

## Live Task Queue

Add a task while a run is active (no restart required):

```bash
cd "$CLONE_ROOT"
./scripts/add_task_queue.sh \
  --repo "project-xyz" \
  --title "Add export CSV button to reports page" \
  --details "Keep current filters when exporting; add tests" \
  --priority 2
```

How dispatch works:
- Clone claims matching `QUEUED` tasks for a repo at pass start.
- Claimed tasks are injected into that repo prompt and prioritized first.
- Agent reports outcomes with markers in final output:
  - `QUEUE_TASK_DONE:<id>`
  - `QUEUE_TASK_BLOCKED:<id>`
- Unfinished claimed tasks are auto re-queued for a later pass.

Control Plane quick-add also supports chat-style text:
- Example: `for project xyz: add onboarding checklist`
- If repo selector is `*`, Clone auto-parses repo + task from the text.

## Project Intent Intake

Use intents when you have a project idea and want Clone to:
- detect whether the repo already exists under `CODE_ROOT` (default `$HOME/code`)
- scaffold a repo if it does not exist
- initialize git and commit bootstrap changes
- optionally create/sync GitHub repo and push commits
- auto-enroll repo into `repos.yaml`

If your repos are under `/code`, run with `CODE_ROOT=/code`.

Queue an intent:

```bash
cd "$CLONE_ROOT"
./scripts/add_intent.sh \
  --project "Project XYZ" \
  --summary "Internal dashboard with auth, analytics, and task automation" \
  --visibility private
```

Process intents immediately:

```bash
cd "$CLONE_ROOT"
INTENTS_FILE="intents.yaml" ./scripts/process_intents.sh
```

`run_clone_loop.sh` also processes intents automatically at startup and each cycle when `INTENT_BOOTSTRAP_ENABLED=1`.

## Deploy / Run Headless

Clone is a local-first orchestrator. "Deploy" usually means running it on a dedicated Mac/Linux box via `nohup`, `tmux`, or a system service.

- macOS: use `caffeinate` to prevent sleep.
- Linux: prefer `tmux`/`screen` or `systemd`.

## Monitor / Debug

See `docs/observability.md` for:
- tailing logs
- runtime telemetry
- commit tables + live commit watcher

## Control Plane (Web UI)

Run a local monitoring web app (no auth by default):

```bash
cd /path/to/Clone
./scripts/control_plane.sh precheck
./scripts/control_plane.sh start
./scripts/control_plane.sh status
```

Open `http://127.0.0.1:8787`.

Stop / restart:

```bash
./scripts/control_plane.sh stop
./scripts/control_plane.sh restart
```

Tail helper:

```bash
./scripts/control_plane.sh tail ui
./scripts/control_plane.sh tail run
./scripts/control_plane.sh tail events
```

More details: `apps/control_plane/README.md`

Highlights:
- live alerts + toasts
- run controls (`start` / `stop` / `restart`)
- duplicate-loop normalization (`Normalize Loops`)
- optional webhook notifications (rules by alert type + cooldown + test send)
- stream rail UX (pause/resume, refresh, UTC/local time mode, compact mode, keyboard shortcuts)
- calm-first command deck + density mode (calm/dense) for low-noise monitoring
- inspector drawer for progressive drilldown (summary/commits/events/repos)
- operations center (health score, lock hotspots, quick remediation actions)
- agent pilot (autonomous remediation plan, run-next/run-plan, optional autopilot)
- persisted agent control state and action history in `logs/control-plane-agent-*.json`
- command palette (`Cmd/Ctrl+K`) and URL-synced filters for shareable views
- deep-linkable inspector drawer state/tab for commit/event/repo drilldowns
- section jump nav + collapsible panels for long monitoring sessions
- structured events auto-scroll toggle and improved jump-nav keyboard traversal
- deep-linkable selected run/repo context and smart alert action buttons
- per-run commit/event inspector
- repo insights + repo drilldown (commit + run-state trends)

## Docs

- `docs/observability.md`
- `docs/readme_policy.md`
- `docs/ideas.md`
- `docs/intents.md`
- `docs/operations.md`
- `docs/product_phase.md`
- `docs/product_delivery_loop.md`
- `docs/product_roadmap_template.md`
- `docs/full_agentic_roadmap.md`
- `docs/uiux_playbook.md`
- `prompts/` (agent behavior)
- `scripts/` (discovery + loop)

Use `IGNORED_REPOS_CSV` for durable and one-off overrides.

```bash
cd "$CLONE_ROOT"
"$CLONE_ROOT/scripts/discover_active_repos.sh" "$WORK_ROOT"
```

## New Idea Intake

Use `ideas.yaml` to introduce brand-new projects (even if no repo exists yet).

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
- triage and bootstrap local project files in `$WORK_ROOT/<repo_name>`
- initialize git + commit
- optionally sync GitHub repo only when `ENABLE_GITHUB_SYNC=1`
- append/update that project in `repos.yaml`
- mark idea status to `ACTIVE` when successful (or `BLOCKED` on failure)

Status meanings:
- `NEW`: pending idea, ready for incubator
- `TRIAGED`: already assessed, still eligible for bootstrap
- `ACTIVE`: bootstrapped/enrolled in normal autonomous loop
- `BLOCKED`: incubator failed; check `last_error`

## Daily Idea Cycle (Every 24 Hours)

Run:

```bash
CLONE_ROOT="${CLONE_ROOT:-$HOME/code/Clone}"
WORK_ROOT="${WORK_ROOT:-$HOME/code}"

cd "$CLONE_ROOT"
ENABLE_GITHUB_SYNC=1 "$CLONE_ROOT/scripts/run_daily_idea_cycle.sh"
```

What it does:
- generates one best new idea for the day
- tags it with `clone-idea` and `clone-idea-<timestamp>`
- creates a new repo folder under `$WORK_ROOT` (name pattern: `clone-idea-YYYYMMDD-<slug>`)
- bootstraps the project with the same repo structure as others
- pushes to GitHub when sync is enabled and `gh` auth is available
- creates git tag `clone-idea-<timestamp>` in the new repo and pushes the tag when remote exists

How 24-hour detection works:
- the script stores timing in `logs/daily-idea-state.json`
- it compares `now - last_success_epoch` against `MIN_INTERVAL_SECONDS` (default `86400`)
- if 24 hours are not over, it exits and prints the next due time

## Safety Notes

- This loop uses direct pushes to `main`.
- Auth-dependent automation is disabled by default:
  - `GH_SIGNALS_ENABLED=0`
  - `CI_AUTOFIX_ENABLED=0`
  - `ENABLE_GITHUB_SYNC=0`
- No personal absolute paths are required; defaults use `$HOME/code` and workspace-relative files.
