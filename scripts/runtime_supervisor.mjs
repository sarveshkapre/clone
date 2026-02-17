#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cloneRoot = path.resolve(process.env.CLONE_ROOT || path.join(__dirname, ".."));
const logsDirInput = process.env.CLONE_LOGS_DIR || "logs";
const logsDir = path.isAbsolute(logsDirInput) ? logsDirInput : path.resolve(cloneRoot, logsDirInput);
const supervisorPidFile = path.join(logsDir, "clone-runtime-v2-supervisor.pid");
const stateFile = path.join(logsDir, "clone-runtime-v2-state.json");
const runtimeLogFile = path.join(logsDir, "clone-runtime-v2.log");
const controlPlaneScript = path.resolve(cloneRoot, "apps/control_plane/server.py");
const pythonBin = process.env.PYTHON_BIN || "python3";
const apiHost = process.env.CLONE_V2_API_HOST || "127.0.0.1";
const apiPort = Number(process.env.CLONE_V2_API_PORT || process.env.CLONE_CONTROL_PLANE_PORT || 8787);
const externalApiBaseUrl = process.env.CLONE_V2_API_BASE_URL?.trim() || "";
const apiBaseUrl = externalApiBaseUrl || `http://${apiHost}:${apiPort}`;
const webPort = Number(process.env.CLONE_V2_WEB_PORT || 3000);
const stateDbPath = process.env.CLONE_STATE_DB || path.resolve(cloneRoot, "logs/clone_state_v2.db");
const command = String(process.argv[2] || "status").trim().toLowerCase();

function ensureLogsDir() {
  fs.mkdirSync(logsDir, { recursive: true });
}

function pidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function writeJson(filePath, payload) {
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function readPid() {
  try {
    const raw = fs.readFileSync(supervisorPidFile, "utf8").trim();
    const pid = Number(raw);
    return Number.isInteger(pid) ? pid : 0;
  } catch {
    return 0;
  }
}

function writePid(pid) {
  fs.writeFileSync(supervisorPidFile, `${pid}\n`, "utf8");
}

function removePid() {
  try {
    fs.unlinkSync(supervisorPidFile);
  } catch {}
}

function childSpecs() {
  const specs = [
    ...(externalApiBaseUrl
      ? []
      : [
          {
            id: "api",
            cmd: pythonBin,
            args: [
              controlPlaneScript,
              "--host",
              apiHost,
              "--port",
              String(apiPort),
              "--clone-root",
              cloneRoot,
              "--logs-dir",
              logsDir,
            ],
          },
        ]),
    {
      id: "web",
      cmd: "npm",
      args: ["run", "dev", "--workspace", "@clone/web", "--", "--hostname", "127.0.0.1", "--port", String(webPort)],
      env: {
        CLONE_V2_API_BASE_URL: apiBaseUrl,
      },
    },
    {
      id: "worker",
      cmd: "npm",
      args: ["run", "dev", "--workspace", "@clone/worker"],
      env: {
        CLONE_V2_API_BASE_URL: apiBaseUrl,
        CLONE_STATE_DB: stateDbPath,
      },
    },
  ];
  return specs;
}

function printStatus() {
  const supervisorPid = readPid();
  const supervisorAlive = pidAlive(supervisorPid);
  const state = readJson(stateFile, {});
  const children = Array.isArray(state.children) ? state.children : [];

  const enrichedChildren = children.map((child) => ({
    ...child,
    alive: pidAlive(Number(child.pid || 0)),
  }));

  console.log(`mode=v2`);
  console.log(`root=${cloneRoot}`);
  console.log(`logs_dir=${logsDir}`);
  console.log(`supervisor_pid=${supervisorPid || "-"}`);
  console.log(`supervisor_state=${supervisorAlive ? "running" : "stopped"}`);
  console.log(`api_url=${apiBaseUrl}`);
  console.log(`web_url=http://127.0.0.1:${webPort}`);
  if (enrichedChildren.length) {
    for (const child of enrichedChildren) {
      console.log(`child.${child.id}.pid=${child.pid || "-"}`);
      console.log(`child.${child.id}.state=${child.alive ? "running" : "stopped"}`);
    }
  }
  console.log(`state_file=${stateFile}`);
  console.log(`log_file=${runtimeLogFile}`);
}

function stopSupervisor() {
  const supervisorPid = readPid();
  if (!supervisorPid || !pidAlive(supervisorPid)) {
    removePid();
    console.log("Clone runtime v2 is already stopped.");
    return;
  }

  process.kill(supervisorPid, "SIGTERM");
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    if (!pidAlive(supervisorPid)) {
      removePid();
      console.log(`Stopped runtime supervisor pid=${supervisorPid}`);
      return;
    }
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 150);
  }

  try {
    process.kill(supervisorPid, "SIGKILL");
  } catch {}
  removePid();
  console.log(`Force-stopped runtime supervisor pid=${supervisorPid}`);
}

