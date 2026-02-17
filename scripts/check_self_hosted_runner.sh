#!/usr/bin/env bash
set -euo pipefail

fail=0

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd" >&2
    fail=1
  fi
}

echo "Runner OS: $(uname -s) $(uname -m)"

require_cmd git
require_cmd bash
require_cmd node
require_cmd npm
require_cmd python3
require_cmd jq

if command -v docker >/dev/null 2>&1; then
  echo "Docker detected: $(docker --version 2>/dev/null || echo 'installed')"
else
  echo "Docker not found. Current CI workflow does not require Docker." >&2
fi

if (( fail != 0 )); then
  echo "Self-hosted runner prerequisite check failed." >&2
  exit 1
fi

echo "Self-hosted runner prerequisite check passed."
