#!/usr/bin/env bash
set -euo pipefail

REPOS_FILE="${REPOS_FILE:-repos.yaml}"
MAX_HOURS="${MAX_HOURS:-10}"
MAX_CYCLES="${MAX_CYCLES:-1}"
MODEL="${MODEL:-}"
SLEEP_SECONDS="${SLEEP_SECONDS:-120}"
LOG_DIR="${LOG_DIR:-logs}"
TRACKER_FILE_NAME="${TRACKER_FILE_NAME:-CLONE_FEATURES.md}"

mkdir -p "$LOG_DIR"
RUN_ID="$(date +%Y%m%d-%H%M%S)"
RUN_LOG="$LOG_DIR/run-${RUN_ID}.log"

if [[ ! -f "$REPOS_FILE" ]]; then
  echo "Missing repos file: $REPOS_FILE" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required" >&2
  exit 1
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "codex CLI is required" >&2
  exit 1
fi

repo_count="$(jq '.repos | length' "$REPOS_FILE")"
if [[ "$repo_count" -eq 0 ]]; then
  echo "No repos found in $REPOS_FILE" | tee -a "$RUN_LOG"
  exit 0
fi

start_epoch="$(date +%s)"
deadline_epoch="$((start_epoch + MAX_HOURS * 3600))"

echo "Run ID: $RUN_ID" | tee -a "$RUN_LOG"
echo "Repos file: $REPOS_FILE" | tee -a "$RUN_LOG"
echo "Repo count: $repo_count" | tee -a "$RUN_LOG"
echo "Max hours: $MAX_HOURS" | tee -a "$RUN_LOG"
echo "Max cycles: $MAX_CYCLES" | tee -a "$RUN_LOG"
echo "Tracker file: $TRACKER_FILE_NAME" | tee -a "$RUN_LOG"

has_uncommitted_changes() {
  local repo_path="$1"
  if ! git -C "$repo_path" diff --quiet || ! git -C "$repo_path" diff --cached --quiet; then
    return 0
  fi
  return 1
}

commit_all_changes_if_any() {
  local repo_path="$1"
  local message="$2"
  if has_uncommitted_changes "$repo_path"; then
    git -C "$repo_path" add -A
    git -C "$repo_path" commit -m "$message" >>"$RUN_LOG" 2>&1 || true
  fi
}

push_main_with_retries() {
  local repo_path="$1"
  local branch="$2"
  local attempt

  for attempt in 1 2 3; do
    if git -C "$repo_path" push origin "$branch" >>"$RUN_LOG" 2>&1; then
      return 0
    fi

    git -C "$repo_path" pull --rebase origin "$branch" >>"$RUN_LOG" 2>&1 || {
      git -C "$repo_path" rebase --abort >>"$RUN_LOG" 2>&1 || true
      git -C "$repo_path" pull --no-rebase origin "$branch" >>"$RUN_LOG" 2>&1 || true
    }
  done

  return 1
}

seed_tracker_from_repo() {
  local repo_path="$1"
  local tracker_file="$2"
  local temp_todos
  local has_markdown_todo=0
  local created_tracker=0

  if [[ ! -f "$tracker_file" ]]; then
    created_tracker=1
    cat >"$tracker_file" <<EOF
# Clone Feature Tracker

## Context Sources
- README and docs
- TODO/FIXME markers in code
- Test and build failures
- Gaps found during codebase exploration

## Candidate Features To Do

## Implemented

## Notes
- This file is maintained by the autonomous clone loop.
EOF
  fi

  if [[ "$created_tracker" -ne 1 ]]; then
    return 0
  fi

  temp_todos="$(mktemp)"
  find "$repo_path" -maxdepth 4 -type f \( -iname '*.md' -o -iname '*.txt' \) \
    -not -path '*/.git/*' \
    -not -path "*/${TRACKER_FILE_NAME}" \
    -print0 2>/dev/null | while IFS= read -r -d '' f; do
      awk '
        BEGIN { IGNORECASE=1 }
        /^[[:space:]]*[-*][[:space:]]+\[[[:space:]]\][[:space:]]+/ { print FILENAME ":" $0 }
      ' "$f" 2>/dev/null || true
    done >"$temp_todos"

  if [[ -s "$temp_todos" ]]; then
    has_markdown_todo=1
  fi

  if [[ "$has_markdown_todo" -eq 1 ]]; then
    {
      echo
      echo "### Auto-discovered Open Checklist Items ($(date -u +%Y-%m-%d))"
      sed 's/^/- /' "$temp_todos"
    } >>"$tracker_file"
  fi

  rm -f "$temp_todos"
}

