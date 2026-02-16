# Ideas: Auto-Bootstrap New Projects

Clone can bootstrap new projects from an idea queue file and then include the new repo in the run queue.

## File: `ideas.yaml`

Despite the name, `ideas.yaml` is JSON (so it can be edited/updated safely with `jq`).

Each idea goes through statuses:
- `NEW`: eligible for auto-bootstrap
- `TRIAGED`: fields normalized and repo path chosen
- `ACTIVE`: bootstrapped and added to repos queue
- `BLOCKED`: missing data or bootstrap failed

## Add A New Idea

```bash
CLONE_ROOT="${CLONE_ROOT:-$HOME/code/Clone}"

"$CLONE_ROOT/scripts/add_idea.sh" \
  --title "My new project idea" \
  --summary "1-2 lines describing the project"
```

Optional:
- `--repo-name <name>` (defaults to a slug of the title)
- `--objective <text>` (defaults to a safe generic objective)
- `--visibility private|public` (default: private)

## What Bootstrap Does

When the loop sees a `NEW` idea, it will:
- create a local folder under `CODE_ROOT`
- initialize a git repo (`main`)
- create baseline docs (`README.md`, `AGENTS.md`, `PRODUCT_ROADMAP.md`, `PROJECT_MEMORY.md`, `INCIDENTS.md`, `CLONE_FEATURES.md`)
- optionally run Codex to build the first real slice
- optionally create or sync a GitHub repo only when `ENABLE_GITHUB_SYNC=1`
- add the repo to managed repos catalog (`repos.runtime.yaml` by default) so it gets worked on in the same run

## Daily Best-Idea Runner

Use:

```bash
CLONE_ROOT="${CLONE_ROOT:-$HOME/code/Clone}"
ENABLE_GITHUB_SYNC=1 "$CLONE_ROOT/scripts/run_daily_idea_cycle.sh"
```

Behavior:
- selects one best idea per run
- enforces a 24-hour gate via `logs/daily-idea-state.json`
- adds tags `clone-idea` and `clone-idea-<timestamp>` to the idea entry
- bootstraps and enrolls the new repo
- creates and pushes git tag `clone-idea-<timestamp>` when remote sync is available
