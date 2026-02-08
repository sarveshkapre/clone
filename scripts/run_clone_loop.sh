#!/usr/bin/env bash
set -euo pipefail

REPOS_FILE="${REPOS_FILE:-repos.yaml}"
MAX_HOURS="${MAX_HOURS:-10}"
MAX_CYCLES="${MAX_CYCLES:-1}"
MODEL="${MODEL:-gpt-5.3-codex}"
SLEEP_SECONDS="${SLEEP_SECONDS:-120}"
LOG_DIR="${LOG_DIR:-logs}"
TRACKER_FILE_NAME="${TRACKER_FILE_NAME:-CLONE_FEATURES.md}"
COMMITS_PER_REPO="${COMMITS_PER_REPO:-1}"
COMMIT_STRATEGY="${COMMIT_STRATEGY:-exact}"
PROMPTS_FILE="${PROMPTS_FILE:-prompts/repo_steering.md}"
CORE_PROMPT_FILE="${CORE_PROMPT_FILE:-prompts/autonomous_core_prompt.md}"
CODEX_SANDBOX_FLAG="--dangerously-bypass-approvals-and-sandbox"
GH_SIGNALS_ENABLED="${GH_SIGNALS_ENABLED:-1}"
GH_ISSUES_LIMIT="${GH_ISSUES_LIMIT:-20}"
GH_RUNS_LIMIT="${GH_RUNS_LIMIT:-15}"
CI_AUTOFIX_ENABLED="${CI_AUTOFIX_ENABLED:-1}"
CI_WAIT_TIMEOUT_SECONDS="${CI_WAIT_TIMEOUT_SECONDS:-900}"
CI_POLL_INTERVAL_SECONDS="${CI_POLL_INTERVAL_SECONDS:-30}"
CI_MAX_FIX_ATTEMPTS="${CI_MAX_FIX_ATTEMPTS:-2}"
CI_FAILURE_LOG_LINES="${CI_FAILURE_LOG_LINES:-200}"
PARALLEL_REPOS="${PARALLEL_REPOS:-1}"

mkdir -p "$LOG_DIR"
RUN_ID="$(date +%Y%m%d-%H%M%S)"
RUN_LOG="$LOG_DIR/run-${RUN_ID}.log"
EVENTS_LOG="$LOG_DIR/run-${RUN_ID}-events.log"
STATUS_FILE="$LOG_DIR/run-${RUN_ID}-status.txt"
WORKER_STATUS_DIR="$LOG_DIR/run-${RUN_ID}-workers"
mkdir -p "$WORKER_STATUS_DIR"

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

if [[ "$CODEX_SANDBOX_FLAG" != "--dangerously-bypass-approvals-and-sandbox" ]]; then
  echo "CODEX_SANDBOX_FLAG must be --dangerously-bypass-approvals-and-sandbox" >&2
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

if ! [[ "$GH_SIGNALS_ENABLED" =~ ^[01]$ ]]; then
  echo "GH_SIGNALS_ENABLED must be 0 or 1, got: $GH_SIGNALS_ENABLED" >&2
  exit 1
fi

if ! [[ "$GH_ISSUES_LIMIT" =~ ^[1-9][0-9]*$ ]]; then
  echo "GH_ISSUES_LIMIT must be a positive integer, got: $GH_ISSUES_LIMIT" >&2
  exit 1
fi

if ! [[ "$GH_RUNS_LIMIT" =~ ^[1-9][0-9]*$ ]]; then
  echo "GH_RUNS_LIMIT must be a positive integer, got: $GH_RUNS_LIMIT" >&2
  exit 1
fi

if ! [[ "$CI_AUTOFIX_ENABLED" =~ ^[01]$ ]]; then
  echo "CI_AUTOFIX_ENABLED must be 0 or 1, got: $CI_AUTOFIX_ENABLED" >&2
  exit 1
fi

if ! [[ "$CI_WAIT_TIMEOUT_SECONDS" =~ ^[1-9][0-9]*$ ]]; then
  echo "CI_WAIT_TIMEOUT_SECONDS must be a positive integer, got: $CI_WAIT_TIMEOUT_SECONDS" >&2
  exit 1
