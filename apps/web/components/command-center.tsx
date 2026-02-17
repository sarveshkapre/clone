"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type SystemStatus = {
  active: boolean;
  run_state: string;
  run_state_raw?: string;
  run_id?: string;
  run_pid?: number;
  updated_at?: string;
};

type RepoItem = {
  name: string;
  path: string;
  branch?: string;
  source?: string;
};

type RunItem = {
  id: string;
  state: string;
  state_raw?: string;
  started_at?: string;
  ended_at?: string;
  repo_count?: number;
  repos_changed?: number;
  repos_no_change?: number;
};

type ActiveRunPayload = {
  active: boolean;
  run: RunItem | null;
};

type TaskItem = {
  id: string;
  status: string;
  repo: string;
  title: string;
  priority: number;
  is_interrupt?: boolean;
  updated_at?: string;
};

type PresetItem = {
  id: string;
  name: string;
  mode?: string;
  code_root?: string;
  parallel_repos?: number;
  max_cycles?: number;
  tasks_per_repo?: number;
  selected_repos?: Array<{ name: string; path: string; branch?: string }>;
};

type LaunchDiagnostics = {
  generated_at?: string;
  server?: { pid?: number; started_at?: string; host?: string; port?: number };
  control_status?: { run_state?: string; run_state_raw?: string; active?: boolean };
  recent_log_errors?: string[];
};

type StreamEnvelope = {
  topic: string;
  type: string;
  ts: string;
  cursor: string;
  payload: Record<string, unknown>;
};

type ParsedQueueIntent = {
  title: string;
  repo: string;
  parsed: boolean;
};

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error((payload as { error?: string }).error || `${path} failed with ${response.status}`);
  }
  return payload;
}

function formatIso(iso?: string): string {
  if (!iso) return "-";
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return iso;
  return value.toISOString().replace("T", " ").replace(".000Z", "Z");
}

function parseQueueIntent(rawTitle: string, selectedRepo: string): ParsedQueueIntent {
  const text = String(rawTitle || "").trim();
  const explicit = text.match(/^(?:for|repo)\s+([a-zA-Z0-9._-]+)\s*:\s+(.+)$/i);
  if (!explicit) {
    return { title: text, repo: selectedRepo || "*", parsed: false };
  }
  const parsedRepo = String(explicit[1] || "").trim();
  const parsedTitle = String(explicit[2] || "").trim();
  return {
    title: parsedTitle || text,
    repo: parsedRepo || selectedRepo || "*",
    parsed: parsedRepo.length > 0 && parsedTitle.length > 0,
  };
}

