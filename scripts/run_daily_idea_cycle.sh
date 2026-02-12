#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLONE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

IDEAS_FILE="${IDEAS_FILE:-$CLONE_ROOT/ideas.yaml}"
REPOS_FILE="${REPOS_FILE:-$CLONE_ROOT/repos.yaml}"
CODE_ROOT="${CODE_ROOT:-$HOME/code}"
MODEL="${MODEL:-gpt-5.3-codex}"
CODEX_SANDBOX_FLAG="${CODEX_SANDBOX_FLAG:-}"
MIN_INTERVAL_SECONDS="${MIN_INTERVAL_SECONDS:-86400}"
LOG_DIR="${LOG_DIR:-$CLONE_ROOT/logs}"
STATE_FILE="${STATE_FILE:-$LOG_DIR/daily-idea-state.json}"
ENABLE_GITHUB_SYNC="${ENABLE_GITHUB_SYNC:-1}"
IDEA_REPO_VISIBILITY="${IDEA_REPO_VISIBILITY:-private}"

mkdir -p "$LOG_DIR"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required" >&2
  exit 1
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "codex CLI is required" >&2
  exit 1
fi

if ! [[ "$MIN_INTERVAL_SECONDS" =~ ^[1-9][0-9]*$ ]]; then
  echo "MIN_INTERVAL_SECONDS must be a positive integer, got: $MIN_INTERVAL_SECONDS" >&2
  exit 1
fi

if ! [[ "$ENABLE_GITHUB_SYNC" =~ ^[01]$ ]]; then
  echo "ENABLE_GITHUB_SYNC must be 0 or 1, got: $ENABLE_GITHUB_SYNC" >&2
  exit 1
fi

if [[ "$IDEA_REPO_VISIBILITY" != "private" && "$IDEA_REPO_VISIBILITY" != "public" ]]; then
  echo "IDEA_REPO_VISIBILITY must be private or public, got: $IDEA_REPO_VISIBILITY" >&2
  exit 1
fi

epoch_to_utc() {
  local epoch="$1"
  if date -u -r "$epoch" +%Y-%m-%dT%H:%M:%SZ >/dev/null 2>&1; then
    date -u -r "$epoch" +%Y-%m-%dT%H:%M:%SZ
  else
    date -u -d "@$epoch" +%Y-%m-%dT%H:%M:%SZ
  fi
}

slugify() {
  local input="$1"
  local slug
  slug="$(printf '%s' "$input" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')"
  if [[ -z "$slug" ]]; then
    slug="new-project"
  fi
  printf '%s\n' "$slug"
}

extract_first_json_object() {
  local src_file="$1"
  python3 - "$src_file" <<'PY'
import json
import sys

path = sys.argv[1]
text = open(path, "r", encoding="utf-8", errors="ignore").read()
decoder = json.JSONDecoder()
for i, ch in enumerate(text):
    if ch != "{":
        continue
    try:
        obj, end = decoder.raw_decode(text[i:])
    except Exception:
        continue
    if isinstance(obj, dict):
        print(json.dumps(obj, ensure_ascii=True))
        sys.exit(0)
print("")
sys.exit(1)
PY
}

if [[ ! -f "$IDEAS_FILE" ]]; then
  cat >"$IDEAS_FILE" <<'EOF_IDEAS'
{
  "generated_at": "1970-01-01T00:00:00Z",
  "ideas": []
}
EOF_IDEAS
fi

if [[ ! -f "$REPOS_FILE" ]]; then
  cat >"$REPOS_FILE" <<EOF_REPOS
{
  "generated_at": "1970-01-01T00:00:00Z",
  "code_root": "$CODE_ROOT",
  "activity_window_days": 60,
  "threshold_date": "1970-01-01",
  "repos": []
}
EOF_REPOS
fi

now_epoch="$(date +%s)"
last_success_epoch="0"
if [[ -f "$STATE_FILE" ]]; then
  last_success_epoch="$(jq -r '.last_success_epoch // 0' "$STATE_FILE" 2>/dev/null || echo 0)"
fi

if [[ ! "$last_success_epoch" =~ ^[0-9]+$ ]]; then
  last_success_epoch=0
fi

elapsed="$((now_epoch - last_success_epoch))"
if (( elapsed < MIN_INTERVAL_SECONDS )); then
  next_due_epoch="$((last_success_epoch + MIN_INTERVAL_SECONDS))"
  next_due_at="$(epoch_to_utc "$next_due_epoch")"
  echo "Daily idea cycle not due yet. Next due at: $next_due_at"
  exit 0
fi

run_tag="$(date -u +%Y%m%dT%H%M%SZ)"
scout_last_message="$LOG_DIR/daily-idea-scout-${run_tag}-last-message.txt"
scout_log="$LOG_DIR/daily-idea-scout-${run_tag}.log"

