#!/usr/bin/env bash
set -euo pipefail

CODE_ROOT="${1:-$HOME/code}"
WINDOW_DAYS="${WINDOW_DAYS:-60}"
OUTPUT_FILE="${OUTPUT_FILE:-repos.yaml}"
IGNORED_REPOS_CSV="${IGNORED_REPOS_CSV:-}"
PINNED_REPOS_CSV="${PINNED_REPOS_CSV:-}"

if [[ ! -d "$CODE_ROOT" ]]; then
  echo "Code root not found: $CODE_ROOT" >&2
  exit 1
fi

if date -v-"${WINDOW_DAYS}"d +%Y-%m-%d >/dev/null 2>&1; then
  THRESHOLD_DATE="$(date -v-"${WINDOW_DAYS}"d +%Y-%m-%d)"
else
  THRESHOLD_DATE="$(date -d "${WINDOW_DAYS} days ago" +%Y-%m-%d)"
fi

infer_objective() {
  local repo_path="$1"
  local repo_name="$2"
  local readme
  local line

  readme="$(find "$repo_path" -maxdepth 1 -type f \( -iname 'readme.md' -o -iname 'readme' -o -iname 'readme.txt' \) | head -n 1 || true)"

  if [[ -n "$readme" && -f "$readme" ]]; then
    line="$(awk '
      NF {
        if ($0 ~ /^#/) {
          sub(/^#+[[:space:]]*/, "", $0)
          if (length($0) > 0) {
            print $0
            exit
          }
        }
        if ($0 !~ /^!\[/ && $0 !~ /^\[!\[/ && $0 !~ /^</) {
          print $0
          exit
        }
      }
    ' "$readme" | tr -d '\r' | head -n 1)"

    if [[ -n "${line:-}" ]]; then
      printf 'Keep %s production-ready. Current focus: %s. Find the highest-impact pending work, implement it, test it, and push to main.\n' "$repo_name" "$line"
      return
    fi
  fi

  printf 'Keep %s production-ready: identify pending work, implement the highest-impact task, verify with tests/build, and push stable updates to main.\n' "$repo_name"
}

is_ignored_repo() {
  local repo_name="$1"
  local token normalized

  if [[ -z "$IGNORED_REPOS_CSV" ]]; then
    return 1
  fi

  IFS=',' read -r -a ignore_tokens <<<"$IGNORED_REPOS_CSV"
  for token in "${ignore_tokens[@]}"; do
    normalized="$(printf '%s' "$token" | xargs)"
    if [[ -n "$normalized" && "$repo_name" == "$normalized" ]]; then
      return 0
    fi
  done

  return 1
}

is_pinned_repo() {
  local repo_name="$1"
  local token normalized

  if [[ -z "$PINNED_REPOS_CSV" ]]; then
    return 1
  fi

  IFS=',' read -r -a pinned_tokens <<<"$PINNED_REPOS_CSV"
  for token in "${pinned_tokens[@]}"; do
    normalized="$(printf '%s' "$token" | xargs)"
    if [[ -n "$normalized" && "$repo_name" == "$normalized" ]]; then
      return 0
    fi
  done
  return 1
}

repos_json='[]'

while IFS= read -r git_dir; do
  repo_path="${git_dir%/.git}"

  if [[ "$repo_path" == "$(pwd)" ]]; then
    continue
  fi

  repo_name="$(basename "$repo_path")"
  if is_ignored_repo "$repo_name"; then
    continue
  fi

  pinned_repo=0
  if is_pinned_repo "$repo_name"; then
    pinned_repo=1
  fi

  last_commit_iso="$(git -C "$repo_path" log -1 --format='%cI' 2>/dev/null || true)"
  if [[ -z "$last_commit_iso" ]]; then
    if [[ "$pinned_repo" -ne 1 ]]; then
      continue
    fi
    last_commit_iso="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  fi

  if [[ "$pinned_repo" -ne 1 ]]; then
    last_commit_date="${last_commit_iso%%T*}"
    if [[ "$last_commit_date" < "$THRESHOLD_DATE" ]]; then
      continue
    fi
  fi

  objective="$(infer_objective "$repo_path" "$repo_name")"

  entry="$(jq -n \
    --arg name "$repo_name" \
    --arg path "$repo_path" \
    --arg branch "main" \
    --arg last_commit "$last_commit_iso" \
    --arg objective "$objective" \
    '{name: $name, path: $path, branch: $branch, last_commit: $last_commit, objective: $objective}')"

  repos_json="$(jq -c --argjson entry "$entry" '. + [$entry]' <<<"$repos_json")"
done < <(find "$CODE_ROOT" -maxdepth 3 -type d -name .git | sort)

repos_json="$(jq -c 'sort_by(.last_commit) | reverse' <<<"$repos_json")"

jq -n \
  --arg generated_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg code_root "$CODE_ROOT" \
  --argjson activity_window_days "$WINDOW_DAYS" \
  --arg threshold_date "$THRESHOLD_DATE" \
  --argjson repos "$repos_json" \
  '{
    generated_at: $generated_at,
    code_root: $code_root,
    activity_window_days: $activity_window_days,
    threshold_date: $threshold_date,
    repos: $repos
  }' > "$OUTPUT_FILE"

count="$(jq '.repos | length' "$OUTPUT_FILE")"
echo "Wrote $OUTPUT_FILE with $count active repos (last ${WINDOW_DAYS} days; since $THRESHOLD_DATE)."
