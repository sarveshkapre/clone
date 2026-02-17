import path from "node:path";
import { appendRunEvent, ensureRun, migrate, openDb, setRunState, upsertKvState } from "@clone/db";
import { TypedEventBus } from "./event-bus.js";
import { RunEngine } from "./engine.js";
import { BoundedScheduler } from "./scheduler.js";

const bus = new TypedEventBus();
const engine = new RunEngine(bus);
const scheduler = new BoundedScheduler(Math.max(1, Number(process.env.CLONE_V2_WORKER_CONCURRENCY || 2)));
const dbPath = process.env.CLONE_STATE_DB || path.resolve(process.cwd(), "logs/clone_state_v2.db");
const runId = process.env.CLONE_WORKER_RUN_ID || `worker-${Date.now()}`;
const db = openDb(dbPath);
migrate(db);
ensureRun(db, runId, "running");

bus.subscribe("*", (event) => {
  const line = `[worker-event] ${event.ts} ${event.topic}/${event.type} cursor=${event.cursor}`;
  process.stdout.write(`${line}\n`);
  scheduler.enqueue(async () => {
    appendRunEvent(db, runId, event);
    upsertKvState(db, "worker_status", {
      run_id: runId,
      pid: process.pid,
      last_event_at: event.ts,
      last_event_type: `${event.topic}/${event.type}`,
    });
  });
});

engine.emit("system", "worker_boot", {
  pid: process.pid,
  runtime: "clone-v2-scaffold",
  run_id: runId,
  db_path: dbPath,
});

const heartbeat = setInterval(() => {
  engine.emit("system", "heartbeat", { pid: process.pid });
}, 15000);

function shutdown(signal: string): void {
  clearInterval(heartbeat);
  engine.emit("system", "worker_shutdown", { pid: process.pid, signal });
  setRunState(db, runId, "stopped");
  db.close();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
