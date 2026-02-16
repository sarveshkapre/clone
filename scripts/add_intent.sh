#!/usr/bin/env bash
set -euo pipefail

INTENTS_FILE="${INTENTS_FILE:-intents.yaml}"
CODE_ROOT="${CODE_ROOT:-$HOME/code}"
DEFAULT_VISIBILITY="${DEFAULT_VISIBILITY:-private}"

project=""
summary=""
repo_name=""
repo_path=""
objective=""
visibility=""
source="manual"

usage() {
  cat <<'EOF'
Usage:
  scripts/add_intent.sh --project "..." --summary "..."

Options:
  --project      Required. Project label used for intent analysis.
  --summary      Required. Short summary of intended product/work.
  --repo-name    Optional. Target repo slug (default: derived from project).
  --repo-path    Optional. Absolute repo path override.
  --objective    Optional. Objective for repo bootstrap and execution.
  --visibility   Optional. private|public (default: private).
  --source       Optional. Source label (default: manual).

Environment:
  INTENTS_FILE         Path to intents queue file (default: intents.yaml)
  CODE_ROOT            Local code root (default: $HOME/code)
  DEFAULT_VISIBILITY   Default visibility when omitted (default: private)
EOF
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

timestamp_utc() {
  date -u +%Y-%m-%dT%H:%M:%SZ
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project) project="${2:-}"; shift 2 ;;
    --summary) summary="${2:-}"; shift 2 ;;
    --repo-name) repo_name="${2:-}"; shift 2 ;;
    --repo-path) repo_path="${2:-}"; shift 2 ;;
    --objective) objective="${2:-}"; shift 2 ;;
    --visibility) visibility="${2:-}"; shift 2 ;;
    --source) source="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; usage; exit 2 ;;
  esac
done

if [[ -z "$project" || -z "$summary" ]]; then
  echo "Missing required --project/--summary" >&2
  usage
  exit 2
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required" >&2
  exit 1
fi

if [[ -z "$repo_name" ]]; then
  repo_name="$(slugify "$project")"
fi

if [[ -z "$repo_path" ]]; then
  repo_path="$CODE_ROOT/$repo_name"
fi

if [[ -z "$visibility" ]]; then
  visibility="$DEFAULT_VISIBILITY"
fi
if [[ "$visibility" != "private" && "$visibility" != "public" ]]; then
  echo "--visibility must be private or public, got: $visibility" >&2
  exit 2
fi

if [[ -z "$source" ]]; then
  source="manual"
fi

if [[ -z "$objective" ]]; then
  objective="Build and evolve $repo_name for project '$project': ship high-impact features safely, keep tests/docs current, and maintain production-grade quality."
fi

now="$(timestamp_utc)"
id="$(slugify "$project")-$(date -u +%Y%m%d%H%M%S)"

if [[ ! -f "$INTENTS_FILE" ]]; then
  cat >"$INTENTS_FILE" <<'EOF'
{
  "generated_at": "1970-01-01T00:00:00Z",
  "intents": []
}
EOF
fi

tmp="$(mktemp)"
jq \
  --arg now "$now" \
  --arg id "$id" \
  --arg project "$project" \
  --arg summary "$summary" \
  --arg status "NEW" \
  --arg repo_name "$repo_name" \
  --arg repo_path "$repo_path" \
  --arg objective "$objective" \
  --arg visibility "$visibility" \
  --arg source "$source" \
  '
  .generated_at = $now
  | .intents = ((.intents // []) + [{
      id: $id,
      project: $project,
      summary: $summary,
      status: $status,
      repo_name: $repo_name,
      repo_path: $repo_path,
      objective: $objective,
      visibility: $visibility,
      source: $source,
      notes: "",
      created_at: $now,
      updated_at: $now,
      last_error: ""
    }])
  ' "$INTENTS_FILE" >"$tmp"
mv "$tmp" "$INTENTS_FILE"

echo "Queued intent: $project -> $repo_name ($visibility) id=$id"
