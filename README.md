# Clone

Autonomous Codex orchestrator that runs a repeatable "plan -> implement -> verify -> push -> fix CI" loop across many repos.

## What It Does (High Level)

- Builds a queue of active repositories (`repos.yaml` by default).
- Iterates repos in parallel (defaults to `5` repos at a time).
- Pushes directly to `main` (no PRs).
- Runs no-auth by default; GitHub-dependent automation is opt-in.
- Persists durable context per repo in `AGENTS.md`, `PRODUCT_ROADMAP.md`, `PROJECT_MEMORY.md`, and `INCIDENTS.md`.

## Features

- Parallel execution across repos (`PARALLEL_REPOS`, default `5`).
- Per-repo task planning with optional target (`TASKS_PER_REPO`; `0` means unlimited planning scope).
- Roadmap-first delivery loop with milestones and done criteria.
- Mandatory brainstorming and goal-alignment checkpoint before implementation.
- Local verification when feasible (tests/lint/build/smoke checks).
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

## Deploy / Run Headless

Clone is a local-first orchestrator. "Deploy" usually means running it on a dedicated Mac/Linux box via `nohup`, `tmux`, or a system service.

- macOS: use `caffeinate` to prevent sleep.
- Linux: prefer `tmux`/`screen` or `systemd`.

## Monitor / Debug

See `docs/observability.md` for:
- tailing logs
- runtime telemetry
- commit tables + live commit watcher

## Docs

- `docs/observability.md`
- `docs/readme_policy.md`
- `docs/ideas.md`
- `docs/operations.md`
- `docs/product_phase.md`
- `docs/product_delivery_loop.md`
- `docs/product_roadmap_template.md`
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
