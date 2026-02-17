#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
cd "$ROOT_DIR"

violations=0

run_check() {
  local label="$1"
  local pattern="$2"
  shift 2
  local files=("$@")
  local output
  output="$(rg -n --color never --no-heading --glob '!scripts/check_open_source_readiness.sh' "$pattern" "${files[@]}" 2>/dev/null || true)"
  if [[ -n "$output" ]]; then
    echo "FAIL [$label]"
    echo "$output"
    echo
    violations=$((violations + 1))
  else
    echo "PASS [$label]"
  fi
}

run_check "no absolute macOS user paths" "/Users/[A-Za-z0-9._-]+" \
  apps scripts packages bin README.md docs UIUX.md

run_check "no absolute Linux user paths" "/home/[A-Za-z0-9._-]+" \
  apps scripts packages bin README.md docs UIUX.md

run_check "no legacy repos.yaml dependency in runtime code" "repos\\.yaml" \
  apps scripts packages bin

run_check "no hardcoded personal username in runtime code" "sarvesh" \
  apps scripts packages bin

if (( violations > 0 )); then
  echo "Open-source readiness checks failed: $violations violation group(s)."
  exit 1
fi

echo "Open-source readiness checks passed."