fi

if ! [[ "$CI_POLL_INTERVAL_SECONDS" =~ ^[1-9][0-9]*$ ]]; then
  echo "CI_POLL_INTERVAL_SECONDS must be a positive integer, got: $CI_POLL_INTERVAL_SECONDS" >&2
  exit 1
fi

if ! [[ "$CI_MAX_FIX_ATTEMPTS" =~ ^[1-9][0-9]*$ ]]; then
  echo "CI_MAX_FIX_ATTEMPTS must be a positive integer, got: $CI_MAX_FIX_ATTEMPTS" >&2
  exit 1
fi

if ! [[ "$CI_FAILURE_LOG_LINES" =~ ^[1-9][0-9]*$ ]]; then
  echo "CI_FAILURE_LOG_LINES must be a positive integer, got: $CI_FAILURE_LOG_LINES" >&2
  exit 1
fi

if ! [[ "$PARALLEL_REPOS" =~ ^[1-9][0-9]*$ ]]; then
  echo "PARALLEL_REPOS must be a positive integer, got: $PARALLEL_REPOS" >&2
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

update_worker_status() {
  local state="$1"
  local repo="${2:-}"
  local path="${3:-}"
  local pass="${4:-}"
  local updated_at worker_file
  updated_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  worker_file="$WORKER_STATUS_DIR/worker-$$.txt"
  cat >"$worker_file" <<EOF
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

set_status() {
  local state="$1"
  local repo="${2:-}"
  local path="${3:-}"
  local pass="${4:-}"
  if (( PARALLEL_REPOS > 1 )); then
    update_worker_status "$state" "$repo" "$path" "$pass"
  else
    update_status "$state" "$repo" "$path" "$pass"
  fi
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
log_event INFO "Model: $MODEL"
log_event INFO "Codex sandbox flag: $CODEX_SANDBOX_FLAG"
log_event INFO "GitHub signals enabled: $GH_SIGNALS_ENABLED"
log_event INFO "GitHub issue limit: $GH_ISSUES_LIMIT"
log_event INFO "GitHub runs limit: $GH_RUNS_LIMIT"
log_event INFO "CI autofix enabled: $CI_AUTOFIX_ENABLED"
log_event INFO "CI wait timeout seconds: $CI_WAIT_TIMEOUT_SECONDS"
log_event INFO "CI poll interval seconds: $CI_POLL_INTERVAL_SECONDS"
log_event INFO "CI max fix attempts: $CI_MAX_FIX_ATTEMPTS"
log_event INFO "CI failure log lines: $CI_FAILURE_LOG_LINES"
log_event INFO "Parallel repos: $PARALLEL_REPOS"
log_event INFO "Run log: $RUN_LOG"
log_event INFO "Events log: $EVENTS_LOG"
log_event INFO "Status file: $STATUS_FILE"
log_event INFO "Worker status dir: $WORKER_STATUS_DIR"
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

gh_ready() {
  if [[ "$GH_SIGNALS_ENABLED" != "1" ]]; then
    return 1
  fi
  command -v gh >/dev/null 2>&1 || return 1
  gh auth status >/dev/null 2>&1 || return 1
  return 0
}

collect_issue_context() {
  local repo_path="$1"
  local viewer_login="$2"
  local issue_json
  local filtered

  if [[ -z "$viewer_login" ]]; then
    echo "- Issue signals unavailable: could not resolve authenticated GitHub user."
    return 0
  fi

  issue_json="$(cd "$repo_path" && gh issue list --state open --limit "$GH_ISSUES_LIMIT" --json number,title,author,url 2>/dev/null || true)"
  if [[ -z "$issue_json" || "$issue_json" == "[]" ]]; then
    echo "- Open issues by $viewer_login or GitHub bots: none found."
    return 0
  fi

  filtered="$(
    jq -r \
      --arg viewer "$viewer_login" \
      '
      map(
        select(
          .author.login == $viewer
          or .author.login == "github"
          or .author.login == "dependabot[bot]"
          or .author.login == "github-actions[bot]"
        )
      )
      | .[0:8]
      | .[]
      | "- #\(.number) \(.title) [author: \(.author.login)] \(.url)"
      ' <<<"$issue_json" 2>/dev/null || true
  )"

  if [[ -z "$filtered" ]]; then
    echo "- Open issues by $viewer_login or GitHub bots: none found."
  else
    echo "$filtered"
  fi
}

collect_ci_context() {
  local repo_path="$1"
  local runs_json
  local failures

  runs_json="$(cd "$repo_path" && gh run list --limit "$GH_RUNS_LIMIT" --json databaseId,workflowName,displayTitle,status,conclusion,url 2>/dev/null || true)"
  if [[ -z "$runs_json" || "$runs_json" == "[]" ]]; then
    echo "- CI signals unavailable or no workflow runs found."
    return 0
  fi

  failures="$(
    jq -r '
      map(select(.status == "completed" and (.conclusion != "success")))
      | .[0:8]
      | .[]
      | "- Run #\(.databaseId) \(.workflowName // "workflow") [\(.conclusion // "unknown")] \(.url // "")"
    ' <<<"$runs_json" 2>/dev/null || true
  )"

  if [[ -z "$failures" ]]; then
    echo "- No failing completed CI runs in recent history."
  else
    echo "$failures"
  fi
}

