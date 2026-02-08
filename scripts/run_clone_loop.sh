#!/usr/bin/env bash
set -euo pipefail

REPOS_FILE="${REPOS_FILE:-repos.yaml}"
MAX_HOURS="${MAX_HOURS:-10}"
MAX_CYCLES="${MAX_CYCLES:-1}"
MODEL="${MODEL:-}"
SLEEP_SECONDS="${SLEEP_SECONDS:-120}"
LOG_DIR="${LOG_DIR:-logs}"
TRACKER_FILE_NAME="${TRACKER_FILE_NAME:-CLONE_FEATURES.md}"
COMMITS_PER_REPO="${COMMITS_PER_REPO:-1}"
COMMIT_STRATEGY="${COMMIT_STRATEGY:-exact}"
PROMPTS_FILE="${PROMPTS_FILE:-prompts/repo_steering.md}"
CORE_PROMPT_FILE="${CORE_PROMPT_FILE:-prompts/autonomous_core_prompt.md}"

mkdir -p "$LOG_DIR"
RUN_ID="$(date +%Y%m%d-%H%M%S)"
RUN_LOG="$LOG_DIR/run-${RUN_ID}.log"
EVENTS_LOG="$LOG_DIR/run-${RUN_ID}-events.log"
STATUS_FILE="$LOG_DIR/run-${RUN_ID}-status.txt"

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

if ! [[ "$COMMITS_PER_REPO" =~ ^[1-9][0-9]*$ ]]; then
  echo "COMMITS_PER_REPO must be a positive integer, got: $COMMITS_PER_REPO" >&2
  exit 1
fi

if [[ "$COMMIT_STRATEGY" != "exact" && "$COMMIT_STRATEGY" != "up_to" ]]; then
  echo "COMMIT_STRATEGY must be 'exact' or 'up_to', got: $COMMIT_STRATEGY" >&2
  exit 1
fi

repo_count="$(jq '.repos | length' "$REPOS_FILE")"
if [[ "$repo_count" -eq 0 ]]; then
  echo "No repos found in $REPOS_FILE" | tee -a "$RUN_LOG"
  exit 0
fi

start_epoch="$(date +%s)"
deadline_epoch="$((start_epoch + MAX_HOURS * 3600))"

log_event() {
  local level="$1"
  local message="$2"
  local ts
  ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "[$ts] [$level] $message" | tee -a "$RUN_LOG"
  echo "{\"ts\":\"$ts\",\"level\":\"$level\",\"message\":$(jq -Rn --arg m "$message" '$m')}" >>"$EVENTS_LOG"
}

update_status() {
  local state="$1"
  local repo="${2:-}"
  local path="${3:-}"
  local pass="${4:-}"
  local updated_at
  updated_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  cat >"$STATUS_FILE" <<EOF
run_id: $RUN_ID
pid: $$
updated_at: $updated_at
state: $state
repo: $repo
path: $path
pass: $pass
run_log: $RUN_LOG
events_log: $EVENTS_LOG
EOF
}

CURRENT_REPO=""
CURRENT_PATH=""
CURRENT_PASS=""
cleanup() {
  update_status "finished" "$CURRENT_REPO" "$CURRENT_PATH" "$CURRENT_PASS"
}
trap cleanup EXIT

log_event INFO "Run ID: $RUN_ID"
log_event INFO "PID: $$"
log_event INFO "Repos file: $REPOS_FILE"
log_event INFO "Repo count: $repo_count"
log_event INFO "Max hours: $MAX_HOURS"
log_event INFO "Max cycles: $MAX_CYCLES"
log_event INFO "Tracker file: $TRACKER_FILE_NAME"
log_event INFO "Commits per repo: $COMMITS_PER_REPO"
log_event INFO "Commit strategy: $COMMIT_STRATEGY"
log_event INFO "Prompts file: $PROMPTS_FILE"
log_event INFO "Core prompt file: $CORE_PROMPT_FILE"
log_event INFO "Run log: $RUN_LOG"
log_event INFO "Events log: $EVENTS_LOG"
log_event INFO "Status file: $STATUS_FILE"
update_status "starting"

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

