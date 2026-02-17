#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLONE_ROOT="${CLONE_ROOT:-$(cd "$SCRIPT_DIR/.." && pwd)}"

HOST="${CLONE_CONTROL_PLANE_HOST:-127.0.0.1}"
PORT="${CLONE_CONTROL_PLANE_PORT:-8787}"
PYTHON_BIN="${PYTHON_BIN:-python3}"
STOP_TIMEOUT_SECONDS="${STOP_TIMEOUT_SECONDS:-10}"
TAIL_LINES="${TAIL_LINES:-200}"
CLEANUP_STALE_DAYS="${CLEANUP_STALE_DAYS:-2}"
RUNTIME_STACK="${CLONE_RUNTIME_STACK:-v1}"
RUNTIME_SUPERVISOR_SCRIPT="$CLONE_ROOT/scripts/runtime_supervisor.mjs"
V2_API_BASE_URL="${CLONE_V2_API_BASE_URL:-}"
V2_API_HOST="${CLONE_V2_API_HOST:-127.0.0.1}"
V2_API_PORT="${CLONE_V2_API_PORT:-${CLONE_CONTROL_PLANE_PORT:-8787}}"
V2_WEB_PORT="${CLONE_V2_WEB_PORT:-3000}"

LOGS_DIR_INPUT="${CLONE_LOGS_DIR:-logs}"
if [[ "$LOGS_DIR_INPUT" = /* ]]; then
  LOGS_DIR="$LOGS_DIR_INPUT"
else
  LOGS_DIR="$CLONE_ROOT/$LOGS_DIR_INPUT"
fi

UI_LOG="${CLONE_CONTROL_PLANE_LOG:-$LOGS_DIR/control-plane-ui.log}"
PID_FILE="${CLONE_CONTROL_PLANE_PID_FILE:-$LOGS_DIR/control-plane-ui-${PORT}.pid}"
SERVER_SCRIPT="$CLONE_ROOT/apps/control_plane/server.py"

REPOS_FILE_INPUT="${REPOS_FILE:-}"
if [[ -n "$REPOS_FILE_INPUT" ]]; then
  if [[ "$REPOS_FILE_INPUT" = /* ]]; then
    RESOLVED_REPOS_FILE="$REPOS_FILE_INPUT"
  else
    RESOLVED_REPOS_FILE="$CLONE_ROOT/$REPOS_FILE_INPUT"
  fi
else
  RESOLVED_REPOS_FILE="$CLONE_ROOT/repos.runtime.yaml"
fi

usage() {
  cat <<EOF
Usage: $(basename "$0") <command> [args]

Commands:
  precheck                Verify required dependencies and local paths.
  start                   Start the control-plane web server in background.
  stop                    Stop server and cleanup orphan processes for this port.
  restart                 Restart server.
  status                  Show process and health status.
  cleanup                 Remove stale local runtime artifacts.
  tail [ui|run|events|launcher]
                          Tail logs (default: ui).
  help                    Show this help.

Environment overrides:
  CLONE_ROOT                  (default: repo root resolved from this script)
  CLONE_CONTROL_PLANE_HOST    (default: 127.0.0.1)
  CLONE_CONTROL_PLANE_PORT    (default: 8787)
  CLONE_LOGS_DIR              (default: logs)
  CLONE_RUNTIME_STACK         (default: v1; set to v2 for dark-launch Next.js+worker runtime)
  CLONE_V2_API_BASE_URL       (optional; use external API backend instead of bundled Python API)
  CLONE_V2_API_HOST           (default: 127.0.0.1 for bundled v2 API)
  CLONE_V2_API_PORT           (default: CLONE_CONTROL_PLANE_PORT or 8787)
  CLONE_V2_WEB_PORT           (default: 3000)
  CLONE_CONTROL_PLANE_LOG     (default: logs/control-plane-ui.log)
  CLONE_CONTROL_PLANE_PID_FILE(default: logs/control-plane-ui-<port>.pid)
  REPOS_FILE                  (optional; default: repos.runtime.yaml)
  PYTHON_BIN                  (default: python3)
  STOP_TIMEOUT_SECONDS        (default: 10)
  TAIL_LINES                  (default: 200)
  CLEANUP_STALE_DAYS          (default: 2; used by cleanup command)
EOF
}

have_cmd() {
  command -v "$1" >/dev/null 2>&1
}

require_cmd() {
  local name="$1"
  if ! have_cmd "$name"; then
    echo "Missing required command: $name" >&2
    return 1
  fi
}

pid_is_alive() {
  local pid="$1"
  kill -0 "$pid" >/dev/null 2>&1
}

pid_command() {
  local pid="$1"
  ps -p "$pid" -o command= 2>/dev/null || true
}

pid_is_control_plane() {
  local pid="$1"
  local cmd
  cmd="$(pid_command "$pid")"
  [[ "$cmd" == *"apps/control_plane/server.py"* ]]
}

pidfile_pid() {
  if [[ -f "$PID_FILE" ]]; then
    head -n 1 "$PID_FILE" | tr -d '[:space:]'
  fi
}

find_control_plane_pids_on_port() {
  local pid cmd
  if have_cmd lsof; then
    while IFS= read -r pid; do
      [[ -n "$pid" ]] || continue
      if pid_is_control_plane "$pid"; then
        echo "$pid"
      fi
    done < <(lsof -nP -t -iTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | awk '!seen[$0]++')
    return 0
  fi

  if have_cmd pgrep; then
    while IFS= read -r pid; do
      [[ -n "$pid" ]] || continue
      cmd="$(pid_command "$pid")"
      if [[ "$cmd" == *"apps/control_plane/server.py"* && "$cmd" == *"--port $PORT"* ]]; then
        echo "$pid"
      fi
    done < <(pgrep -f "apps/control_plane/server.py" 2>/dev/null || true)
    return 0
  fi

  while IFS= read -r pid; do
    [[ -n "$pid" ]] || continue
    cmd="$(pid_command "$pid")"
    if [[ "$cmd" == *"apps/control_plane/server.py"* && "$cmd" == *"--port $PORT"* ]]; then
      echo "$pid"
    fi
  done < <(ps -eo pid=,command= | awk '/apps\/control_plane\/server\.py/ {print $1}')
}

active_pids() {
  local pid
  pid="$(pidfile_pid || true)"
  if [[ -n "$pid" ]] && [[ "$pid" =~ ^[0-9]+$ ]] && pid_is_alive "$pid" && pid_is_control_plane "$pid"; then
    echo "$pid"
  fi
  find_control_plane_pids_on_port
}

write_pidfile() {
  local pid="$1"
  mkdir -p "$LOGS_DIR"
  printf "%s\n" "$pid" > "$PID_FILE"
}

remove_pidfile() {
  rm -f "$PID_FILE"
}

port_in_use_by_non_control_plane() {
  local pid
  if ! have_cmd lsof; then
    return 1
  fi
  while IFS= read -r pid; do
    [[ -n "$pid" ]] || continue
    if ! pid_is_control_plane "$pid"; then
      return 0
    fi
  done < <(lsof -nP -t -iTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | awk '!seen[$0]++')
  return 1
}

runtime_v2_enabled() {
  [[ "$RUNTIME_STACK" == "v2" ]]
}

runtime_v2_precheck() {
  local ok=0
  require_cmd node || ok=1
  require_cmd npm || ok=1
  if [[ -z "$V2_API_BASE_URL" ]]; then
    require_cmd "$PYTHON_BIN" || ok=1
    if [[ ! -f "$SERVER_SCRIPT" ]]; then
      echo "Missing server script for v2 bundled API: $SERVER_SCRIPT" >&2
      ok=1
    fi
  fi
  if [[ ! -f "$RUNTIME_SUPERVISOR_SCRIPT" ]]; then
    echo "Missing runtime supervisor script: $RUNTIME_SUPERVISOR_SCRIPT" >&2
    ok=1
  fi
  if [[ ! -d "$CLONE_ROOT/node_modules" ]]; then
    echo "Missing node_modules in $CLONE_ROOT. Run: npm install" >&2
    ok=1
  fi
  mkdir -p "$LOGS_DIR" || {
    echo "Unable to create logs directory: $LOGS_DIR" >&2
    ok=1
  }
  if (( ok != 0 )); then
    return 1
  fi
  echo "Precheck OK (runtime_stack=v2)"
  echo "clone_root=$CLONE_ROOT"
  echo "runtime_supervisor=$RUNTIME_SUPERVISOR_SCRIPT"
  if [[ -n "$V2_API_BASE_URL" ]]; then
    echo "api_base_url=$V2_API_BASE_URL (external)"
  else
    echo "api_base_url=http://$V2_API_HOST:$V2_API_PORT (bundled)"
  fi
  echo "web_url=http://127.0.0.1:$V2_WEB_PORT"
  echo "logs_dir=$LOGS_DIR"
}

runtime_v2_exec() {
  local action="$1"
  (
    cd "$CLONE_ROOT"
    CLONE_ROOT="$CLONE_ROOT" CLONE_LOGS_DIR="$LOGS_DIR" node "$RUNTIME_SUPERVISOR_SCRIPT" "$action"
  )
}

precheck() {
  local ok=0
  require_cmd "$PYTHON_BIN" || ok=1
  require_cmd git || ok=1

  if [[ ! -f "$SERVER_SCRIPT" ]]; then
    echo "Missing server script: $SERVER_SCRIPT" >&2
    ok=1
  fi

  if [[ ! -d "$CLONE_ROOT" ]]; then
    echo "Missing clone root directory: $CLONE_ROOT" >&2
    ok=1
  fi

  mkdir -p "$LOGS_DIR" || {
    echo "Unable to create logs directory: $LOGS_DIR" >&2
    ok=1
  }

  if (( ok != 0 )); then
    return 1
  fi

  echo "Precheck OK"
  echo "clone_root=$CLONE_ROOT"
  echo "server_script=$SERVER_SCRIPT"
  if [[ -f "$RESOLVED_REPOS_FILE" ]]; then
    echo "repos_file=$RESOLVED_REPOS_FILE"
  else
    echo "repos_file=$RESOLVED_REPOS_FILE (optional; using local-scan fallback)"
  fi
  echo "logs_dir=$LOGS_DIR"
  echo "bind=http://$HOST:$PORT"
}

status() {
  local pids health_code
  pids="$(active_pids | awk '!seen[$0]++')"

  echo "Control Plane status"
  echo "url=http://$HOST:$PORT"
  echo "log=$UI_LOG"
  echo "pid_file=$PID_FILE"

  if [[ -z "$pids" ]]; then
    echo "state=stopped"
  else
    echo "state=running"
    while IFS= read -r pid; do
      [[ -n "$pid" ]] || continue
      ps -p "$pid" -o pid=,etime=,command=
    done <<< "$pids"
  fi

  if have_cmd curl; then
    health_code="$(curl -s -o /dev/null -m 2 -w "%{http_code}" "http://$HOST:$PORT/api/health" || true)"
    if [[ "$health_code" == "200" ]]; then
      echo "health=ok"
    elif [[ "$health_code" == "000" || -z "$health_code" ]]; then
      echo "health=unreachable"
    elif [[ -n "$health_code" ]]; then
      echo "health=http_$health_code"
    fi
  else
    echo "health=unknown (curl not found)"
  fi
}

start() {
  precheck

  if port_in_use_by_non_control_plane; then
    echo "Port $PORT is already in use by a non-control-plane process." >&2
    return 1
  fi

  local running pid cmd health_code tries
  running="$(active_pids | awk '!seen[$0]++')"
  if [[ -n "$running" ]]; then
    pid="$(echo "$running" | head -n 1)"
    write_pidfile "$pid"
    echo "Already running on $HOST:$PORT (pid=$pid)"
    status
    return 0
  fi

  mkdir -p "$LOGS_DIR"
  touch "$UI_LOG"

  cmd=("$PYTHON_BIN" "$SERVER_SCRIPT" "--host" "$HOST" "--port" "$PORT" "--clone-root" "$CLONE_ROOT" "--logs-dir" "$LOGS_DIR" "--repos-file" "$RESOLVED_REPOS_FILE")
  (
    cd "$CLONE_ROOT"
    nohup "${cmd[@]}" >>"$UI_LOG" 2>&1 &
    echo $! > "$PID_FILE"
  )

  pid="$(pidfile_pid || true)"
  if [[ -z "$pid" ]] || ! pid_is_alive "$pid"; then
    echo "Failed to start control plane. Check log: $UI_LOG" >&2
    tail -n 80 "$UI_LOG" || true
    return 1
  fi

  if have_cmd curl; then
    tries=0
    while (( tries < 20 )); do
      health_code="$(curl -s -o /dev/null -m 2 -w "%{http_code}" "http://$HOST:$PORT/api/health" || true)"
      if [[ "$health_code" == "200" ]]; then
        break
      fi
      tries=$((tries + 1))
      sleep 0.25
    done
  fi

  echo "Started control plane (pid=$pid)"
  echo "Open: http://$HOST:$PORT"
}

stop() {
  local pids remaining elapsed
  pids="$(active_pids | awk '!seen[$0]++')"

  if [[ -z "$pids" ]]; then
    remove_pidfile
    echo "Control plane is already stopped."
    return 0
  fi

  echo "Stopping control plane pids: $(echo "$pids" | paste -sd',' -)"
  while IFS= read -r pid; do
    [[ -n "$pid" ]] || continue
    kill -TERM "$pid" 2>/dev/null || true
  done <<< "$pids"

  elapsed=0
  while (( elapsed < STOP_TIMEOUT_SECONDS )); do
    remaining=""
    while IFS= read -r pid; do
      [[ -n "$pid" ]] || continue
      if pid_is_alive "$pid"; then
        remaining+="${pid}"$'\n'
      fi
    done <<< "$pids"
    if [[ -z "$remaining" ]]; then
      break
    fi
    sleep 1
    elapsed=$((elapsed + 1))
  done

  if [[ -n "${remaining:-}" ]]; then
    echo "Force-killing lingering pids: $(echo "$remaining" | paste -sd',' -)"
    while IFS= read -r pid; do
      [[ -n "$pid" ]] || continue
      kill -KILL "$pid" 2>/dev/null || true
    done <<< "$remaining"
  fi

  # Cleanup pass for orphan listeners on this port.
  while IFS= read -r pid; do
    [[ -n "$pid" ]] || continue
    kill -KILL "$pid" 2>/dev/null || true
  done < <(find_control_plane_pids_on_port | awk '!seen[$0]++')

  remove_pidfile
  echo "Stopped."
}

restart() {
  stop
  start
}

cleanup_artifacts() {
  mkdir -p "$LOGS_DIR"
  local removed=0 pid_file pid path pattern
  for pid_file in "$LOGS_DIR"/control-plane-ui-*.pid "$LOGS_DIR"/clone-runtime-v2-supervisor.pid; do
    [[ -f "$pid_file" ]] || continue
    pid="$(head -n 1 "$pid_file" 2>/dev/null | tr -d '[:space:]')"
    if ! [[ "$pid" =~ ^[0-9]+$ ]] || ! pid_is_alive "$pid"; then
      rm -f "$pid_file"
      echo "Removed stale pid file: $pid_file"
      removed=$((removed + 1))
    fi
  done

  while IFS= read -r path; do
    [[ -n "$path" ]] || continue
    rm -f "$path"
    echo "Removed stale run snapshot: $path"
    removed=$((removed + 1))
  done < <(find "$LOGS_DIR" -maxdepth 1 -type f -name "run-*-repos.json" -mtime +"$CLEANUP_STALE_DAYS" 2>/dev/null || true)

  while IFS= read -r path; do
    [[ -n "$path" ]] || continue
    rm -f "$path"
    echo "Removed stale temp file: $path"
    removed=$((removed + 1))
  done < <(find "$LOGS_DIR" -maxdepth 1 -type f -name "*.tmp" -mtime +"$CLEANUP_STALE_DAYS" 2>/dev/null || true)

  for pattern in "run-*-workers" "run-*-repo-locks" "run-*-repo-progress"; do
    while IFS= read -r path; do
      [[ -n "$path" ]] || continue
      rm -rf "$path"
      echo "Removed stale empty dir: $path"
      removed=$((removed + 1))
    done < <(find "$LOGS_DIR" -maxdepth 1 -type d -name "$pattern" -empty -mtime +"$CLEANUP_STALE_DAYS" 2>/dev/null || true)
  done

  echo "Cleanup complete: removed=$removed logs_dir=$LOGS_DIR stale_days=$CLEANUP_STALE_DAYS"
}

tail_logs() {
  local target="${1:-ui}" file=""
  if runtime_v2_enabled; then
    case "$target" in
      ui|runtime)
        file="$LOGS_DIR/clone-runtime-v2.log"
        ;;
      *)
        echo "Unknown tail target for runtime v2: $target" >&2
        echo "Expected: ui | runtime" >&2
        return 1
        ;;
    esac
  else
  case "$target" in
    ui)
      file="$UI_LOG"
      ;;
    run)
      file="$(ls -1t "$LOGS_DIR"/run-*.log 2>/dev/null | head -n 1 || true)"
      ;;
    events)
      file="$(ls -1t "$LOGS_DIR"/run-*-events.log 2>/dev/null | head -n 1 || true)"
      ;;
    launcher)
      file="$(ls -1t "$LOGS_DIR"/launcher-*.log 2>/dev/null | head -n 1 || true)"
      ;;
    *)
      echo "Unknown tail target: $target" >&2
      echo "Expected: ui | run | events | launcher" >&2
      return 1
      ;;
  esac
  fi

  if [[ -z "$file" ]]; then
    echo "No log file found for target: $target" >&2
    return 1
  fi

  echo "Tailing: $file"
  tail -n "$TAIL_LINES" -f "$file"
}

cmd="${1:-help}"
if runtime_v2_enabled; then
  case "$cmd" in
    precheck)
      runtime_v2_precheck
      ;;
    start|stop|status|restart)
      runtime_v2_precheck
      runtime_v2_exec "$cmd"
      ;;
    cleanup)
      cleanup_artifacts
      ;;
    tail)
      tail_logs "${2:-ui}"
      ;;
    help|-h|--help)
      usage
      ;;
    *)
      echo "Unknown command: $cmd" >&2
      usage
      exit 1
      ;;
  esac
  exit 0
fi

case "$cmd" in
  precheck)
    precheck
    ;;
  start)
    start
    ;;
  stop)
    stop
    ;;
  restart)
    restart
    ;;
  status)
    status
    ;;
  cleanup)
    cleanup_artifacts
    ;;
  tail)
    tail_logs "${2:-ui}"
    ;;
  help|-h|--help)
    usage
    ;;
  *)
    echo "Unknown command: $cmd" >&2
    usage
    exit 1
    ;;
esac
