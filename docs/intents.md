# Intents: Project-First Repository Intake

Clone can process project intents and automatically decide whether to reuse an existing local repo or bootstrap a new one.

Set `CODE_ROOT=/code` when your local repos live under `/code`.

## File: `intents.yaml`

Like `ideas.yaml`, this file is JSON managed with `jq`:

- `NEW`: intent queued for analysis/bootstrap
- `TRIAGED`: normalized fields + resolved target repo path
- `ACTIVE`: repo is ready and enrolled in `repos.yaml`
- `BLOCKED`: intake failed (check `last_error`)

## Add Intent

```bash
CLONE_ROOT="${CLONE_ROOT:-$HOME/code/Clone}"

"$CLONE_ROOT/scripts/add_intent.sh" \
  --project "Project XYZ" \
  --summary "Internal dashboard with auth and analytics"
```

Optional:
- `--repo-name <slug>`
- `--repo-path <absolute path>`
- `--objective <text>`
- `--visibility private|public`

## What Intent Processing Does

For each `NEW`/`TRIAGED` intent:

1. Resolve repo path:
- uses explicit `repo_path` when provided
- otherwise checks `CODE_ROOT/<repo_name>`
- otherwise checks existing `repos.yaml` matches

2. If repo does not exist:
- create local repo folder
- scaffold baseline docs and `.gitignore`
- initialize git on `main`
- commit bootstrap files

3. Optional first implementation bootstrap with Codex:
- controlled by `INTENT_BOOTSTRAP_WITH_CODEX=1`

4. Optional GitHub sync:
- controlled by `ENABLE_GITHUB_SYNC=1`
- creates repo with `gh` if needed
- pushes local commits to `origin/main`

5. Enroll/refresh repo in `repos.yaml`.

## Runtime Integration

`scripts/run_clone_loop.sh` runs intent processing automatically:

- at startup
- before each cycle

Controls:
- `INTENTS_FILE` (default: `intents.yaml`)
- `INTENT_BOOTSTRAP_ENABLED` (default: `1`)
- `INTENT_PROCESSOR_SCRIPT` (default: `scripts/process_intents.sh`)
- `INTENT_BOOTSTRAP_WITH_CODEX` (default: `1`)
- `ENABLE_GITHUB_SYNC` (default: `0`)
