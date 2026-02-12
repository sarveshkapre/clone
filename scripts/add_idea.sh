#!/usr/bin/env bash
set -euo pipefail

IDEAS_FILE="${IDEAS_FILE:-ideas.yaml}"
CODE_ROOT="${CODE_ROOT:-$HOME/code}"
DEFAULT_VISIBILITY="${DEFAULT_VISIBILITY:-private}"

title=""
summary=""
repo_name=""
objective=""
visibility=""
source="manual"
tags_csv=""

usage() {
  cat <<'EOF'
Usage:
  scripts/add_idea.sh --title "..." --summary "..."

Options:
  --title        Required. Idea title.
  --summary      Required. Short summary (1-2 lines).
  --repo-name    Optional. Repo name slug to create (default: derived from title).
  --objective    Optional. Repository objective (default: generic shipping objective).
  --visibility   Optional. private|public (default: private).
  --source       Optional. Idea source label (default: manual).
  --tags         Optional. Comma-separated tags (example: clone-idea,clone-idea-20260212T090000Z).

Environment:
  IDEAS_FILE          Path to ideas file (default: ideas.yaml)
  CODE_ROOT           Code root for repo_path (default: $HOME/code)
  DEFAULT_VISIBILITY  Default visibility (default: private)
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
    --title) title="${2:-}"; shift 2 ;;
    --summary) summary="${2:-}"; shift 2 ;;
    --repo-name) repo_name="${2:-}"; shift 2 ;;
    --objective) objective="${2:-}"; shift 2 ;;
    --visibility) visibility="${2:-}"; shift 2 ;;
    --source) source="${2:-}"; shift 2 ;;
    --tags) tags_csv="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; usage; exit 2 ;;
  esac
done

if [[ -z "$title" || -z "$summary" ]]; then
  echo "Missing required --title/--summary" >&2
  usage
  exit 2
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required" >&2
  exit 1
fi

if [[ -z "$repo_name" ]]; then
  repo_name="$(slugify "$title")"
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

repo_path="$CODE_ROOT/$repo_name"

if [[ -z "$objective" ]]; then
  objective="Build and evolve $repo_name from idea '$title': ship the highest-impact features safely, keep tests/docs current, and maintain production-grade quality."
fi

now="$(timestamp_utc)"
id="$(slugify "$title")-$(date -u +%Y%m%d%H%M%S)"
tags_json='[]'
if [[ -n "$tags_csv" ]]; then
  tags_json="$(jq -Rn --arg csv "$tags_csv" '
    ($csv
      | split(",")
      | map(gsub("^\\s+|\\s+$"; ""))
      | map(select(length > 0))
      | unique
    )
  ')"
fi

if [[ ! -f "$IDEAS_FILE" ]]; then
  cat >"$IDEAS_FILE" <<'EOF'
{
  "generated_at": "1970-01-01T00:00:00Z",
  "ideas": []
}
EOF
fi

tmp="$(mktemp)"
jq \
  --arg now "$now" \
  --arg id "$id" \
  --arg title "$title" \
  --arg summary "$summary" \
  --arg status "NEW" \
  --arg repo_name "$repo_name" \
  --arg repo_path "$repo_path" \
  --arg objective "$objective" \
  --arg visibility "$visibility" \
  --arg source "$source" \
  --argjson tags "$tags_json" \
  '
  .generated_at = $now
  | .ideas = ((.ideas // []) + [{
      id: $id,
      title: $title,
      summary: $summary,
      status: $status,
      repo_name: $repo_name,
      repo_path: $repo_path,
      objective: $objective,
      visibility: $visibility,
      source: $source,
      tags: $tags,
      notes: "",
      created_at: $now,
      updated_at: $now,
      last_error: ""
    }])
  ' "$IDEAS_FILE" >"$tmp"
mv "$tmp" "$IDEAS_FILE"

echo "Queued idea: $title -> $repo_name ($visibility) id=$id"
