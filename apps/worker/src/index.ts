import { TypedEventBus } from "./event-bus.js";
import { RunEngine } from "./engine.js";

const bus = new TypedEventBus();
const engine = new RunEngine(bus);

bus.subscribe("*", (event) => {
  const line = `[worker-event] ${event.ts} ${event.topic}/${event.type} cursor=${event.cursor}`;
  process.stdout.write(`${line}\n`);
});

engine.emit("system", "worker_boot", {
  pid: process.pid,
  runtime: "clone-v2-scaffold",
});

setInterval(() => {
  engine.emit("system", "heartbeat", { pid: process.pid });
}, 15000);