repos_context="$(jq -r '.repos[]? | "- \(.name): \(.objective // "")"' "$REPOS_FILE" | head -n 120)"
ideas_context="$(jq -r '.ideas[]? | "- \(.title) [status=\(.status)]"' "$IDEAS_FILE" | head -n 120)"
if [[ -z "$repos_context" ]]; then
  repos_context="- No repositories listed yet."
fi
if [[ -z "$ideas_context" ]]; then
  ideas_context="- No prior ideas listed yet."
fi

IFS= read -r -d '' scout_prompt <<PROMPT || true
You are selecting exactly one best new product idea for today.

Constraints:
- Return exactly one best idea for a new repository.
- It must be non-security-focused.
- It should fit this existing portfolio and avoid duplication.
- Prefer ideas with clear demand signals and strong buildability.
- Keep scope realistic for iterative delivery.

Existing repositories:
$repos_context

Existing ideas:
$ideas_context

Return JSON only (no markdown), matching this schema:
{
  "title": "string",
  "summary": "string (1-2 lines)",
  "repo_slug": "kebab-case-short-slug",
  "objective": "string",
  "why_best": "string",
  "market_signals": ["string", "string"]
}
PROMPT

codex_cmd=(codex exec --cd "$CLONE_ROOT" --output-last-message "$scout_last_message")
if [[ -n "$CODEX_SANDBOX_FLAG" ]]; then
  codex_cmd+=("$CODEX_SANDBOX_FLAG")
fi
if [[ -n "$MODEL" ]]; then
  codex_cmd+=(--model "$MODEL")
fi
codex_cmd+=("$scout_prompt")

if ! "${codex_cmd[@]}" >"$scout_log" 2>&1; then
  echo "Scout generation failed. See: $scout_log" >&2
  exit 1
fi

idea_json="$(extract_first_json_object "$scout_last_message")"
if [[ -z "$idea_json" ]]; then
  echo "Could not parse scout JSON output. See: $scout_last_message" >&2
  exit 1
fi

if ! jq -e '.title and .summary and .objective and (.repo_slug or .repo_name)' >/dev/null <<<"$idea_json"; then
  echo "Scout JSON missing required fields. Parsed payload: $idea_json" >&2
  exit 1
fi

title="$(jq -r '.title' <<<"$idea_json")"
summary="$(jq -r '.summary' <<<"$idea_json")"
objective="$(jq -r '.objective' <<<"$idea_json")"
repo_seed="$(jq -r '.repo_slug // .repo_name // .title' <<<"$idea_json")"
repo_seed_slug="$(slugify "$repo_seed")"

stamp_day="$(date -u +%Y%m%d)"
stamp_tag="$(date -u +%Y%m%dT%H%M%SZ)"
repo_name="clone-idea-${stamp_day}-${repo_seed_slug}"
if jq -e --arg rn "$repo_name" '.ideas[]? | select(.repo_name == $rn)' "$IDEAS_FILE" >/dev/null 2>&1; then
  repo_name="${repo_name}-$(date -u +%H%M%S)"
fi

tags_csv="clone-idea,clone-idea-${stamp_tag}"

"$SCRIPT_DIR/add_idea.sh" \
  --title "$title" \
  --summary "$summary" \
  --repo-name "$repo_name" \
  --objective "$objective" \
  --visibility "$IDEA_REPO_VISIBILITY" \
  --source "clone-scout" \
  --tags "$tags_csv" \
  >"$LOG_DIR/daily-idea-add-${run_tag}.log" 2>&1

IDEAS_FILE="$IDEAS_FILE" \
REPOS_FILE="$REPOS_FILE" \
CODE_ROOT="$CODE_ROOT" \
MODEL="$MODEL" \
CODEX_SANDBOX_FLAG="$CODEX_SANDBOX_FLAG" \
ENABLE_GITHUB_SYNC="$ENABLE_GITHUB_SYNC" \
"$SCRIPT_DIR/process_ideas.sh" >"$LOG_DIR/daily-idea-bootstrap-${run_tag}.log" 2>&1

now_epoch="$(date +%s)"
next_due_epoch="$((now_epoch + MIN_INTERVAL_SECONDS))"
now_utc="$(epoch_to_utc "$now_epoch")"
next_due_utc="$(epoch_to_utc "$next_due_epoch")"

jq -n \
  --argjson last_success_epoch "$now_epoch" \
  --arg last_success_at "$now_utc" \
  --argjson next_due_epoch "$next_due_epoch" \
  --arg next_due_at "$next_due_utc" \
  --arg title "$title" \
  --arg repo_name "$repo_name" \
  --arg tags "$tags_csv" \
  '{
    last_success_epoch: $last_success_epoch,
    last_success_at: $last_success_at,
    next_due_epoch: $next_due_epoch,
    next_due_at: $next_due_at,
    last_selected_idea: {
      title: $title,
      repo_name: $repo_name,
      tags: ($tags | split(","))
    }
  }' >"$STATE_FILE"

echo "Daily idea cycle complete."
echo "Selected: $title"
echo "Repo: $repo_name"
echo "Next due: $next_due_utc"