ci_autofix_ready() {
  if [[ "$CI_AUTOFIX_ENABLED" != "1" ]]; then
    return 1
  fi
  gh_ready || return 1
  return 0
}

wait_for_ci_outcome() {
  local repo_path="$1"
  local branch="$2"
  local head_sha="$3"
  local report_file="$4"
  local deadline now pending failed total seen_runs
  local runs_json

  seen_runs=0
  deadline="$(( $(date +%s) + CI_WAIT_TIMEOUT_SECONDS ))"
  : >"$report_file"

  while :; do
    now="$(date +%s)"
    if (( now >= deadline )); then
      if (( seen_runs == 0 )); then
        echo "No CI workflow runs observed for commit $head_sha within ${CI_WAIT_TIMEOUT_SECONDS}s." >>"$report_file"
      else
        echo "Timed out waiting for CI completion for commit $head_sha after ${CI_WAIT_TIMEOUT_SECONDS}s." >>"$report_file"
      fi
      return 2
    fi

    runs_json="$(cd "$repo_path" && gh run list --branch "$branch" --commit "$head_sha" --limit "$GH_RUNS_LIMIT" --json databaseId,workflowName,status,conclusion,url,headSha,updatedAt 2>/dev/null || true)"
    if [[ -z "$runs_json" || "$runs_json" == "[]" ]]; then
      sleep "$CI_POLL_INTERVAL_SECONDS"
      continue
    fi

    seen_runs=1
    pending="$(jq '[.[] | select(.status != "completed")] | length' <<<"$runs_json" 2>/dev/null || echo 0)"
    failed="$(jq '[.[] | select(.status == "completed" and (.conclusion != "success"))] | length' <<<"$runs_json" 2>/dev/null || echo 0)"
    total="$(jq 'length' <<<"$runs_json" 2>/dev/null || echo 0)"

    if (( pending > 0 )); then
      sleep "$CI_POLL_INTERVAL_SECONDS"
      continue
    fi

    {
      echo "Commit: $head_sha"
      echo "Observed runs: $total"
      echo "Failed runs: $failed"
      jq -r '.[] | "- Run #\(.databaseId) \(.workflowName // "workflow") [status=\(.status) conclusion=\(.conclusion // "unknown")] \(.url // "")"' <<<"$runs_json" 2>/dev/null || true
    } >>"$report_file"

    if (( failed > 0 )); then
      return 1
    fi
    return 0
  done
}