sync_repo_branch() {
  local repo_path="$1"
  local branch="$2"
  local repo_name="$3"

  if ! git -C "$repo_path" remote get-url origin >/dev/null 2>&1; then
    return 0
  fi

  git -C "$repo_path" fetch origin "$branch" >>"$RUN_LOG" 2>&1 || true
  commit_all_changes_if_any "$repo_path" "chore: save pending local changes before autonomous sync"

  if ! git -C "$repo_path" ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
    return 0
  fi

  git -C "$repo_path" pull --rebase origin "$branch" >>"$RUN_LOG" 2>&1 || {
    git -C "$repo_path" rebase --abort >>"$RUN_LOG" 2>&1 || true
    git -C "$repo_path" pull --no-rebase origin "$branch" >>"$RUN_LOG" 2>&1 || {
      log_event WARN "FAIL repo=$repo_name reason=pull_sync_conflict"
      return 1
    }
  }

  if ! git -C "$repo_path" diff --quiet "@{upstream}"..HEAD 2>/dev/null; then
    if ! push_main_with_retries "$repo_path" "$branch"; then
      log_event WARN "WARN repo=$repo_name reason=push_pending_sync_failed"
    fi
  fi

  return 0
}

append_tracker_checkpoint() {
  local tracker_file="$1"
  local pass="$2"
  local total="$3"

  {
    echo "- $(date -u +%Y-%m-%dT%H:%M:%SZ): checkpoint commit for pass ${pass}/${total} (no meaningful code delta found)."
  } >>"$tracker_file"
}

load_steering_prompt() {
  if [[ -f "$PROMPTS_FILE" ]]; then
    cat "$PROMPTS_FILE"
    return 0
  fi

  cat <<'EOF'
- What is the next relevant feature to build?
- Can we improve the project quality, reliability, and maintainability?
- Which features from similar projects are worth adapting here?
- If Apple or Google built this, what product and engineering quality upgrades would they prioritize?
- What are the top 5 improvements for this repository right now?
- If web search is available, what recent ideas or techniques can we apply today?
- Keep AGENTS.md, README.md, and other relevant docs current with changes.
EOF
}