export function CommandCenter() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [activeRun, setActiveRun] = useState<ActiveRunPayload | null>(null);
  const [repos, setRepos] = useState<RepoItem[]>([]);
  const [runs, setRuns] = useState<RunItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [preset, setPreset] = useState<PresetItem | null>(null);
  const [diagnostics, setDiagnostics] = useState<LaunchDiagnostics | null>(null);
  const [stream, setStream] = useState<StreamEnvelope[]>([]);

  const [search, setSearch] = useState("");
  const [selectedRepoPaths, setSelectedRepoPaths] = useState<string[]>([]);
  const [parallelRepos, setParallelRepos] = useState(5);
  const [maxCycles, setMaxCycles] = useState(30);
  const [tasksPerRepo, setTasksPerRepo] = useState(0);
  const [codeRoot, setCodeRoot] = useState("");

  const [queueTitle, setQueueTitle] = useState("");
  const [queueDetails, setQueueDetails] = useState("");
  const [queueRepo, setQueueRepo] = useState("*");
  const [queuePriority, setQueuePriority] = useState(3);
  const [queueInterrupt, setQueueInterrupt] = useState(false);

  const [busyAction, setBusyAction] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const activeRunId = useMemo(() => {
    const fromActive = String(activeRun?.run?.id || "").trim();
    if (fromActive) return fromActive;
    const fromStatus = String(status?.run_id || "").trim();
    if (fromStatus) return fromStatus;
    return String(runs[0]?.id || "").trim();
  }, [activeRun?.run?.id, runs, status?.run_id]);

  const filteredRepos = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return repos;
    return repos.filter((repo) => {
      const haystack = `${repo.name} ${repo.path}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [repos, search]);

  const selectedRepos = useMemo(() => {
    const selected = new Set(selectedRepoPaths);
    return repos.filter((repo) => selected.has(repo.path));
  }, [repos, selectedRepoPaths]);

  const runControlBlockReason = useMemo(() => {
    if (busyAction.length > 0) return "Another action is in progress.";
    if (!activeRun?.active) return "No active run is currently online.";
    if (!activeRunId) return "Active run id is unavailable.";
    return "";
  }, [activeRun?.active, activeRunId, busyAction.length]);

  const parsedQueueIntent = useMemo(() => parseQueueIntent(queueTitle, queueRepo), [queueRepo, queueTitle]);

  const loadStatus = useCallback(async () => {
    const payload = await apiRequest<SystemStatus>("/api/v1/system/status");
    setStatus(payload);
  }, []);

  const loadRepos = useCallback(async () => {
    const payload = await apiRequest<{ items: RepoItem[] }>("/api/v1/repos?source=all&limit=2500");
    const items = Array.isArray(payload.items) ? payload.items : [];
    setRepos(items);
    setSelectedRepoPaths((current) => {
      if (current.length > 0) return current;
      return items.slice(0, Math.min(5, items.length)).map((item) => item.path);
    });
  }, []);

  const loadRuns = useCallback(async () => {
    const payload = await apiRequest<{ items: RunItem[] }>("/api/v1/runs?limit=20");
    setRuns(Array.isArray(payload.items) ? payload.items : []);
  }, []);

  const loadActiveRun = useCallback(async () => {
    const payload = await apiRequest<ActiveRunPayload>("/api/v1/runs/active");
    setActiveRun(payload);
  }, []);

  const loadTasks = useCallback(async () => {
    const payload = await apiRequest<{ items: TaskItem[] }>("/api/v1/tasks?limit=80");
    setTasks(Array.isArray(payload.items) ? payload.items : []);
  }, []);

  const loadPreset = useCallback(async () => {
    const payload = await apiRequest<{ items: PresetItem[] }>("/api/v1/presets?limit=5");
    const first = Array.isArray(payload.items) ? payload.items[0] : null;
    if (!first) return;
    setPreset(first);
    setParallelRepos(Number(first.parallel_repos || 5));
    setMaxCycles(Number(first.max_cycles || 30));
    setTasksPerRepo(Number(first.tasks_per_repo || 0));
    setCodeRoot(String(first.code_root || ""));
    if (Array.isArray(first.selected_repos) && first.selected_repos.length > 0) {
      setSelectedRepoPaths(first.selected_repos.map((repo) => repo.path).filter(Boolean));
    }
  }, []);

  const loadDiagnostics = useCallback(async () => {
    const payload = await apiRequest<LaunchDiagnostics>("/api/v1/system/launch-diagnostics");
    setDiagnostics(payload);
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadStatus(), loadActiveRun(), loadRuns(), loadTasks(), loadDiagnostics()]);
  }, [loadActiveRun, loadDiagnostics, loadRuns, loadStatus, loadTasks]);

  const runAction = useCallback(
    async (action: "stop" | "force-stop" | "restart") => {
      const runId = activeRunId;
      if (!runId) {
        setMessage("No run available for action.");
        return;
      }
      setBusyAction(action);
      try {
        await apiRequest(`/api/v1/runs/${encodeURIComponent(runId)}/${action}`, {
          method: "POST",
          body: JSON.stringify({ wait_seconds: action === "force-stop" ? 20 : 12 }),
        });
        setMessage(`Action ${action} executed on ${runId}.`);
        await refreshAll();
      } catch (error) {
        setMessage(String(error));
      } finally {
        setBusyAction("");
      }
    },
    [activeRunId, refreshAll],
  );

  const startRun = useCallback(async () => {
    if (!selectedRepos.length) {
      setMessage("Select at least one repository before starting a run.");
      return;
    }
    setBusyAction("start");
    try {
      await apiRequest("/api/v1/runs", {
        method: "POST",
        body: JSON.stringify({
          repos: selectedRepos.map((repo) => ({ name: repo.name, path: repo.path, branch: repo.branch || "main" })),
          parallel_repos: Math.max(1, Math.min(64, Number(parallelRepos || 5))),
          max_cycles: Math.max(1, Math.min(10000, Number(maxCycles || 30))),
          tasks_per_repo: Math.max(0, Math.min(1000, Number(tasksPerRepo || 0))),
        }),
      });

      await apiRequest("/api/v1/presets", {
        method: "POST",
        body: JSON.stringify({
          id: "default",
          name: "default",
          mode: "custom",
          code_root: codeRoot || "/",
          parallel_repos: Math.max(1, Math.min(64, Number(parallelRepos || 5))),
          max_cycles: Math.max(1, Math.min(10000, Number(maxCycles || 30))),
          tasks_per_repo: Math.max(0, Math.min(1000, Number(tasksPerRepo || 0))),
          selected_repos: selectedRepos.map((repo) => ({ name: repo.name, path: repo.path, branch: repo.branch || "main" })),
        }),
      });

      setMessage(`Started run with ${selectedRepos.length} repos.`);
      await refreshAll();
      await loadPreset();
    } catch (error) {
      setMessage(String(error));
    } finally {
      setBusyAction("");
    }
  }, [codeRoot, loadPreset, maxCycles, parallelRepos, refreshAll, selectedRepos, tasksPerRepo]);

  const queueTask = useCallback(async () => {
    const parsedIntent = parseQueueIntent(queueTitle, queueRepo);
    const title = parsedIntent.title.trim();
    if (!title) {
      setMessage("Task title is required.");
      return;
    }
    setBusyAction("queue");
    try {
      await apiRequest("/api/v1/tasks", {
        method: "POST",
        body: JSON.stringify({
          title,
          details: queueDetails,
          repo: parsedIntent.repo || "*",
          priority: queueInterrupt ? 1 : Math.max(1, Math.min(5, queuePriority)),
          is_interrupt: queueInterrupt,
        }),
      });
      setQueueTitle("");
      setQueueDetails("");
      setQueueInterrupt(false);
      setMessage(parsedIntent.parsed ? `Task queued for ${parsedIntent.repo}.` : "Task queued.");
      await loadTasks();
    } catch (error) {
      setMessage(String(error));
    } finally {
      setBusyAction("");
    }
  }, [loadTasks, queueDetails, queueInterrupt, queuePriority, queueRepo, queueTitle]);

  useEffect(() => {
    void Promise.all([loadPreset(), loadRepos()]).then(() => refreshAll());
  }, [loadPreset, loadRepos, refreshAll]);

  useEffect(() => {
    if (!preset) return;
    setSelectedRepoPaths((current) => {
      if (current.length > 0) return current;
      const preferred = Array.isArray(preset.selected_repos)
        ? preset.selected_repos.map((repo) => repo.path).filter(Boolean)
        : [];
      return preferred.length > 0 ? preferred : current;
    });
  }, [preset]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refreshAll();
    }, 6000);
    return () => window.clearInterval(interval);
  }, [refreshAll]);

  useEffect(() => {
    const source = new EventSource("/api/v1/stream?poll=4");
    source.onmessage = (event) => {
      try {
        const envelope = JSON.parse(String(event.data || "{}")) as StreamEnvelope;
        setStream((current) => [envelope, ...current].slice(0, 160));
      } catch {
        // Ignore malformed stream frame.
      }
    };
    return () => {
      source.close();
    };
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-4 py-6 md:px-8 md:py-8">
      <header className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--ink-soft)]">Clone Runtime</p>
            <h1 className="text-3xl font-semibold tracking-tight">Mission Control</h1>
          </div>
          <div
            className={`rounded-full border px-3 py-1 text-xs ${
              activeRun?.active
                ? "border-[#9db8ac] bg-[#edf7f2] text-[#165947]"
                : "border-[var(--line)] bg-[#f6faf7] text-[var(--ink-soft)]"
            }`}
          >
            {activeRun?.active ? "Run Active" : "Idle"} · {status?.run_state || "unknown"}
          </div>
        </div>
        <p className="mt-3 text-sm text-[var(--ink-soft)]">
          Start the UI with <code>clone start</code>, then launch runs from here without stopping the control plane.
        </p>
        {message ? <p className="mt-3 rounded-xl bg-[#f4faf6] px-3 py-2 text-sm text-[var(--ink)]">{message}</p> : null}
      </header>

      <section className="grid gap-3 md:grid-cols-4">
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">Current Run</p>
          <p className="mt-2 text-xl font-semibold">{status?.run_id || "-"}</p>
          <p className="mt-1 text-xs text-[var(--ink-soft)]">PID {status?.run_pid || "-"}</p>
        </article>
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">Repos Selected</p>
          <p className="mt-2 text-xl font-semibold">{selectedRepos.length}</p>
          <p className="mt-1 text-xs text-[var(--ink-soft)]">{repos.length} available</p>
        </article>
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">Queue Depth</p>
          <p className="mt-2 text-xl font-semibold">{tasks.filter((item) => item.status === "QUEUED").length}</p>
          <p className="mt-1 text-xs text-[var(--ink-soft)]">{tasks.length} total tasks</p>
        </article>
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">Last Snapshot</p>
          <p className="mt-2 text-base font-semibold">{formatIso(status?.updated_at)}</p>
          <p className="mt-1 text-xs text-[var(--ink-soft)]">Diagnostics {formatIso(diagnostics?.generated_at)}</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Run Launcher</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => runAction("stop")}
                disabled={runControlBlockReason.length > 0}
                title={runControlBlockReason || "Stop active run"}
                className="rounded-full border border-[#d58d75] bg-[#fef3ef] px-3 py-1 text-xs font-semibold text-[#a74a2a] disabled:opacity-50"
              >
                Stop
              </button>
              <button
                type="button"
                onClick={() => runAction("force-stop")}
                disabled={runControlBlockReason.length > 0}
                title={runControlBlockReason || "Force stop active run"}
                className="rounded-full border border-[#d27474] bg-[#fdeeee] px-3 py-1 text-xs font-semibold text-[#9d1f1f] disabled:opacity-50"
              >
                Force Stop
              </button>
              <button
                type="button"
                onClick={() => runAction("restart")}
                disabled={runControlBlockReason.length > 0}
                title={runControlBlockReason || "Restart active run"}
                className="rounded-full border border-[#9db8ac] bg-[#edf7f2] px-3 py-1 text-xs font-semibold text-[#165947] disabled:opacity-50"
              >
                Restart
              </button>
            </div>
          </div>
          {runControlBlockReason ? (
            <p className="mb-3 rounded-xl border border-[var(--line)] bg-[#f9fbf9] px-3 py-2 text-xs text-[var(--ink-soft)]">
              Controls disabled: {runControlBlockReason}
            </p>
          ) : null}

          <div className="mb-3 grid gap-2 md:grid-cols-4">
            <label className="text-xs text-[var(--ink-soft)]">
              Parallel
              <input
                type="number"
                min={1}
                max={64}
                value={parallelRepos}
                onChange={(event) => setParallelRepos(Number(event.target.value || 5))}
                className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-2 py-1"
              />
            </label>
            <label className="text-xs text-[var(--ink-soft)]">
              Max Cycles
              <input
                type="number"
                min={1}
                max={10000}
                value={maxCycles}
                onChange={(event) => setMaxCycles(Number(event.target.value || 30))}
                className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-2 py-1"
              />
            </label>
            <label className="text-xs text-[var(--ink-soft)]">
              Tasks/Repo
              <input
                type="number"
                min={0}
                max={1000}
                value={tasksPerRepo}
                onChange={(event) => setTasksPerRepo(Number(event.target.value || 0))}
                className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-2 py-1"
              />
            </label>
            <label className="text-xs text-[var(--ink-soft)]">
              Code Root
              <input
                type="text"
                value={codeRoot}
                onChange={(event) => setCodeRoot(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-2 py-1"
              />
            </label>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <input
              type="search"
              placeholder="Filter repos"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-[260px] rounded-full border border-[var(--line)] bg-white px-3 py-1 text-sm"
            />
            <button
              type="button"
              onClick={() => setSelectedRepoPaths(filteredRepos.map((repo) => repo.path))}
              className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs"
            >
              Select Visible
            </button>
            <button
              type="button"
              onClick={() => setSelectedRepoPaths([])}
              className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => void startRun()}
              disabled={busyAction.length > 0 || selectedRepos.length === 0}
              className="rounded-full border border-[#182119] bg-[#182119] px-4 py-1 text-xs font-semibold text-white disabled:opacity-50"
            >
              {busyAction === "start" ? "Starting..." : "Start Run"}
            </button>
          </div>

          <div className="max-h-[280px] overflow-auto rounded-xl border border-[var(--line)]">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#f8fbf8] text-xs uppercase tracking-[0.08em] text-[var(--ink-soft)]">
                <tr>
                  <th className="px-3 py-2">Use</th>
                  <th className="px-3 py-2">Repo</th>
                  <th className="px-3 py-2">Branch</th>
                  <th className="px-3 py-2">Source</th>
                </tr>
              </thead>
              <tbody>
                {filteredRepos.map((repo) => {
                  const checked = selectedRepoPaths.includes(repo.path);
                  return (
                    <tr key={repo.path} className="border-t border-[var(--line)]">
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            setSelectedRepoPaths((current) => {
                              if (event.target.checked) {
                                return [...new Set([...current, repo.path])];
                              }
                              return current.filter((path) => path !== repo.path);
                            });
                          }}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-medium">{repo.name}</p>
                        <p className="text-xs text-[var(--ink-soft)]">{repo.path}</p>
                      </td>
                      <td className="px-3 py-2">{repo.branch || "main"}</td>
                      <td className="px-3 py-2">{repo.source || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Queue Inbox</h2>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Task title (or: for repo-name: task)"
              value={queueTitle}
              onChange={(event) => setQueueTitle(event.target.value)}
              className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
            />
            {parsedQueueIntent.parsed ? (
              <p className="rounded-lg border border-[#cfe2d8] bg-[#f4faf7] px-3 py-2 text-xs text-[#165947]">
                Parsed: repo <span className="font-semibold">{parsedQueueIntent.repo}</span> · task{" "}
                <span className="font-semibold">{parsedQueueIntent.title}</span>
              </p>
            ) : null}
            <input
              type="text"
              placeholder="Details"
              value={queueDetails}
              onChange={(event) => setQueueDetails(event.target.value)}
              className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-3 gap-2">
              <select
                value={queueRepo}
                onChange={(event) => setQueueRepo(event.target.value)}
                className="rounded-lg border border-[var(--line)] bg-white px-2 py-2 text-sm"
              >
                <option value="*">All repos</option>
                {repos.slice(0, 120).map((repo) => (
                  <option key={`q-${repo.path}`} value={repo.name}>
                    {repo.name}
                  </option>
                ))}
              </select>
              <select
                value={queuePriority}
                onChange={(event) => setQueuePriority(Number(event.target.value || 3))}
                className="rounded-lg border border-[var(--line)] bg-white px-2 py-2 text-sm"
              >
                <option value={1}>Priority 1</option>
                <option value={2}>Priority 2</option>
                <option value={3}>Priority 3</option>
                <option value={4}>Priority 4</option>
                <option value={5}>Priority 5</option>
              </select>
              <label className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-2 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={queueInterrupt}
                  onChange={(event) => setQueueInterrupt(event.target.checked)}
                />
                Interrupt
              </label>
            </div>
            <button
              type="button"
              onClick={() => void queueTask()}
              disabled={busyAction === "queue"}
              className="w-full rounded-full border border-[#182119] bg-[#182119] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busyAction === "queue" ? "Queueing..." : "Add Task"}
            </button>
          </div>

          <div className="mt-4 max-h-[280px] overflow-auto rounded-xl border border-[var(--line)]">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#f8fbf8] text-xs uppercase tracking-[0.08em] text-[var(--ink-soft)]">
                <tr>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Task</th>
                  <th className="px-3 py-2">Repo</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-t border-[var(--line)]">
                    <td className="px-3 py-2 text-xs">
                      {task.status}
                      {task.is_interrupt ? " · interrupt" : ""}
                    </td>
                    <td className="px-3 py-2">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-[var(--ink-soft)]">{task.id}</p>
                    </td>
                    <td className="px-3 py-2 text-xs text-[var(--ink-soft)]">{task.repo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Run Activity</h2>
          <div className="max-h-[280px] overflow-auto rounded-xl border border-[var(--line)] bg-[#fbfdfb] p-3 font-mono text-xs">
            {stream.length === 0 ? (
              <p className="text-[var(--ink-soft)]">Waiting for stream frames...</p>
            ) : (
              stream.map((event) => (
                <p key={event.cursor} className="border-b border-[#e8efe8] py-1 last:border-b-0">
                  {formatIso(event.ts)} · {event.topic}/{event.type} · {event.cursor}
                </p>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Recent Runs</h2>
          <div className="max-h-[280px] overflow-auto rounded-xl border border-[var(--line)]">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#f8fbf8] text-xs uppercase tracking-[0.08em] text-[var(--ink-soft)]">
                <tr>
                  <th className="px-3 py-2">Run</th>
                  <th className="px-3 py-2">State</th>
                  <th className="px-3 py-2">Repos</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id} className="border-t border-[var(--line)]">
                    <td className="px-3 py-2">
                      <p className="font-medium">{run.id}</p>
                      <p className="text-xs text-[var(--ink-soft)]">{formatIso(run.started_at)}</p>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {run.state}
                      {run.state_raw && run.state_raw !== run.state ? ` (${run.state_raw})` : ""}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {run.repo_count || 0} · {run.repos_changed || 0} changed
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Launch Diagnostics</h2>
        <p className="mb-3 text-xs text-[var(--ink-soft)]">
          API {diagnostics?.server?.host || "-"}:{diagnostics?.server?.port || "-"} · server pid {diagnostics?.server?.pid || "-"}
        </p>
        <div className="max-h-[200px] overflow-auto rounded-xl border border-[var(--line)] bg-[#fbfdfb] p-3 font-mono text-xs">
          {(diagnostics?.recent_log_errors || []).length === 0 ? (
            <p className="text-[var(--ink-soft)]">No recent log errors.</p>
          ) : (
            (diagnostics?.recent_log_errors || []).map((line, index) => <p key={`${index}-${line.slice(0, 16)}`}>{line}</p>)
          )}
        </div>
      </section>
    </main>
  );
}
