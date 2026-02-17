# Clone Runtime V2 (Dark Launch)

Runtime v2 adds a parallel scaffold for the Next.js web app + Node worker while preserving the existing Python control plane as default.

## Goals

- Keep `main` stable while rewrite work lands incrementally.
- Let developers opt in explicitly.
- Avoid auto-run behavior on boot/login.

## Layout

- `apps/control_plane`: bundled API backend reused during dark launch (`/api/v1/*` + diagnostics).
- `apps/web`: Next.js app-router Mission Control scaffold.
- `apps/worker`: typed event-bus worker scaffold.
- `packages/contracts`: shared zod contracts for API/event payloads.
- `packages/db`: SQLite migration + DAL starter (`logs/clone_state_v2.db`).
- `scripts/runtime_supervisor.mjs`: starts/stops v2 web + worker services.

## Default behavior

- `clone start` continues to launch the Python control plane by default.
- No agent execution auto-start is introduced.

## Opt in to v2 runtime

```bash
cd /path/to/Clone
npm install
CLONE_RUNTIME_STACK=v2 clone precheck
CLONE_RUNTIME_STACK=v2 clone start
CLONE_RUNTIME_STACK=v2 clone status
```

Open the v2 web UI:

```bash
open http://127.0.0.1:3000
```

Tail v2 logs:

```bash
CLONE_RUNTIME_STACK=v2 clone tail ui
```

Worker heartbeat events are persisted to SQLite (`runs`, `run_events`, `kv_state`) to bootstrap v2 state durability.

Stop v2 runtime:

```bash
CLONE_RUNTIME_STACK=v2 clone stop
```

## Current v2 UI coverage

- Mission Control dashboard with truthful run state
- Run launcher with repo selection + saved default preset
- Runtime controls (`stop`, `force-stop`, `restart`)
- Queue inbox (including `is_interrupt` high-priority tasks)
- Live SSE event stream and run history
- Launch diagnostics panel
