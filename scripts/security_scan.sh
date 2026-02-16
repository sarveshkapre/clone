#!/usr/bin/env bash
set -euo pipefail

REPO_PATH="${REPO_PATH:-$(pwd)}"
REPORT_FILE="${REPORT_FILE:-security_audit_report.md}"
MAX_FINDINGS="${MAX_FINDINGS:-120}"

if ! [[ "$MAX_FINDINGS" =~ ^[1-9][0-9]*$ ]]; then
  echo "MAX_FINDINGS must be a positive integer, got: $MAX_FINDINGS" >&2
  exit 1
fi

if [[ ! -d "$REPO_PATH" ]]; then
  echo "REPO_PATH does not exist: $REPO_PATH" >&2
  exit 1
fi

if ! command -v rg >/dev/null 2>&1; then
  echo "ripgrep (rg) is required for security_scan.sh" >&2
  exit 1
fi

mkdir -p "$(dirname "$REPORT_FILE")"

critical_count=0
high_count=0
medium_count=0
total_count=0
truncated=0

findings_file="$(mktemp)"
trap 'unlink "$findings_file" 2>/dev/null || true' EXIT

add_finding() {
  local severity="$1"
  local category="$2"
  local file="$3"
  local line="$4"
  local message="$5"

  if (( total_count >= MAX_FINDINGS )); then
    truncated=1
    return 0
  fi

  total_count="$((total_count + 1))"
  case "$severity" in
    critical) critical_count="$((critical_count + 1))" ;;
    high) high_count="$((high_count + 1))" ;;
    *) medium_count="$((medium_count + 1))" ;;
  esac

  file="${file#"$REPO_PATH"/}"
  printf '| %s | %s | `%s:%s` | %s |\n' "$severity" "$category" "$file" "$line" "$message" >>"$findings_file"
}

scan_pattern() {
  local severity="$1"
  local category="$2"
  local regex="$3"
  local message="$4"
  local hit_file hit_line _

  while IFS=: read -r hit_file hit_line _; do
    [[ -z "$hit_file" ]] && continue
    [[ "$hit_file" == "$REPORT_FILE" ]] && continue
    add_finding "$severity" "$category" "$hit_file" "$hit_line" "$message"
    if (( truncated == 1 )); then
      return 0
    fi
  done < <(
    rg -n --hidden --no-ignore-vcs --with-filename \
      --glob '!.git' \
      --glob '!node_modules' \
      --glob '!dist' \
      --glob '!build' \
      --glob '!coverage' \
      --glob '!venv' \
      --glob '!.venv' \
      --glob '!vendor' \
      -e "$regex" "$REPO_PATH" 2>/dev/null || true
  )
}

# Secrets and credential exposure
scan_pattern critical "private_key" "-----BEGIN (RSA|EC|DSA|OPENSSH|PGP) PRIVATE KEY-----" "Private key material in repository."
scan_pattern critical "aws_access_key" "AKIA[0-9A-Z]{16}" "Possible AWS access key in code."
scan_pattern high "github_token" "gh[pousr]_[A-Za-z0-9]{20,}" "Possible GitHub token in source."
scan_pattern high "slack_token" "xox[baprs]-[A-Za-z0-9-]{10,}" "Possible Slack token in source."
scan_pattern high "hardcoded_secret" "(api[_-]?key|secret|token|password)[[:space:]]*[:=][[:space:]]*['\"][^'\"]{8,}['\"]" "Potential hardcoded secret value."

# Transport / TLS safety
scan_pattern high "tls_bypass" "verify[[:space:]]*=[[:space:]]*False" "TLS verification disabled."
scan_pattern high "tls_bypass" "NODE_TLS_REJECT_UNAUTHORIZED[[:space:]]*=[[:space:]]*['\"]?0" "Node TLS verification disabled."
scan_pattern medium "http_transport" "http://[A-Za-z0-9._:/?#@!$&'()*+,;=%-]+" "Plain HTTP URL detected; verify if safe."

# Risky execution patterns
scan_pattern medium "dynamic_eval_js" "\\beval[[:space:]]*\\(" "Use of eval detected."
scan_pattern medium "dynamic_eval_js" "new[[:space:]]+Function[[:space:]]*\\(" "Use of dynamic Function constructor detected."
scan_pattern medium "shell_exec_js" "child_process\\.(exec|execSync)\\(" "Shell command execution API detected; validate input handling."
scan_pattern medium "shell_exec_py" "subprocess\\.(run|Popen|call)\\([^\\n]*shell[[:space:]]*=[[:space:]]*True" "Python subprocess with shell=True detected."

{
  echo "# Security Audit Report"
  echo
  echo "- Repository: \`$REPO_PATH\`"
  echo "- Generated at: \`$(date -u +%Y-%m-%dT%H:%M:%SZ)\`"
  echo "- Max findings: \`$MAX_FINDINGS\`"
  echo "- Summary: critical=\`$critical_count\`, high=\`$high_count\`, medium=\`$medium_count\`, total=\`$total_count\`"
  if (( truncated == 1 )); then
    echo "- Note: findings were truncated after \`$MAX_FINDINGS\` entries."
  fi
  echo
  echo "| Severity | Category | Location | Finding |"
  echo "| --- | --- | --- | --- |"
  if [[ -s "$findings_file" ]]; then
    cat "$findings_file"
  else
    echo "| ok | baseline | n/a | No findings matched lightweight security heuristics. |"
  fi
} >"$REPORT_FILE"

echo "SECURITY_SUMMARY critical=$critical_count high=$high_count medium=$medium_count total=$total_count report=$REPORT_FILE"
