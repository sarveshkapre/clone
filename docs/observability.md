# Observability

These commands are intentionally generic. Set `CLONE_ROOT` and `WORK_ROOT` once, then reuse.

```bash
CLONE_ROOT="${CLONE_ROOT:-$HOME/code/Clone}"
WORK_ROOT="${WORK_ROOT:-$HOME/code}"
REPOS_FILE="${REPOS_FILE:-$CLONE_ROOT/repos.yaml}"
```

## Tail Logs

```bash
# Latest launcher log (nohup/caffeinate wrapper)
tail -n 200 -f "$(ls -t "$CLONE_ROOT"/logs/launcher-*.log | head -1)"

# Latest Clone run log (main loop output)
tail -n 200 -f "$(ls -t "$CLONE_ROOT"/logs/run-*.log | head -1)"

# Latest events log (structured breadcrumbs)
tail -n 200 -f "$(ls -t "$CLONE_ROOT"/logs/run-*-events.log | head -1)"
```

## Show Running Processes (Short Paths)

```bash
pgrep -fl run_clone_loop.sh | sed "s|$WORK_ROOT/||g"
pids="$(pgrep -f run_clone_loop.sh | paste -sd, -)"
if [[ -n "$pids" ]]; then
  ps -o pid=,etime=,command= -p "$pids" | sed "s|$WORK_ROOT/||g"
else
  echo "No run_clone_loop.sh process found"
fi
```

## CODEX REACTOR TELEMETRY (Nerdy Runtime Banner)

Prints a big banner like `CODEX RUNTIME: 4 HRS 18 MINS` based on the oldest running `run_clone_loop.sh` process.

```bash
WORK_ROOT="${WORK_ROOT:-$HOME/code}"
pids="$(pgrep -f run_clone_loop.sh | paste -sd, -)"

if [[ -z "$pids" ]]; then
  printf "\033[1;31m[C O D E X  R U N T I M E] REACTOR OFFLINE\033[0m\n"
else
  ps -o pid=,etime=,command= -p "$pids" | sed "s|$WORK_ROOT/||g" | awk '
  function etime_to_sec(e, n,a,d,h,m,s){
    n=split(e,a,/[-:]/)
    if (index(e,"-"))      { d=a[1]; h=a[2]; m=a[3]; s=a[4] }
    else if (n==3)         { d=0;    h=a[1]; m=a[2]; s=a[3] }
    else                   { d=0;    h=0;    m=a[1]; s=a[2] }
    return d*86400 + h*3600 + m*60 + s
  }
  BEGIN{ green="\033[1;32m"; reset="\033[0m"; bold="\033[1m" }
  {
    pid=$1; et=$2
    sub($1 FS $2 FS, "", $0); cmd=$0
    sec=etime_to_sec(et)
    mins=int(sec/60); hh=int(sec/3600); mm=int((sec%3600)/60)
    rows[++n]=sprintf("%010d\t%-6s | %7d | %02d:%02d   | %s", sec, pid, mins, hh, mm, cmd)
    if (sec>max) max=sec
  }
  END{
    H=int(max/3600); M=int((max%3600)/60)
    print green bold "████ CODEX RUNTIME: " H " HRS " M " MINS ████" reset
    print green bold "=== CODEX REACTOR TELEMETRY ===" reset
    printf "%-6s | %-7s | %-7s | %s\n", "PID", "mins", "hh:mm", "command"
    print  "------+---------+---------+-------------------------------"
    for(i=1;i<=n;i++) print rows[i] | "sort -r | cut -f2-"
    close("sort -r | cut -f2-")
  }'
fi
```

## Commits In The Last X Hours (Simple)

```bash
HOURS="${HOURS:-8}"

jq -r '.repos[].path' "$REPOS_FILE" | while IFS= read -r repo; do
  c=$(git -C "$repo" rev-list --count --since="${HOURS} hours ago" HEAD 2>/dev/null || echo 0)
  [ "$c" -gt 0 ] && printf "%s\t%s\n" "$c" "$repo"
done | sort -nr -k1,1
```

## Commits In The Last X Hours (4-Column Compact Table)

```bash
HOURS="${HOURS:-8}"
tmp="$(mktemp)"

jq -r '.repos[].path' "$REPOS_FILE" | while IFS= read -r repo; do
  c=$(git -C "$repo" rev-list --count --since="${HOURS} hours ago" HEAD 2>/dev/null || echo 0)
  [ "$c" -gt 0 ] && printf "%s\t%s\n" "$c" "$(basename "$repo")"
done | sort -nr -k1,1 > "$tmp"

paste -d $'\t' \
  <(awk -F'\t' 'NR%2==1{print $1"\t"$2}' "$tmp") \
  <(awk -F'\t' 'NR%2==0{print $1"\t"$2}' "$tmp") \
| awk -F'\t' '
function repeat(ch,n,  s,i){s=""; for(i=0;i<n;i++) s=s ch; return s}
function center(s,w,  l,r,p){l=length(s); if(l>=w) return s; p=w-l; r=int(p/2); return repeat(" ",p-r) s repeat(" ",r)}
BEGIN{
  cW=7; rW=28
  printf "%s | %-*s || %s | %-*s\n", center("COMMITS",cW), rW, "REPO", center("COMMITS",cW), rW, "REPO"
  printf "%s-+-%s-++-%s-+-%s\n", repeat("-",cW), repeat("-",rW), repeat("-",cW), repeat("-",rW)
}
{
  c1=$1; r1=$2; c2=$3; r2=$4
  if(c2==""){c2="-"; r2=""}
  printf "%s | %-*s || %s | %-*s\n", center(c1,cW), rW, r1, center(c2,cW), rW, r2
}'

rm -f "$tmp"
```

## Live Append-Only Commit Watcher

Prints only *new* commits as they appear (polling + de-dup).

```bash
HOURS="${HOURS:-2}"
POLL_SECONDS="${POLL_SECONDS:-20}"

seen_file="$(mktemp)"
trap 'rm -f "$seen_file"' EXIT

while true; do
  jq -r '.repos[].path' "$REPOS_FILE" | while IFS= read -r repo; do
    repo_name="$(basename "$repo")"
    git -C "$repo" log --since="${HOURS} hours ago" --pretty=format:'%ct%x09'"$repo_name"'%x09%h%x09%s'
  done | sort -n -k1,1 | while IFS=$'\t' read -r ts repo_name hash subject; do
    key="${repo_name}:${hash}"
    if ! grep -qxF "$key" "$seen_file"; then
      echo "$key" >> "$seen_file"
      printf "%s | %s | %s | %s\n" "$(date -r "$ts" '+%Y-%m-%d %H:%M:%S')" "$repo_name" "$hash" "$subject"
    fi
  done
  sleep "$POLL_SECONDS"
done
```