append_failed_run_logs() {
  local repo_path="$1"
  local branch="$2"
  local head_sha="$3"
  local report_file="$4"
  local failed_ids
  local run_id

  failed_ids="$(
    cd "$repo_path" && gh run list --branch "$branch" --commit "$head_sha" --status failure --limit "$GH_RUNS_LIMIT" --json databaseId \
      | jq -r '.[0:3] | .[] | .databaseId' 2>/dev/null || true
  )"

  if [[ -z "$failed_ids" ]]; then
    return 0
  fi

  {
    echo
    echo "Failed run log excerpts:"
  } >>"$report_file"

  while IFS= read -r run_id; do
    [[ -z "$run_id" ]] && continue
    {
      echo
      echo "=== Run #$run_id failed log excerpt ==="
      cd "$repo_path" && gh run view "$run_id" --log-failed 2>/dev/null | tail -n "$CI_FAILURE_LOG_LINES"
    } >>"$report_file" || {
      echo "Could not fetch failed logs for run #$run_id." >>"$report_file"
    }
  done <<<"$failed_ids"
}

run_ci_autofix_for_pass() {
  local repo_path="$1"
  local repo_name="$2"
  local branch="$3"
  local repo_slug="$4"
  local pass="$5"
  local objective="$6"
  local core_guidance="$7"
  local steering_guidance="$8"
  local viewer_login="$9"
  local issue_context="${10}"
  local ci_context="${11}"
  local pass_log_file="${12}"

  local fix_attempt head_sha new_head_sha ci_report_file ci_prompt ci_last_message_file ci_fix_log_file current_branch
  local wait_rc

  ci_autofix_ready || return 0
  git -C "$repo_path" remote get-url origin >/dev/null 2>&1 || return 0

  for (( fix_attempt=1; fix_attempt<=CI_MAX_FIX_ATTEMPTS; fix_attempt++ )); do
    head_sha="$(git -C "$repo_path" rev-parse HEAD 2>/dev/null || true)"
    [[ -z "$head_sha" ]] && return 0

    ci_report_file="$LOG_DIR/${RUN_ID}-${repo_slug}-pass-${pass}-ci-attempt-${fix_attempt}.txt"
    log_event INFO "CI_CHECK repo=$repo_name pass=${pass} attempt=${fix_attempt}/${CI_MAX_FIX_ATTEMPTS} sha=$head_sha"

    wait_for_ci_outcome "$repo_path" "$branch" "$head_sha" "$ci_report_file"
    wait_rc="$?"

    if [[ "$wait_rc" -eq 0 ]]; then
      log_event INFO "CI_PASS repo=$repo_name pass=${pass} sha=$head_sha"
      return 0
    fi

    if [[ "$wait_rc" -eq 2 ]]; then
      log_event WARN "CI_WAIT_UNRESOLVED repo=$repo_name pass=${pass} sha=$head_sha"
      return 0
    fi

    append_failed_run_logs "$repo_path" "$branch" "$head_sha" "$ci_report_file"
    ci_fix_log_file="$LOG_DIR/${RUN_ID}-${repo_slug}-pass-${pass}-ci-fix-${fix_attempt}.log"
    ci_last_message_file="$LOG_DIR/${RUN_ID}-${repo_slug}-pass-${pass}-ci-fix-${fix_attempt}-last-message.txt"
    log_event WARN "CI_FAIL repo=$repo_name pass=${pass} attempt=${fix_attempt}/${CI_MAX_FIX_ATTEMPTS} sha=$head_sha report=$ci_report_file"

    IFS= read -r -d '' ci_prompt <<PROMPT || true
You are fixing GitHub Actions CI failures for this repository.

Core directive:
$core_guidance

Objective:
$objective

Current commit with failing CI:
- branch: $branch
- sha: $head_sha

CI failure report:
$(cat "$ci_report_file")

GitHub issue signals (author-filtered):
$issue_context

GitHub CI signals:
$ci_context

Required workflow:
1) Inspect failing workflow steps and identify root causes.
2) Prioritize fixes for missing dependencies/configuration and failing tests/build steps.
3) Implement the minimal safe fix with production-quality code.
4) Run relevant local verification commands that correspond to failing CI jobs.
5) Update README/AGENTS/docs if setup/configuration behavior changed.
6) Commit to $branch and push directly to origin/$branch.