function startSupervisor() {
  ensureLogsDir();
  const existingPid = readPid();
  if (existingPid && pidAlive(existingPid)) {
    console.log(`Clone runtime v2 already running (pid=${existingPid})`);
    printStatus();
    return;
  }

  const logHandle = fs.openSync(runtimeLogFile, "a");
  const child = spawn(process.execPath, [__filename, "run"], {
    cwd: cloneRoot,
    env: process.env,
    detached: true,
    stdio: ["ignore", logHandle, logHandle],
  });
  child.unref();
  writePid(child.pid);
  console.log(`Started runtime supervisor pid=${child.pid}`);
  console.log(`log_file=${runtimeLogFile}`);
}

function runSupervisor() {
  ensureLogsDir();
  writePid(process.pid);

  const log = fs.createWriteStream(runtimeLogFile, { flags: "a" });
  const children = new Map();
  let shuttingDown = false;

  const writeState = () => {
    const payload = {
      updated_at: new Date().toISOString(),
      supervisor_pid: process.pid,
      children: Array.from(children.values()).map((item) => ({
        id: item.id,
        pid: item.pid,
        cmd: item.cmd,
        args: item.args,
      })),
    };
    writeJson(stateFile, payload);
  };

  const stopChildren = (signal = "SIGTERM") => {
    for (const child of children.values()) {
      if (!pidAlive(child.pid)) continue;
      try {
        process.kill(-child.pid, signal);
      } catch {
        try {
          process.kill(child.pid, signal);
        } catch {}
      }
    }
  };

  const finalize = (exitCode) => {
    if (shuttingDown) return;
    shuttingDown = true;
    stopChildren("SIGTERM");
    setTimeout(() => stopChildren("SIGKILL"), 1500).unref();
    setTimeout(() => {
      removePid();
      writeState();
      process.exit(exitCode);
    }, 1900).unref();
  };

  process.on("SIGTERM", () => finalize(0));
  process.on("SIGINT", () => finalize(0));
  process.on("exit", () => {
    removePid();
  });

  for (const spec of childSpecs()) {
    const child = spawn(spec.cmd, spec.args, {
      cwd: cloneRoot,
      env: {
        ...process.env,
        ...(spec.env || {}),
      },
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout?.on("data", (chunk) => {
      log.write(`[${spec.id}] ${String(chunk)}`);
    });
    child.stderr?.on("data", (chunk) => {
      log.write(`[${spec.id}][stderr] ${String(chunk)}`);
    });

    const tracked = {
      id: spec.id,
      pid: child.pid,
      cmd: spec.cmd,
      args: spec.args,
    };
    children.set(spec.id, tracked);
    writeState();

    child.on("exit", (code, signal) => {
      log.write(`[supervisor] child ${spec.id} exited code=${code ?? "-"} signal=${signal ?? "-"}\n`);
      if (!shuttingDown) {
        finalize(code === 0 ? 1 : Number(code || 1));
      }
    });
  }

  log.write(`[supervisor] runtime v2 started pid=${process.pid}\n`);
  writeState();
  setInterval(writeState, 5000).unref();
}

if (command === "run") {
  runSupervisor();
} else if (command === "start") {
  startSupervisor();
} else if (command === "stop") {
  stopSupervisor();
} else if (command === "status") {
  printStatus();
} else if (command === "restart") {
  stopSupervisor();
  startSupervisor();
} else {
  console.error(`Unknown command: ${command}`);
  console.error("Usage: runtime_supervisor.mjs [start|stop|status|restart|run]");
  process.exit(1);
}
