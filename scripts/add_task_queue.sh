#!/usr/bin/env bash
set -euo pipefail

TASK_QUEUE_FILE="${TASK_QUEUE_FILE:-logs/task_queue.json}"

repo="*"
repo_path=""
title=""
details=""
priority="3"
source="operator"
task_id=""

usage() {
  cat <<'EOF'
Usage:
  scripts/add_task_queue.sh --title "Task title" [options]

Options:
  --repo <name>         Repo name selector (default: "*" for all repos)
  --repo-path <path>    Optional absolute repo path selector
  --title <text>        Required task title
  --details <text>      Optional details/body
  --priority <1-5>      Optional priority, lower is higher priority (default: 3)
  --source <text>       Optional source label (default: operator)
  --id <text>           Optional explicit task id (auto-generated when omitted)
  -h, --help            Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)
      repo="${2:-}"
      shift 2
      ;;
    --repo-path)
      repo_path="${2:-}"
      shift 2
      ;;
    --title)
      title="${2:-}"
      shift 2
      ;;
    --details)
      details="${2:-}"
      shift 2
      ;;
    --priority)
      priority="${2:-}"
      shift 2
      ;;
    --source)
      source="${2:-}"
      shift 2
      ;;
    --id)
      task_id="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -z "$title" ]]; then
  echo "--title is required" >&2
  usage >&2
  exit 1
fi

if ! [[ "$priority" =~ ^[1-5]$ ]]; then
  echo "--priority must be an integer from 1 to 5, got: $priority" >&2
  exit 1
fi

mkdir -p "$(dirname "$TASK_QUEUE_FILE")"

if [[ ! -f "$TASK_QUEUE_FILE" ]]; then
  cat >"$TASK_QUEUE_FILE" <<EOF
{
  "generated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "tasks": []
}
EOF
fi

if ! jq -e '.tasks // [] | type == "array"' "$TASK_QUEUE_FILE" >/dev/null 2>&1; then
  echo "Invalid queue file format (expected object with tasks array): $TASK_QUEUE_FILE" >&2
  exit 1
fi

if [[ -z "$task_id" ]]; then
  slug="$(printf '%s' "$title" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | sed 's/^-//; s/-$//' | cut -c1-24)"
  if [[ -z "$slug" ]]; then
    slug="task"
  fi
  task_id="q-$(date -u +%Y%m%d-%H%M%S)-$slug"
fi

if jq -e --arg id "$task_id" '(.tasks // []) | any(.id == $id)' "$TASK_QUEUE_FILE" >/dev/null 2>&1; then
  task_id="${task_id}-$(date -u +%s)"
fi

created_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
tmp="$(mktemp)"
jq \
  --arg now "$created_at" \
  --arg id "$task_id" \
  --arg repo "$repo" \
  --arg repo_path "$repo_path" \
  --arg title "$title" \
  --arg details "$details" \
  --arg source "$source" \
  --argjson priority "$priority" \
  '
  .generated_at = $now
  | .tasks = ((.tasks // []) + [{
      id: $id,
      status: "QUEUED",
      repo: $repo,
      repo_path: $repo_path,
      title: $title,
      details: $details,
      priority: $priority,
      source: $source,
      created_at: $now
    }])
  ' "$TASK_QUEUE_FILE" >"$tmp"
mv "$tmp" "$TASK_QUEUE_FILE"

echo "Queued task $task_id for repo selector '$repo' in $TASK_QUEUE_FILE"