load_core_prompt() {
  if [[ -f "$CORE_PROMPT_FILE" ]]; then
    cat "$CORE_PROMPT_FILE"
    return 0
  fi

  cat <<'EOF'
You are an autonomous expert engineer, highly focused on making this project product-market fit. You own decisions for this repository and wear multiple hats: developer, product thinker, user advocate, and DevEx optimizer. Identify the most relevant next features to build, update, improve, or remove. Keep track of key learnings in relevant markdown files in this project, and create one if needed. Treat these docs as your persistent project memory as you continue improving the codebase.
EOF
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

## Insights

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

  local name path branch objective current_branch last_message_file tracker_file pass_log_file repo_slug
  local pass commits_done before_head after_head
  local prompt steering_guidance core_guidance
  name="$(jq -r '.name' <<<"$repo_json")"
  path="$(jq -r '.path' <<<"$repo_json")"
  branch="$(jq -r '.branch // "main"' <<<"$repo_json")"
  objective="$(jq -r '.objective' <<<"$repo_json")"
  tracker_file="$path/$TRACKER_FILE_NAME"
  repo_slug="$(printf '%s' "$name" | tr '/[:space:]' '__' | tr -cd 'A-Za-z0-9._-')"
  if [[ -z "$repo_slug" ]]; then
    repo_slug="repo"
  fi

  CURRENT_REPO="$name"
  CURRENT_PATH="$path"
  CURRENT_PASS=""
  log_event INFO "START repo=$name path=$path"
  update_status "running_repo" "$name" "$path" ""

  if [[ ! -d "$path/.git" ]]; then
    log_event WARN "SKIP repo=$name reason=missing_git_dir"
    update_status "skipped_repo" "$name" "$path" ""
    return 0
  fi

  if git -C "$path" rev-parse --verify "$branch" >/dev/null 2>&1; then
    git -C "$path" checkout "$branch" >>"$RUN_LOG" 2>&1
  else
    git -C "$path" checkout -b "$branch" >>"$RUN_LOG" 2>&1
  fi

  if ! sync_repo_branch "$path" "$branch" "$name"; then
    return 0
  fi

  steering_guidance="$(load_steering_prompt)"
  core_guidance="$(load_core_prompt)"

  seed_tracker_from_repo "$path" "$tracker_file"
  commit_all_changes_if_any "$path" "docs: initialize clone feature tracker"
  if git -C "$path" remote get-url origin >/dev/null 2>&1; then
    push_main_with_retries "$path" "$branch" >>"$RUN_LOG" 2>&1 || true
  fi

  commits_done=0
  for (( pass=1; pass<=COMMITS_PER_REPO; pass++ )); do
    now_epoch="$(date +%s)"
    if (( now_epoch >= deadline_epoch )); then
      log_event WARN "STOP repo=$name reason=runtime_deadline"
      update_status "deadline_reached" "$name" "$path" "$pass"
      break
    fi

    CURRENT_PASS="${pass}/${COMMITS_PER_REPO}"
    log_event INFO "PASS repo=$name pass=${pass}/${COMMITS_PER_REPO}"
    update_status "running_pass" "$name" "$path" "${pass}/${COMMITS_PER_REPO}"

    if ! sync_repo_branch "$path" "$branch" "$name"; then
      break
    fi

    before_head="$(git -C "$path" rev-parse HEAD 2>/dev/null || true)"
    last_message_file="$LOG_DIR/${RUN_ID}-${repo_slug}-pass-${pass}-last-message.txt"
    pass_log_file="$LOG_DIR/${RUN_ID}-${repo_slug}-pass-${pass}.log"
    log_event INFO "RUN repo=$name pass=${pass}/${COMMITS_PER_REPO} cwd=$path pass_log=$pass_log_file"

    prompt="$(cat <<PROMPT
You are my autonomous maintainer for this repository.

Core directive:
$core_guidance

Objective:
$objective

Execution mode for this pass:
- Pass ${pass} of ${COMMITS_PER_REPO}.
- Required commit strategy: ${COMMIT_STRATEGY}.
- Complete exactly one high-value improvement in this pass and produce exactly one meaningful commit if possible.

Required workflow:
1) Read README/docs/roadmap/changelog/checklists first and extract pending product or engineering work.
2) Run a quick code review sweep to identify risks, dead or unused code, low-quality patterns, and maintenance debt.
3) Propose 2-4 concrete feature or quality improvements based on current codebase reality.
4) Select the highest-impact, safely shippable item and implement it now.
5) Run relevant checks (lint/tests/build) and fix failures.
6) Update $TRACKER_FILE_NAME:
   - Keep "Candidate Features To Do" current and deduplicated.
   - Move delivered items to "Implemented" with date and evidence (files/tests).
   - Add actionable project insights to the "Insights" section.
7) Commit directly to $branch and push directly to origin/$branch (no PR).

Rules:
- Work only in this repository.
- Avoid destructive git operations.
- Favor real improvements over superficial edits.
- If no meaningful feature remains, perform one high-value maintenance/refactor cleanup and document why.
- End with concise output: change summary, tests run, remaining backlog ideas.