run_repo() {
  local repo_json="$1"

  local name path branch objective current_branch last_message_file tracker_file
  name="$(jq -r '.name' <<<"$repo_json")"
  path="$(jq -r '.path' <<<"$repo_json")"
  branch="$(jq -r '.branch // "main"' <<<"$repo_json")"
  objective="$(jq -r '.objective' <<<"$repo_json")"
  tracker_file="$path/$TRACKER_FILE_NAME"

  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] START repo=$name path=$path" | tee -a "$RUN_LOG"

  if [[ ! -d "$path/.git" ]]; then
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] SKIP repo=$name reason=missing_git_dir" | tee -a "$RUN_LOG"
    return 0
  fi

  if git -C "$path" rev-parse --verify "$branch" >/dev/null 2>&1; then
    git -C "$path" checkout "$branch" >>"$RUN_LOG" 2>&1
  else
    git -C "$path" checkout -b "$branch" >>"$RUN_LOG" 2>&1
  fi

  if git -C "$path" remote get-url origin >/dev/null 2>&1; then
    git -C "$path" fetch origin "$branch" >>"$RUN_LOG" 2>&1 || true
    commit_all_changes_if_any "$path" "chore: save pending local changes before autonomous sync"
    git -C "$path" pull --rebase origin "$branch" >>"$RUN_LOG" 2>&1 || {
      git -C "$path" rebase --abort >>"$RUN_LOG" 2>&1 || true
      git -C "$path" pull --no-rebase origin "$branch" >>"$RUN_LOG" 2>&1 || {
        echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] FAIL repo=$name reason=pull_sync_conflict" | tee -a "$RUN_LOG"
        return 0
      }
    }
    if ! git -C "$path" diff --quiet "@{upstream}"..HEAD 2>/dev/null; then
      if ! push_main_with_retries "$path" "$branch"; then
        echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] WARN repo=$name reason=push_pending_sync_failed" | tee -a "$RUN_LOG"
      fi
    fi
  fi

  seed_tracker_from_repo "$path" "$tracker_file"
  commit_all_changes_if_any "$path" "docs: initialize clone feature tracker"

  last_message_file="$LOG_DIR/${RUN_ID}-${name}-last-message.txt"

  prompt="$(cat <<PROMPT
You are my autonomous maintainer for this repository.

Objective:
$objective

Required workflow:
1) Inspect the repository to identify pending work from README/docs/roadmaps/checklists first, then TODO/FIXME markers, missing tests, docs gaps, broken scripts, and dependency hygiene.
2) Pick the highest-impact task you can finish safely now.
3) Implement the task with clean code changes.
4) Run relevant checks (lint/tests/build) and fix failures.
5) Ensure there are no uncommitted changes left behind.
6) Update $TRACKER_FILE_NAME before commit:
   - Add pending candidate work items under "Candidate Features To Do".
   - Move completed items into "Implemented" with date and short proof (files/tests).
   - Keep the file concise and deduplicated.
7) Commit directly to $branch with a concise message and push directly to origin/$branch (no PR).

Rules:
- Work only in this repository.
- Avoid destructive git operations.
- If no meaningful pending feature work exists, do one concrete maintenance improvement and validate it.
- End with a concise summary of what changed and what remains pending.
PROMPT
)"

  codex_cmd=(codex exec --dangerously-bypass-approvals-and-sandbox --cd "$path" --output-last-message "$last_message_file")
  if [[ -n "$MODEL" ]]; then
    codex_cmd+=(--model "$MODEL")
  fi
  codex_cmd+=("$prompt")

  if ! "${codex_cmd[@]}" >>"$RUN_LOG" 2>&1; then
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] FAIL repo=$name reason=codex_exec" | tee -a "$RUN_LOG"
    return 0
  fi

  current_branch="$(git -C "$path" rev-parse --abbrev-ref HEAD)"
  if [[ "$current_branch" != "$branch" ]]; then
    git -C "$path" checkout "$branch" >>"$RUN_LOG" 2>&1 || true
  fi

  commit_all_changes_if_any "$path" "chore: autonomous maintenance pass"

  if git -C "$path" remote get-url origin >/dev/null 2>&1; then
    if ! push_main_with_retries "$path" "$branch"; then
      echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] WARN repo=$name reason=final_push_failed" | tee -a "$RUN_LOG"
    fi
  fi

  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] END repo=$name" | tee -a "$RUN_LOG"
}

cycle=1
while :; do
  now_epoch="$(date +%s)"
  if (( now_epoch >= deadline_epoch )); then
    echo "Reached max runtime (${MAX_HOURS}h)." | tee -a "$RUN_LOG"
    break
  fi

  if (( cycle > MAX_CYCLES )); then
    echo "Reached max cycles ($MAX_CYCLES)." | tee -a "$RUN_LOG"
    break
  fi

  echo "--- Cycle $cycle ---" | tee -a "$RUN_LOG"

  while IFS= read -r repo_json; do
    now_epoch="$(date +%s)"
    if (( now_epoch >= deadline_epoch )); then
      echo "Runtime deadline hit during cycle." | tee -a "$RUN_LOG"
      break 2
    fi

    run_repo "$repo_json"
  done < <(jq -c '.repos[]' "$REPOS_FILE")

  cycle="$((cycle + 1))"
  now_epoch="$(date +%s)"
  if (( now_epoch >= deadline_epoch )); then
    echo "Reached max runtime (${MAX_HOURS}h)." | tee -a "$RUN_LOG"
    break
  fi

  if (( cycle <= MAX_CYCLES )); then
    echo "Sleeping ${SLEEP_SECONDS}s before next cycle." | tee -a "$RUN_LOG"
    sleep "$SLEEP_SECONDS"
  fi

done

echo "Finished. Run log: $RUN_LOG" | tee -a "$RUN_LOG"