Rules:
- Do not post comments in GitHub issues/PRs.
- Avoid destructive git operations.
- Keep fix scope tight and reliable.
- End with concise output: root cause, fix, tests run, and residual risks.

Steering prompts:
$steering_guidance
PROMPT

    codex_cmd=(codex exec "$CODEX_SANDBOX_FLAG" --cd "$repo_path" --output-last-message "$ci_last_message_file")
    if [[ -n "$MODEL" ]]; then
      codex_cmd+=(--model "$MODEL")
    fi
    codex_cmd+=("$ci_prompt")

    if ! "${codex_cmd[@]}" 2>&1 | tee -a "$RUN_LOG" "$pass_log_file" "$ci_fix_log_file"; then
      log_event WARN "CI_FIX_FAIL repo=$repo_name pass=${pass} attempt=${fix_attempt}/${CI_MAX_FIX_ATTEMPTS}"
    fi

    current_branch="$(git -C "$repo_path" rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
    if [[ "$current_branch" != "$branch" ]]; then
      git -C "$repo_path" checkout "$branch" >>"$RUN_LOG" 2>&1 || true
    fi

    commit_all_changes_if_any "$repo_path" "fix(ci): address GitHub Actions failures pass ${pass} attempt ${fix_attempt}/${CI_MAX_FIX_ATTEMPTS}"
    if ! push_main_with_retries "$repo_path" "$branch"; then
      log_event WARN "CI_FIX_PUSH_FAIL repo=$repo_name pass=${pass} attempt=${fix_attempt}/${CI_MAX_FIX_ATTEMPTS}"
      return 0
    fi

    new_head_sha="$(git -C "$repo_path" rev-parse HEAD 2>/dev/null || true)"
    if [[ -z "$new_head_sha" || "$new_head_sha" == "$head_sha" ]]; then
      log_event WARN "CI_FIX_NO_DELTA repo=$repo_name pass=${pass} attempt=${fix_attempt}/${CI_MAX_FIX_ATTEMPTS}"
      return 0
    fi
  done

  log_event WARN "CI_FIX_EXHAUSTED repo=$repo_name pass=${pass} attempts=$CI_MAX_FIX_ATTEMPTS"
  return 0
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
  local prompt steering_guidance core_guidance viewer_login issue_context ci_context
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
  set_status "running_repo" "$name" "$path" ""

  if [[ ! -d "$path/.git" ]]; then
    log_event WARN "SKIP repo=$name reason=missing_git_dir"
    set_status "skipped_repo" "$name" "$path" ""
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
  viewer_login=""
  issue_context="- GitHub issue signals disabled or unavailable."
  ci_context="- GitHub CI signals disabled or unavailable."

  if gh_ready && git -C "$path" remote get-url origin >/dev/null 2>&1; then
    viewer_login="$(gh api user -q .login 2>/dev/null || true)"
    issue_context="$(collect_issue_context "$path" "$viewer_login")"
    ci_context="$(collect_ci_context "$path")"
    log_event INFO "GitHub signals repo=$name viewer=${viewer_login:-unknown}"
  fi

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
      set_status "deadline_reached" "$name" "$path" "$pass"
      break
    fi

    CURRENT_PASS="${pass}/${COMMITS_PER_REPO}"
    log_event INFO "PASS repo=$name pass=${pass}/${COMMITS_PER_REPO}"
    set_status "running_pass" "$name" "$path" "${pass}/${COMMITS_PER_REPO}"

    if ! sync_repo_branch "$path" "$branch" "$name"; then
      break
    fi

    before_head="$(git -C "$path" rev-parse HEAD 2>/dev/null || true)"
    last_message_file="$LOG_DIR/${RUN_ID}-${repo_slug}-pass-${pass}-last-message.txt"
    pass_log_file="$LOG_DIR/${RUN_ID}-${repo_slug}-pass-${pass}.log"
    log_event INFO "RUN repo=$name pass=${pass}/${COMMITS_PER_REPO} cwd=$path pass_log=$pass_log_file"

    IFS= read -r -d '' prompt <<PROMPT || true
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
2) Review GitHub issue signals and prioritize only issues authored by "$viewer_login" and GitHub/bot-owned issues when they are relevant and high signal.
3) Review recent CI signals and prioritize fixing failing checks when the fix is clear and safely shippable.
4) Run a quick code review sweep to identify risks, dead or unused code, low-quality patterns, and maintenance debt.
5) Propose 2-4 concrete feature or quality improvements based on current codebase reality.
6) Select the highest-impact, safely shippable item and implement it now.
7) Run relevant checks (lint/tests/build) and fix failures.
8) Update $TRACKER_FILE_NAME:
   - Keep "Candidate Features To Do" current and deduplicated.
   - Move delivered items to "Implemented" with date and evidence (files/tests).
   - Add actionable project insights to the "Insights" section.