Steering prompts for this repository:
$steering_guidance
PROMPT
)"

    codex_cmd=(codex exec --dangerously-bypass-approvals-and-sandbox --cd "$path" --output-last-message "$last_message_file")
    if [[ -n "$MODEL" ]]; then
      codex_cmd+=(--model "$MODEL")
    fi
    codex_cmd+=("$prompt")

    if ! "${codex_cmd[@]}" 2>&1 | tee -a "$RUN_LOG" "$pass_log_file"; then
      log_event WARN "FAIL repo=$name reason=codex_exec pass=${pass} pass_log=$pass_log_file"
    fi

    current_branch="$(git -C "$path" rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
    if [[ "$current_branch" != "$branch" ]]; then
      git -C "$path" checkout "$branch" >>"$RUN_LOG" 2>&1 || true
    fi

    commit_all_changes_if_any "$path" "chore: autonomous maintenance pass ${pass}/${COMMITS_PER_REPO}"

    if git -C "$path" remote get-url origin >/dev/null 2>&1; then
      if ! push_main_with_retries "$path" "$branch"; then
        log_event WARN "WARN repo=$name reason=final_push_failed pass=${pass}"
      fi
    fi

    after_head="$(git -C "$path" rev-parse HEAD 2>/dev/null || true)"

    if [[ -z "$before_head" && -n "$after_head" ]]; then
      commits_done="$((commits_done + 1))"
      continue
    fi
    if [[ -n "$before_head" && -n "$after_head" && "$before_head" != "$after_head" ]]; then
      commits_done="$((commits_done + 1))"
      continue
    fi

    if [[ "$COMMIT_STRATEGY" == "up_to" ]]; then
      log_event INFO "STOP repo=$name reason=no_meaningful_delta pass=${pass}"
      break
    fi

    append_tracker_checkpoint "$tracker_file" "$pass" "$COMMITS_PER_REPO"
    commit_all_changes_if_any "$path" "docs: autonomous checkpoint pass ${pass}/${COMMITS_PER_REPO}"
    if git -C "$path" remote get-url origin >/dev/null 2>&1; then
      push_main_with_retries "$path" "$branch" >>"$RUN_LOG" 2>&1 || true
    fi
    after_head="$(git -C "$path" rev-parse HEAD 2>/dev/null || true)"

    if [[ -z "$before_head" && -n "$after_head" ]]; then
      commits_done="$((commits_done + 1))"
      continue
    fi
    if [[ -n "$before_head" && -n "$after_head" && "$before_head" != "$after_head" ]]; then
      commits_done="$((commits_done + 1))"
      continue
    fi

    git -C "$path" commit --allow-empty -m "chore: autonomous heartbeat pass ${pass}/${COMMITS_PER_REPO}" >>"$RUN_LOG" 2>&1 || true
    if git -C "$path" remote get-url origin >/dev/null 2>&1; then
      push_main_with_retries "$path" "$branch" >>"$RUN_LOG" 2>&1 || true
    fi

    after_head="$(git -C "$path" rev-parse HEAD 2>/dev/null || true)"
    if [[ -z "$before_head" && -n "$after_head" ]]; then
      commits_done="$((commits_done + 1))"
      continue
    fi
    if [[ -n "$before_head" && -n "$after_head" && "$before_head" != "$after_head" ]]; then
      commits_done="$((commits_done + 1))"
      continue
    fi

    log_event WARN "WARN repo=$name reason=exact_commit_unmet pass=${pass}"
  done

  log_event INFO "END repo=$name commits_done=$commits_done target=$COMMITS_PER_REPO strategy=$COMMIT_STRATEGY"
  update_status "repo_complete" "$name" "$path" ""
}

cycle=1
while :; do
  now_epoch="$(date +%s)"
  if (( now_epoch >= deadline_epoch )); then
    log_event INFO "Reached max runtime (${MAX_HOURS}h)."
    update_status "finished_deadline" "$CURRENT_REPO" "$CURRENT_PATH" "$CURRENT_PASS"
    break
  fi

  if (( cycle > MAX_CYCLES )); then
    log_event INFO "Reached max cycles ($MAX_CYCLES)."
    update_status "finished_cycles" "$CURRENT_REPO" "$CURRENT_PATH" "$CURRENT_PASS"
    break
  fi

  log_event INFO "--- Cycle $cycle ---"
  update_status "running_cycle_$cycle" "$CURRENT_REPO" "$CURRENT_PATH" "$CURRENT_PASS"

  while IFS= read -r repo_json; do
    now_epoch="$(date +%s)"
    if (( now_epoch >= deadline_epoch )); then
      log_event INFO "Runtime deadline hit during cycle."
      update_status "finished_deadline" "$CURRENT_REPO" "$CURRENT_PATH" "$CURRENT_PASS"
      break 2
    fi

    run_repo "$repo_json"
  done < <(jq -c '.repos[]' "$REPOS_FILE")

  cycle="$((cycle + 1))"
  now_epoch="$(date +%s)"
  if (( now_epoch >= deadline_epoch )); then
    log_event INFO "Reached max runtime (${MAX_HOURS}h)."
    update_status "finished_deadline" "$CURRENT_REPO" "$CURRENT_PATH" "$CURRENT_PASS"
    break
  fi

  if (( cycle <= MAX_CYCLES )); then
    log_event INFO "Sleeping ${SLEEP_SECONDS}s before next cycle."
    update_status "sleeping" "$CURRENT_REPO" "$CURRENT_PATH" "$CURRENT_PASS"
    sleep "$SLEEP_SECONDS"
  fi

done

log_event INFO "Finished. Run log: $RUN_LOG"
update_status "finished" "$CURRENT_REPO" "$CURRENT_PATH" "$CURRENT_PASS"
