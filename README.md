# Clone Orchestrator

This project runs Codex in an autonomous loop across active repositories in `/Users/sarvesh/code`.

Goal:
- operate Codex in a mostly hands-off mode
- keep repositories updated and improving
- prioritize high-impact work while preserving safety and reliability
- fix CI failures automatically after pushes when possible

## What It Does

- Discovers recently active repos and builds `repos.yaml`.
- Runs maintenance/product-improvement passes per repo.
- Uses steering prompts + a core directive for decision quality.
- Tracks per-repo backlog in `CLONE_FEATURES.md`.
- Maintains durable operating docs: `AGENTS.md`, `PROJECT_MEMORY.md`, and `INCIDENTS.md`.
- Runs local verification (lint/tests/build and smoke paths like API/CLI checks when feasible) and records evidence in pass output.
- Pushes directly to `main`.
- Watches GitHub Actions for pushed commits and attempts CI remediation.
- Logs run, event, status, and per-pass details under `logs/`.

## Main Files

- `scripts/discover_active_repos.sh`
- `scripts/run_clone_loop.sh`
- `repos.yaml`
- `prompts/repo_steering.md`
- `prompts/autonomous_core_prompt.md`
- `scripts/process_ideas.sh`
- `ideas.yaml`

## How To Run

1) Refresh active repo list:

```bash
cd /Users/sarvesh/code/Clone
/Users/sarvesh/code/Clone/scripts/discover_active_repos.sh /Users/sarvesh/code
```

2) Start autonomous loop (example):

```bash
cd /Users/sarvesh/code/Clone
MODEL=gpt-5.3-codex PARALLEL_REPOS=3 TASKS_PER_REPO=10 MAX_CYCLES=3 /Users/sarvesh/code/Clone/scripts/run_clone_loop.sh
```

3) Monitor:

```bash
tail -f /Users/sarvesh/code/Clone/logs/run-<RUN_ID>.log
tail -f /Users/sarvesh/code/Clone/logs/run-<RUN_ID>-events.log
cat /Users/sarvesh/code/Clone/logs/run-<RUN_ID>-status.txt
```

## Observability Commands (Generic)

Set shared variables once:

```bash
CLONE_ROOT="${CLONE_ROOT:-$HOME/code/Clone}"
REPOS_FILE="${REPOS_FILE:-$CLONE_ROOT/repos.yaml}"
WORK_ROOT="${WORK_ROOT:-$HOME/code}"
```

Show running Clone processes with shorter paths:

```bash
pgrep -fl run_clone_loop.sh | sed "s|$WORK_ROOT/||g"
pids="$(pgrep -f run_clone_loop.sh | paste -sd, -)"
if [[ -n "$pids" ]]; then
  ps -o pid=,etime=,command= -p "$pids" | sed "s|$WORK_ROOT/||g"
else
  echo "No run_clone_loop.sh process found"
fi
```

Commit counts in the last 8 hours (simple):

```bash
jq -r '.repos[].path' "$REPOS_FILE" | while IFS= read -r repo; do
  c=$(git -C "$repo" rev-list --count --since="8 hours ago" HEAD 2>/dev/null || echo 0)
  [ "$c" -gt 0 ] && printf "%s\t%s\n" "$c" "$repo"
done | sort -nr -k1,1
```

Commit counts in a 4-column compact table (`commits | repo || commits | repo`):

```bash
tmp="$(mktemp)"
jq -r '.repos[].path' "$REPOS_FILE" | while IFS= read -r repo; do
  c=$(git -C "$repo" rev-list --count --since="8 hours ago" HEAD 2>/dev/null || echo 0)
  [ "$c" -gt 0 ] && printf "%s\t%s\n" "$c" "$(basename "$repo")"
done | sort -nr -k1,1 > "$tmp"

paste -d $'\t' \
  <(awk -F'\t' 'NR%2==1{print $1"\t"$2}' "$tmp") \
  <(awk -F'\t' 'NR%2==0{print $1"\t"$2}' "$tmp") \
| awk -F'\t' '
function repeat(ch,n,  s,i){s=""; for(i=0;i<n;i++) s=s ch; return s}
function center(s,w,  l,r,p){l=length(s); if(l>=w) return s; p=w-l; r=int(p/2); return repeat(" ",p-r) s repeat(" ",r)}
BEGIN{
  cW=7; rW=28
  printf "%s | %-*s || %s | %-*s\n", center("COMMITS",cW), rW, "REPO", center("COMMITS",cW), rW, "REPO"
  printf "%s-+-%s-++-%s-+-%s\n", repeat("-",cW), repeat("-",rW), repeat("-",cW), repeat("-",rW)
}
{
  c1=$1; r1=$2; c2=$3; r2=$4
  if(c2==""){c2="-"; r2=""}
  printf "%s | %-*s || %s | %-*s\n", center(c1,cW), rW, r1, center(c2,cW), rW, r2
}'
rm -f "$tmp"
```

Live append-only commit watcher (prints only new commits as they appear):

```bash
seen_file="$(mktemp)"
trap 'rm -f "$seen_file"' EXIT

while true; do
  jq -r '.repos[].path' "$REPOS_FILE" | while IFS= read -r repo; do
    repo_name="$(basename "$repo")"
    git -C "$repo" log --since="2 hours ago" --pretty=format:'%ct%x09'"$repo_name"'%x09%h%x09%s'
  done | sort -n -k1,1 | while IFS=$'\t' read -r ts repo_name hash subject; do
    key="${repo_name}:${hash}"
    if ! grep -qxF "$key" "$seen_file"; then
      echo "$key" >> "$seen_file"
      printf "%s | %s | %s | %s\n" "$(date -r "$ts" '+%Y-%m-%d %H:%M:%S')" "$repo_name" "$hash" "$subject"
    fi
  done
  sleep 20
done
```

## Key Runtime Knobs

- `PARALLEL_REPOS`: concurrent repos (default `3`)
- `TASKS_PER_REPO`: max planned tasks per repo session (default `10`, may do fewer)
- `MAX_CYCLES`: number of full passes across all repos (`1 cycle = 1 touch per repo`)
- `MAX_HOURS`: total runtime cap (`0` = unlimited, default)
- `IDEA_BOOTSTRAP_ENABLED`: `1` to process `ideas.yaml` into new projects (default)
- `PROJECT_MEMORY_MAX_LINES`: compaction threshold for `PROJECT_MEMORY.md` (default `500`)
- `CI_AUTOFIX_ENABLED`: `1` to auto-remediate failing GitHub Actions
- `PROMPTS_FILE` / `CORE_PROMPT_FILE`: steering and core autonomous prompts

## Repository Memory Policy

For each tracked repository, the loop enforces:
- `AGENTS.md`: stable operating contract (core policy sections are not rewritten automatically).
- `PROJECT_MEMORY.md`: evolving structured memory (decisions, evidence, trust labels, verification history).
- `INCIDENTS.md`: true failure/mistake records with root cause and prevention rules.

When `PROJECT_MEMORY.md` exceeds `PROJECT_MEMORY_MAX_LINES`, the loop auto-compacts it and archives snapshots under `.clone_memory_archive/`.

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