9) Commit directly to $branch and push directly to origin/$branch (no PR).

Rules:
- Work only in this repository.
- Avoid destructive git operations.
- Do not post public comments/discussions on issues or PRs from this automation loop.
- Favor real improvements over superficial edits.
- If no meaningful feature remains, perform one high-value maintenance/refactor cleanup and document why.
- Continuously look for algorithmic improvements, design simplification, and performance optimizations when safe.
- End with concise output: change summary, tests run, remaining backlog ideas.

Steering prompts for this repository:
$steering_guidance

GitHub issue signals (author-filtered):
$issue_context

GitHub CI signals:
$ci_context
PROMPT

    codex_cmd=(codex exec "$CODEX_SANDBOX_FLAG" --cd "$path" --output-last-message "$last_message_file")
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

    run_ci_autofix_for_pass \
      "$path" \
      "$name" \
      "$branch" \
      "$repo_slug" \
      "$pass" \
      "$objective" \
      "$core_guidance" \
      "$steering_guidance" \
      "$viewer_login" \
      "$issue_context" \
      "$ci_context" \
      "$pass_log_file"

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
  set_status "repo_complete" "$name" "$path" ""
}

CYCLE_DEADLINE_HIT=0

run_cycle_repos() {
  local cycle_id="$1"
  local repo_json
  local now_epoch running_jobs pid
  local -a worker_pids
  worker_pids=()

  if (( PARALLEL_REPOS <= 1 )); then
    while IFS= read -r repo_json; do
      now_epoch="$(date +%s)"
      if (( now_epoch >= deadline_epoch )); then
        CYCLE_DEADLINE_HIT=1
        return 0
      fi
      run_repo "$repo_json"
    done < <(jq -c '.repos[]' "$REPOS_FILE")
    return 0
  fi

  while IFS= read -r repo_json; do
    now_epoch="$(date +%s)"
    if (( now_epoch >= deadline_epoch )); then
      CYCLE_DEADLINE_HIT=1
      break
    fi

    while :; do
      now_epoch="$(date +%s)"
      if (( now_epoch >= deadline_epoch )); then
        CYCLE_DEADLINE_HIT=1
        break 2
      fi

      running_jobs="$(jobs -rp | wc -l | tr -d '[:space:]')"
      if (( running_jobs < PARALLEL_REPOS )); then
        break
      fi
      sleep 1
    done

    run_repo "$repo_json" &
    pid="$!"
    worker_pids+=("$pid")
    log_event INFO "SPAWN cycle=$cycle_id worker_pid=$pid parallel_limit=$PARALLEL_REPOS"
  done < <(jq -c '.repos[]' "$REPOS_FILE")

  for pid in "${worker_pids[@]}"; do
    wait "$pid" || true
  done
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

  CYCLE_DEADLINE_HIT=0
  run_cycle_repos "$cycle"
  if (( CYCLE_DEADLINE_HIT == 1 )); then
    log_event INFO "Runtime deadline hit during cycle."
    update_status "finished_deadline" "$CURRENT_REPO" "$CURRENT_PATH" "$CURRENT_PASS"
    break
  fi

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
