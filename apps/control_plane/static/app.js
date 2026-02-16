const elements = {
  generatedAt: document.getElementById("generatedAt"),
  reactorBadge: document.getElementById("reactorBadge"),
  heroCompactModeBtn: document.getElementById("heroCompactModeBtn"),
  heroDensityModeBtn: document.getElementById("heroDensityModeBtn"),
  heroCommandBtn: document.getElementById("heroCommandBtn"),
  heroShortcutsBtn: document.getElementById("heroShortcutsBtn"),
  metricCards: document.getElementById("metricCards"),
  alertsList: document.getElementById("alertsList"),
  alertsMeta: document.getElementById("alertsMeta"),
  streamStatePill: document.getElementById("streamStatePill"),
  streamMeta: document.getElementById("streamMeta"),
  pauseStreamBtn: document.getElementById("pauseStreamBtn"),
  refreshNowBtn: document.getElementById("refreshNowBtn"),
  timeMode: document.getElementById("timeMode"),
  compactModeBtn: document.getElementById("compactModeBtn"),
  densityModeBtn: document.getElementById("densityModeBtn"),
  collapseAllBtn: document.getElementById("collapseAllBtn"),
  commandPaletteBtn: document.getElementById("commandPaletteBtn"),
  shortcutsBtn: document.getElementById("shortcutsBtn"),
  shortcutsPanel: document.getElementById("shortcutsPanel"),
  jumpNav: document.getElementById("jumpNav"),
  deckMeta: document.getElementById("deckMeta"),
  deckNowValue: document.getElementById("deckNowValue"),
  deckNowMeta: document.getElementById("deckNowMeta"),
  deckFlowValue: document.getElementById("deckFlowValue"),
  deckFlowMeta: document.getElementById("deckFlowMeta"),
  deckFlowTrend: document.getElementById("deckFlowTrend"),
  deckNowCard: document.getElementById("deckNowCard"),
  deckFlowCard: document.getElementById("deckFlowCard"),
  deckIssueCard: document.getElementById("deckIssueCard"),
  deckIssueValue: document.getElementById("deckIssueValue"),
  deckIssueMeta: document.getElementById("deckIssueMeta"),
  deckIssueTrend: document.getElementById("deckIssueTrend"),
  deckActionCard: document.getElementById("deckActionCard"),
  deckActionValue: document.getElementById("deckActionValue"),
  deckActionMeta: document.getElementById("deckActionMeta"),
  deckAlertSummary: document.getElementById("deckAlertSummary"),
  deckAlertStack: document.getElementById("deckAlertStack"),
  deckOpenAlertsBtn: document.getElementById("deckOpenAlertsBtn"),
  routeNav: document.getElementById("routeNav"),
  opsMeta: document.getElementById("opsMeta"),
  opsHealthScore: document.getElementById("opsHealthScore"),
  opsHealthSummary: document.getElementById("opsHealthSummary"),
  opsRecommendations: document.getElementById("opsRecommendations"),
  opsNormalizeBtn: document.getElementById("opsNormalizeBtn"),
  opsRestartBtn: document.getElementById("opsRestartBtn"),
  opsInspectRunBtn: document.getElementById("opsInspectRunBtn"),
  agentMode: document.getElementById("agentMode"),
  agentInterval: document.getElementById("agentInterval"),
  agentAutopilotEnabled: document.getElementById("agentAutopilotEnabled"),
  agentRunNextBtn: document.getElementById("agentRunNextBtn"),
  agentRunPlanBtn: document.getElementById("agentRunPlanBtn"),
  agentStatusMeta: document.getElementById("agentStatusMeta"),
  agentPlanList: document.getElementById("agentPlanList"),
  agentEventLog: document.getElementById("agentEventLog"),
  agentPilotToggleBtn: document.getElementById("agentPilotToggleBtn"),
  agentPilotBody: document.getElementById("agentPilotBody"),
  lockHotspotsMeta: document.getElementById("lockHotspotsMeta"),
  lockHotspotsList: document.getElementById("lockHotspotsList"),
  commandPaletteOverlay: document.getElementById("commandPaletteOverlay"),
  commandPaletteInput: document.getElementById("commandPaletteInput"),
  commandPaletteMeta: document.getElementById("commandPaletteMeta"),
  commandPaletteList: document.getElementById("commandPaletteList"),
  controlStatusMeta: document.getElementById("controlStatusMeta"),
  controlParallelRepos: document.getElementById("controlParallelRepos"),
  controlMaxCycles: document.getElementById("controlMaxCycles"),
  controlTasksPerRepo: document.getElementById("controlTasksPerRepo"),
  controlStartBtn: document.getElementById("controlStartBtn"),
  controlStopBtn: document.getElementById("controlStopBtn"),
  controlRestartBtn: document.getElementById("controlRestartBtn"),
  controlNormalizeBtn: document.getElementById("controlNormalizeBtn"),
  startRunModal: document.getElementById("startRunModal"),
  startRunCloseBtn: document.getElementById("startRunCloseBtn"),
  startRunCancelBtn: document.getElementById("startRunCancelBtn"),
  startRunConfirmBtn: document.getElementById("startRunConfirmBtn"),
  startRunParallelRepos: document.getElementById("startRunParallelRepos"),
  startRunMaxCycles: document.getElementById("startRunMaxCycles"),
  startRunTasksPerRepo: document.getElementById("startRunTasksPerRepo"),
  startRunMaxCyclesPerRepo: document.getElementById("startRunMaxCyclesPerRepo"),
  startRunMaxCommitsPerRepo: document.getElementById("startRunMaxCommitsPerRepo"),
  startRunModeAuto: document.getElementById("startRunModeAuto"),
  startRunModeCustom: document.getElementById("startRunModeCustom"),
  startRunRepoCountMeta: document.getElementById("startRunRepoCountMeta"),
  startRunSearch: document.getElementById("startRunSearch"),
  startRunSelectAllBtn: document.getElementById("startRunSelectAllBtn"),
  startRunSelectNoneBtn: document.getElementById("startRunSelectNoneBtn"),
  startRunRepoTable: document.getElementById("startRunRepoTable"),
  notifyStatusMeta: document.getElementById("notifyStatusMeta"),
  notifyEnabled: document.getElementById("notifyEnabled"),
  notifyWebhookUrl: document.getElementById("notifyWebhookUrl"),
  notifyMinSeverity: document.getElementById("notifyMinSeverity"),
  notifyCooldownSeconds: document.getElementById("notifyCooldownSeconds"),
  notifySendOk: document.getElementById("notifySendOk"),
  notifyRules: document.getElementById("notifyRules"),
  notifySaveBtn: document.getElementById("notifySaveBtn"),
  notifyTestBtn: document.getElementById("notifyTestBtn"),
  notifyDeliveryMeta: document.getElementById("notifyDeliveryMeta"),
  notifyEventsTable: document.getElementById("notifyEventsTable"),
  taskQueueMeta: document.getElementById("taskQueueMeta"),
  taskQueueRepo: document.getElementById("taskQueueRepo"),
  taskQueueStatus: document.getElementById("taskQueueStatus"),
  taskQueueTitle: document.getElementById("taskQueueTitle"),
  taskQueueDetails: document.getElementById("taskQueueDetails"),
  taskQueuePriority: document.getElementById("taskQueuePriority"),
  taskQueueAddBtn: document.getElementById("taskQueueAddBtn"),
  taskQueueTable: document.getElementById("taskQueueTable"),
  commitTable: document.getElementById("commitTable"),
  repoStates: document.getElementById("repoStates"),
  repoStateMeta: document.getElementById("repoStateMeta"),
  runTable: document.getElementById("runTable"),
  runHistorySearch: document.getElementById("runHistorySearch"),
  runHistoryStateFilter: document.getElementById("runHistoryStateFilter"),
  runHistoryMeta: document.getElementById("runHistoryMeta"),
  runDetailNav: document.getElementById("runDetailNav"),
  runDetailSummaryBtn: document.getElementById("runDetailSummaryBtn"),
  runDetailCommitsBtn: document.getElementById("runDetailCommitsBtn"),
  runDetailEventsBtn: document.getElementById("runDetailEventsBtn"),
  runDetailReposBtn: document.getElementById("runDetailReposBtn"),
  runDetailLogsBtn: document.getElementById("runDetailLogsBtn"),
  runCommitTable: document.getElementById("runCommitTable"),
  runCommitRepoFilter: document.getElementById("runCommitRepoFilter"),
  runCommitSearch: document.getElementById("runCommitSearch"),
  selectedRunMeta: document.getElementById("selectedRunMeta"),
  eventsPane: document.getElementById("eventsPane"),
  eventsAutoScrollBtn: document.getElementById("eventsAutoScrollBtn"),
  runLogSection: document.getElementById("runLogSection"),
  runLogPane: document.getElementById("runLogPane"),
  runLogMeta: document.getElementById("runLogMeta"),
  runLogAutoScrollBtn: document.getElementById("runLogAutoScrollBtn"),
  runLogRefreshBtn: document.getElementById("runLogRefreshBtn"),
  runActivityPane: document.getElementById("runActivityPane"),
  runActivityMeta: document.getElementById("runActivityMeta"),
  runActivityRefreshBtn: document.getElementById("runActivityRefreshBtn"),
  runActivityAutoScrollBtn: document.getElementById("runActivityAutoScrollBtn"),
  commitHours: document.getElementById("commitHours"),
  repoInsightsHours: document.getElementById("repoInsightsHours"),
  repoInsightsRefreshBtn: document.getElementById("repoInsightsRefreshBtn"),
  repoInsightsSearch: document.getElementById("repoInsightsSearch"),
  repoInsightsStateFilter: document.getElementById("repoInsightsStateFilter"),
  repoInsightsMeta: document.getElementById("repoInsightsMeta"),
  repoDetailNav: document.getElementById("repoDetailNav"),
  repoDetailSummaryBtn: document.getElementById("repoDetailSummaryBtn"),
  repoDetailCommitsBtn: document.getElementById("repoDetailCommitsBtn"),
  repoDetailTimelineBtn: document.getElementById("repoDetailTimelineBtn"),
  repoInsightsTable: document.getElementById("repoInsightsTable"),
  repoDetailsMeta: document.getElementById("repoDetailsMeta"),
  repoDetailsCommitsTable: document.getElementById("repoDetailsCommitsTable"),
  repoTimelineMeta: document.getElementById("repoTimelineMeta"),
  repoTimelineTable: document.getElementById("repoTimelineTable"),
  toastStack: document.getElementById("toastStack"),
  inspectorDrawer: document.getElementById("inspectorDrawer"),
  inspectorTitle: document.getElementById("inspectorTitle"),
  inspectorMeta: document.getElementById("inspectorMeta"),
  inspectorBody: document.getElementById("inspectorBody"),
  inspectorTabs: document.querySelectorAll("#inspectorDrawer .inspector-tabs button[data-tab]"),
  inspectorCloseBtn: document.getElementById("inspectorCloseBtn"),
};

const ALERT_DEFAULTS = {
  stallMinutes: 15,
  noCommitMinutes: 60,
  lockSkipThreshold: 25,
};

const DETAILS_REFRESH_MS = 30000;
const ACTIVE_RUN_DETAILS_REFRESH_MS = 10000;
const REPO_INSIGHTS_REFRESH_MS = 45000;
const NOTIFY_EVENTS_REFRESH_MS = 30000;
const TASK_QUEUE_REFRESH_MS = 12000;
const REPOS_CATALOG_REFRESH_MS = 120000;
const RUN_LOG_REFRESH_MS = 8000;
const ACTIVE_RUN_LOG_REFRESH_MS = 5000;
const RUN_LOG_LINE_LIMIT = 500;
const RUN_COMMITS_VIEW_LIMIT = 500;
const RUN_ACTIVITY_MAX_ITEMS = 800;
const RUN_ACTIVITY_AUTOSCROLL_TEXT_ON = "Auto-scroll On";
const RUN_ACTIVITY_AUTOSCROLL_TEXT_OFF = "Auto-scroll Off";
const COMPACT_MODE_STORAGE_KEY = "clone_control_plane_compact_mode_v1";
const DENSITY_MODE_STORAGE_KEY = "clone_control_plane_density_mode_v1";
const COLLAPSED_PANELS_STORAGE_KEY = "clone_control_plane_collapsed_panels_v1";
const RUN_LOG_AUTOSCROLL_STORAGE_KEY = "clone_control_plane_run_log_autoscroll_v1";
const RUN_ACTIVITY_AUTOSCROLL_STORAGE_KEY = "clone_control_plane_run_activity_autoscroll_v1";
const TIME_MODE_STORAGE_KEY = "clone_control_plane_time_mode_v1";
const EVENTS_AUTOSCROLL_STORAGE_KEY = "clone_control_plane_events_autoscroll_v1";
const AGENT_AUTOPILOT_STORAGE_KEY = "clone_control_plane_agent_autopilot_v1";
const AGENT_MODE_STORAGE_KEY = "clone_control_plane_agent_mode_v1";
const AGENT_INTERVAL_STORAGE_KEY = "clone_control_plane_agent_interval_v1";
const PACIFIC_TIMEZONE = "America/Los_Angeles";
const PACIFIC_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: PACIFIC_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZoneName: "short",
});
const URL_PARAM_MAP = {
  commitHours: "ch",
  repoInsightsHours: "rih",
  runHistorySearch: "rhs",
  runHistoryStateFilter: "rhf",
  repoInsightsSearch: "ris",
  repoInsightsStateFilter: "rif",
  compact: "cm",
  density: "dm",
  inspectorOpen: "io",
  inspectorTab: "it",
  timeMode: "tz",
  eventsAutoScroll: "eas",
  selectedRunId: "rid",
  selectedRepoName: "repo",
  agentAuto: "ap",
  agentMode: "am",
  agentInterval: "ai",
};
const ROUTE_PATH_MAP = {
  overview: "/",
  runs: "/runs",
  repos: "/repos",
  alerts: "/alerts",
  controls: "/controls",
  launch: "/launch",
};
const DEFAULT_NOTIFY_ALERT_IDS = [
  "run_stalled",
  "lock_contention",
  "no_workers_cycle",
  "no_commits_long_run",
  "duplicate_loop_groups",
  "healthy",
];
const DEFAULT_COLLAPSED_PANEL_IDS = new Set([
  "runTriagePanel",
  "notificationsSection",
  "commitStreamSection",
  "runHistorySection",
  "eventsSection",
  "runLogSection",
  "repoInsightsSection",
  "repoDrilldownSection",
]);
const NOTIFY_RULE_LABELS = {
  run_stalled: "Run stalled",
  lock_contention: "Lock contention",
  no_workers_cycle: "No workers cycle",
  no_commits_long_run: "No commits long run",
  duplicate_loop_groups: "Duplicate loop groups",
  healthy: "Healthy status",
};

const state = {
  commitHours: Number(elements.commitHours.value || 2),
  repoInsightsHours: Number(elements.repoInsightsHours.value || 24),
  source: null,
  streamPaused: false,
  streamConnected: false,
  streamLastMessageAt: 0,
  latestAlertsCount: 0,
  lastSnapshotIso: "",
  latestSnapshot: null,
  compactMode: false,
  densityMode: "calm",
  timeMode: "utc",
  shortcutsOpen: false,
  commandPaletteOpen: false,
  commandPaletteQuery: "",
  commandPaletteSelection: 0,
  activeSectionId: "",
  collapsedPanels: new Set(),
  collapsedPanelsLoaded: false,
  runHistory: [],
  selectedRunId: null,
  selectedRun: null,
  selectedRunCommits: [],
  selectedRunEvents: [],
  selectedRunLogLines: [],
  selectedRunLogPath: "",
  selectedRunLogLineCount: 0,
  selectedRunLogLoadedAt: 0,
  selectedRunActivity: [],
  selectedRunActivityUpdatedAt: 0,
  selectedRunDetailsAt: 0,
  pendingRunDetailsFor: null,
  eventsAutoScroll: true,
  runLogAutoScroll: true,
  runActivityAutoScroll: true,
  pendingRunLogFor: null,
  repoInsights: [],
  repoInsightsUpdatedAt: 0,
  runHistorySearch: "",
  runHistoryStateFilter: "all",
  repoInsightsSearch: "",
  repoInsightsStateFilter: "all",
  selectedRepoName: "",
  requestedRunId: "",
  requestedRepoName: "",
  agentBackendAvailable: false,
  agentAutopilotEnabled: false,
  agentMode: "safe",
  agentIntervalSec: 60,
  agentBusy: false,
  agentPlan: [],
  agentEvents: [],
  agentLastStepKey: "",
  agentLastStepAt: 0,
  agentLastAutoTickAt: 0,
  selectedRepoDetails: null,
  selectedRepoDetailsUpdatedAt: 0,
  pendingRepoDetailsFor: "",
  notificationConfig: null,
  notificationStatus: null,
  notificationEvents: [],
  notificationKnownAlertIds: [...DEFAULT_NOTIFY_ALERT_IDS],
  notificationEventsUpdatedAt: 0,
  notificationsBusy: false,
  taskQueueItems: [],
  taskQueueSummary: null,
  taskQueueUpdatedAt: 0,
  taskQueueBusy: false,
  controlStatus: null,
  controlBusy: false,
  seenToastAlerts: new Set(),
  inspectorOpen: false,
  inspectorTab: "summary",
  repoCatalog: [],
  repoCatalogUpdatedAt: 0,
  startRunModalOpen: false,
  startRunAction: "start",
  startRunMode: "auto",
  startRunSearch: "",
  startRunSelection: {},
  startRunBusy: false,
  route: "overview",
  lastNonLaunchRoute: "overview",
  runDetailView: "summary",
  repoDetailView: "summary",
  agentPilotExpanded: false,
};

function formatDuration(totalSeconds) {
  const sec = Number(totalSeconds || 0);
  const hours = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function pad2(value) {
  return String(Number(value || 0)).padStart(2, "0");
}

function formatLocalDate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())} local`;
}

function formatUtc(isoString) {
  if (!isoString) return "-";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  if (state.timeMode === "local") {
    return formatLocalDate(date);
  }
  return date.toISOString().replace("T", " ").replace(".000Z", "Z");
}

function formatPacific(isoString) {
  if (!isoString) return "-";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;

  const parts = PACIFIC_TIME_FORMATTER.formatToParts(date).reduce((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second} ${parts.timeZoneName || "PST"}`;
}

function formatRunId(runId) {
  const text = String(runId || "");
  const match = text.match(/^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})$/);
  if (!match) return text || "-";
  return `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:${match[6]}`;
}

function formatRelativeMs(msValue) {
  const diffMs = Math.max(0, Number(msValue || 0));
  const sec = Math.floor(diffMs / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatRelativeIso(isoString) {
  if (!isoString) return "-";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "-";
  return formatRelativeMs(Date.now() - date.getTime());
}

function normalizeRunCommit(entry = {}) {
  const hash = String(entry.hash || "").trim();
  const subject = String(entry.subject || "").trim();
  const repo = String(entry.repo || "unknown").trim();
  const ts = Number(entry.ts || 0);
  const timeUtc = String(entry.time_utc || "").trim();
  return {
    ts: Number.isFinite(ts) ? Math.max(0, ts) : 0,
    time_utc: timeUtc,
    repo,
    hash,
    subject,
    ambiguous: Boolean(entry.ambiguous),
    repo_candidates: Array.isArray(entry.repo_candidates) ? [...entry.repo_candidates] : [],
  };
}

function mergeRunCommits(baseCommits = [], incomingCommits = [], limit = RUN_COMMITS_VIEW_LIMIT) {
  const deduped = new Map();
  const upsert = (entry) => {
    const item = normalizeRunCommit(entry);
    const key = item.hash
      ? `hash:${item.hash}`
      : `repo:${item.repo}|subject:${item.subject}|time:${item.time_utc}`;
    const existing = deduped.get(key);
    if (!existing || item.ts > (existing.ts || 0)) {
      deduped.set(key, item);
    }
  };

  [...baseCommits, ...incomingCommits].forEach(upsert);

  const merged = [...deduped.values()].sort((left, right) => {
    const delta = (right.ts || 0) - (left.ts || 0);
    if (delta !== 0) return delta;
    const leftHash = String(left.hash || "");
    const rightHash = String(right.hash || "");
    return leftHash.localeCompare(rightHash);
  });
  return merged.slice(0, Math.max(0, Number(limit) || RUN_COMMITS_VIEW_LIMIT));
}

function clampInt(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

function normalizeRunState(rawState) {
  const text = String(rawState || "unknown");
  if (text.startsWith("running") || text === "starting") return "running";
  if (text.startsWith("finished")) return "finished";
  if (text === "ended") return "ended";
  if (text === "no_change") return "no_change";
  if (text.startsWith("skipped")) return "skipped";
  return "neutral";
}

function createStateBadge(rawState) {
  const badge = document.createElement("span");
  badge.className = `state-badge ${normalizeRunState(rawState)}`;
  badge.textContent = String(rawState || "unknown");
  return badge;
}

function isEditableTarget(target) {
  if (!target || !(target instanceof Element)) return false;
  const tag = String(target.tagName || "").toLowerCase();
  if (target.isContentEditable) return true;
  return tag === "input" || tag === "textarea" || tag === "select" || tag === "button";
}

function setCompactMode(enabled, persist = true) {
  state.compactMode = Boolean(enabled);
  document.body.classList.toggle("compact-mode", state.compactMode);
  elements.compactModeBtn.textContent = state.compactMode ? "Comfort Mode" : "Compact Mode";
  elements.heroCompactModeBtn.textContent = state.compactMode ? "Comfort Mode" : "Compact Mode";
  if (persist) {
    try {
      localStorage.setItem(COMPACT_MODE_STORAGE_KEY, state.compactMode ? "1" : "0");
    } catch {
      // Ignore storage errors in restrictive browser contexts.
    }
  }
}

function toggleCompactMode() {
  setCompactMode(!state.compactMode, true);
  syncUrlState();
}

function setDensityMode(mode, persist = true) {
  const normalized = String(mode || "").toLowerCase() === "dense" ? "dense" : "calm";
  state.densityMode = normalized;
  document.body.classList.toggle("density-dense", normalized === "dense");
  elements.densityModeBtn.textContent = normalized === "dense" ? "Density: Dense" : "Density: Calm";
  elements.heroDensityModeBtn.textContent = normalized === "dense" ? "Density: Dense" : "Density: Calm";
  if (persist) {
    try {
      localStorage.setItem(DENSITY_MODE_STORAGE_KEY, normalized);
    } catch {
      // Ignore storage errors in restrictive browser contexts.
    }
  }
}

function toggleDensityMode() {
  setDensityMode(state.densityMode === "dense" ? "calm" : "dense", true);
  syncUrlState();
}

function rerenderCachedData() {
  if (state.latestSnapshot) {
    renderSnapshot(state.latestSnapshot);
  } else {
    renderStreamStatus();
  }
  renderRunCommitTable();
  renderEvents(state.selectedRunEvents || []);
  renderRepoDetails(state.selectedRepoDetails || null);
  renderNotificationEvents(state.notificationEvents || []);
}

function setTimeMode(mode, persist = true) {
  const normalized = String(mode || "").toLowerCase() === "local" ? "local" : "utc";
  state.timeMode = normalized;
  elements.timeMode.value = normalized;
  if (persist) {
    try {
      localStorage.setItem(TIME_MODE_STORAGE_KEY, normalized);
    } catch {
      // Ignore storage errors in restrictive browser contexts.
    }
  }
}

function toggleTimeMode() {
  setTimeMode(state.timeMode === "local" ? "utc" : "local", true);
  syncUrlState();
  rerenderCachedData();
}

function setEventsAutoScroll(enabled, persist = true) {
  state.eventsAutoScroll = Boolean(enabled);
  elements.eventsAutoScrollBtn.textContent = state.eventsAutoScroll ? "Auto-scroll On" : "Auto-scroll Off";
  elements.eventsAutoScrollBtn.classList.toggle("active", state.eventsAutoScroll);
  if (persist) {
    try {
      localStorage.setItem(EVENTS_AUTOSCROLL_STORAGE_KEY, state.eventsAutoScroll ? "1" : "0");
    } catch {
      // Ignore storage errors in restrictive browser contexts.
    }
  }
}

function toggleEventsAutoScroll() {
  setEventsAutoScroll(!state.eventsAutoScroll, true);
  syncUrlState();
}

function setAgentAutopilotEnabled(enabled, persist = true) {
  state.agentAutopilotEnabled = Boolean(enabled);
  elements.agentAutopilotEnabled.checked = state.agentAutopilotEnabled;
  if (persist) {
    try {
      localStorage.setItem(AGENT_AUTOPILOT_STORAGE_KEY, state.agentAutopilotEnabled ? "1" : "0");
    } catch {
      // Ignore storage failures.
    }
  }
}

function toggleAgentAutopilotEnabled() {
  setAgentAutopilotEnabled(!state.agentAutopilotEnabled, true);
  appendAgentEvent("info", `manual: autopilot ${state.agentAutopilotEnabled ? "enabled" : "disabled"}`);
  syncUrlState();
}

function setAgentMode(mode, persist = true) {
  const normalized = String(mode || "").toLowerCase() === "assertive" ? "assertive" : "safe";
  state.agentMode = normalized;
  elements.agentMode.value = normalized;
  if (persist) {
    try {
      localStorage.setItem(AGENT_MODE_STORAGE_KEY, normalized);
    } catch {
      // Ignore storage failures.
    }
  }
}

function setAgentIntervalSec(seconds, persist = true) {
  const allowed = new Set([30, 60, 120, 180]);
  const normalized = allowed.has(Number(seconds)) ? Number(seconds) : 60;
  state.agentIntervalSec = normalized;
  elements.agentInterval.value = String(normalized);
  if (persist) {
    try {
      localStorage.setItem(AGENT_INTERVAL_STORAGE_KEY, String(normalized));
    } catch {
      // Ignore storage failures.
    }
  }
}

function appendAgentEvent(status, message) {
  const entry = {
    ts: new Date().toISOString(),
    status: String(status || "info"),
    message: String(message || ""),
  };
  state.agentEvents = [...state.agentEvents, entry].slice(-80);
}

function syncAgentFromServerStatus(agentStatus) {
  if (!agentStatus || typeof agentStatus !== "object") return;
  state.agentBackendAvailable = true;

  const config = agentStatus.config || {};
  if (config.mode === "safe" || config.mode === "assertive") {
    setAgentMode(config.mode, false);
  }
  if (Number.isFinite(Number(config.interval_seconds))) {
    setAgentIntervalSec(Number(config.interval_seconds), false);
  }
  if (Object.prototype.hasOwnProperty.call(config, "enabled")) {
    setAgentAutopilotEnabled(Boolean(config.enabled), false);
  }

  const serverPlan = Array.isArray(agentStatus.plan) ? agentStatus.plan : [];
  if (serverPlan.length) {
    state.agentPlan = serverPlan.map((step) => ({
      ...step,
      safeAutoAllowed: Boolean(step.safeAutoAllowed ?? step.safe_auto_allowed),
    }));
  }

  const events = Array.isArray(agentStatus?.state?.recent_actions) ? agentStatus.state.recent_actions : [];
  state.agentEvents = events.slice(-80).map((entry) => {
    const statusRaw = String(entry.status || "info").toLowerCase();
    const normalizedStatus = statusRaw === "sent" ? "ok" : statusRaw;
    const label = String(entry.label || entry.action || "action");
    const reason = String(entry.reason || "");
    const source = String(entry.source || "agent");
    return {
      ts: String(entry.ts || new Date().toISOString()),
      status: normalizedStatus,
      message: `${source}: ${label}${reason ? ` (${reason})` : ""}`,
    };
  });
}

async function saveAgentConfigToServer() {
  if (!state.agentBackendAvailable) return true;
  try {
    const payload = await apiPost("/api/agent/config", {
      enabled: state.agentAutopilotEnabled,
      mode: state.agentMode,
      interval_seconds: state.agentIntervalSec,
    });
    syncAgentFromServerStatus(payload.status || null);
    return true;
  } catch (error) {
    appendAgentEvent("critical", `manual: failed to save agent config (${String(error)})`);
    renderAgentPilot(state.latestSnapshot || {});
    return false;
  }
}

async function runAgentServerAction(path, payload) {
  if (!state.agentBackendAvailable) return false;
  try {
    const response = await apiPost(path, payload || {});
    syncAgentFromServerStatus(response.agent_status || null);
    const actionName = String(path || "").split("/").pop() || "agent_action";
    appendAgentEvent(response.ok ? "ok" : "warn", `server: ${actionName}${response.ok ? " completed" : " blocked"}`);
    await loadSnapshot();
    await loadRepoInsights(true);
    renderAgentPilot(state.latestSnapshot || {});
    return Boolean(response.ok);
  } catch (error) {
    appendAgentEvent("critical", `agent request failed (${String(error)})`);
    renderAgentPilot(state.latestSnapshot || {});
    return false;
  }
}

function setShortcutsOpen(open) {
  state.shortcutsOpen = Boolean(open);
  elements.shortcutsPanel.classList.toggle("hidden", !state.shortcutsOpen);
  elements.shortcutsPanel.setAttribute("aria-hidden", state.shortcutsOpen ? "false" : "true");
  elements.shortcutsBtn.textContent = state.shortcutsOpen ? "Hide Shortcuts" : "Shortcuts";
  elements.heroShortcutsBtn.textContent = state.shortcutsOpen ? "Hide Shortcuts" : "Shortcuts";
}

function toggleShortcutsPanel() {
  setShortcutsOpen(!state.shortcutsOpen);
}

function normalizeRoute(route) {
  const key = String(route || "").trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(ROUTE_PATH_MAP, key)) return key;
  return "overview";
}

function normalizeRunDetailView(view) {
  const key = String(view || "").trim().toLowerCase();
  if (["summary", "commits", "events", "repos", "logs"].includes(key)) return key;
  return "summary";
}

function normalizeRepoDetailView(view) {
  const key = String(view || "").trim().toLowerCase();
  if (["summary", "commits", "timeline"].includes(key)) return key;
  return "summary";
}

function runDetailFromInspectorTab(tab) {
  return normalizeRunDetailView(tab);
}

function repoDetailFromInspectorTab(tab) {
  const normalized = String(tab || "").trim().toLowerCase();
  if (normalized === "commits") return "commits";
  if (normalized === "repos") return "timeline";
  return "summary";
}

function inspectorTabForRunDetail(view) {
  return normalizeRunDetailView(view);
}

function inspectorTabForRepoDetail(view) {
  const normalized = normalizeRepoDetailView(view);
  if (normalized === "commits") return "commits";
  if (normalized === "timeline") return "repos";
  return "summary";
}

function decodePathToken(value) {
  const raw = String(value || "");
  if (!raw) return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function routeInfoFromPathname(pathname) {
  let normalizedPath = String(pathname || "/").trim();
  if (!normalizedPath.startsWith("/")) normalizedPath = `/${normalizedPath}`;
  if (normalizedPath.length > 1) normalizedPath = normalizedPath.replace(/\/+$/, "");
  if (normalizedPath === "/") {
    return { route: "overview", runId: "", repoName: "", runDetailView: "summary", repoDetailView: "summary" };
  }

  const segments = normalizedPath.split("/").filter(Boolean);
  const base = String(segments[0] || "").toLowerCase();
  if (base === "runs") {
    const runId = decodePathToken(segments[1] || "");
    const runDetailView = normalizeRunDetailView(segments[2] || "summary");
    return {
      route: "runs",
      runId,
      repoName: "",
      runDetailView,
      repoDetailView: "summary",
    };
  }
  if (base === "repos") {
    const repoName = decodePathToken(segments[1] || "");
    const repoDetailView = normalizeRepoDetailView(segments[2] || "summary");
    return {
      route: "repos",
      runId: "",
      repoName,
      runDetailView: "summary",
      repoDetailView,
    };
  }
  if (base === "alerts" || base === "controls" || base === "launch") {
    return { route: base, runId: "", repoName: "", runDetailView: "summary", repoDetailView: "summary" };
  }
  return { route: "overview", runId: "", repoName: "", runDetailView: "summary", repoDetailView: "summary" };
}

function pathForRouteState() {
  const route = state.route;
  const normalized = normalizeRoute(route);
  if (normalized === "runs") {
    const runId = String(state.selectedRunId || "").trim();
    if (!runId) return "/runs";
    const detail = normalizeRunDetailView(state.runDetailView);
    if (detail !== "summary") {
      return `/runs/${encodeURIComponent(runId)}/${encodeURIComponent(detail)}`;
    }
    return `/runs/${encodeURIComponent(runId)}`;
  }
  if (normalized === "repos") {
    const repoName = String(state.selectedRepoName || "").trim();
    if (!repoName) return "/repos";
    const detail = normalizeRepoDetailView(state.repoDetailView);
    if (detail !== "summary") {
      return `/repos/${encodeURIComponent(repoName)}/${encodeURIComponent(detail)}`;
    }
    return `/repos/${encodeURIComponent(repoName)}`;
  }
  return ROUTE_PATH_MAP[normalized] || "/";
}

function pathForRunDetail(runId, detailView = "summary") {
  const id = String(runId || "").trim();
  if (!id) return "/runs";
  const detail = normalizeRunDetailView(detailView);
  if (detail !== "summary") {
    return `/runs/${encodeURIComponent(id)}/${encodeURIComponent(detail)}`;
  }
  return `/runs/${encodeURIComponent(id)}`;
}

function pathForRepoDetail(repoName, detailView = "summary") {
  const name = String(repoName || "").trim();
  if (!name) return "/repos";
  const detail = normalizeRepoDetailView(detailView);
  if (detail !== "summary") {
    return `/repos/${encodeURIComponent(name)}/${encodeURIComponent(detail)}`;
  }
  return `/repos/${encodeURIComponent(name)}`;
}

function absoluteUrlForPath(pathname) {
  return new URL(String(pathname || "/"), window.location.origin).toString();
}

async function copyTextToClipboard(text) {
  const value = String(text || "");
  if (!value) throw new Error("empty clipboard value");
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "readonly");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!copied) {
    throw new Error("clipboard unavailable");
  }
}

async function copyShareLink(pathname, subjectLabel) {
  const link = absoluteUrlForPath(pathname);
  try {
    await copyTextToClipboard(link);
    toastAlert({
      id: "share_link_copied",
      run_id: "",
      severity: "ok",
      title: "Link copied",
      detail: `${subjectLabel}: ${link}`,
    });
  } catch (error) {
    toastAlert({
      id: "share_link_copy_failed",
      run_id: "",
      severity: "critical",
      title: "Copy failed",
      detail: `${subjectLabel}: ${String(error)}`,
    });
  }
}

function applyRouteVisibility() {
  const route = normalizeRoute(state.route);
  document.body.dataset.route = route;
  state.route = route;
  if (route !== "launch") {
    state.lastNonLaunchRoute = route;
  }
  const sections = [...document.querySelectorAll(".shell > section[data-routes]")];
  sections.forEach((section) => {
    const raw = String(section.getAttribute("data-routes") || "");
    const supported = raw
      .split(/\s+/)
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
    const visible = supported.includes(route);
    section.classList.toggle("route-hidden", !visible);
  });
  const routeButtons = [...(elements.routeNav?.querySelectorAll("button[data-route]") || [])];
  routeButtons.forEach((button) => {
    const buttonRoute = normalizeRoute(button.dataset.route || "overview");
    const active = buttonRoute === route;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });
}

function setRoute(route, options = {}) {
  const normalized = normalizeRoute(route);
  const updateUrl = options.updateUrl !== false;
  const replaceHistory = options.replaceHistory !== false;
  if (state.route === normalized) {
    applyRouteVisibility();
    if (updateUrl) syncUrlState({ replace: replaceHistory });
    return;
  }
  state.route = normalized;
  applyRouteVisibility();
  renderDetailRouteControls();
  if (normalized === "runs") {
    setInspectorTab(inspectorTabForRunDetail(state.runDetailView), false);
  } else if (normalized === "repos") {
    setInspectorTab(inspectorTabForRepoDetail(state.repoDetailView), false);
  }
  if (normalized !== "launch" && state.startRunModalOpen) {
    setStartRunModalOpen(false);
  }
  if (updateUrl) syncUrlState({ replace: replaceHistory });
}

function runSectionForDetailView(view) {
  const normalized = normalizeRunDetailView(view);
  if (normalized === "commits") return "runWorkspaceSection";
  if (normalized === "events") return "eventsSection";
  if (normalized === "repos") return "commitStreamSection";
  if (normalized === "logs") return "runLogSection";
  return "runHistorySection";
}

function repoSectionForDetailView(view) {
  const normalized = normalizeRepoDetailView(view);
  if (normalized === "commits" || normalized === "timeline") return "repoDrilldownSection";
  return "repoInsightsSection";
}

function renderDetailRouteControls() {
  const runView = normalizeRunDetailView(state.runDetailView);
  const repoView = normalizeRepoDetailView(state.repoDetailView);
  const hasRun = Boolean(String(state.selectedRunId || "").trim());
  const hasRepo = Boolean(String(state.selectedRepoName || "").trim());
  const runButtons = [...(elements.runDetailNav?.querySelectorAll("button[data-run-view]") || [])];
  runButtons.forEach((button) => {
    const active = normalizeRunDetailView(button.dataset.runView || "summary") === runView;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
    button.disabled = !hasRun;
  });
  const repoButtons = [...(elements.repoDetailNav?.querySelectorAll("button[data-repo-view]") || [])];
  repoButtons.forEach((button) => {
    const active = normalizeRepoDetailView(button.dataset.repoView || "summary") === repoView;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
    button.disabled = !hasRepo;
  });
}

function setRunDetailView(view, options = {}) {
  const normalized = normalizeRunDetailView(view);
  const updateUrl = options.updateUrl !== false;
  const focus = Boolean(options.focus);
  state.runDetailView = normalized;
  if (state.route === "runs") {
    setInspectorTab(inspectorTabForRunDetail(normalized), false);
  }
  renderDetailRouteControls();
  if (updateUrl) syncUrlState({ replace: true });
  if (focus && state.route === "runs") {
    scrollToSection(runSectionForDetailView(normalized));
  }
}

function setRepoDetailView(view, options = {}) {
  const normalized = normalizeRepoDetailView(view);
  const updateUrl = options.updateUrl !== false;
  const focus = Boolean(options.focus);
  state.repoDetailView = normalized;
  if (state.route === "repos") {
    setInspectorTab(inspectorTabForRepoDetail(normalized), false);
  }
  renderDetailRouteControls();
  if (updateUrl) syncUrlState({ replace: true });
  if (focus && state.route === "repos") {
    scrollToSection(repoSectionForDetailView(normalized));
  }
}

function setOrDeleteSearchParam(params, key, value, fallbackValue = "") {
  const normalized = String(value ?? "");
  const fallback = String(fallbackValue ?? "");
  if (!normalized || normalized === fallback) {
    params.delete(key);
    return;
  }
  params.set(key, normalized);
}

function syncUrlState(options = {}) {
  const replace = options.replace !== false;
  const url = new URL(window.location.href);
  const params = url.searchParams;
  setOrDeleteSearchParam(params, URL_PARAM_MAP.commitHours, state.commitHours, "2");
  setOrDeleteSearchParam(params, URL_PARAM_MAP.repoInsightsHours, state.repoInsightsHours, "24");
  setOrDeleteSearchParam(params, URL_PARAM_MAP.runHistorySearch, state.runHistorySearch, "");
  setOrDeleteSearchParam(params, URL_PARAM_MAP.runHistoryStateFilter, state.runHistoryStateFilter, "all");
  setOrDeleteSearchParam(params, URL_PARAM_MAP.repoInsightsSearch, state.repoInsightsSearch, "");
  setOrDeleteSearchParam(params, URL_PARAM_MAP.repoInsightsStateFilter, state.repoInsightsStateFilter, "all");
  setOrDeleteSearchParam(params, URL_PARAM_MAP.compact, state.compactMode ? "1" : "0", "0");
  setOrDeleteSearchParam(params, URL_PARAM_MAP.density, state.densityMode, "calm");
  setOrDeleteSearchParam(params, URL_PARAM_MAP.inspectorOpen, state.inspectorOpen ? "1" : "0", "0");
  setOrDeleteSearchParam(params, URL_PARAM_MAP.inspectorTab, state.inspectorTab, "summary");
  setOrDeleteSearchParam(params, URL_PARAM_MAP.timeMode, state.timeMode, "utc");
  setOrDeleteSearchParam(params, URL_PARAM_MAP.eventsAutoScroll, state.eventsAutoScroll ? "1" : "0", "1");
  setOrDeleteSearchParam(params, URL_PARAM_MAP.selectedRunId, state.selectedRunId || "", "");
  setOrDeleteSearchParam(params, URL_PARAM_MAP.selectedRepoName, state.selectedRepoName || "", "");
  setOrDeleteSearchParam(params, URL_PARAM_MAP.agentAuto, state.agentAutopilotEnabled ? "1" : "0", "0");
  setOrDeleteSearchParam(params, URL_PARAM_MAP.agentMode, state.agentMode, "safe");
  setOrDeleteSearchParam(params, URL_PARAM_MAP.agentInterval, state.agentIntervalSec, "60");
  const pathname = pathForRouteState();
  const nextPath = `${pathname}${params.toString() ? `?${params.toString()}` : ""}${url.hash || ""}`;
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash || ""}`;
  if (nextPath !== currentPath) {
    window.history[replace ? "replaceState" : "pushState"](null, "", nextPath);
  }
}

function applyUrlStateFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const routeInfo = routeInfoFromPathname(window.location.pathname);
  const commitHours = params.get(URL_PARAM_MAP.commitHours);
  const insightsHours = params.get(URL_PARAM_MAP.repoInsightsHours);
  const runHistorySearch = params.get(URL_PARAM_MAP.runHistorySearch);
  const runHistoryState = params.get(URL_PARAM_MAP.runHistoryStateFilter);
  const repoInsightsSearch = params.get(URL_PARAM_MAP.repoInsightsSearch);
  const repoInsightsState = params.get(URL_PARAM_MAP.repoInsightsStateFilter);
  const compactMode = params.get(URL_PARAM_MAP.compact);
  const densityMode = params.get(URL_PARAM_MAP.density);
  const inspectorOpen = params.get(URL_PARAM_MAP.inspectorOpen);
  const inspectorTab = params.get(URL_PARAM_MAP.inspectorTab);
  const timeMode = params.get(URL_PARAM_MAP.timeMode);
  const eventsAutoScroll = params.get(URL_PARAM_MAP.eventsAutoScroll);
  const selectedRunId = params.get(URL_PARAM_MAP.selectedRunId);
  const selectedRepoName = params.get(URL_PARAM_MAP.selectedRepoName);
  const agentAuto = params.get(URL_PARAM_MAP.agentAuto);
  const agentMode = params.get(URL_PARAM_MAP.agentMode);
  const agentInterval = params.get(URL_PARAM_MAP.agentInterval);
  const legacyLauncherMode = params.get("launch");

  const commitOptions = [...elements.commitHours.options].map((item) => String(item.value || ""));
  const insightsOptions = [...elements.repoInsightsHours.options].map((item) => String(item.value || ""));

  if (commitHours && commitOptions.includes(commitHours)) {
    elements.commitHours.value = commitHours;
  }
  if (insightsHours && insightsOptions.includes(insightsHours)) {
    elements.repoInsightsHours.value = insightsHours;
  }

  if (runHistorySearch !== null) {
    elements.runHistorySearch.value = runHistorySearch;
  }
  if (repoInsightsSearch !== null) {
    elements.repoInsightsSearch.value = repoInsightsSearch;
  }

  const validRunHistoryStates = new Set(["all", "running", "finished"]);
  if (runHistoryState && validRunHistoryStates.has(runHistoryState)) {
    elements.runHistoryStateFilter.value = runHistoryState;
  }

  const validRepoInsightStates = new Set(["all", "active", "changed", "no_change", "lock_skip"]);
  if (repoInsightsState && validRepoInsightStates.has(repoInsightsState)) {
    elements.repoInsightsStateFilter.value = repoInsightsState;
  }

  if (compactMode === "1" || compactMode === "true") {
    setCompactMode(true, false);
  } else if (compactMode === "0" || compactMode === "false") {
    setCompactMode(false, false);
  }
  if (densityMode === "calm" || densityMode === "dense") {
    setDensityMode(densityMode, false);
  }
  if (inspectorTab && ["summary", "commits", "events", "repos"].includes(inspectorTab)) {
    setInspectorTab(inspectorTab, false);
  }
  if (inspectorOpen === "1" || inspectorOpen === "true") {
    setInspectorOpen(true, false);
  } else if (inspectorOpen === "0" || inspectorOpen === "false") {
    setInspectorOpen(false, false);
  }

  if (timeMode === "local" || timeMode === "utc") {
    setTimeMode(timeMode, false);
  }
  if (eventsAutoScroll === "1" || eventsAutoScroll === "true") {
    setEventsAutoScroll(true, false);
  } else if (eventsAutoScroll === "0" || eventsAutoScroll === "false") {
    setEventsAutoScroll(false, false);
  }

  if (selectedRunId) state.requestedRunId = selectedRunId;
  if (selectedRepoName) state.requestedRepoName = selectedRepoName;
  if (routeInfo.runId) state.requestedRunId = routeInfo.runId;
  if (routeInfo.repoName) state.requestedRepoName = routeInfo.repoName;
  if (agentAuto === "1" || agentAuto === "true") {
    setAgentAutopilotEnabled(true, false);
  } else if (agentAuto === "0" || agentAuto === "false") {
    setAgentAutopilotEnabled(false, false);
  }
  if (agentMode === "safe" || agentMode === "assertive") {
    setAgentMode(agentMode, false);
  }
  if (agentInterval && ["30", "60", "120", "180"].includes(agentInterval)) {
    setAgentIntervalSec(Number(agentInterval), false);
  }
  state.runDetailView = normalizeRunDetailView(routeInfo.runDetailView || "summary");
  state.repoDetailView = normalizeRepoDetailView(routeInfo.repoDetailView || "summary");
  renderDetailRouteControls();
  const route = legacyLauncherMode === "1" || legacyLauncherMode === "true" ? "launch" : routeInfo.route;
  setRoute(route, { updateUrl: false, replaceHistory: true });
}

function commandPaletteActions() {
  const active = Boolean(state.controlStatus?.active);
  const loopGroups = Number(state.controlStatus?.loop_groups_count || 0);
  return [
    {
      id: "refresh_now",
      label: "Refresh now",
      detail: "Reload snapshot, repo insights, run details, and notification events.",
      keywords: "refresh reload sync snapshot",
      enabled: true,
      run: async () => refreshNow(),
    },
    {
      id: "toggle_stream",
      label: state.streamPaused ? "Resume live stream" : "Pause live stream",
      detail: "Toggle Server-Sent Events streaming updates.",
      keywords: "stream pause resume live",
      enabled: true,
      run: async () => {
        toggleStreamPause();
      },
    },
    {
      id: "toggle_compact",
      label: state.compactMode ? "Switch to comfort mode" : "Switch to compact mode",
      detail: "Toggle dense table/card spacing for long monitoring sessions.",
      keywords: "compact comfort dense spacing",
      enabled: true,
      run: async () => {
        toggleCompactMode();
      },
    },
    {
      id: "toggle_density",
      label: state.densityMode === "dense" ? "Switch to calm density" : "Switch to dense density",
      detail: "Control event/telemetry verbosity in primary views.",
      keywords: "density calm dense signal noise",
      enabled: true,
      run: async () => {
        toggleDensityMode();
        rerenderCachedData();
      },
    },
    {
      id: "toggle_time_mode",
      label: state.timeMode === "local" ? "Switch to UTC time mode" : "Switch to local time mode",
      detail: "Toggle timestamp rendering between UTC and local timezone.",
      keywords: "time timezone utc local timestamps",
      enabled: true,
      run: async () => {
        toggleTimeMode();
      },
    },
    {
      id: "toggle_events_autoscroll",
      label: state.eventsAutoScroll ? "Disable events auto-scroll" : "Enable events auto-scroll",
      detail: "Keep events pane pinned to newest lines or allow manual inspection.",
      keywords: "events logs terminal autoscroll",
      enabled: true,
      run: async () => {
        toggleEventsAutoScroll();
      },
    },
    {
      id: "toggle_shortcuts",
      label: state.shortcutsOpen ? "Hide shortcuts help" : "Show shortcuts help",
      detail: "Open or close keyboard shortcut reference panel.",
      keywords: "shortcuts help hotkeys",
      enabled: true,
      run: async () => {
        toggleShortcutsPanel();
      },
    },
    {
      id: "toggle_agent_autopilot",
      label: state.agentAutopilotEnabled ? "Disable agent autopilot" : "Enable agent autopilot",
      detail: "Toggle autonomous remediation based on current plan and guardrails.",
      keywords: "agent autopilot autonomous mode",
      enabled: true,
      run: async () => {
        toggleAgentAutopilotEnabled();
        await saveAgentConfigToServer();
        renderAgentPilot(state.latestSnapshot || {});
      },
    },
    {
      id: "run_agent_next_step",
      label: "Run next agent step",
      detail: "Execute the highest-priority runnable step from the agent plan.",
      keywords: "agent next step execute action",
      enabled: !state.agentBusy,
      run: async () => {
        await runNextAgentStep("manual");
      },
    },
    {
      id: "run_agent_plan",
      label: "Run full agent plan",
      detail: "Execute a guarded sequence of plan steps.",
      keywords: "agent plan execute sequence",
      enabled: !state.agentBusy,
      run: async () => {
        await runFullAgentPlan("manual");
      },
    },
    {
      id: "open_inspector",
      label: state.inspectorOpen ? "Close inspector drawer" : "Open inspector drawer",
      detail: "Open focused run/repo drilldown without expanding all panels.",
      keywords: "inspector drawer drilldown commits events repos",
      enabled: true,
      run: async () => {
        if (state.inspectorOpen) closeInspector();
        else openInspector("summary");
      },
    },
    {
      id: "collapse_all_panels",
      label: "Collapse all panels",
      detail: "Collapse dashboard sections to scan only headings.",
      keywords: "collapse panels compact headings",
      enabled: true,
      run: async () => {
        setAllPanelsCollapsed(true);
      },
    },
    {
      id: "expand_all_panels",
      label: "Expand all panels",
      detail: "Expand all dashboard sections.",
      keywords: "expand panels restore sections",
      enabled: true,
      run: async () => {
        setAllPanelsCollapsed(false);
      },
    },
    {
      id: "jump_operations",
      label: "Jump to run triage",
      detail: "Open alerts view and focus run triage.",
      keywords: "jump navigate run triage health",
      enabled: true,
      run: async () => {
        navigateToSection("alerts", "actionCenterSection");
      },
    },
    {
      id: "jump_repo_insights",
      label: "Jump to repo insights",
      detail: "Open repos view and focus insights table.",
      keywords: "jump navigate repo insights section",
      enabled: true,
      run: async () => {
        navigateToSection("repos", "repoInsightsSection");
      },
    },
    {
      id: "jump_run_history",
      label: "Jump to run history",
      detail: "Open runs view and focus run history.",
      keywords: "jump navigate run history section",
      enabled: true,
      run: async () => {
        navigateToSection("runs", "runHistorySection");
      },
    },
    {
      id: "focus_run_history_search",
      label: "Focus run history search",
      detail: "Jump cursor into run history filter input.",
      keywords: "focus run history search",
      enabled: true,
      run: async () => {
        elements.runHistorySearch.focus();
        elements.runHistorySearch.select();
      },
    },
    {
      id: "focus_repo_insights_search",
      label: "Focus repo insights search",
      detail: "Jump cursor into repo insights filter input.",
      keywords: "focus repo insights search",
      enabled: true,
      run: async () => {
        elements.repoInsightsSearch.focus();
        elements.repoInsightsSearch.select();
      },
    },
    {
      id: "start_run",
      label: "Open run launcher",
      detail: "Open dedicated launcher page for repo selection and run budgets.",
      keywords: "start run launch reactor",
      enabled: !active,
      run: async () => {
        await openRunLauncherPage("start");
      },
    },
    {
      id: "stop_run",
      label: "Stop run loop",
      detail: "Stop active run loop gracefully.",
      keywords: "stop run halt reactor",
      enabled: active,
      run: async () => runControlAction("stop"),
    },
    {
      id: "restart_run",
      label: "Restart run loop",
      detail: "Restart active run loop with current settings.",
      keywords: "restart run reactor",
      enabled: active,
      run: async () => runControlAction("restart"),
    },
    {
      id: "normalize_loops",
      label: "Normalize duplicate loop groups",
      detail: "Keep one loop process group and stop duplicate groups.",
      keywords: "normalize loops duplicate process groups",
      enabled: loopGroups > 1,
      run: async () => runControlAction("normalize"),
    },
  ];
}

function filteredCommandPaletteActions() {
  const query = String(state.commandPaletteQuery || "").trim().toLowerCase();
  const actions = commandPaletteActions();
  if (!query) return actions;
  return actions.filter((action) => {
    const haystack = `${action.label} ${action.detail} ${action.keywords || ""}`.toLowerCase();
    return haystack.includes(query);
  });
}

function renderCommandPalette() {
  if (!state.commandPaletteOpen) return;
  const actions = filteredCommandPaletteActions();
  if (!actions.length) {
    state.commandPaletteSelection = 0;
  } else if (state.commandPaletteSelection >= actions.length) {
    state.commandPaletteSelection = actions.length - 1;
  } else if (state.commandPaletteSelection < 0) {
    state.commandPaletteSelection = 0;
  }

  elements.commandPaletteMeta.textContent = `${actions.length} actions`;
  clearNode(elements.commandPaletteList);

  if (!actions.length) {
    const empty = document.createElement("p");
    empty.className = "muted command-empty";
    empty.textContent = "No matching command.";
    elements.commandPaletteList.appendChild(empty);
    return;
  }

  actions.forEach((action, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "command-item";
    if (index === state.commandPaletteSelection) button.classList.add("selected");
    if (!action.enabled) button.classList.add("disabled");
    button.disabled = !action.enabled;
    button.dataset.index = String(index);

    const title = document.createElement("span");
    title.className = "command-item-title";
    title.textContent = action.label;

    const detail = document.createElement("span");
    detail.className = "command-item-detail";
    detail.textContent = action.detail;

    button.append(title, detail);
    elements.commandPaletteList.appendChild(button);
  });
}

function setCommandPaletteOpen(open) {
  state.commandPaletteOpen = Boolean(open);
  elements.commandPaletteOverlay.classList.toggle("hidden", !state.commandPaletteOpen);
  elements.commandPaletteOverlay.setAttribute("aria-hidden", state.commandPaletteOpen ? "false" : "true");
  elements.commandPaletteBtn.textContent = state.commandPaletteOpen ? "Close Command" : "Command";
  elements.heroCommandBtn.textContent = state.commandPaletteOpen ? "Close Command" : "Command";

  if (state.commandPaletteOpen) {
    setShortcutsOpen(false);
    state.commandPaletteQuery = "";
    state.commandPaletteSelection = 0;
    elements.commandPaletteInput.value = "";
    renderCommandPalette();
    window.setTimeout(() => {
      elements.commandPaletteInput.focus();
      elements.commandPaletteInput.select();
    }, 0);
  }
}

function setAgentPilotExpanded(expanded) {
  state.agentPilotExpanded = Boolean(expanded);
  elements.agentPilotBody.classList.toggle("hidden", !state.agentPilotExpanded);
  elements.agentPilotToggleBtn.textContent = state.agentPilotExpanded ? "Hide" : "Show";
  elements.agentPilotToggleBtn.classList.toggle("active", state.agentPilotExpanded);
}

function toggleCommandPalette() {
  setCommandPaletteOpen(!state.commandPaletteOpen);
}

function moveCommandPaletteSelection(delta) {
  const actions = filteredCommandPaletteActions();
  if (!actions.length) return;
  const next = (state.commandPaletteSelection + delta + actions.length) % actions.length;
  state.commandPaletteSelection = next;
  renderCommandPalette();
}

async function executeCommandPaletteSelection(index = state.commandPaletteSelection) {
  const actions = filteredCommandPaletteActions();
  const selected = actions[index];
  if (!selected || !selected.enabled) return;
  setCommandPaletteOpen(false);
  try {
    await selected.run();
  } catch (error) {
    console.error(error);
    toastAlert({
      id: "command_palette_action_error",
      run_id: "",
      severity: "critical",
      title: "Command failed",
      detail: String(error),
    });
  }
}

function panelStorageKey(panel) {
  const explicitId = String(panel.id || "").trim();
  if (explicitId) return explicitId;
  const heading = panel.querySelector(".panel-head h2");
  if (heading) {
    return String(heading.textContent || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }
  return `panel_${Math.random().toString(36).slice(2, 10)}`;
}

function saveCollapsedPanels() {
  try {
    localStorage.setItem(COLLAPSED_PANELS_STORAGE_KEY, JSON.stringify([...state.collapsedPanels]));
  } catch {
    // Ignore storage failures.
  }
}

function loadCollapsedPanels() {
  try {
    const raw = localStorage.getItem(COLLAPSED_PANELS_STORAGE_KEY);
    if (!raw) {
      state.collapsedPanelsLoaded = false;
      return;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      state.collapsedPanels = new Set(parsed.map((item) => String(item || "")));
      state.collapsedPanelsLoaded = true;
    }
  } catch {
    state.collapsedPanels = new Set();
    state.collapsedPanelsLoaded = false;
  }
}

function setPanelCollapsed(panel, collapsed) {
  const key = String(panel.dataset.panelKey || "");
  if (!key) return;
  panel.classList.toggle("collapsed", collapsed);
  if (collapsed) {
    state.collapsedPanels.add(key);
  } else {
    state.collapsedPanels.delete(key);
  }
  const button = panel.querySelector("button.panel-toggle-btn");
  if (button) {
    button.textContent = collapsed ? "Expand" : "Collapse";
  }
}

function togglePanelCollapsed(panel) {
  const currently = panel.classList.contains("collapsed");
  setPanelCollapsed(panel, !currently);
  saveCollapsedPanels();
}

function collapsiblePanels() {
  return [...document.querySelectorAll(".panel[data-panel-key]")];
}

function hasAnyExpandedCollapsiblePanel() {
  return collapsiblePanels().some((panel) => !panel.classList.contains("collapsed"));
}

function setAllPanelsCollapsed(collapsed) {
  const panels = collapsiblePanels();
  panels.forEach((panel) => setPanelCollapsed(panel, collapsed));
  saveCollapsedPanels();
  elements.collapseAllBtn.textContent = collapsed ? "Expand All" : "Collapse All";
}

function initPanelCollapseControls() {
  const panels = [...document.querySelectorAll(".panel")];
  panels.forEach((panel) => {
    if (String(panel.getAttribute("data-collapsible") || "").toLowerCase() === "false") return;
    const head = panel.querySelector(".panel-head");
    if (!head) return;
    const key = panelStorageKey(panel);
    panel.dataset.panelKey = key;

    if (head.querySelector("button.panel-toggle-btn")) return;
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "panel-toggle-btn";
    toggle.textContent = "Collapse";
    toggle.addEventListener("click", () => {
      togglePanelCollapsed(panel);
      elements.collapseAllBtn.textContent = hasAnyExpandedCollapsiblePanel() ? "Collapse All" : "Expand All";
    });
    head.appendChild(toggle);
  });

  panels.forEach((panel) => {
    const key = String(panel.dataset.panelKey || "");
    let shouldCollapse = state.collapsedPanels.has(key);
    if (!state.collapsedPanelsLoaded && panel.id && DEFAULT_COLLAPSED_PANEL_IDS.has(panel.id)) {
      shouldCollapse = true;
      state.collapsedPanels.add(key);
    }
    setPanelCollapsed(panel, shouldCollapse);
  });

  elements.collapseAllBtn.textContent = hasAnyExpandedCollapsiblePanel() ? "Collapse All" : "Expand All";
}

function scrollToSection(sectionId) {
  const target = document.getElementById(sectionId);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function navigateToSection(route, sectionId) {
  setRoute(route, { updateUrl: true, replaceHistory: false });
  window.setTimeout(() => {
    scrollToSection(sectionId);
  }, 0);
}

function setActiveSection(sectionId) {
  state.activeSectionId = String(sectionId || "");
  const buttons = [...elements.jumpNav.querySelectorAll("button[data-target]")];
  buttons.forEach((button) => {
    const isActive = String(button.dataset.target || "") === state.activeSectionId;
    button.classList.toggle("active", isActive);
  });
}

function initJumpNav() {
  const buttons = [...elements.jumpNav.querySelectorAll("button[data-target]")];
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = String(button.dataset.target || "");
      if (!target) return;
      const section = document.getElementById(target);
      if (section instanceof HTMLElement && section.classList.contains("route-hidden")) {
        const rawRoutes = String(section.getAttribute("data-routes") || "");
        const firstRoute = rawRoutes
          .split(/\s+/)
          .map((item) => item.trim().toLowerCase())
          .find((item) => Boolean(item));
        if (firstRoute) {
          setRoute(firstRoute, { updateUrl: true, replaceHistory: false });
        }
      }
      setActiveSection(target);
      scrollToSection(target);
    });
  });
  elements.jumpNav.addEventListener("keydown", (event) => {
    const keys = new Set(["ArrowRight", "ArrowLeft", "Home", "End", "Enter", " "]);
    if (!keys.has(String(event.key || ""))) return;
    const controls = [...elements.jumpNav.querySelectorAll("button[data-target]")];
    if (!controls.length) return;
    const currentIndex = controls.indexOf(document.activeElement);

    if (event.key === "Enter" || event.key === " ") {
      if (currentIndex < 0) return;
      event.preventDefault();
      controls[currentIndex].click();
      return;
    }

    event.preventDefault();
    if (event.key === "Home") {
      controls[0].focus();
      return;
    }
    if (event.key === "End") {
      controls[controls.length - 1].focus();
      return;
    }
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const start = currentIndex >= 0 ? currentIndex : 0;
    const next = (start + delta + controls.length) % controls.length;
    controls[next].focus();
  });

  const sections = buttons
    .map((button) => document.getElementById(String(button.dataset.target || "")))
    .filter((item) => item instanceof HTMLElement);
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (!visible.length) return;
      const top = visible[0].target;
      if (top && top.id) {
        setActiveSection(top.id);
      }
    },
    { root: null, rootMargin: "-20% 0px -65% 0px", threshold: [0.05, 0.2, 0.4, 0.65] },
  );

  sections.forEach((section) => observer.observe(section));
  if (sections[0]?.id) {
    setActiveSection(sections[0].id);
  }
}

function focusJumpNav() {
  const buttons = [...elements.jumpNav.querySelectorAll("button[data-target]")];
  if (!buttons.length) return;
  const active = buttons.find((button) => button.classList.contains("active"));
  (active || buttons[0]).focus();
}

function renderStreamStatus(note = "") {
  const pill = elements.streamStatePill;
  pill.classList.remove("live", "paused", "disconnected", "connecting");
  let text = "Connecting";
  let klass = "connecting";

  if (state.streamPaused) {
    text = "Paused";
    klass = "paused";
  } else if (state.streamConnected) {
    text = "Live";
    klass = "live";
  } else if (state.streamLastMessageAt > 0) {
    text = "Reconnecting";
    klass = "disconnected";
  }

  pill.textContent = text;
  pill.classList.add(klass);
  elements.pauseStreamBtn.textContent = state.streamPaused ? "Resume Live" : "Pause Live";

  const base = state.streamLastMessageAt
    ? `Last frame ${formatRelativeMs(Date.now() - state.streamLastMessageAt)}`
    : "Waiting for first stream frame";
  const suffix = note ? ` • ${note}` : "";
  elements.streamMeta.textContent = `${base}${suffix}`;
}

function clearNode(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function createMetricCard(label, value, detail = "", options = {}) {
  const card = document.createElement("article");
  card.className = "metric-card";

  const labelEl = document.createElement("p");
  labelEl.className = "metric-label";
  labelEl.textContent = label;

  const valueEl = document.createElement("p");
  valueEl.className = "metric-value";
  valueEl.textContent = value;

  const detailEl = document.createElement("p");
  detailEl.className = "metric-detail";
  detailEl.textContent = detail;

  card.append(labelEl, valueEl, detailEl);
  if (typeof options.onClick === "function") {
    card.classList.add("interactive");
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    if (options.title) {
      card.title = String(options.title);
    }
    const run = () => options.onClick();
    card.addEventListener("click", run);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        run();
      }
    });
  }
  return card;
}

function renderOverview(snapshot) {
  const online = Boolean(snapshot?.overview?.reactor_online);
  elements.reactorBadge.textContent = online ? "AGENTS ONLINE" : "AGENTS OFFLINE";
  elements.reactorBadge.classList.remove("online", "offline");
  elements.reactorBadge.classList.add(online ? "online" : "offline");

  const generatedAt = snapshot?.generated_at || "";
  elements.generatedAt.textContent = `Updated ${formatRelativeIso(generatedAt)} • ${formatUtc(generatedAt)}`;

  const run = snapshot?.latest_run || {};
  const queue = run.latest_cycle_queue || {};
  const latestRunId = String(run.run_id || state.selectedRunId || "");
  const selectLatestRun = (inspectorTab) => {
    if (!latestRunId) return;
    setRoute("runs", { updateUrl: true, replaceHistory: false });
    selectRun(latestRunId, { scroll: true, forceReload: true, openInspector: true, inspectorTab });
  };
  const queueDetail = `${queue.spawned ?? run.spawned_workers ?? 0} spawned • ${queue.skipped_lock ?? run.repos_skipped_lock ?? 0} lock skips • ${queue.repos_seen ?? run.repos_started ?? 0} seen`;

  const metrics = [
    createMetricCard("Latest Run", formatRunId(run.run_id), run.state || "-", {
      onClick: () => selectLatestRun("summary"),
      title: "Open latest run summary",
    }),
    createMetricCard("Run Runtime", formatDuration(run.duration_seconds || 0), `${run.cycles_seen || 0} cycles seen`, {
      onClick: () => selectLatestRun("summary"),
      title: "Inspect runtime and cycle details",
    }),
    createMetricCard("Queue Health", `${queue.spawned ?? run.spawned_workers ?? 0} spawned`, queueDetail, {
      onClick: () => selectLatestRun("events"),
      title: "Inspect queue and worker events",
    }),
  ];
  if (state.densityMode === "dense") {
    metrics.push(
      createMetricCard("Recent Commits", String(snapshot?.recent_commits?.length || 0), `last ${state.commitHours}h`, {
        onClick: () => selectLatestRun("commits"),
        title: "Inspect latest run commits",
      }),
    );
    metrics.push(
      createMetricCard(
        "Repo Coverage",
        `${run.repos_ended || 0} ended`,
        `${run.repos_no_change || 0} no-change / ${run.repos_changed_est || 0} changed`,
        {
          onClick: () => {
            navigateToSection("repos", "repoInsightsSection");
            openInspector("repos");
          },
          title: "Inspect repo-level coverage",
        },
      ),
    );
  }

  clearNode(elements.metricCards);
  metrics.forEach((card) => elements.metricCards.appendChild(card));
}

function renderDeckAlertStack(alerts) {
  clearNode(elements.deckAlertStack);
  const active = (alerts || []).filter((alert) => String(alert.severity || "").toLowerCase() !== "ok").slice(0, 4);
  if (!active.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No active alerts.";
    elements.deckAlertStack.appendChild(empty);
    return;
  }

  active.forEach((alert) => {
    const row = document.createElement("article");
    row.className = `deck-alert ${(alert.severity || "info").toLowerCase()}`;

    const title = document.createElement("p");
    title.className = "deck-alert-title";
    title.textContent = alert.title || "Alert";

    const detail = document.createElement("p");
    detail.className = "deck-alert-detail";
    detail.textContent = alert.detail || "";

    const action = alertActionFor(alert);
    if (action) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = action.label;
      button.addEventListener("click", () => runAlertAction(action.id, String(alert.run_id || "")));
      row.append(title, detail, button);
    } else {
      row.append(title, detail);
    }
    elements.deckAlertStack.appendChild(row);
  });
}

function renderDeckTrend(node, values, options = {}) {
  clearNode(node);
  const numeric = (values || []).map((value) => Number(value || 0));
  if (!numeric.length) return;
  const max = Math.max(...numeric, 1);
  const kind = String(options.kind || "neutral");
  numeric.forEach((value) => {
    const bar = document.createElement("span");
    const ratio = Math.max(0, value) / max;
    bar.className = "deck-trend-bar";
    if (kind === "positive") bar.classList.add("positive");
    if (kind === "issue") bar.classList.add("issue");
    if (value <= 0) bar.classList.add("dim");
    bar.style.height = `${Math.max(4, Math.round(4 + ratio * 22))}px`;
    node.appendChild(bar);
  });
}

function renderCommandDeck(snapshot) {
  const run = snapshot?.latest_run || {};
  const alerts = (snapshot?.alerts || []).filter((alert) => String(alert.severity || "").toLowerCase() !== "ok");
  const queue = run.latest_cycle_queue || {};
  const loopGroups = Number(snapshot?.control_status?.loop_groups_count || 0);
  const hasActiveRun = Boolean(snapshot?.control_status?.active);
  const recentRuns = (snapshot?.run_history || []).slice(0, 12).reverse();
  const changedTrend = recentRuns.map((item) => Number(item?.repos_changed_est || 0));
  const lockTrend = recentRuns.map((item) => Number(item?.repos_skipped_lock || 0));

  elements.deckMeta.textContent = `Run ${formatRunId(run.run_id)} • updated ${formatRelativeIso(snapshot?.generated_at || "")}`;
  elements.deckNowValue.textContent = hasActiveRun ? "Running" : "Idle";
  elements.deckNowMeta.textContent = `${run.state || "unknown"} • cycle ${run.latest_cycle || 0}`;

  elements.deckFlowValue.textContent = `${run.repos_changed_est || 0} changed`;
  elements.deckFlowMeta.textContent = `${run.repos_no_change || 0} no-change • ${queue.spawned ?? run.spawned_workers ?? 0} spawned`;

  elements.deckIssueValue.textContent = `${alerts.length}`;
  elements.deckIssueMeta.textContent = `alerts • loops ${loopGroups} • lock skips ${queue.skipped_lock ?? run.repos_skipped_lock ?? 0}`;

  const nextAction =
    alerts.length > 0
      ? alertActionFor(alerts[0])?.label || "Inspect active alerts"
      : hasActiveRun
        ? "Monitor live run"
        : "Open run launcher";
  elements.deckActionValue.textContent = nextAction;
  elements.deckActionMeta.textContent = alerts.length ? alerts[0]?.title || "Action suggested by alert stack." : "No immediate blockers.";
  elements.deckActionCard.classList.add("interactive");
  elements.deckActionCard.setAttribute("role", "button");
  elements.deckActionCard.tabIndex = 0;
  [elements.deckNowCard, elements.deckFlowCard, elements.deckIssueCard].forEach((card) => {
    if (!card) return;
    card.classList.add("interactive");
    card.setAttribute("role", "button");
    card.tabIndex = 0;
  });
  elements.deckAlertSummary.textContent = alerts.length
    ? `${alerts.length} active alert${alerts.length > 1 ? "s" : ""} • top: ${alerts[0]?.title || "-"}`
    : "No active alerts.";

  renderDeckTrend(elements.deckFlowTrend, changedTrend, { kind: "positive" });
  renderDeckTrend(elements.deckIssueTrend, lockTrend, { kind: "issue" });
  renderDeckAlertStack(snapshot?.alerts || []);
}

function runHealthScore(snapshot) {
  const alerts = (snapshot?.alerts || []).filter((alert) => String(alert.severity || "").toLowerCase() !== "ok");
  const control = snapshot?.control_status || {};
  const latestRun = snapshot?.latest_run || {};
  const queue = latestRun.latest_cycle_queue || {};
  let score = 100;

  alerts.forEach((alert) => {
    const severity = String(alert.severity || "info").toLowerCase();
    if (severity === "critical") score -= 28;
    else if (severity === "warn") score -= 12;
    else if (severity === "info") score -= 5;
  });

  const lockSkipTotal = Number(latestRun.repos_skipped_lock || 0);
  const queueSpawned = Number(queue.spawned || 0);
  const queueSkipped = Number(queue.skipped_lock || 0);
  const queueTotal = queueSpawned + queueSkipped;
  const queueRatio = queueTotal > 0 ? queueSkipped / queueTotal : 0;
  if (queueTotal >= 5 && queueRatio >= 0.6) score -= 14;
  if (lockSkipTotal >= 20) score -= 10;

  if (Number(control.loop_groups_count || 0) > 1) score -= 25;
  if (state.streamPaused) score -= 4;
  if (!state.streamPaused && !state.streamConnected && state.streamLastMessageAt > 0) score -= 8;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildOpsRecommendations(snapshot) {
  const alerts = snapshot?.alerts || [];
  const latestRun = snapshot?.latest_run || {};
  const recs = [];

  if (alerts.some((item) => String(item.id || "") === "duplicate_loop_groups")) {
    recs.push("Duplicate loop groups detected. Run Normalize Loops to keep one active process group.");
  }
  if (alerts.some((item) => String(item.id || "") === "run_stalled")) {
    recs.push("Run looks stalled. Restart the run loop, then watch first two cycles for fresh SPAWN events.");
  }
  if (alerts.some((item) => String(item.id || "") === "lock_contention")) {
    recs.push("High lock contention. Inspect lock-holder repos and reduce overlapping work on hot repositories.");
  }
  if (alerts.some((item) => String(item.id || "") === "no_commits_long_run")) {
    recs.push("Long run without commits. Inspect latest run commits/events to check for repetitive no-change cycles.");
  }
  if (alerts.some((item) => String(item.id || "") === "no_workers_cycle")) {
    recs.push("No-worker cycles observed. Validate repo eligibility and runtime repo list freshness.");
  }

  const changed = Number(latestRun.repos_changed_est || 0);
  const noChange = Number(latestRun.repos_no_change || 0);
  const ended = Number(latestRun.repos_ended || 0);
  if (ended >= 8 && noChange >= ended * 0.8) {
    recs.push("Most completed repos ended with no change. Consider increasing task breadth or expanding repo goals.");
  }
  if (changed > 0 && !recs.length) {
    recs.push("Healthy momentum. Keep current settings and continue monitoring for lock spikes.");
  }
  if (!recs.length) {
    recs.push("No immediate blockers. Keep the stream live and review run + repo tables for trend drift.");
  }
  return recs.slice(0, 5);
}

function renderOpsRecommendations(items) {
  clearNode(elements.opsRecommendations);
  (items || []).forEach((text) => {
    const row = document.createElement("p");
    row.className = "ops-item";
    row.textContent = text;
    elements.opsRecommendations.appendChild(row);
  });
}

function lockHotspotsFromRuns(runs, runLimit = 12, top = 10) {
  const windowRuns = (runs || []).slice(0, Math.max(1, runLimit));
  const counts = new Map();
  windowRuns.forEach((run) => {
    const repoStates = run?.repo_states || {};
    Object.entries(repoStates).forEach(([repo, rawState]) => {
      if (String(rawState || "").startsWith("skipped:repo_lock_active")) {
        counts.set(repo, Number(counts.get(repo) || 0) + 1);
      }
    });
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, Math.max(1, top))
    .map(([repo, count]) => ({ repo, count }));
}

function renderLockHotspots(snapshot) {
  const runs = snapshot?.run_history || [];
  const runLimit = 12;
  const hotspots = lockHotspotsFromRuns(runs, runLimit, 10);
  const windowRuns = runs.slice(0, runLimit);
  elements.lockHotspotsMeta.textContent = `${hotspots.length} repos • last ${windowRuns.length} runs`;
  clearNode(elements.lockHotspotsList);

  if (!hotspots.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No lock hotspots in recent runs.";
    elements.lockHotspotsList.appendChild(empty);
    return;
  }

  hotspots.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "hotspot-item";
    row.classList.add("selectable");
    row.setAttribute("role", "button");
    row.tabIndex = 0;

    const name = document.createElement("span");
    name.className = "mono";
    name.textContent = entry.repo;

    const value = document.createElement("span");
    value.textContent = `${entry.count} lock skips`;

    row.append(name, value);
    const openRepo = () => {
      selectRepo(entry.repo, { scroll: true, forceReload: true, openInspector: true, inspectorTab: "repos" });
      void loadRepoDetails(entry.repo, true);
    };
    row.addEventListener("click", openRepo);
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openRepo();
      }
    });
    elements.lockHotspotsList.appendChild(row);
  });

  return hotspots;
}

function agentPlanFromSnapshot(snapshot) {
  const alerts = (snapshot?.alerts || []).filter((item) => String(item.severity || "").toLowerCase() !== "ok");
  const control = snapshot?.control_status || {};
  const latestRun = snapshot?.latest_run || {};
  const latestRunId = String(latestRun.run_id || "");
  const hotspots = lockHotspotsFromRuns(snapshot?.run_history || [], 12, 1);
  const topHotspot = hotspots[0] || null;
  const steps = [];

  if (state.streamPaused) {
    steps.push({
      key: "resume_stream",
      action: "resume_stream",
      label: "Resume live stream",
      detail: "Live telemetry is paused; resume stream for fresh decisions.",
      priority: 99,
      safeAutoAllowed: true,
    });
  }
  if (Boolean(control.multiple_loops_detected) || Number(control.loop_groups_count || 0) > 1) {
    steps.push({
      key: "normalize_loops",
      action: "normalize_loops",
      label: "Normalize duplicate loop groups",
      detail: "Multiple loop groups are active; keep one process group to avoid contention.",
      priority: 100,
      safeAutoAllowed: true,
    });
  }
  if (alerts.some((item) => String(item.id || "") === "run_stalled")) {
    steps.push({
      key: "restart_run",
      action: "restart_run",
      label: "Restart stalled run",
      detail: "Run appears stalled; restart the loop and verify first cycles recover.",
      priority: 95,
      safeAutoAllowed: true,
    });
  }
  if (alerts.some((item) => String(item.id || "") === "lock_contention") && topHotspot) {
    steps.push({
      key: `inspect_repo:${topHotspot.repo}`,
      action: "inspect_repo",
      repo: topHotspot.repo,
      label: `Inspect lock hotspot ${topHotspot.repo}`,
      detail: `${topHotspot.count} lock skips in recent runs; inspect repo timeline and commits.`,
      priority: 84,
      safeAutoAllowed: false,
    });
  }
  if (alerts.some((item) => String(item.id || "") === "no_commits_long_run") && latestRunId) {
    steps.push({
      key: `inspect_run:${latestRunId}`,
      action: "inspect_run",
      runId: latestRunId,
      label: "Inspect latest run details",
      detail: "Long run with no commits; review run commits/events to identify blockers.",
      priority: 82,
      safeAutoAllowed: false,
    });
  }
  if (alerts.some((item) => String(item.id || "") === "no_workers_cycle")) {
    steps.push({
      key: "refresh_snapshot",
      action: "refresh_snapshot",
      label: "Refresh runtime telemetry",
      detail: "Re-check runtime status after no-worker cycle before changing controls.",
      priority: 70,
      safeAutoAllowed: true,
    });
  }

  if (!steps.length) {
    steps.push({
      key: "observe",
      action: "refresh_snapshot",
      label: "Observe and refresh",
      detail: "No urgent actions; keep telemetry updated and monitor trend changes.",
      priority: 40,
      safeAutoAllowed: false,
    });
  }

  const dedup = new Map();
  steps
    .sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0))
    .forEach((step) => {
      const key = String(step.key || step.action || Math.random().toString(36).slice(2, 8));
      if (!dedup.has(key)) dedup.set(key, step);
    });
  return [...dedup.values()];
}

function agentStepCanRun(step, snapshot) {
  const action = String(step?.action || "");
  const control = snapshot?.control_status || {};
  if (action === "normalize_loops") return Number(control.loop_groups_count || 0) > 1;
  if (action === "restart_run") return Boolean(control.active);
  if (action === "inspect_run") return Boolean(String(step?.runId || snapshot?.latest_run?.run_id || "").trim());
  if (action === "inspect_repo") return Boolean(String(step?.repo || "").trim());
  if (action === "resume_stream") return Boolean(state.streamPaused);
  if (action === "refresh_snapshot") return true;
  return false;
}

function renderAgentPlan(steps) {
  clearNode(elements.agentPlanList);
  (steps || []).forEach((step) => {
    const item = document.createElement("div");
    item.className = "agent-plan-item";

    const title = document.createElement("p");
    title.className = "agent-plan-title";
    title.textContent = step.label || "Agent step";

    const detail = document.createElement("p");
    detail.className = "agent-plan-detail";
    detail.textContent = step.detail || "";

    const controls = document.createElement("div");
    controls.className = "agent-plan-actions";
    const runBtn = document.createElement("button");
    runBtn.type = "button";
    runBtn.textContent = state.agentBackendAvailable ? "Run Next" : "Run";
    runBtn.disabled = state.agentBusy || state.controlBusy || !agentStepCanRun(step, state.latestSnapshot);
    runBtn.addEventListener("click", () => {
      if (state.agentBackendAvailable) {
        void runNextAgentStep("manual");
        return;
      }
      void runAgentStep(step, "manual");
    });
    controls.appendChild(runBtn);

    item.append(title, detail, controls);
    elements.agentPlanList.appendChild(item);
  });
}

function renderAgentEvents() {
  clearNode(elements.agentEventLog);
  const events = [...(state.agentEvents || [])].slice(-8).reverse();
  if (!events.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No agent actions yet.";
    elements.agentEventLog.appendChild(empty);
    return;
  }

  events.forEach((entry) => {
    const row = document.createElement("p");
    row.className = `agent-event ${String(entry.status || "info").toLowerCase()}`;
    row.textContent = `${formatUtc(entry.ts)} • ${entry.message}`;
    elements.agentEventLog.appendChild(row);
  });
}

function renderAgentPilot(snapshot) {
  const serverPlan = state.agentBackendAvailable ? state.agentPlan : [];
  const fallbackPlan = agentPlanFromSnapshot(snapshot);
  const plan = serverPlan.length ? serverPlan : fallbackPlan;
  state.agentPlan = plan;

  const runnable = plan.filter((step) => agentStepCanRun(step, snapshot));
  const modeText = state.agentMode === "assertive" ? "assertive" : "safe";
  const autoText = state.agentAutopilotEnabled ? `auto every ${state.agentIntervalSec}s` : "auto off";
  const busyText = state.agentBusy ? "executing" : "idle";
  const runtime = state.agentBackendAvailable ? "server" : "local";
  elements.agentStatusMeta.textContent = `${runtime} • ${autoText} • mode ${modeText} • ${busyText} • ${runnable.length}/${plan.length} runnable`;

  elements.agentRunNextBtn.disabled = state.agentBusy || state.controlBusy || !runnable.length;
  elements.agentRunPlanBtn.disabled = state.agentBusy || state.controlBusy || !runnable.length;
  elements.agentMode.disabled = state.agentBusy;
  elements.agentInterval.disabled = state.agentBusy;
  elements.agentAutopilotEnabled.disabled = state.agentBusy;

  renderAgentPlan(plan);
  renderAgentEvents();
}

async function runAgentStep(step, source = "manual") {
  if (state.agentBackendAvailable) {
    return runAgentServerAction("/api/agent/run_next", { source });
  }
  if (!step || state.agentBusy) return false;
  if (state.controlBusy && ["normalize_loops", "restart_run"].includes(String(step?.action || ""))) return false;
  const snapshot = state.latestSnapshot || {};
  if (!agentStepCanRun(step, snapshot)) return false;

  state.agentBusy = true;
  renderAgentPilot(snapshot);

  try {
    let ok = true;
    const action = String(step.action || "");
    if (action === "normalize_loops") {
      const result = await runControlAction("normalize");
      ok = Boolean(result?.ok);
    } else if (action === "restart_run") {
      const result = await runControlAction("restart");
      ok = Boolean(result?.ok);
    } else if (action === "inspect_run") {
        const runId = String(step.runId || state.latestSnapshot?.latest_run?.run_id || "");
        if (!runId) {
          ok = false;
        } else {
          selectRun(runId, { scroll: true, forceReload: true, openInspector: true, inspectorTab: "summary" });
        }
      } else if (action === "inspect_repo") {
        const repo = String(step.repo || "");
        if (!repo) {
          ok = false;
        } else {
          selectRepo(repo, { scroll: true, forceReload: true, openInspector: true, inspectorTab: "repos" });
          await loadRepoDetails(repo, true);
        }
    } else if (action === "resume_stream") {
      if (state.streamPaused) toggleStreamPause();
    } else if (action === "refresh_snapshot") {
      ok = await refreshNow();
    } else {
      ok = false;
    }

    state.agentLastStepKey = String(step.key || step.action || "");
    state.agentLastStepAt = Date.now();
    appendAgentEvent(ok ? "ok" : "warn", `${source}: ${step.label}${ok ? " completed" : " failed"}`);
    return ok;
  } catch (error) {
    appendAgentEvent("critical", `${source}: ${step.label} failed (${String(error)})`);
    return false;
  } finally {
    state.agentBusy = false;
    renderAgentPilot(state.latestSnapshot || snapshot);
  }
}

async function runNextAgentStep(source = "manual") {
  if (state.agentBackendAvailable) {
    return runAgentServerAction("/api/agent/run_next", { source });
  }
  const snapshot = state.latestSnapshot || {};
  const plan = state.agentPlan.length ? state.agentPlan : agentPlanFromSnapshot(snapshot);
  const step = plan.find((item) => {
    if (!agentStepCanRun(item, snapshot)) return false;
    if (source !== "autopilot") return true;
    if (state.agentMode === "assertive") return true;
    return Boolean(item.safeAutoAllowed);
  });
  if (!step) {
    if (source !== "autopilot") {
      appendAgentEvent("info", "manual: no runnable agent step");
      renderAgentPilot(snapshot);
    }
    return false;
  }
  return runAgentStep(step, source);
}

async function runFullAgentPlan(source = "manual") {
  if (state.agentBackendAvailable) {
    const maxSteps = state.agentMode === "assertive" ? 5 : 2;
    return runAgentServerAction("/api/agent/run_plan", { source, max_steps: maxSteps });
  }
  if (state.agentBusy) return false;
  const snapshot = state.latestSnapshot || {};
  const runnable = (state.agentPlan.length ? state.agentPlan : agentPlanFromSnapshot(snapshot)).filter((step) =>
    agentStepCanRun(step, snapshot),
  );
  if (!runnable.length) {
    appendAgentEvent("info", `${source}: no runnable steps in plan`);
    renderAgentPilot(snapshot);
    return false;
  }

  const maxSteps = state.agentMode === "assertive" ? Math.min(5, runnable.length) : Math.min(2, runnable.length);
  let executed = 0;
  let allOk = true;
  for (const step of runnable.slice(0, maxSteps)) {
    const ok = await runAgentStep(step, source);
    executed += 1;
    if (!ok) {
      allOk = false;
      if (state.agentMode === "safe") break;
    }
  }
  appendAgentEvent(allOk ? "ok" : "warn", `${source}: executed ${executed} step(s)`);
  renderAgentPilot(state.latestSnapshot || snapshot);
  return allOk;
}

async function maybeRunAgentAutopilot() {
  if (state.agentBackendAvailable) return;
  if (!state.agentAutopilotEnabled || state.agentBusy || state.controlBusy) return;
  if (!state.latestSnapshot) return;

  const now = Date.now();
  if (now - state.agentLastAutoTickAt < state.agentIntervalSec * 1000) return;
  state.agentLastAutoTickAt = now;

  const plan = state.agentPlan.length ? state.agentPlan : agentPlanFromSnapshot(state.latestSnapshot);
  const step = plan.find((item) => {
    if (!agentStepCanRun(item, state.latestSnapshot)) return false;
    if (state.agentMode === "assertive") return true;
    return Boolean(item.safeAutoAllowed);
  });
  if (!step) return;

  const stepKey = String(step.key || step.action || "");
  if (stepKey && state.agentLastStepKey === stepKey) {
    const minGapMs = Math.max(60000, state.agentIntervalSec * 1000);
    if (now - state.agentLastStepAt < minGapMs) return;
  }
  await runAgentStep(step, "autopilot");
}

function renderOperationsCenter(snapshot) {
  const score = runHealthScore(snapshot);
  let summary = "Stable";
  if (score < 50) summary = "Needs intervention";
  else if (score < 75) summary = "Watch closely";

  const latestRun = snapshot?.latest_run || {};
  const control = snapshot?.control_status || {};
  const alerts = (snapshot?.alerts || []).filter((item) => String(item.severity || "").toLowerCase() !== "ok");
  const runState = String(latestRun.state || "unknown");
  const loops = Number(control.loop_groups_count || 0);
  const queue = latestRun.latest_cycle_queue || {};
  const queueSeen = Number(queue.repos_seen ?? latestRun.repos_started ?? 0);
  const queueSpawned = Number(queue.spawned ?? latestRun.spawned_workers ?? 0);
  const queueSkips = Number(queue.skipped_lock ?? latestRun.repos_skipped_lock ?? 0);
  const recs = buildOpsRecommendations(snapshot);

  elements.opsHealthScore.textContent = String(score);
  elements.opsHealthSummary.textContent = `${summary} • ${alerts.length} alerts • queue ${queueSpawned}/${queueSeen} runnable`;
  elements.opsMeta.textContent = `Run ${formatRunId(latestRun.run_id)} • ${runState} • lock skips ${queueSkips} • loop groups ${loops}`;
  renderOpsRecommendations(recs);

  elements.opsNormalizeBtn.disabled = state.controlBusy || state.agentBusy || loops <= 1;
  elements.opsRestartBtn.disabled = state.controlBusy || state.agentBusy || !Boolean(control.active);
  elements.opsInspectRunBtn.disabled = state.agentBusy || !String(latestRun.run_id || "").trim();

  renderLockHotspots(snapshot);
  renderAgentPilot(snapshot);
}

function runAlertAction(actionId, runId = "") {
  if (actionId === "normalize") {
    void runControlAction("normalize");
    return;
  }
  if (actionId === "restart") {
    void runControlAction("restart");
    return;
  }
  if (actionId === "inspect_run") {
    const targetRun = String(runId || state.selectedRunId || state.latestSnapshot?.latest_run?.run_id || "");
    if (targetRun) {
      selectRun(targetRun, { scroll: true, forceReload: true, openInspector: true, inspectorTab: "summary" });
    }
    return;
  }
  if (actionId === "controls") {
    navigateToSection("controls", "controlsSection");
  }
}

function alertActionFor(alert) {
  const id = String(alert?.id || "");
  if (id === "duplicate_loop_groups") return { id: "normalize", label: "Normalize Loops" };
  if (id === "lock_contention") return { id: "normalize", label: "Reduce Locking" };
  if (id === "run_stalled") return { id: "restart", label: "Restart Run" };
  if (id === "no_commits_long_run") return { id: "inspect_run", label: "Inspect Run" };
  if (id === "no_workers_cycle") return { id: "controls", label: "Open Controls" };
  return null;
}

function toastAlert(alert) {
  const key = `${alert.run_id || ""}:${alert.id || ""}:${alert.detail || ""}`;
  if (state.seenToastAlerts.has(key)) return;
  state.seenToastAlerts.add(key);

  const toast = document.createElement("div");
  toast.className = `toast ${(alert.severity || "warn").toLowerCase()}`;
  toast.textContent = `${alert.title || "Alert"}: ${alert.detail || ""}`;
  elements.toastStack.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 250);
  }, 7000);
}

function renderAlerts(alerts, config = null) {
  clearNode(elements.alertsList);

  const stall = Number(config?.alert_stall_minutes || ALERT_DEFAULTS.stallMinutes);
  const noCommit = Number(config?.alert_no_commit_minutes || ALERT_DEFAULTS.noCommitMinutes);
  const lockSkips = Number(config?.alert_lock_skip_threshold || ALERT_DEFAULTS.lockSkipThreshold);
  elements.alertsMeta.textContent = `stall>${stall}m • no-commit>${noCommit}m • lock-skips>=${lockSkips}`;

  (alerts || []).forEach((alert) => {
    const item = document.createElement("article");
    const severity = String(alert.severity || "info").toLowerCase();
    item.className = `alert-item ${severity}`;

    const title = document.createElement("p");
    title.className = "alert-title";
    title.textContent = alert.title || "Alert";

    const detail = document.createElement("p");
    detail.className = "alert-detail";
    detail.textContent = alert.detail || "";

    const action = alertActionFor(alert);
    if (action) {
      const controls = document.createElement("div");
      controls.className = "alert-actions";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "alert-action-btn";
      button.textContent = action.label;
      button.addEventListener("click", () => {
        runAlertAction(action.id, String(alert.run_id || ""));
      });
      controls.appendChild(button);
      item.append(title, detail, controls);
    } else {
      item.append(title, detail);
    }
    elements.alertsList.appendChild(item);

    if (severity === "warn" || severity === "critical") {
      toastAlert(alert);
    }
  });
}

function renderControlStatus(controlStatus) {
  state.controlStatus = controlStatus || {};
  const active = Boolean(state.controlStatus?.active);
  const runId = formatRunId(state.controlStatus?.run_id);
  const runState = state.controlStatus?.run_state || "unknown";
  const runPid = state.controlStatus?.run_pid || "-";
  const launcherPid = state.controlStatus?.managed_launcher_pid || "-";
  const loopCount = Array.isArray(state.controlStatus?.loop_pids) ? state.controlStatus.loop_pids.length : 0;
  const loopGroups = Number(state.controlStatus?.loop_groups_count || 0);
  const selectedRepos = Number(state.controlStatus?.managed_settings?.selected_repos_count || 0);
  const selectedReposText = selectedRepos > 0 ? ` • repos ${selectedRepos}` : "";

  if (active) {
    elements.controlStatusMeta.textContent = `Active ${runId} • ${runState} • pid ${runPid} • launcher ${launcherPid}${selectedReposText} • loops ${loopCount} / groups ${loopGroups}`;
  } else {
    elements.controlStatusMeta.textContent = `Idle • latest ${runId} • state ${runState}${selectedReposText} • loops ${loopCount} / groups ${loopGroups}`;
  }

  if (state.controlStatus?.multiple_loops_detected) {
    toastAlert({
      id: "multiple_loops_detected",
      run_id: String(state.controlStatus?.run_id || ""),
      severity: "warn",
      title: "Multiple loop processes detected",
      detail: `${loopCount} run_clone_loop.sh processes across ${loopGroups} groups are active.`,
    });
  }

  elements.controlStartBtn.disabled = state.controlBusy;
  elements.controlStopBtn.disabled = state.controlBusy || !active;
  elements.controlRestartBtn.disabled = state.controlBusy || !active;
  elements.controlNormalizeBtn.disabled = state.controlBusy || loopGroups <= 1;
  elements.controlParallelRepos.disabled = state.controlBusy;
  elements.controlMaxCycles.disabled = state.controlBusy;
  elements.controlTasksPerRepo.disabled = state.controlBusy;
}

function coerceAlertIdList(value, fallback) {
  const fallbackList = Array.isArray(fallback) && fallback.length ? fallback : [...DEFAULT_NOTIFY_ALERT_IDS];
  const raw = Array.isArray(value)
    ? value.map((item) => String(item || "").trim()).filter(Boolean)
    : String(value || "")
        .split(/[,\s]+/)
        .map((item) => item.trim())
        .filter(Boolean);
  const valid = raw.filter((item) => DEFAULT_NOTIFY_ALERT_IDS.includes(item));
  if (!valid.length) return [...fallbackList];
  return DEFAULT_NOTIFY_ALERT_IDS.filter((item) => valid.includes(item));
}

function renderNotificationRuleOptions(knownAlertIds, enabledAlertIds) {
  const known = coerceAlertIdList(knownAlertIds, DEFAULT_NOTIFY_ALERT_IDS);
  const enabledSet = new Set(coerceAlertIdList(enabledAlertIds, known));
  clearNode(elements.notifyRules);

  known.forEach((alertId) => {
    const label = document.createElement("label");
    label.className = "notify-rule";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = alertId;
    checkbox.checked = enabledSet.has(alertId);
    checkbox.disabled = state.notificationsBusy;

    const text = document.createElement("span");
    text.textContent = NOTIFY_RULE_LABELS[alertId] || alertId;

    label.append(checkbox, text);
    elements.notifyRules.appendChild(label);
  });
}

function selectedNotificationRuleIds() {
  const selected = [...elements.notifyRules.querySelectorAll('input[type="checkbox"]:checked')].map((input) => String(input.value || ""));
  return coerceAlertIdList(selected, state.notificationKnownAlertIds);
}

function notificationRequestPayload() {
  return {
    enabled: Boolean(elements.notifyEnabled.checked),
    webhook_url: String(elements.notifyWebhookUrl.value || "").trim(),
    min_severity: String(elements.notifyMinSeverity.value || "warn").toLowerCase(),
    cooldown_seconds: Number(elements.notifyCooldownSeconds.value || 600),
    send_ok: Boolean(elements.notifySendOk.checked),
    enabled_alert_ids: selectedNotificationRuleIds(),
  };
}

function applyNotificationForm(config, status = null) {
  if (!config) return;
  elements.notifyEnabled.checked = Boolean(config.enabled);
  elements.notifyWebhookUrl.value = String(config.webhook_url || "");
  elements.notifyMinSeverity.value = String(config.min_severity || "warn");
  elements.notifyCooldownSeconds.value = String(Number(config.cooldown_seconds || 600));
  elements.notifySendOk.checked = Boolean(config.send_ok);

  const known = coerceAlertIdList(
    status?.known_alert_ids || state.notificationKnownAlertIds || DEFAULT_NOTIFY_ALERT_IDS,
    DEFAULT_NOTIFY_ALERT_IDS,
  );
  const enabled = coerceAlertIdList(config.enabled_alert_ids, known);
  state.notificationKnownAlertIds = known;
  renderNotificationRuleOptions(known, enabled);
}

function setNotificationBusy(busy) {
  state.notificationsBusy = Boolean(busy);
  elements.notifyEnabled.disabled = state.notificationsBusy;
  elements.notifyWebhookUrl.disabled = state.notificationsBusy;
  elements.notifyMinSeverity.disabled = state.notificationsBusy;
  elements.notifyCooldownSeconds.disabled = state.notificationsBusy;
  elements.notifySendOk.disabled = state.notificationsBusy;
  elements.notifySaveBtn.disabled = state.notificationsBusy;
  elements.notifyTestBtn.disabled = state.notificationsBusy;
  [...elements.notifyRules.querySelectorAll('input[type="checkbox"]')].forEach((input) => {
    input.disabled = state.notificationsBusy;
  });
}

function renderNotificationStatus(status, delivery = null) {
  state.notificationStatus = status || state.notificationStatus || {};

  const enabled = Boolean(state.notificationStatus.enabled);
  const configured = Boolean(state.notificationStatus.webhook_configured);
  const threshold = String(state.notificationStatus.min_severity || "warn");
  const cooldown = Number(state.notificationStatus.cooldown_seconds || 600);
  const eventsCount = Number(state.notificationStatus.events_count || 0);
  const known = coerceAlertIdList(
    state.notificationStatus.known_alert_ids || state.notificationKnownAlertIds,
    DEFAULT_NOTIFY_ALERT_IDS,
  );
  const enabledAlertIds = coerceAlertIdList(
    state.notificationStatus.enabled_alert_ids || state.notificationConfig?.enabled_alert_ids,
    known,
  );
  state.notificationKnownAlertIds = known;

  elements.notifyStatusMeta.textContent = `${enabled ? "enabled" : "disabled"} • webhook ${configured ? "set" : "missing"} • min ${threshold} • cooldown ${cooldown}s • rules ${enabledAlertIds.length}/${known.length} • events ${eventsCount}`;

  if (delivery && typeof delivery === "object") {
    const checked = Number(delivery.checked || 0);
    const eligible = Number(delivery.eligible || 0);
    const sent = Number(delivery.sent || 0);
    const suppressed = Number(delivery.suppressed || 0);
    const errors = Number(delivery.errors || 0);
    elements.notifyDeliveryMeta.textContent = `Delivery last pass: checked ${checked} • eligible ${eligible} • sent ${sent} • suppressed ${suppressed} • errors ${errors}`;
  } else {
    const last = state.notificationStatus.last_event || null;
    if (last) {
      elements.notifyDeliveryMeta.textContent = `Last event: ${formatUtc(last.ts)} • ${last.status || "-"} • ${last.reason || "-"}`;
    } else {
      elements.notifyDeliveryMeta.textContent = "No delivery activity yet.";
    }
  }
}

function renderNotificationEvents(events) {
  clearNode(elements.notifyEventsTable);
  const rows = events || [];
  if (!rows.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.className = "muted";
    cell.textContent = "No notification events yet.";
    row.appendChild(cell);
    elements.notifyEventsTable.appendChild(row);
    return;
  }

  rows
    .slice()
    .reverse()
    .forEach((entry) => {
      const row = document.createElement("tr");

      const ts = document.createElement("td");
      ts.className = "mono";
      ts.textContent = formatUtc(entry.ts);

      const status = document.createElement("td");
      status.textContent = entry.status || "-";

      const severity = document.createElement("td");
      severity.textContent = entry.severity || "-";

      const reason = document.createElement("td");
      reason.className = "mono";
      reason.textContent = entry.reason || "-";

      const detail = document.createElement("td");
      detail.textContent = entry.detail || entry.title || "-";

      row.append(ts, status, severity, reason, detail);
      elements.notifyEventsTable.appendChild(row);
    });
}

async function loadNotificationConfig() {
  const response = await fetch("/api/notifications/config");
  if (!response.ok) throw new Error(`notifications config failed with status ${response.status}`);
  const payload = await response.json();
  state.notificationConfig = payload.config || null;
  applyNotificationForm(state.notificationConfig, payload.status || null);
  renderNotificationStatus(payload.status || null, null);
}

async function loadNotificationEvents(force = false) {
  if (!force && Date.now() - state.notificationEventsUpdatedAt < NOTIFY_EVENTS_REFRESH_MS) return;
  const response = await fetch("/api/notifications/events?limit=80");
  if (!response.ok) throw new Error(`notification events failed with status ${response.status}`);
  const payload = await response.json();
  state.notificationEventsUpdatedAt = Date.now();
  state.notificationEvents = payload.events || [];
  renderNotificationEvents(state.notificationEvents);
  renderNotificationStatus(payload.status || null, null);
}

async function saveNotificationConfig() {
  setNotificationBusy(true);
  try {
    const payload = notificationRequestPayload();
    const result = await apiPost("/api/notifications/config", payload);
    state.notificationConfig = result.config || payload;
    applyNotificationForm(state.notificationConfig, result.status || null);
    renderNotificationStatus(result.status || null, null);
    await loadNotificationEvents(true);
    toastAlert({
      id: "notifications_saved",
      run_id: "",
      severity: "ok",
      title: "Notifications updated",
      detail: "Config saved successfully.",
    });
  } catch (error) {
    console.error(error);
    toastAlert({
      id: "notifications_save_error",
      run_id: "",
      severity: "critical",
      title: "Notification save failed",
      detail: String(error),
    });
  } finally {
    setNotificationBusy(false);
  }
}

async function sendTestNotification() {
  setNotificationBusy(true);
  try {
    const result = await apiPost("/api/notifications/test", {
      severity: String(elements.notifyMinSeverity.value || "warn"),
      message: "Clone control plane test notification.",
    });
    renderNotificationStatus(result.status || null, null);
    await loadNotificationEvents(true);
    toastAlert({
      id: "notifications_test_sent",
      run_id: "",
      severity: result.ok ? "ok" : "critical",
      title: result.ok ? "Test notification sent" : "Test notification failed",
      detail: result.reason || result.error || "-",
    });
  } catch (error) {
    console.error(error);
    toastAlert({
      id: "notifications_test_error",
      run_id: "",
      severity: "critical",
      title: "Test notification failed",
      detail: String(error),
    });
  } finally {
    setNotificationBusy(false);
  }
}

function setTaskQueueBusy(busy) {
  state.taskQueueBusy = Boolean(busy);
  if (elements.taskQueueAddBtn) elements.taskQueueAddBtn.disabled = state.taskQueueBusy;
  if (elements.taskQueueRepo) elements.taskQueueRepo.disabled = state.taskQueueBusy;
  if (elements.taskQueueStatus) elements.taskQueueStatus.disabled = state.taskQueueBusy;
  if (elements.taskQueueTitle) elements.taskQueueTitle.disabled = state.taskQueueBusy;
  if (elements.taskQueueDetails) elements.taskQueueDetails.disabled = state.taskQueueBusy;
  if (elements.taskQueuePriority) elements.taskQueuePriority.disabled = state.taskQueueBusy;
}

function renderTaskQueue() {
  if (!elements.taskQueueTable || !elements.taskQueueMeta) return;
  clearNode(elements.taskQueueTable);

  const counts = state.taskQueueSummary?.counts || {};
  const queued = Number(counts.QUEUED || 0);
  const claimed = Number(counts.CLAIMED || 0);
  const done = Number(counts.DONE || 0);
  const blocked = Number(counts.BLOCKED || 0);
  const total = Number(state.taskQueueSummary?.total || state.taskQueueItems.length || 0);
  elements.taskQueueMeta.textContent = `total ${total} • queued ${queued} • claimed ${claimed} • done ${done} • blocked ${blocked}`;

  if (!state.taskQueueItems.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 7;
    cell.className = "muted";
    cell.textContent = "No queue tasks match the current filter.";
    row.appendChild(cell);
    elements.taskQueueTable.appendChild(row);
    return;
  }

  state.taskQueueItems.forEach((item) => {
    const row = document.createElement("tr");

    const idCell = document.createElement("td");
    idCell.className = "mono";
    idCell.textContent = item.id || "-";

    const statusCell = document.createElement("td");
    statusCell.appendChild(createStateBadge(item.status || "unknown"));

    const priorityCell = document.createElement("td");
    priorityCell.textContent = `P${Number(item.priority || 3)}`;

    const repoCell = document.createElement("td");
    repoCell.className = "mono";
    repoCell.textContent = item.repo || "*";

    const taskCell = document.createElement("td");
    taskCell.textContent = item.title || "-";
    const detailText = String(item.details || "").trim();
    if (detailText) {
      taskCell.title = detailText;
    }

    const updatedCell = document.createElement("td");
    updatedCell.className = "mono";
    updatedCell.textContent = formatUtc(item.updated_at || item.created_at || "");

    const actionCell = document.createElement("td");
    const actions = document.createElement("div");
    actions.className = "inline-controls";
    const createActionButton = (label, status) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.disabled = state.taskQueueBusy;
      button.addEventListener("click", async () => {
        await updateTaskQueueStatus(String(item.id || ""), status);
      });
      return button;
    };

    if (item.status === "DONE" || item.status === "BLOCKED" || item.status === "CANCELED") {
      actions.appendChild(createActionButton("Requeue", "QUEUED"));
    } else {
      actions.appendChild(createActionButton("Done", "DONE"));
      actions.appendChild(createActionButton("Block", "BLOCKED"));
      actions.appendChild(createActionButton("Cancel", "CANCELED"));
    }
    actionCell.appendChild(actions);

    row.append(idCell, statusCell, priorityCell, repoCell, taskCell, updatedCell, actionCell);
    elements.taskQueueTable.appendChild(row);
  });
}

async function loadTaskQueue(force = false) {
  if (!force && Date.now() - state.taskQueueUpdatedAt < TASK_QUEUE_REFRESH_MS) return;
  const query = new URLSearchParams({
    limit: "160",
    status: String(elements.taskQueueStatus?.value || ""),
    repo: String(elements.taskQueueRepo?.value || ""),
  });
  const response = await fetch(`/api/task_queue?${query.toString()}`);
  if (!response.ok) throw new Error(`task queue load failed with status ${response.status}`);
  const payload = await response.json();
  state.taskQueueItems = Array.isArray(payload.tasks) ? payload.tasks : [];
  state.taskQueueSummary = payload.summary || payload || null;
  state.taskQueueUpdatedAt = Date.now();
  renderTaskQueue();
}

function parseQuickTaskCommand(rawText) {
  const text = String(rawText || "").trim();
  if (!text) return null;

  const patterns = [
    /^\s*(?:for\s+)?(?:project|repo)\s+([a-zA-Z0-9._/-]+)\s*[:,-]?\s*(.+)$/i,
    /^\s*([a-zA-Z0-9._/-]+)\s*:\s*(.+)$/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const repo = String(match[1] || "").trim();
    const title = String(match[2] || "")
      .trim()
      .replace(/^can you\s+/i, "");
    if (repo && title) {
      return { repo, title };
    }
  }

  return null;
}

async function addTaskQueueItem() {
  const title = String(elements.taskQueueTitle?.value || "").trim();
  if (!title) {
    toastAlert({
      id: "task_queue_missing_title",
      run_id: "",
      severity: "warn",
      title: "Task title required",
      detail: "Add a short task title before queueing.",
    });
    return;
  }

  setTaskQueueBusy(true);
  try {
    let repoValue = String(elements.taskQueueRepo?.value || "*").trim() || "*";
    let queueTitle = title;
    const parsedCommand = parseQuickTaskCommand(title);
    if ((repoValue === "*" || !repoValue) && parsedCommand) {
      repoValue = parsedCommand.repo;
      queueTitle = parsedCommand.title;
      if (elements.taskQueueRepo) elements.taskQueueRepo.value = repoValue;
    }

    const payload = {
      repo: repoValue,
      title: queueTitle,
      details: String(elements.taskQueueDetails?.value || "").trim(),
      priority: Number(elements.taskQueuePriority?.value || 3),
      source: "control_plane",
    };
    await apiPost("/api/task_queue/add", payload);
    elements.taskQueueTitle.value = "";
    elements.taskQueueDetails.value = "";
    await loadTaskQueue(true);
    toastAlert({
      id: "task_queue_added",
      run_id: "",
      severity: "ok",
      title: "Task queued",
      detail: queueTitle,
    });
  } catch (error) {
    toastAlert({
      id: "task_queue_add_error",
      run_id: "",
      severity: "critical",
      title: "Queue add failed",
      detail: String(error),
    });
  } finally {
    setTaskQueueBusy(false);
  }
}

async function updateTaskQueueStatus(taskId, status) {
  const normalizedId = String(taskId || "").trim();
  const normalizedStatus = String(status || "").trim().toUpperCase();
  if (!normalizedId || !normalizedStatus) return;

  setTaskQueueBusy(true);
  try {
    await apiPost("/api/task_queue/update", {
      id: normalizedId,
      status: normalizedStatus,
      note: "updated via control plane",
    });
    await loadTaskQueue(true);
  } catch (error) {
    toastAlert({
      id: "task_queue_update_error",
      run_id: "",
      severity: "critical",
      title: "Queue update failed",
      detail: String(error),
    });
  } finally {
    setTaskQueueBusy(false);
  }
}

function renderCommitTable(commits) {
  clearNode(elements.commitTable);

  if (!commits?.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.className = "muted";
    cell.textContent = "No commits found in the selected window.";
    row.appendChild(cell);
    elements.commitTable.appendChild(row);
    return;
  }

  commits.forEach((item) => {
    const row = document.createElement("tr");

    const time = document.createElement("td");
    time.className = "mono";
    time.textContent = formatPacific(item.time_utc);
    time.title = formatRelativeIso(item.time_utc);

    const repo = document.createElement("td");
    repo.textContent = item.repo;

    const hash = document.createElement("td");
    hash.className = "mono";
    hash.textContent = item.hash;

    const subject = document.createElement("td");
    subject.textContent = item.subject;

    row.append(time, repo, hash, subject);
    elements.commitTable.appendChild(row);
  });
}

function classifyRepoState(rawState) {
  const stateText = String(rawState || "unknown");
  if (stateText.startsWith("running")) return "running";
  if (stateText === "starting") return "running";
  if (stateText === "ended") return "no_change";
  if (stateText === "no_change") return "no_change";
  if (stateText.startsWith("skipped")) return "skipped";
  return "neutral";
}

function renderRepoStates(run) {
  clearNode(elements.repoStates);
  const entries = Object.entries(run?.repo_states || {});
  const selected = formatRunId(run?.run_id);
  elements.repoStateMeta.textContent = `${entries.length} repos • ${selected}`;

  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No repo state events yet for this run.";
    elements.repoStates.appendChild(empty);
    return;
  }

  entries
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([repo, rawState]) => {
      const pill = document.createElement("div");
      const klass = classifyRepoState(rawState);
      pill.className = `repo-pill ${klass} selectable`;
      pill.setAttribute("role", "button");
      pill.tabIndex = 0;

      const name = document.createElement("span");
      name.textContent = repo;

      const status = document.createElement("span");
      status.className = "status";
      status.textContent = String(rawState).replace("skipped:", "skip/");

      const insight = (state.repoInsights || []).find((item) => String(item.repo || "") === repo);
      if (insight) {
        pill.title = `${insight.commits_recent || 0} commits • changed ${insight.changed_runs || 0} • no-change ${insight.no_change_runs || 0} • lock-skip ${insight.lock_skip_runs || 0}`;
      }
      const openRepo = () => {
        selectRepo(repo, { scroll: true, forceReload: true, openInspector: true, inspectorTab: "repos" });
        void loadRepoDetails(repo, true);
      };
      pill.addEventListener("click", openRepo);
      pill.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openRepo();
        }
      });

      pill.append(name, status);
      elements.repoStates.appendChild(pill);
    });
}

function filteredRunHistory(runs) {
  const query = String(state.runHistorySearch || "").trim().toLowerCase();
  const mode = String(state.runHistoryStateFilter || "all");
  return (runs || []).filter((run) => {
    const runState = String(run.state || "");
    const isFinished = runState.startsWith("finished");
    if (mode === "running" && isFinished) return false;
    if (mode === "finished" && !isFinished) return false;
    if (!query) return true;
    const haystack = `${run.run_id || ""} ${runState} ${run.latest_cycle || ""}`.toLowerCase();
    return haystack.includes(query);
  });
}

function selectRun(runId, options = {}) {
  const targetRunId = String(runId || "").trim();
  if (!targetRunId) return;
  const run = (state.runHistory || []).find((item) => String(item.run_id || "") === targetRunId);
  if (!run) return;
  const detailView = options.detailView
    ? normalizeRunDetailView(options.detailView)
    : options.inspectorTab
      ? runDetailFromInspectorTab(options.inspectorTab)
      : state.runDetailView;
  setRunDetailView(detailView, { updateUrl: false, focus: false });

  if (options.scroll) {
    navigateToSection("runs", runSectionForDetailView(detailView));
  }
  if (options.openInspector) {
    openInspector(options.inspectorTab || "summary");
  }

  if (state.selectedRunId === targetRunId && !options.forceReload) {
    return;
  }

  state.selectedRunId = targetRunId;
  state.selectedRun = null;
  state.selectedRunCommits = [];
  state.selectedRunEvents = [];
  state.selectedRunLogLines = [];
  state.selectedRunLogPath = "";
  state.selectedRunLogLineCount = 0;
  state.selectedRunLogLoadedAt = 0;
  state.selectedRunDetailsAt = 0;
  state.selectedRunActivity = [];
  state.selectedRunActivityUpdatedAt = 0;
  renderRunLogTail();
  renderRunActivityStream();
  renderDetailRouteControls();
  syncUrlState();
  renderRunHistory(state.runHistory);
  elements.selectedRunMeta.textContent = `Loading ${formatRunId(targetRunId)}...`;
  void loadRunDetails(targetRunId);
}

function renderRunHistory(runs) {
  clearNode(elements.runTable);
  const allRuns = runs || [];
  const filtered = filteredRunHistory(allRuns);
  elements.runHistoryMeta.textContent = `${filtered.length}/${allRuns.length} runs`;

  if (!filtered.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 10;
    cell.className = "muted";
    cell.textContent = "No runs match current filters.";
    row.appendChild(cell);
    elements.runTable.appendChild(row);
    return;
  }

  filtered.forEach((run) => {
    const row = document.createElement("tr");
    row.className = "selectable";
    if (run.run_id === state.selectedRunId) row.classList.add("selected");

    row.addEventListener("click", () => {
      if (!run.run_id) return;
      selectRun(run.run_id, { openInspector: true, inspectorTab: "summary" });
    });

    const runIdCell = document.createElement("td");
    runIdCell.className = "mono";
    runIdCell.textContent = formatRunId(run.run_id);

    const startCell = document.createElement("td");
    startCell.className = "mono";
    startCell.textContent = formatUtc(run.run_started_at || run.first_ts);
    startCell.title = formatRelativeIso(run.run_started_at || run.first_ts);

    const stateCell = document.createElement("td");
    stateCell.appendChild(createStateBadge(run.state));

    const durationCell = document.createElement("td");
    durationCell.textContent = formatDuration(run.duration_seconds || 0);

    const cycleCell = document.createElement("td");
    cycleCell.textContent = String(run.latest_cycle || 0);

    const startedCell = document.createElement("td");
    startedCell.textContent = String(run.repos_started || 0);

    const endedCell = document.createElement("td");
    endedCell.textContent = String(run.repos_ended || 0);

    const noChangeCell = document.createElement("td");
    noChangeCell.textContent = String(run.repos_no_change || 0);

    const skipCell = document.createElement("td");
    skipCell.textContent = String(run.repos_skipped_lock || 0);

    const linkCell = document.createElement("td");
    const linkBtn = document.createElement("button");
    linkBtn.type = "button";
    linkBtn.className = "table-link-btn";
    linkBtn.textContent = "Copy";
    linkBtn.title = "Copy deep link";
    linkBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      const path = pathForRunDetail(run.run_id, state.runDetailView);
      void copyShareLink(path, String(run.run_id || "run"));
    });
    linkCell.appendChild(linkBtn);

    row.append(
      runIdCell,
      startCell,
      stateCell,
      durationCell,
      cycleCell,
      startedCell,
      endedCell,
      noChangeCell,
      skipCell,
      linkCell,
    );

    elements.runTable.appendChild(row);
  });
}

function updateRunCommitRepoOptions(commits) {
  const previous = elements.runCommitRepoFilter.value;
  const repos = [...new Set((commits || []).map((item) => String(item.repo || "unknown")))].sort();

  clearNode(elements.runCommitRepoFilter);
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All";
  elements.runCommitRepoFilter.appendChild(allOption);

  repos.forEach((repoName) => {
    const option = document.createElement("option");
    option.value = repoName;
    option.textContent = repoName;
    elements.runCommitRepoFilter.appendChild(option);
  });

  if (previous && repos.includes(previous)) {
    elements.runCommitRepoFilter.value = previous;
  }
}

function filteredSelectedRunCommits() {
  const selectedRepo = elements.runCommitRepoFilter.value;
  const query = String(elements.runCommitSearch.value || "").trim().toLowerCase();
  return (state.selectedRunCommits || []).filter((entry) => {
    if (selectedRepo && entry.repo !== selectedRepo) return false;
    if (!query) return true;
    const haystack = `${entry.hash || ""} ${entry.subject || ""} ${entry.repo || ""}`.toLowerCase();
    return haystack.includes(query);
  }).map(normalizeRunCommit).sort((left, right) => (right.ts || 0) - (left.ts || 0));
}

function renderRunCommitTable() {
  clearNode(elements.runCommitTable);
  const commits = filteredSelectedRunCommits();

  if (!commits.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.className = "muted";
    cell.textContent = state.selectedRunCommits.length
      ? "No commits match current filters."
      : "No commits detected for this run.";
    row.appendChild(cell);
    elements.runCommitTable.appendChild(row);
    return;
  }

  commits.forEach((entry) => {
    const row = document.createElement("tr");

    const time = document.createElement("td");
    time.className = "mono";
    time.textContent = formatUtc(entry.time_utc);
    time.title = formatRelativeIso(entry.time_utc);

    const repo = document.createElement("td");
    repo.textContent = entry.repo || "unknown";
    if (entry.ambiguous && Array.isArray(entry.repo_candidates) && entry.repo_candidates.length > 1) {
      repo.title = `Potential repos: ${entry.repo_candidates.join(", ")}`;
    }

    const hash = document.createElement("td");
    hash.className = "mono";
    hash.textContent = String(entry.hash || "-").slice(0, 12);
    hash.title = entry.hash || "-";

    const subject = document.createElement("td");
    subject.textContent = entry.subject || "";

    row.append(time, repo, hash, subject);
    elements.runCommitTable.appendChild(row);
  });
}

function renderEvents(events) {
  clearNode(elements.eventsPane);

  if (!events?.length) {
    const empty = document.createElement("p");
    empty.className = "terminal-event info";
    empty.textContent = "No events available yet.";
    elements.eventsPane.appendChild(empty);
    return;
  }

  let rows = events;
  if (state.densityMode === "calm") {
    const grouped = [];
    events.forEach((event) => {
      const level = String(event.level || "INFO").toUpperCase();
      const message = String(event.message || "");
      const tokenMatch = message.match(/^([A-Z_]+)\b/);
      const token = tokenMatch ? tokenMatch[1] : "EVENT";
      const key = `${level}:${token}`;
      const prev = grouped[grouped.length - 1];
      if (prev && prev.key === key) {
        prev.count += 1;
        prev.last = event;
        return;
      }
      grouped.push({ key, count: 1, first: event, last: event });
    });
    rows = grouped.map((item) => {
      const suffix = item.count > 1 ? ` (${item.count}x)` : "";
      return {
        ts: item.last.ts,
        level: item.last.level,
        message: `${item.first.message}${suffix}`,
      };
    });
  }

  rows.forEach((event) => {
    const line = document.createElement("div");
    const level = String(event.level || "INFO").toLowerCase();
    line.className = `terminal-event ${level === "warn" ? "warn" : "info"}`;
    line.textContent = `${formatEventTs(event.ts)}  [${event.level || "INFO"}]  ${event.message || ""}`;
    elements.eventsPane.appendChild(line);
  });

  if (state.eventsAutoScroll) {
    elements.eventsPane.scrollTop = elements.eventsPane.scrollHeight;
  }
}

function formatRunActivityTs(ts) {
  if (!ts) return "-";
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return "-";
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

function formatEventTs(ts) {
  const ms = parseTimestampMs(ts);
  if (!ms) return String(ts || "-");

  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return String(ts || "-");

  const parts = PACIFIC_TIME_FORMATTER.formatToParts(date).reduce((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second} ${parts.timeZoneName || "PST"}`;
}

function parseTimestampMs(value) {
  const raw = String(value || "").trim();
  if (!raw) return 0;
  if (/^\d+$/.test(raw)) {
    return raw.length <= 10 ? Number(raw) * 1000 : Number(raw);
  }
  const date = new Date(raw);
  const ms = date.getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

function parseLogLineForActivity(line) {
  const text = String(line || "").trim();
  if (!text) return { ts: 0, text: "", level: "info", key: "" };

  const bracketMatch = text.match(/^\[([^\]]+)\]\s*(?:\[(\w+)\])?\s*(.*)$/);
  if (bracketMatch) {
    const ts = parseTimestampMs(bracketMatch[1]);
    const level = String(bracketMatch[2] || "info").toLowerCase();
    return {
      ts,
      text: String(bracketMatch[3] || "").trim(),
      level: /warn|error|err|critical/.test(level) ? "warn" : "info",
      key: `${bracketMatch[1]}:${bracketMatch[2] || "log"}:${text}`,
    };
  }

  const fallbackMatch = text.match(/^(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)\s+(.*)$/);
  if (fallbackMatch) {
    const ts = parseTimestampMs(fallbackMatch[1]);
    return {
      ts,
      text: String(fallbackMatch[2] || "").trim(),
      level: /warn|error|err|critical/i.test(fallbackMatch[2]) ? "warn" : "info",
      key: `${fallbackMatch[1]}:log:${text}`,
    };
  }

  return {
    ts: 0,
    text,
    level: /warn|error|err|critical/i.test(text) ? "warn" : "info",
    key: `raw:${text}`,
  };
}

function buildRunActivityItems(run, commits, events, runLogLines = []) {
  const baseTs = parseTimestampMs(run?.run_started_at || run?.first_ts || run?.generated_at || "");
  const nowTs = Date.now();
  const activity = [];
  const seen = new Set();

  const addItem = (item) => {
    const key = item.key;
    if (!key || seen.has(key)) return;
    seen.add(key);
    activity.push(item);
  };

  (events || []).forEach((event) => {
    const ts = parseTimestampMs(event.ts);
    addItem({
      type: "event",
      ts: ts || baseTs || nowTs,
      level: String(event.level || "info").toLowerCase() === "warn" ? "warn" : "info",
      source: "EVENT",
      message: `${String(event.message || "").trim()}`,
      key: `event:${event.ts || ""}:${String(event.message || "").slice(0, 200)}:${String(event.level || "").toLowerCase()}`,
    });
  });

  (commits || []).forEach((commit) => {
    const commitTs = parseTimestampMs(commit.time_utc);
    const hash = String(commit.hash || "").trim() || String(commit.subject || "").slice(0, 6);
    const repo = String(commit.repo || "unknown");
    addItem({
      type: "commit",
      ts: commitTs || baseTs || nowTs,
      level: "info",
      source: "COMMIT",
      message: `${repo}: ${hash} ${String(commit.subject || "").trim()}`,
      key: `commit:${hash}:${repo}:${commitTs || ""}:${String(commit.subject || "").slice(0, 120)}`,
    });
  });

  (runLogLines || []).forEach((line, index) => {
    const parsed = parseLogLineForActivity(line);
    addItem({
      type: "log",
      ts: parsed.ts || baseTs || nowTs - index * 2,
      level: parsed.level,
      source: "LOG",
      message: parsed.text,
      key: `log:${parsed.key || parsed.ts || index}`,
    });
  });

  return activity
    .sort((left, right) => (right.ts || 0) - (left.ts || 0))
    .slice(0, RUN_ACTIVITY_MAX_ITEMS);
}

function setRunActivityAutoScroll(enabled, persist = true) {
  state.runActivityAutoScroll = Boolean(enabled);
  if (!elements.runActivityAutoScrollBtn) return;
  elements.runActivityAutoScrollBtn.textContent = state.runActivityAutoScroll
    ? RUN_ACTIVITY_AUTOSCROLL_TEXT_ON
    : RUN_ACTIVITY_AUTOSCROLL_TEXT_OFF;
  elements.runActivityAutoScrollBtn.classList.toggle("active", state.runActivityAutoScroll);
  if (persist) {
    try {
      localStorage.setItem(RUN_ACTIVITY_AUTOSCROLL_STORAGE_KEY, state.runActivityAutoScroll ? "1" : "0");
    } catch {
      // Ignore storage failures.
    }
  }
}

function toggleRunActivityAutoScroll() {
  setRunActivityAutoScroll(!state.runActivityAutoScroll, true);
}

function renderRunActivityStream() {
  if (!elements.runActivityPane) return;
  clearNode(elements.runActivityPane);

  if (!state.selectedRun) {
    elements.runActivityMeta.textContent = "Select a run to stream activity.";
    const empty = document.createElement("p");
    empty.className = "terminal-event info";
    empty.textContent = "No run selected.";
    elements.runActivityPane.appendChild(empty);
    return;
  }

  const items = state.selectedRunActivity || [];
  const count = items.length;
  elements.runActivityMeta.textContent = `${count} activity entries • ${state.selectedRun?.run_id ? formatRunId(state.selectedRun.run_id) : ""}`;

  if (!count) {
    const empty = document.createElement("p");
    empty.className = "terminal-event info";
    empty.textContent = "No stream entries yet.";
    elements.runActivityPane.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const line = document.createElement("div");
    const level = String(item.level || "info").toLowerCase() === "warn" ? "warn" : "info";
    line.className = `terminal-event ${level}`;
    const ts = formatRunActivityTs(item.ts);
    const prefix = `${ts}  [${item.source || "UPDATE"}]`;
    line.textContent = `${prefix}  ${String(item.message || "")}`;
    elements.runActivityPane.appendChild(line);
  });

  if (state.runActivityAutoScroll) {
    elements.runActivityPane.scrollTop = elements.runActivityPane.scrollHeight;
  }
}

function setRunLogAutoScroll(enabled, persist = true) {
  state.runLogAutoScroll = Boolean(enabled);
  if (!elements.runLogAutoScrollBtn) return;
  elements.runLogAutoScrollBtn.textContent = state.runLogAutoScroll ? "Auto-scroll On" : "Auto-scroll Off";
  elements.runLogAutoScrollBtn.classList.toggle("active", state.runLogAutoScroll);
  if (persist) {
    try {
      localStorage.setItem(RUN_LOG_AUTOSCROLL_STORAGE_KEY, state.runLogAutoScroll ? "1" : "0");
    } catch {
      // Ignore storage failures.
    }
  }
}

function toggleRunLogAutoScroll() {
  setRunLogAutoScroll(!state.runLogAutoScroll, true);
}

function renderRunLogTail() {
  if (!elements.runLogPane) return;
  clearNode(elements.runLogPane);

  const lines = Array.isArray(state.selectedRunLogLines) ? state.selectedRunLogLines : [];
  const total = Number(state.selectedRunLogLineCount || lines.length) || 0;
  const seen = lines.length;
  const path = state.selectedRunLogPath ? ` • ${state.selectedRunLogPath}` : "";
  elements.runLogMeta.textContent = `${seen}/${total} lines (showing latest)${path ? path : ""}`;

  if (!lines.length) {
    const empty = document.createElement("p");
    empty.className = "terminal-event info";
    empty.textContent = "No run log lines yet.";
    elements.runLogPane.appendChild(empty);
    return;
  }

  lines.forEach((line) => {
    const row = document.createElement("div");
    const text = String(line || "");
    const isWarn = /\bWARN\b/.test(text);
    const isError = /\bERR|ERROR\b/.test(text);
    row.className = `terminal-event ${isWarn || isError ? "warn" : "info"}`;
    row.textContent = text;
    elements.runLogPane.appendChild(row);
  });

  if (state.runLogAutoScroll) {
    elements.runLogPane.scrollTop = elements.runLogPane.scrollHeight;
  }
}

function setInspectorOpen(open, updateUrl = true) {
  state.inspectorOpen = Boolean(open);
  elements.inspectorDrawer.classList.toggle("hidden", !state.inspectorOpen);
  elements.inspectorDrawer.setAttribute("aria-hidden", state.inspectorOpen ? "false" : "true");
  if (state.inspectorOpen) renderInspector();
  if (updateUrl) syncUrlState();
}

function setInspectorTab(tab, updateUrl = true) {
  const normalized = ["summary", "commits", "events", "repos"].includes(String(tab || "")) ? String(tab) : "summary";
  state.inspectorTab = normalized;
  if (state.route === "runs") {
    state.runDetailView = runDetailFromInspectorTab(normalized);
    renderDetailRouteControls();
  } else if (state.route === "repos") {
    state.repoDetailView = repoDetailFromInspectorTab(normalized);
    renderDetailRouteControls();
  }
  elements.inspectorTabs.forEach((button) => {
    button.classList.toggle("active", String(button.dataset.tab || "") === normalized);
  });
  renderInspector();
  if (updateUrl) syncUrlState();
}

function openInspector(tab = "summary", updateUrl = true) {
  setInspectorOpen(true, false);
  setInspectorTab(tab, false);
  if (updateUrl) syncUrlState();
}

function closeInspector(updateUrl = true) {
  setInspectorOpen(false, updateUrl);
}

function renderInspectorSummary() {
  const run = state.selectedRun || state.latestSnapshot?.latest_run || {};
  const repo = state.selectedRepoDetails || null;
  const wrapper = document.createElement("div");
  wrapper.className = "inspector-stack";

  const runCard = document.createElement("article");
  runCard.className = "inspector-card";
  runCard.innerHTML = `
    <p class="inspector-card-title">Run Snapshot</p>
    <p class="inspector-card-value">${formatRunId(run.run_id || "")}</p>
    <p class="inspector-card-meta">${run.state || "unknown"} • ${formatDuration(run.duration_seconds || 0)} • cycle ${run.latest_cycle || 0}</p>
  `;

  const repoCard = document.createElement("article");
  repoCard.className = "inspector-card";
  if (repo?.repo) {
    repoCard.innerHTML = `
      <p class="inspector-card-title">Repo Focus</p>
      <p class="inspector-card-value">${repo.repo}</p>
      <p class="inspector-card-meta">${repo?.summary?.commits_recent || 0} commits • changed ${repo?.summary?.changed_runs || 0} • no-change ${repo?.summary?.no_change_runs || 0}</p>
    `;
  } else {
    repoCard.innerHTML = `
      <p class="inspector-card-title">Repo Focus</p>
      <p class="inspector-card-value">None selected</p>
      <p class="inspector-card-meta">Select a repo from Insights to inspect it here.</p>
    `;
  }

  wrapper.append(runCard, repoCard);
  return wrapper;
}

function buildInspectorTable(columns, rows, emptyText) {
  const tableWrap = document.createElement("div");
  tableWrap.className = "table-wrap inspector-table-wrap";
  const table = document.createElement("table");
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  columns.forEach((col) => {
    const th = document.createElement("th");
    th.textContent = col;
    headRow.appendChild(th);
  });
  head.appendChild(headRow);
  table.appendChild(head);

  const body = document.createElement("tbody");
  if (!rows.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = columns.length;
    cell.className = "muted";
    cell.textContent = emptyText;
    row.appendChild(cell);
    body.appendChild(row);
  } else {
    rows.forEach((cells) => {
      const row = document.createElement("tr");
      cells.forEach((cellDef) => {
        const td = document.createElement("td");
        td.textContent = String(cellDef.text ?? "");
        if (cellDef.mono) td.classList.add("mono");
        if (cellDef.title) td.title = String(cellDef.title);
        row.appendChild(td);
      });
      body.appendChild(row);
    });
  }
  table.appendChild(body);
  tableWrap.appendChild(table);
  return tableWrap;
}

function renderInspectorCommits() {
  const commits = (state.selectedRunCommits || []).map(normalizeRunCommit).sort((left, right) => (right.ts || 0) - (left.ts || 0));
  const rows = commits.map((entry) => [
    { text: formatUtc(entry.time_utc), mono: true, title: formatRelativeIso(entry.time_utc) },
    { text: entry.repo || "unknown" },
    { text: String(entry.hash || "").slice(0, 12), mono: true, title: entry.hash || "" },
    { text: entry.subject || "" },
  ]);
  return buildInspectorTable(["Time", "Repo", "Hash", "Subject"], rows, "No commits for selected run.");
}

function renderInspectorEvents() {
  const events = state.selectedRunEvents || [];
  const grouped = [];
  events.forEach((event) => {
    const level = String(event.level || "INFO").toUpperCase();
    const message = String(event.message || "");
    const tokenMatch = message.match(/^([A-Z_]+)\b/);
    const token = tokenMatch ? tokenMatch[1] : "EVENT";
    const key = `${level}:${token}`;
    const prev = grouped[grouped.length - 1];
    if (prev && prev.key === key) {
      prev.count += 1;
      prev.last = event;
      return;
    }
    grouped.push({ key, count: 1, first: event, last: event, level, token });
  });

  const rows = grouped
    .slice()
    .reverse()
    .map((entry) => [
      { text: formatUtc(entry.last.ts), mono: true, title: formatRelativeIso(entry.last.ts) },
      { text: entry.level, mono: true },
      { text: `${entry.token}${entry.count > 1 ? ` (${entry.count}x)` : ""}`, mono: true },
      { text: entry.first.message || "" },
    ]);
  return buildInspectorTable(["Time", "Level", "Group", "Detail"], rows, "No events for selected run.");
}

function renderInspectorRepos() {
  const timeline = state.selectedRepoDetails?.timeline || [];
  const rows = timeline.map((entry) => [
    { text: formatRunId(entry.run_id), mono: true },
    { text: entry.state || "-" },
    { text: formatUtc(entry.run_started_at), mono: true, title: formatRelativeIso(entry.run_started_at) },
  ]);
  return buildInspectorTable(["Run", "State", "Start"], rows, "No repo timeline for selected repo.");
}

function renderInspector() {
  const run = state.selectedRun || state.latestSnapshot?.latest_run || {};
  const repo = state.selectedRepoName || state.selectedRepoDetails?.repo || "";
  elements.inspectorTitle.textContent = "Run & Repo Inspector";
  elements.inspectorMeta.textContent = `${formatRunId(run.run_id || "") || "-"} • ${repo || "no repo selected"} • ${state.inspectorTab}`;
  clearNode(elements.inspectorBody);

  if (state.inspectorTab === "summary") {
    elements.inspectorBody.appendChild(renderInspectorSummary());
    return;
  }
  if (state.inspectorTab === "commits") {
    elements.inspectorBody.appendChild(renderInspectorCommits());
    return;
  }
  if (state.inspectorTab === "events") {
    elements.inspectorBody.appendChild(renderInspectorEvents());
    return;
  }
  elements.inspectorBody.appendChild(renderInspectorRepos());
}

function filteredRepoInsights(items) {
  const query = String(state.repoInsightsSearch || "").trim().toLowerCase();
  const focus = String(state.repoInsightsStateFilter || "all");
  return (items || []).filter((item) => {
    const commitsRecent = Number(item.commits_recent || 0);
    const changedRuns = Number(item.changed_runs || 0);
    const noChangeRuns = Number(item.no_change_runs || 0);
    const lockSkipRuns = Number(item.lock_skip_runs || 0);
    if (focus === "active" && commitsRecent <= 0) return false;
    if (focus === "changed" && changedRuns <= 0) return false;
    if (focus === "no_change" && noChangeRuns <= 0) return false;
    if (focus === "lock_skip" && lockSkipRuns <= 0) return false;
    if (!query) return true;
    const haystack = `${item.repo || ""} ${item.latest_state || ""}`.toLowerCase();
    return haystack.includes(query);
  });
}

function selectRepo(repoName, options = {}) {
  const targetRepo = String(repoName || "").trim();
  if (!targetRepo) return;
  const detailView = options.detailView
    ? normalizeRepoDetailView(options.detailView)
    : options.inspectorTab
      ? repoDetailFromInspectorTab(options.inspectorTab)
      : state.repoDetailView;
  setRepoDetailView(detailView, { updateUrl: false, focus: false });
  if (options.scroll) {
    navigateToSection("repos", repoSectionForDetailView(detailView));
  }
  if (options.openInspector) {
    openInspector(options.inspectorTab || "repos");
  }
  if (state.selectedRepoName === targetRepo && !options.forceReload) {
    return;
  }
  state.selectedRepoName = targetRepo;
  state.selectedRepoDetails = null;
  state.selectedRepoDetailsUpdatedAt = 0;
  renderDetailRouteControls();
  syncUrlState();
  renderRepoInsightsTable(state.repoInsights);
}

function renderRepoInsightsTable(items) {
  clearNode(elements.repoInsightsTable);
  const allItems = items || [];
  const filtered = filteredRepoInsights(allItems);
  elements.repoInsightsMeta.textContent = `${filtered.length}/${allItems.length} repos`;

  if (!filtered.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 9;
    cell.className = "muted";
    cell.textContent = allItems.length ? "No repos match current filters." : "No repo insights available.";
    row.appendChild(cell);
    elements.repoInsightsTable.appendChild(row);
    if (!allItems.length) {
      elements.repoDetailsMeta.textContent = "Select a repo from insights table.";
      elements.repoTimelineMeta.textContent = "";
      clearNode(elements.repoDetailsCommitsTable);
      clearNode(elements.repoTimelineTable);
    } else {
      elements.repoDetailsMeta.textContent = "Selected repo is hidden by current insights filters.";
    }
    return;
  }

  const known = new Set(filtered.map((item) => String(item.repo || "")));
  if (state.requestedRepoName && known.has(state.requestedRepoName)) {
    state.selectedRepoName = state.requestedRepoName;
    state.requestedRepoName = "";
    state.selectedRepoDetails = null;
    state.selectedRepoDetailsUpdatedAt = 0;
    renderDetailRouteControls();
    syncUrlState();
  }
  if (!state.selectedRepoName || !known.has(state.selectedRepoName)) {
    state.selectedRepoName = String(filtered[0].repo || "");
    state.requestedRepoName = "";
    state.selectedRepoDetails = null;
    state.selectedRepoDetailsUpdatedAt = 0;
    renderDetailRouteControls();
    syncUrlState();
  }

  filtered.forEach((item) => {
    const row = document.createElement("tr");
    row.className = "selectable";
    if (item.repo === state.selectedRepoName) row.classList.add("selected");
    row.addEventListener("click", () => {
      const repo = String(item.repo || "");
      if (!repo) return;
      selectRepo(repo, { forceReload: true, openInspector: true, inspectorTab: "repos" });
    });

    const repoCell = document.createElement("td");
    repoCell.className = "mono";
    repoCell.textContent = item.repo || "-";

    const commitsCell = document.createElement("td");
    commitsCell.textContent = String(item.commits_recent || 0);

    const lastCommitCell = document.createElement("td");
    lastCommitCell.className = "mono";
    lastCommitCell.textContent = formatUtc(item.last_commit_time_utc);
    lastCommitCell.title = formatRelativeIso(item.last_commit_time_utc);

    const stateCell = document.createElement("td");
    stateCell.appendChild(createStateBadge(item.latest_state || "-"));

    const seenRunsCell = document.createElement("td");
    seenRunsCell.textContent = String(item.seen_runs || 0);

    const changedCell = document.createElement("td");
    changedCell.textContent = String(item.changed_runs || 0);

    const noChangeCell = document.createElement("td");
    noChangeCell.textContent = String(item.no_change_runs || 0);

    const lockSkipCell = document.createElement("td");
    lockSkipCell.textContent = String(item.lock_skip_runs || 0);

    const linkCell = document.createElement("td");
    const linkBtn = document.createElement("button");
    linkBtn.type = "button";
    linkBtn.className = "table-link-btn";
    linkBtn.textContent = "Copy";
    linkBtn.title = "Copy deep link";
    linkBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      const path = pathForRepoDetail(item.repo, state.repoDetailView);
      void copyShareLink(path, String(item.repo || "repo"));
    });
    linkCell.appendChild(linkBtn);

    row.append(
      repoCell,
      commitsCell,
      lastCommitCell,
      stateCell,
      seenRunsCell,
      changedCell,
      noChangeCell,
      lockSkipCell,
      linkCell,
    );
    elements.repoInsightsTable.appendChild(row);
  });

  if (!state.selectedRepoDetails || state.selectedRepoDetails?.repo !== state.selectedRepoName) {
    void loadRepoDetails(state.selectedRepoName, false);
  } else {
    renderRepoDetails(state.selectedRepoDetails);
  }
}

function renderRepoDetails(details) {
  if (!details) {
    elements.repoDetailsMeta.textContent = "Select a repo from insights table.";
    elements.repoTimelineMeta.textContent = "";
    clearNode(elements.repoDetailsCommitsTable);
    clearNode(elements.repoTimelineTable);
    if (state.inspectorOpen) renderInspector();
    return;
  }

  const summary = details.summary || {};
  elements.repoDetailsMeta.textContent = `${details.repo} • ${summary.commits_recent || 0} commits • changed ${summary.changed_runs || 0} • no-change ${summary.no_change_runs || 0} • lock-skip ${summary.lock_skip_runs || 0}`;
  elements.repoTimelineMeta.textContent = `${(details.timeline || []).length} run samples`;

  clearNode(elements.repoDetailsCommitsTable);
  const commits = details.commits || [];
  if (!commits.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 3;
    cell.className = "muted";
    cell.textContent = "No recent commits for selected window.";
    row.appendChild(cell);
    elements.repoDetailsCommitsTable.appendChild(row);
  } else {
    commits.forEach((entry) => {
      const row = document.createElement("tr");
      const time = document.createElement("td");
      time.className = "mono";
      time.textContent = formatUtc(entry.time_utc);
      time.title = formatRelativeIso(entry.time_utc);
      const hash = document.createElement("td");
      hash.className = "mono";
      hash.textContent = String(entry.hash || "").slice(0, 12);
      hash.title = String(entry.hash || "");
      const subject = document.createElement("td");
      subject.textContent = entry.subject || "";
      row.append(time, hash, subject);
      elements.repoDetailsCommitsTable.appendChild(row);
    });
  }

  clearNode(elements.repoTimelineTable);
  const timeline = details.timeline || [];
  if (!timeline.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 3;
    cell.className = "muted";
    cell.textContent = "No run timeline for this repo in selected history.";
    row.appendChild(cell);
    elements.repoTimelineTable.appendChild(row);
  } else {
    timeline.forEach((entry) => {
      const row = document.createElement("tr");
      const run = document.createElement("td");
      run.className = "mono";
      run.textContent = formatRunId(entry.run_id);
      const stateCell = document.createElement("td");
      stateCell.appendChild(createStateBadge(entry.state || "-"));
      const started = document.createElement("td");
      started.className = "mono";
      started.textContent = formatUtc(entry.run_started_at);
      started.title = formatRelativeIso(entry.run_started_at);
      row.append(run, stateCell, started);
      elements.repoTimelineTable.appendChild(row);
    });
  }

  if (state.inspectorOpen) {
    renderInspector();
  }
}

function updateSelectedRunMeta(run) {
  if (!run) {
    elements.selectedRunMeta.textContent = "";
    return;
  }
  const started = formatUtc(run.run_started_at || run.first_ts);
  elements.selectedRunMeta.textContent = `${formatRunId(run.run_id)} • ${run.state || "unknown"} • ${state.selectedRunCommits.length} commits • start ${started}`;
}

function applySelectedRunData(run, commits, events, runLogPayload = null) {
  state.selectedRun = run || null;
  state.selectedRunCommits = commits || [];
  state.selectedRunEvents = events || [];
  const runLogLines = runLogPayload && Array.isArray(runLogPayload.run_log_lines) ? runLogPayload.run_log_lines : [];
  const runLogLineCount = runLogPayload && Number.isFinite(Number(runLogPayload.run_log_line_count))
    ? Number(runLogPayload.run_log_line_count)
    : runLogLines.length;
  if (runLogPayload) {
    state.selectedRunLogLines = runLogLines;
    state.selectedRunLogLineCount = Math.max(0, runLogLineCount || 0);
    state.selectedRunLogPath = String(runLogPayload.run_log_path || "");
    state.selectedRunLogLoadedAt = Date.now();
  } else if (!run) {
    state.selectedRunLogLines = [];
    state.selectedRunLogPath = "";
    state.selectedRunLogLineCount = 0;
    state.selectedRunLogLoadedAt = 0;
  }

  renderRepoStates(state.selectedRun || {});
  updateRunCommitRepoOptions(state.selectedRunCommits);
  renderRunCommitTable();
  renderEvents(state.selectedRunEvents);
  renderRunLogTail();
  state.selectedRunActivity = buildRunActivityItems(
    state.selectedRun || {},
    state.selectedRunCommits,
    state.selectedRunEvents,
    state.selectedRunLogLines,
  );
  state.selectedRunActivityUpdatedAt = Date.now();
  renderRunActivityStream();
  updateSelectedRunMeta(state.selectedRun);
  if (state.inspectorOpen) {
    renderInspector();
  }
}

function ensureSelectedRun(snapshot) {
  const runs = snapshot?.run_history || [];
  const runIds = new Set(runs.map((item) => item.run_id));

  if (state.requestedRunId && runIds.has(state.requestedRunId)) {
    state.selectedRunId = state.requestedRunId;
    state.requestedRunId = "";
    state.selectedRun = null;
    state.selectedRunCommits = [];
    state.selectedRunEvents = [];
    state.selectedRunLogLines = [];
    state.selectedRunLogPath = "";
    state.selectedRunLogLineCount = 0;
    state.selectedRunLogLoadedAt = 0;
    state.selectedRunDetailsAt = 0;
    state.selectedRunActivity = [];
    state.selectedRunActivityUpdatedAt = 0;
    renderRunLogTail();
    renderRunActivityStream();
    renderDetailRouteControls();
    syncUrlState();
    return;
  }

  if (!state.selectedRunId || !runIds.has(state.selectedRunId)) {
    state.selectedRunId = snapshot?.latest_run?.run_id || runs[0]?.run_id || null;
    state.requestedRunId = "";
    state.selectedRun = null;
    state.selectedRunCommits = [];
    state.selectedRunEvents = [];
    state.selectedRunLogLines = [];
    state.selectedRunLogPath = "";
    state.selectedRunLogLineCount = 0;
    state.selectedRunLogLoadedAt = 0;
    state.selectedRunDetailsAt = 0;
    state.selectedRunActivity = [];
    state.selectedRunActivityUpdatedAt = 0;
    renderRunLogTail();
    renderRunActivityStream();
    renderDetailRouteControls();
    syncUrlState();
  }
}

function alertQuery() {
  return {
    alert_stall_minutes: String(ALERT_DEFAULTS.stallMinutes),
    alert_no_commit_minutes: String(ALERT_DEFAULTS.noCommitMinutes),
    alert_lock_skip_threshold: String(ALERT_DEFAULTS.lockSkipThreshold),
  };
}

async function apiPost(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error || data?.message || `${path} failed with status ${response.status}`;
    throw new Error(message);
  }
  return data;
}

function controlRequestPayload() {
  return {
    parallel_repos: clampInt(elements.controlParallelRepos.value, 5, 1, 64),
    max_cycles: clampInt(elements.controlMaxCycles.value, 30, 1, 10000),
    tasks_per_repo: clampInt(elements.controlTasksPerRepo.value, 0, 0, 1000),
  };
}

function repoCatalogKey(repo) {
  return String(repo?.path || repo?.name || "");
}

function normalizeRepoCatalog(records) {
  const normalized = [];
  (records || []).forEach((item) => {
    if (!item || typeof item !== "object") return;
    const path = String(item.path || "").trim();
    if (!path) return;
    const name = String(item.name || "").trim() || path.split("/").pop() || path;
    const branch = String(item.branch || "main").trim() || "main";
    const objective = String(item.objective || "").trim();
    const tasks = clampInt(item.tasks_per_repo, -1, -1, 1000);
    const maxCycles = clampInt(item.max_cycles_per_run, -1, -1, 10000);
    const maxCommits = clampInt(item.max_commits_per_run, -1, -1, 10000);
    const entry = { name, path, branch, objective };
    if (tasks >= 0) entry.tasks_per_repo = tasks;
    if (maxCycles >= 0) entry.max_cycles_per_run = maxCycles;
    if (maxCommits >= 0) entry.max_commits_per_run = maxCommits;
    normalized.push(entry);
  });
  normalized.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  return normalized;
}

function ensureStartRunSelectionInitialized(force = false) {
  const globalDefaultTasks = clampInt(elements.startRunTasksPerRepo.value, 0, 0, 1000);
  const globalDefaultMaxCycles = clampInt(elements.startRunMaxCyclesPerRepo.value, 0, 0, 10000);
  const globalDefaultMaxCommits = clampInt(elements.startRunMaxCommitsPerRepo.value, 0, 0, 10000);
  const previous = state.startRunSelection || {};
  const next = {};
  (state.repoCatalog || []).forEach((repo) => {
    const key = repoCatalogKey(repo);
    if (!key) return;
    const fallbackTasks = clampInt(repo.tasks_per_repo, globalDefaultTasks, 0, 1000);
    const fallbackMaxCycles = clampInt(repo.max_cycles_per_run, globalDefaultMaxCycles, 0, 10000);
    const fallbackMaxCommits = clampInt(repo.max_commits_per_run, globalDefaultMaxCommits, 0, 10000);
    if (!force && previous[key]) {
      next[key] = {
        enabled: Boolean(previous[key].enabled),
        tasks_per_repo: clampInt(previous[key].tasks_per_repo, fallbackTasks, 0, 1000),
        max_cycles_per_run: clampInt(previous[key].max_cycles_per_run, fallbackMaxCycles, 0, 10000),
        max_commits_per_run: clampInt(previous[key].max_commits_per_run, fallbackMaxCommits, 0, 10000),
      };
      return;
    }
    next[key] = {
      enabled: true,
      tasks_per_repo: fallbackTasks,
      max_cycles_per_run: fallbackMaxCycles,
      max_commits_per_run: fallbackMaxCommits,
    };
  });
  state.startRunSelection = next;
}

function filteredStartRunCatalog() {
  const query = String(state.startRunSearch || "").trim().toLowerCase();
  if (!query) return state.repoCatalog || [];
  return (state.repoCatalog || []).filter((repo) => {
    const haystack = `${repo.name || ""} ${repo.path || ""} ${repo.objective || ""}`.toLowerCase();
    return haystack.includes(query);
  });
}

function selectedReposFromModal() {
  const globalDefaultTasks = clampInt(elements.startRunTasksPerRepo.value, 0, 0, 1000);
  const globalDefaultMaxCycles = clampInt(elements.startRunMaxCyclesPerRepo.value, 0, 0, 10000);
  const globalDefaultMaxCommits = clampInt(elements.startRunMaxCommitsPerRepo.value, 0, 0, 10000);
  const customMode = state.startRunMode === "custom";
  return (state.repoCatalog || [])
    .filter((repo) => {
      if (!customMode) return true;
      const selection = state.startRunSelection[repoCatalogKey(repo)];
      return Boolean(selection?.enabled);
    })
    .map((repo) => {
      const key = repoCatalogKey(repo);
      const selection = state.startRunSelection[key] || {};
      const tasks = clampInt(selection.tasks_per_repo, clampInt(repo.tasks_per_repo, globalDefaultTasks, 0, 1000), 0, 1000);
      const maxCycles = clampInt(
        selection.max_cycles_per_run,
        clampInt(repo.max_cycles_per_run, globalDefaultMaxCycles, 0, 10000),
        0,
        10000,
      );
      const maxCommits = clampInt(
        selection.max_commits_per_run,
        clampInt(repo.max_commits_per_run, globalDefaultMaxCommits, 0, 10000),
        0,
        10000,
      );
      return {
        name: repo.name,
        path: repo.path,
        branch: repo.branch,
        objective: repo.objective || "",
        tasks_per_repo: tasks,
        max_cycles_per_run: maxCycles,
        max_commits_per_run: maxCommits,
      };
    });
}

function setStartRunModalBusy(busy) {
  state.startRunBusy = Boolean(busy);
  elements.startRunConfirmBtn.disabled = state.startRunBusy;
  elements.startRunCloseBtn.disabled = state.startRunBusy;
  elements.startRunCancelBtn.disabled = state.startRunBusy;
}

function setStartRunMode(mode) {
  const normalized = mode === "custom" ? "custom" : "auto";
  if (state.startRunMode === normalized) return;
  state.startRunMode = normalized;
  if (normalized === "custom") {
    ensureStartRunSelectionInitialized(false);
  }
}

function setStartRunModalOpen(open) {
  state.startRunModalOpen = Boolean(open);
  elements.startRunModal.classList.toggle("hidden", !state.startRunModalOpen);
  elements.startRunModal.setAttribute("aria-hidden", state.startRunModalOpen ? "false" : "true");
  if (!state.startRunModalOpen) return;
  window.setTimeout(() => {
    elements.startRunSearch.focus();
    elements.startRunSearch.select();
  }, 0);
}

function renderStartRunRepoTable() {
  clearNode(elements.startRunRepoTable);
  const rows = filteredStartRunCatalog();
  const customMode = state.startRunMode === "custom";
  const selectedCount = selectedReposFromModal().length;
  const total = (state.repoCatalog || []).length;
  elements.startRunRepoCountMeta.textContent = `${selectedCount}/${total} repos selected • mode ${customMode ? "custom" : "auto"}`;
  elements.startRunModeAuto.checked = !customMode;
  elements.startRunModeCustom.checked = customMode;
  elements.startRunSelectAllBtn.disabled = false;
  elements.startRunSelectNoneBtn.disabled = false;

  if (!rows.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.className = "muted";
    cell.textContent = "No repositories match your search.";
    row.appendChild(cell);
    elements.startRunRepoTable.appendChild(row);
    return;
  }

  rows.forEach((repo) => {
    const key = repoCatalogKey(repo);
    const selection = state.startRunSelection[key] || {
      enabled: true,
      tasks_per_repo: 0,
      max_cycles_per_run: 0,
      max_commits_per_run: 0,
    };
    const setSelection = (patch = {}) => {
      const currentSelection = state.startRunSelection[key] || selection;
      state.startRunSelection[key] = {
        ...currentSelection,
        ...patch,
      };
    };

    const row = document.createElement("tr");

    const useCell = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(selection.enabled);
    checkbox.disabled = false;
    checkbox.addEventListener("change", () => {
      if (!customMode) {
        setStartRunMode("custom");
      }
      setSelection({
        enabled: Boolean(checkbox.checked),
      });
      renderStartRunRepoTable();
    });
    useCell.appendChild(checkbox);

    const repoCell = document.createElement("td");
    repoCell.className = "mono";
    repoCell.textContent = repo.name || "-";
    repoCell.title = repo.path || "";

    const branchCell = document.createElement("td");
    branchCell.textContent = repo.branch || "main";

    const tasksCell = document.createElement("td");
    const tasksInput = document.createElement("input");
    tasksInput.type = "number";
    tasksInput.min = "0";
    tasksInput.max = "1000";
    tasksInput.value = String(clampInt(selection.tasks_per_repo, 0, 0, 1000));
    tasksInput.disabled = !customMode || !selection.enabled;
    tasksInput.addEventListener("change", () => {
      if (!customMode) return;
      setSelection({
        enabled: true,
        tasks_per_repo: clampInt(tasksInput.value, 0, 0, 1000),
      });
    });
    tasksCell.appendChild(tasksInput);

    const maxCyclesCell = document.createElement("td");
    const maxCyclesInput = document.createElement("input");
    maxCyclesInput.type = "number";
    maxCyclesInput.min = "0";
    maxCyclesInput.max = "10000";
    maxCyclesInput.value = String(clampInt(selection.max_cycles_per_run, 0, 0, 10000));
    maxCyclesInput.disabled = !customMode || !selection.enabled;
    maxCyclesInput.addEventListener("change", () => {
      if (!customMode) return;
      setSelection({
        enabled: true,
        max_cycles_per_run: clampInt(maxCyclesInput.value, 0, 0, 10000),
      });
    });
    maxCyclesCell.appendChild(maxCyclesInput);

    const maxCommitsCell = document.createElement("td");
    const maxCommitsInput = document.createElement("input");
    maxCommitsInput.type = "number";
    maxCommitsInput.min = "0";
    maxCommitsInput.max = "10000";
    maxCommitsInput.value = String(clampInt(selection.max_commits_per_run, 0, 0, 10000));
    maxCommitsInput.disabled = !customMode || !selection.enabled;
    maxCommitsInput.addEventListener("change", () => {
      if (!customMode) return;
      setSelection({
        enabled: true,
        max_commits_per_run: clampInt(maxCommitsInput.value, 0, 0, 10000),
      });
    });
    maxCommitsCell.appendChild(maxCommitsInput);

    const setRowCheckedState = () => {
      row.dataset.selected = String(Boolean((state.startRunSelection[key] || selection).enabled));
    };
    const syncRowState = () => {
      row.classList.toggle("selected", Boolean((state.startRunSelection[key] || selection).enabled));
      setRowCheckedState();
    };
    const toggleRow = (event) => {
      if (event.target instanceof HTMLInputElement) return;
      event.preventDefault();
      if (!customMode) {
        setStartRunMode("custom");
      }
      setSelection({ enabled: !Boolean((state.startRunSelection[key] || selection).enabled) });
      syncRowState();
      renderStartRunRepoTable();
    };
    row.addEventListener("click", toggleRow);
    row.addEventListener("keydown", (event) => {
      const key = String(event.key || "");
      if (key === "Enter" || key === " ") {
        event.preventDefault();
        toggleRow(event);
      }
    });
    row.tabIndex = 0;
    row.setAttribute("role", "button");
    row.setAttribute("aria-label", `${repo.name || "repo"} launch selection`);
    syncRowState();
    repoCell.style.cursor = "pointer";

    row.append(useCell, repoCell, branchCell, tasksCell, maxCyclesCell, maxCommitsCell);
    elements.startRunRepoTable.appendChild(row);
  });
}

async function loadReposCatalog(force = false) {
  if (!force && Date.now() - state.repoCatalogUpdatedAt < REPOS_CATALOG_REFRESH_MS && state.repoCatalog.length) return state.repoCatalog;
  const candidates = [
    "/api/repos_catalog",
    "/api/repos-catalog",
    "/api/repos/catalog",
    "/api/repos",
    "/api/repos-list",
    "/api/repos/list",
    "/api/repositories",
  ];
  let payload = null;
  let lastError = "unknown error";
  for (const path of candidates) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        payload = await response.json();
        break;
      }
      if (response.status !== 404) {
        throw new Error(`repos catalog failed with status ${response.status} (${path})`);
      }
      lastError = `repos catalog not found at ${path}`;
    } catch (error) {
      lastError = String(error);
    }
  }
  if (!payload) {
    throw new Error(lastError);
  }
  const reposPayload = Array.isArray(payload) ? payload : payload.repos || [];
  state.repoCatalog = normalizeRepoCatalog(reposPayload);
  state.repoCatalogUpdatedAt = Date.now();
  ensureStartRunSelectionInitialized(false);
  return state.repoCatalog;
}

async function openStartRunModal(action = "start") {
  state.startRunAction = String(action || "start");
  setCommandPaletteOpen(false);
  setShortcutsOpen(false);
  setStartRunModalOpen(true);
  setStartRunModalBusy(true);
  elements.startRunParallelRepos.value = String(clampInt(elements.controlParallelRepos.value, 5, 1, 64));
  elements.startRunMaxCycles.value = String(clampInt(elements.controlMaxCycles.value, 30, 1, 10000));
  elements.startRunTasksPerRepo.value = String(clampInt(elements.controlTasksPerRepo.value, 0, 0, 1000));
  elements.startRunMaxCyclesPerRepo.value = "0";
  elements.startRunMaxCommitsPerRepo.value = "0";
  state.startRunMode = "auto";
  state.startRunSearch = "";
  elements.startRunSearch.value = "";
  elements.startRunRepoCountMeta.textContent = "Loading repositories...";
  clearNode(elements.startRunRepoTable);
  {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.className = "muted";
    cell.textContent = "Loading repository catalog...";
    row.appendChild(cell);
    elements.startRunRepoTable.appendChild(row);
  }
  try {
    await loadReposCatalog(true);
    ensureStartRunSelectionInitialized(false);
    renderStartRunRepoTable();
    setStartRunModalBusy(false);
    return true;
  } catch (error) {
    const canUseCachedCatalog = Array.isArray(state.repoCatalog) && state.repoCatalog.length > 0;
    if (canUseCachedCatalog) {
      ensureStartRunSelectionInitialized(false);
      renderStartRunRepoTable();
      elements.startRunRepoCountMeta.textContent = "Catalog refresh failed; showing cached repositories.";
      setStartRunModalBusy(false);
      toastAlert({
        id: "start_run_catalog_stale",
        run_id: "",
        severity: "warn",
        title: "Using cached repo catalog",
        detail: String(error),
      });
      return true;
    }
    clearNode(elements.startRunRepoTable);
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.className = "muted";
    cell.textContent = `Failed to load repositories: ${String(error)}`;
    row.appendChild(cell);
    elements.startRunRepoTable.appendChild(row);
    elements.startRunRepoCountMeta.textContent = "Catalog load failed. Retry from Configure Next Run.";
    setStartRunModalBusy(false);
    toastAlert({
      id: "start_run_catalog_error",
      run_id: "",
      severity: "critical",
      title: "Repo catalog load failed",
      detail: String(error),
    });
    return false;
  }
}

async function openRunLauncherPage(action = "start") {
  setRoute("launch", { updateUrl: true, replaceHistory: false });
  if (state.startRunModalOpen) {
    return;
  }
  await openStartRunModal(action);
}

function closeStartRunModal() {
  if (state.startRunBusy) return;
  if (state.route === "launch") {
    setRoute(state.lastNonLaunchRoute || "overview", { updateUrl: true, replaceHistory: false });
  }
  setStartRunModalOpen(false);
}

function startRunRequestPayloadFromModal() {
  const parallelRepos = clampInt(elements.startRunParallelRepos.value, 5, 1, 64);
  const maxCycles = clampInt(elements.startRunMaxCycles.value, 30, 1, 10000);
  const defaultTasksPerRepo = clampInt(elements.startRunTasksPerRepo.value, 0, 0, 1000);
  const repos = selectedReposFromModal();
  if (!repos.length) {
    toastAlert({
      id: "start_run_no_repo",
      run_id: "",
      severity: "warn",
      title: "No repos selected",
      detail: "Select at least one repository to start a run.",
    });
    return null;
  }
  elements.controlParallelRepos.value = String(parallelRepos);
  elements.controlMaxCycles.value = String(maxCycles);
  elements.controlTasksPerRepo.value = String(defaultTasksPerRepo);
  return {
    parallel_repos: parallelRepos,
    max_cycles: maxCycles,
    tasks_per_repo: defaultTasksPerRepo,
    repos,
  };
}

function setControlBusy(busy) {
  state.controlBusy = busy;
  renderControlStatus(state.controlStatus || {});
  if (state.latestSnapshot) {
    renderAgentPilot(state.latestSnapshot);
  }
}

async function runControlAction(action, options = {}) {
  const payloadOverride = options && typeof options === "object" ? options.payloadOverride : null;
  setControlBusy(true);
  try {
    let payload = {};
    if (action === "start" || action === "restart") {
      payload = payloadOverride && typeof payloadOverride === "object" ? payloadOverride : controlRequestPayload();
    }
    if (action === "stop") {
      payload = { force: false, wait_seconds: 12 };
    }
    if (action === "normalize") {
      payload = { force: true, wait_seconds: 8 };
    }
    const result = await apiPost(`/api/control/${action}`, payload);
    renderControlStatus(result.control_status || state.controlStatus || {});
    await loadSnapshot();
    await loadRepoInsights(true);
    return { ok: true, result };
  } catch (error) {
    console.error(error);
    toastAlert({
      id: `control_${action}_error`,
      run_id: "",
      severity: "critical",
      title: `Control ${action} failed`,
      detail: String(error),
    });
    return { ok: false, error: String(error) };
  } finally {
    setControlBusy(false);
  }
}

async function loadRepoInsights(force = false) {
  if (!force && Date.now() - state.repoInsightsUpdatedAt < REPO_INSIGHTS_REFRESH_MS) return;
  const query = new URLSearchParams({
    history_limit: "60",
    commit_hours: String(state.repoInsightsHours),
    top: "120",
  });
  const response = await fetch(`/api/repo_insights?${query.toString()}`);
  if (!response.ok) throw new Error(`repo insights failed with status ${response.status}`);
  const payload = await response.json();
  state.repoInsights = payload.repo_insights || [];
  state.repoInsightsUpdatedAt = Date.now();
  renderRepoInsightsTable(state.repoInsights);
}

async function loadRepoDetails(repoName, force = false) {
  const repo = String(repoName || "").trim();
  if (!repo) return;
  if (!force && Date.now() - state.selectedRepoDetailsUpdatedAt < REPO_INSIGHTS_REFRESH_MS && state.selectedRepoDetails?.repo === repo) {
    renderRepoDetails(state.selectedRepoDetails);
    return;
  }
  if (state.pendingRepoDetailsFor === repo) return;
  state.pendingRepoDetailsFor = repo;

  try {
    const query = new URLSearchParams({
      repo,
      commit_hours: String(state.repoInsightsHours),
      commit_limit: "140",
      run_history: "100",
    });
    const response = await fetch(`/api/repo_details?${query.toString()}`);
    if (!response.ok) throw new Error(`repo details failed with status ${response.status}`);
    const payload = await response.json();
    if (state.selectedRepoName !== repo) return;
    state.selectedRepoDetails = payload;
    state.selectedRepoDetailsUpdatedAt = Date.now();
    renderRepoDetails(state.selectedRepoDetails);
  } catch (error) {
    console.error(error);
    elements.repoDetailsMeta.textContent = `Failed loading ${repo}: ${String(error)}`;
  } finally {
    if (state.pendingRepoDetailsFor === repo) state.pendingRepoDetailsFor = "";
  }
}

async function loadRunDetails(runId) {
  if (!runId) return;
  state.pendingRunDetailsFor = runId;

  try {
    const query = new URLSearchParams({
      run_id: runId,
      commit_limit: String(Math.min(RUN_COMMITS_VIEW_LIMIT, 500)),
      event_limit: "320",
      run_log_limit: String(RUN_LOG_LINE_LIMIT),
      ...alertQuery(),
    });
    const response = await fetch(`/api/run_details?${query.toString()}`);
    if (!response.ok) throw new Error(`run details failed with status ${response.status}`);
    const payload = await response.json();

    if (state.selectedRunId !== runId) return;
    state.selectedRunDetailsAt = Date.now();
    const normalizedCommits = (payload.run_commits_detailed || []).map(normalizeRunCommit);
    const mergedCommits = mergeRunCommits(state.selectedRunCommits || [], normalizedCommits, RUN_COMMITS_VIEW_LIMIT);
    applySelectedRunData(
      payload.run || {},
      mergedCommits,
      payload.latest_events || [],
      payload.run_log_tail || null,
    );
    renderRunHistory(state.runHistory);
  } catch (error) {
    if (state.selectedRunId === runId) {
      elements.selectedRunMeta.textContent = `Failed loading ${formatRunId(runId)}: ${String(error)}`;
    }
    console.error(error);
  } finally {
    if (state.pendingRunDetailsFor === runId) state.pendingRunDetailsFor = null;
  }
}

async function loadRunLogTail(runId, options = {}) {
  const force = Boolean(options.force);
  if (!runId) return;
  const normalizedRunId = String(runId).trim();
  if (!normalizedRunId) return;
  if (!force && state.pendingRunLogFor === normalizedRunId) return;
  if (!force && Date.now() - state.selectedRunLogLoadedAt < RUN_LOG_REFRESH_MS && state.selectedRunLogLoadedAt > 0) return;

  state.pendingRunLogFor = normalizedRunId;
  try {
    const query = new URLSearchParams({
      run_id: normalizedRunId,
      run_log_limit: String(RUN_LOG_LINE_LIMIT),
    });
    const response = await fetch(`/api/run_log_tail?${query.toString()}`);
    if (!response.ok) throw new Error(`run log tail failed with status ${response.status}`);
    const payload = await response.json();

    if (state.selectedRunId !== normalizedRunId) return;
    const liveCommits = (payload.run_commits_detailed || payload.run_commits || []).map(normalizeRunCommit);
    const mergedCommits = mergeRunCommits(state.selectedRunCommits || [], liveCommits, RUN_COMMITS_VIEW_LIMIT);
    applySelectedRunData(
      state.selectedRun || {},
      mergedCommits,
      state.selectedRunEvents || [],
      payload,
    );
  } catch (error) {
    console.error(error);
  } finally {
    if (state.pendingRunLogFor === normalizedRunId) state.pendingRunLogFor = null;
  }
}

function renderSnapshot(snapshot) {
  state.latestSnapshot = snapshot || null;
  state.runHistory = snapshot.run_history || [];
  state.lastSnapshotIso = String(snapshot.generated_at || "");
  state.latestAlertsCount = (snapshot.alerts || []).filter((item) => String(item.severity || "").toLowerCase() !== "ok").length;
  syncAgentFromServerStatus(snapshot?.agent_status || null);
  ensureSelectedRun(snapshot);

  renderOverview(snapshot);
  renderCommandDeck(snapshot);
  renderStreamStatus();
  renderAlerts(snapshot.alerts || [], snapshot.config || null);
  renderOperationsCenter(snapshot);
  renderControlStatus(snapshot.control_status || state.controlStatus || {});
  renderNotificationStatus(snapshot.notification_status || state.notificationStatus || {}, snapshot.notification_delivery || null);
  if (snapshot.task_queue && typeof snapshot.task_queue === "object") {
    state.taskQueueSummary = snapshot.task_queue;
    renderTaskQueue();
  }
  renderCommitTable(snapshot.recent_commits || []);
  renderRunHistory(state.runHistory);

    const latestRunId = snapshot?.latest_run?.run_id || null;
  if (state.selectedRunId && latestRunId && state.selectedRunId === latestRunId) {
    applySelectedRunData(snapshot.latest_run || {}, state.selectedRunCommits || [], snapshot.latest_events || []);
    const selectedRunState = String((snapshot.latest_run || {}).state || "").toLowerCase();
    const runActive = selectedRunState && !selectedRunState.startsWith("finished");
    const shouldRefreshRunLog = runActive || (state.route === "runs" && state.runDetailView === "logs");
    const runLogRefreshMs = runActive ? ACTIVE_RUN_LOG_REFRESH_MS : RUN_LOG_REFRESH_MS;
    if (
      shouldRefreshRunLog &&
      !state.pendingRunLogFor &&
      (Date.now() - state.selectedRunLogLoadedAt >= runLogRefreshMs || !state.selectedRunLogLineCount)
    ) {
      void loadRunLogTail(state.selectedRunId, { force: false });
    }

    const runDetailsRefreshMs = runActive ? ACTIVE_RUN_DETAILS_REFRESH_MS : DETAILS_REFRESH_MS;
    if (
      state.pendingRunDetailsFor !== state.selectedRunId &&
      (Date.now() - state.selectedRunDetailsAt > runDetailsRefreshMs || state.selectedRunCommits.length === 0)
    ) {
      void loadRunDetails(state.selectedRunId);
    }
  } else if (state.selectedRun && state.selectedRun.run_id === state.selectedRunId) {
    applySelectedRunData(state.selectedRun, state.selectedRunCommits, state.selectedRunEvents);
  } else if (state.selectedRunId && state.pendingRunDetailsFor !== state.selectedRunId) {
    void loadRunDetails(state.selectedRunId);
  }

  if (Date.now() - state.repoInsightsUpdatedAt > REPO_INSIGHTS_REFRESH_MS) {
    void loadRepoInsights(false);
  }
  if (state.selectedRepoName && Date.now() - state.selectedRepoDetailsUpdatedAt > REPO_INSIGHTS_REFRESH_MS) {
    void loadRepoDetails(state.selectedRepoName, false);
  }
  if (Date.now() - state.notificationEventsUpdatedAt > NOTIFY_EVENTS_REFRESH_MS) {
    void loadNotificationEvents(false);
  }
  if (Date.now() - state.taskQueueUpdatedAt > TASK_QUEUE_REFRESH_MS) {
    void loadTaskQueue(false);
  }
  if (state.commandPaletteOpen) {
    renderCommandPalette();
  }
  if (state.inspectorOpen) {
    renderInspector();
  }
}

async function loadSnapshot() {
  const query = new URLSearchParams({
    history_limit: "25",
    commit_limit: "180",
    event_limit: "240",
    commit_hours: String(state.commitHours),
    ...alertQuery(),
  });

  const response = await fetch(`/api/snapshot?${query.toString()}`);
  if (!response.ok) throw new Error(`snapshot request failed with status ${response.status}`);
  const payload = await response.json();
  renderSnapshot(payload);
}

function startStream() {
  if (state.source) {
    state.source.close();
    state.source = null;
  }
  if (state.streamPaused) {
    state.streamConnected = false;
    renderStreamStatus("live updates paused");
    return;
  }

  const query = new URLSearchParams({
    poll: "6",
    commit_hours: String(state.commitHours),
    ...alertQuery(),
  });

  const source = new EventSource(`/api/stream?${query.toString()}`);
  state.source = source;
  state.streamConnected = false;
  renderStreamStatus();

  source.onopen = () => {
    state.streamConnected = true;
    renderStreamStatus();
  };

  source.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      state.streamConnected = true;
      state.streamLastMessageAt = Date.now();
      renderSnapshot(payload);
    } catch (error) {
      console.error("Failed to parse stream payload", error);
    }
  };

  source.onerror = () => {
    if (state.streamPaused) return;
    state.streamConnected = false;
    renderStreamStatus("retrying");
  };
}

async function refreshNow() {
  try {
    await loadSnapshot();
    await loadRepoInsights(true);
    if (state.selectedRunId) await loadRunDetails(state.selectedRunId);
    if (state.selectedRunId) {
      await loadRunLogTail(state.selectedRunId, { force: true });
    }
    if (state.selectedRepoName) await loadRepoDetails(state.selectedRepoName, true);
    await loadNotificationEvents(true);
    await loadTaskQueue(true);
    renderStreamStatus("manual refresh complete");
    return true;
  } catch (error) {
    console.error(error);
    toastAlert({
      id: "manual_refresh_error",
      run_id: "",
      severity: "critical",
      title: "Refresh failed",
      detail: String(error),
    });
    return false;
  }
}

function toggleStreamPause() {
  state.streamPaused = !state.streamPaused;
  if (state.streamPaused) {
    if (state.source) {
      state.source.close();
      state.source = null;
    }
    state.streamConnected = false;
    renderStreamStatus("live updates paused");
    return;
  }
  startStream();
}

function handleKeyboardShortcuts(event) {
  if (event.defaultPrevented) return;
  const key = String(event.key || "");

  if (state.startRunModalOpen && key === "Escape") {
    event.preventDefault();
    closeStartRunModal();
    return;
  }

  if ((event.metaKey || event.ctrlKey) && (key === "k" || key === "K")) {
    event.preventDefault();
    toggleCommandPalette();
    return;
  }

  if (state.commandPaletteOpen) {
    if (key === "Escape") {
      event.preventDefault();
      setCommandPaletteOpen(false);
      return;
    }
    if (key === "ArrowDown") {
      event.preventDefault();
      moveCommandPaletteSelection(1);
      return;
    }
    if (key === "ArrowUp") {
      event.preventDefault();
      moveCommandPaletteSelection(-1);
      return;
    }
    if (key === "Enter") {
      event.preventDefault();
      void executeCommandPaletteSelection();
      return;
    }
  }

  if (event.metaKey || event.ctrlKey || event.altKey) return;

  if (isEditableTarget(event.target)) {
    if (key === "Escape") {
      if (state.shortcutsOpen) setShortcutsOpen(false);
      if (state.inspectorOpen) closeInspector();
    }
    return;
  }

  if (key === "?") {
    event.preventDefault();
    toggleShortcutsPanel();
    return;
  }

  if (key === "/") {
    event.preventDefault();
    setRoute("runs", { updateUrl: true, replaceHistory: false });
    elements.runHistorySearch.focus();
    elements.runHistorySearch.select();
    return;
  }

  if (key === " " || key === "Spacebar") {
    event.preventDefault();
    toggleStreamPause();
    return;
  }

  if (key === "r" || key === "R") {
    event.preventDefault();
    void refreshNow();
    return;
  }

  if (key === "o" || key === "O") {
    event.preventDefault();
    navigateToSection("alerts", "actionCenterSection");
    return;
  }

  if (key === "n" || key === "N") {
    event.preventDefault();
    void runNextAgentStep("manual");
    return;
  }

  if (key === "p" || key === "P") {
    event.preventDefault();
    toggleAgentAutopilotEnabled();
    void saveAgentConfigToServer();
    renderAgentPilot(state.latestSnapshot || {});
    return;
  }

  if (key === "t" || key === "T") {
    event.preventDefault();
    toggleTimeMode();
    return;
  }

  if (key === "a" || key === "A") {
    event.preventDefault();
    toggleEventsAutoScroll();
    return;
  }

  if (key === "c" || key === "C") {
    event.preventDefault();
    toggleCompactMode();
    return;
  }

  if (key === "g" || key === "G") {
    event.preventDefault();
    focusJumpNav();
    return;
  }

  if (key === "i" || key === "I") {
    event.preventDefault();
    if (state.inspectorOpen) {
      closeInspector();
    } else {
      openInspector("summary");
    }
    return;
  }

  if (key === "Escape") {
    if (state.shortcutsOpen) {
      event.preventDefault();
      setShortcutsOpen(false);
      return;
    }
    if (state.inspectorOpen) {
      event.preventDefault();
      closeInspector();
    }
  }
}

async function bootstrap() {
  let compactDefault = false;
  let densityDefault = "calm";
  let timeModeDefault = "utc";
  let eventsAutoScrollDefault = true;
  let runActivityAutoScrollDefault = true;
  let agentAutopilotDefault = false;
  let agentModeDefault = "safe";
  let agentIntervalDefault = 60;
  try {
    compactDefault = localStorage.getItem(COMPACT_MODE_STORAGE_KEY) === "1";
    const densityStored = String(localStorage.getItem(DENSITY_MODE_STORAGE_KEY) || "").toLowerCase();
    if (densityStored === "calm" || densityStored === "dense") {
      densityDefault = densityStored;
    }
    const timeModeStored = String(localStorage.getItem(TIME_MODE_STORAGE_KEY) || "").toLowerCase();
    if (timeModeStored === "local" || timeModeStored === "utc") {
      timeModeDefault = timeModeStored;
    }
    const autoScrollStored = localStorage.getItem(EVENTS_AUTOSCROLL_STORAGE_KEY);
    if (autoScrollStored === "0") eventsAutoScrollDefault = false;
    if (autoScrollStored === "1") eventsAutoScrollDefault = true;
    agentAutopilotDefault = localStorage.getItem(AGENT_AUTOPILOT_STORAGE_KEY) === "1";
    const agentModeStored = String(localStorage.getItem(AGENT_MODE_STORAGE_KEY) || "").toLowerCase();
    if (agentModeStored === "safe" || agentModeStored === "assertive") {
      agentModeDefault = agentModeStored;
    }
    const intervalStored = Number(localStorage.getItem(AGENT_INTERVAL_STORAGE_KEY) || "60");
    if ([30, 60, 120, 180].includes(intervalStored)) {
      agentIntervalDefault = intervalStored;
    }
    const runLogAutoScrollStored = localStorage.getItem(RUN_LOG_AUTOSCROLL_STORAGE_KEY);
    if (runLogAutoScrollStored === "0") {
      state.runLogAutoScroll = false;
    } else if (runLogAutoScrollStored === "1") {
      state.runLogAutoScroll = true;
    }
    const runActivityAutoScrollStored = localStorage.getItem(RUN_ACTIVITY_AUTOSCROLL_STORAGE_KEY);
    if (runActivityAutoScrollStored === "0") {
      runActivityAutoScrollDefault = false;
    } else if (runActivityAutoScrollStored === "1") {
      runActivityAutoScrollDefault = true;
    }
  } catch {
    compactDefault = false;
    densityDefault = "calm";
    timeModeDefault = "utc";
    runActivityAutoScrollDefault = true;
    eventsAutoScrollDefault = true;
    agentAutopilotDefault = false;
    agentModeDefault = "safe";
    agentIntervalDefault = 60;
    state.runLogAutoScroll = true;
  }
  setCompactMode(compactDefault, false);
  setDensityMode(densityDefault, false);
  setTimeMode(timeModeDefault, false);
  setEventsAutoScroll(eventsAutoScrollDefault, false);
  setRunActivityAutoScroll(runActivityAutoScrollDefault, false);
  setRunLogAutoScroll(state.runLogAutoScroll, false);
  setAgentAutopilotEnabled(agentAutopilotDefault, false);
  setAgentMode(agentModeDefault, false);
  setAgentIntervalSec(agentIntervalDefault, false);
  setShortcutsOpen(false);
  setCommandPaletteOpen(false);
  setAgentPilotExpanded(false);
  setInspectorOpen(false, false);
  setInspectorTab("summary", false);
  loadCollapsedPanels();
  initPanelCollapseControls();
  initJumpNav();
  applyUrlStateFromQuery();

  state.commitHours = Number(elements.commitHours.value || 2);
  state.repoInsightsHours = Number(elements.repoInsightsHours.value || 24);
  state.runHistorySearch = String(elements.runHistorySearch.value || "");
  state.runHistoryStateFilter = String(elements.runHistoryStateFilter.value || "all");
  state.repoInsightsSearch = String(elements.repoInsightsSearch.value || "");
  state.repoInsightsStateFilter = String(elements.repoInsightsStateFilter.value || "all");
  syncUrlState();
  try {
    await loadSnapshot();
    await loadRepoInsights(true);
    await loadNotificationConfig();
    await loadNotificationEvents(true);
    await loadTaskQueue(true);
    await loadReposCatalog(true);
    if (state.route === "launch" && !state.startRunModalOpen) {
      await openStartRunModal("start");
    }
  } catch (error) {
    console.error(error);
    elements.generatedAt.textContent = `Initial load failed: ${String(error)}`;
  }
  renderStreamStatus();
  startStream();
}

elements.commitHours.addEventListener("change", async (event) => {
  state.commitHours = Number(event.target.value || 2);
  syncUrlState();
  await loadSnapshot();
  if (!state.streamPaused) startStream();
});

elements.repoInsightsHours.addEventListener("change", async (event) => {
  state.repoInsightsHours = Number(event.target.value || 24);
  syncUrlState();
  await loadRepoInsights(true);
  if (state.selectedRepoName) await loadRepoDetails(state.selectedRepoName, true);
});

elements.repoInsightsRefreshBtn.addEventListener("click", async () => {
  await loadRepoInsights(true);
  if (state.selectedRepoName) await loadRepoDetails(state.selectedRepoName, true);
});

elements.pauseStreamBtn.addEventListener("click", () => {
  toggleStreamPause();
});

elements.refreshNowBtn.addEventListener("click", async () => {
  await refreshNow();
});

elements.opsNormalizeBtn.addEventListener("click", async () => {
  await runControlAction("normalize");
});

elements.opsRestartBtn.addEventListener("click", async () => {
  await runControlAction("restart");
});

elements.opsInspectRunBtn.addEventListener("click", () => {
  const targetRun = String(state.latestSnapshot?.latest_run?.run_id || state.selectedRunId || "");
  if (!targetRun) return;
  selectRun(targetRun, { scroll: true, forceReload: true, openInspector: true, inspectorTab: "summary" });
});

elements.agentAutopilotEnabled.addEventListener("change", (event) => {
  setAgentAutopilotEnabled(Boolean(event.target.checked), true);
  syncUrlState();
  void saveAgentConfigToServer();
  renderAgentPilot(state.latestSnapshot || {});
});

elements.agentMode.addEventListener("change", (event) => {
  setAgentMode(String(event.target.value || "safe"), true);
  syncUrlState();
  void saveAgentConfigToServer();
  renderAgentPilot(state.latestSnapshot || {});
});

elements.agentInterval.addEventListener("change", (event) => {
  setAgentIntervalSec(Number(event.target.value || 60), true);
  syncUrlState();
  void saveAgentConfigToServer();
  renderAgentPilot(state.latestSnapshot || {});
});

elements.agentRunNextBtn.addEventListener("click", async () => {
  await runNextAgentStep("manual");
});

elements.agentRunPlanBtn.addEventListener("click", async () => {
  await runFullAgentPlan("manual");
});

elements.timeMode.addEventListener("change", (event) => {
  setTimeMode(String(event.target.value || "utc"), true);
  syncUrlState();
  rerenderCachedData();
});

elements.compactModeBtn.addEventListener("click", () => {
  toggleCompactMode();
});

elements.heroCompactModeBtn.addEventListener("click", () => {
  toggleCompactMode();
});

elements.densityModeBtn.addEventListener("click", () => {
  toggleDensityMode();
  rerenderCachedData();
});

elements.heroDensityModeBtn.addEventListener("click", () => {
  toggleDensityMode();
  rerenderCachedData();
});

elements.collapseAllBtn.addEventListener("click", () => {
  const shouldCollapse = elements.collapseAllBtn.textContent.trim().toLowerCase().includes("collapse");
  setAllPanelsCollapsed(shouldCollapse);
});

elements.commandPaletteBtn.addEventListener("click", () => {
  toggleCommandPalette();
});

elements.heroCommandBtn.addEventListener("click", () => {
  toggleCommandPalette();
});

elements.shortcutsBtn.addEventListener("click", () => {
  toggleShortcutsPanel();
});

elements.heroShortcutsBtn.addEventListener("click", () => {
  toggleShortcutsPanel();
});

elements.agentPilotToggleBtn.addEventListener("click", () => {
  setAgentPilotExpanded(!state.agentPilotExpanded);
});

elements.eventsAutoScrollBtn.addEventListener("click", () => {
  toggleEventsAutoScroll();
});

elements.commandPaletteInput.addEventListener("input", (event) => {
  state.commandPaletteQuery = String(event.target.value || "");
  state.commandPaletteSelection = 0;
  renderCommandPalette();
});

elements.commandPaletteList.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target.closest("button[data-index]") : null;
  if (!target) return;
  const index = Number(target.getAttribute("data-index") || "0");
  void executeCommandPaletteSelection(index);
});

elements.commandPaletteOverlay.addEventListener("click", (event) => {
  if (event.target === elements.commandPaletteOverlay) {
    setCommandPaletteOpen(false);
  }
});

elements.inspectorCloseBtn.addEventListener("click", () => {
  closeInspector();
});

elements.inspectorTabs.forEach((button) => {
  button.addEventListener("click", () => {
    setInspectorTab(String(button.dataset.tab || "summary"), true);
  });
});

elements.inspectorDrawer.addEventListener("click", (event) => {
  if (event.target === elements.inspectorDrawer) {
    closeInspector();
  }
});

elements.runHistorySearch.addEventListener("input", (event) => {
  state.runHistorySearch = String(event.target.value || "");
  syncUrlState();
  renderRunHistory(state.runHistory);
});

elements.runHistoryStateFilter.addEventListener("change", (event) => {
  state.runHistoryStateFilter = String(event.target.value || "all");
  syncUrlState();
  renderRunHistory(state.runHistory);
});

[...(elements.runDetailNav?.querySelectorAll("button[data-run-view]") || [])].forEach((button) => {
  button.addEventListener("click", () => {
    const view = normalizeRunDetailView(button.dataset.runView || "summary");
    setRunDetailView(view, { updateUrl: true, focus: true });
  });
});

elements.repoInsightsSearch.addEventListener("input", (event) => {
  state.repoInsightsSearch = String(event.target.value || "");
  syncUrlState();
  renderRepoInsightsTable(state.repoInsights);
});

elements.repoInsightsStateFilter.addEventListener("change", (event) => {
  state.repoInsightsStateFilter = String(event.target.value || "all");
  syncUrlState();
  renderRepoInsightsTable(state.repoInsights);
});

[...(elements.repoDetailNav?.querySelectorAll("button[data-repo-view]") || [])].forEach((button) => {
  button.addEventListener("click", () => {
    const view = normalizeRepoDetailView(button.dataset.repoView || "summary");
    setRepoDetailView(view, { updateUrl: true, focus: true });
  });
});

if (elements.runLogRefreshBtn) {
  elements.runLogRefreshBtn.addEventListener("click", async () => {
    if (!state.selectedRunId) return;
    await loadRunLogTail(state.selectedRunId, { force: true });
  });
}

if (elements.runLogAutoScrollBtn) {
  elements.runLogAutoScrollBtn.addEventListener("click", () => {
    toggleRunLogAutoScroll();
  });
}

if (elements.runActivityRefreshBtn) {
  elements.runActivityRefreshBtn.addEventListener("click", async () => {
    if (!state.selectedRunId) return;
    await loadRunLogTail(state.selectedRunId, { force: true });
  });
}

if (elements.runActivityAutoScrollBtn) {
  elements.runActivityAutoScrollBtn.addEventListener("click", () => {
    toggleRunActivityAutoScroll();
  });
}

elements.runCommitRepoFilter.addEventListener("change", () => {
  renderRunCommitTable();
});

elements.runCommitSearch.addEventListener("input", () => {
  renderRunCommitTable();
});

elements.deckOpenAlertsBtn.addEventListener("click", () => {
  navigateToSection("alerts", "alertsSection");
});

elements.deckActionCard.addEventListener("click", () => {
  const alerts = (state.latestSnapshot?.alerts || []).filter((item) => String(item.severity || "").toLowerCase() !== "ok");
  if (alerts.length) {
    const action = alertActionFor(alerts[0]);
    if (action) {
      runAlertAction(action.id, String(alerts[0]?.run_id || ""));
      return;
    }
  }
  if (Boolean(state.controlStatus?.active)) {
    navigateToSection("alerts", "actionCenterSection");
    return;
  }
  void openRunLauncherPage("start");
});

elements.deckActionCard.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    elements.deckActionCard.click();
  }
});

[...(elements.routeNav?.querySelectorAll("button[data-route]") || [])].forEach((button) => {
  button.addEventListener("click", () => {
    const targetRoute = String(button.dataset.route || "overview");
    if (targetRoute === "launch") {
      void openRunLauncherPage("start");
      return;
    }
    setRoute(targetRoute, { updateUrl: true, replaceHistory: false });
  });
});

elements.deckNowCard.addEventListener("click", () => {
  const targetRun = String(state.selectedRunId || state.latestSnapshot?.latest_run?.run_id || "");
  if (!targetRun) return;
  setRoute("runs", { updateUrl: true, replaceHistory: false });
  selectRun(targetRun, { scroll: true, forceReload: true, openInspector: true, inspectorTab: "summary" });
});

elements.deckNowCard.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    elements.deckNowCard.click();
  }
});

elements.deckFlowCard.addEventListener("click", () => {
  setRoute("repos", { updateUrl: true, replaceHistory: false });
  const preferred = String(state.selectedRepoName || state.repoInsights?.[0]?.repo || "");
  if (!preferred) return;
  selectRepo(preferred, { scroll: true, forceReload: true, openInspector: true, inspectorTab: "repos" });
  void loadRepoDetails(preferred, true);
});

elements.deckFlowCard.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    elements.deckFlowCard.click();
  }
});

elements.deckIssueCard.addEventListener("click", () => {
  navigateToSection("alerts", "alertsSection");
});

elements.deckIssueCard.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    elements.deckIssueCard.click();
  }
});

elements.controlStartBtn.addEventListener("click", async () => {
  await openRunLauncherPage("start");
});

elements.controlStopBtn.addEventListener("click", async () => {
  await runControlAction("stop");
});

elements.controlRestartBtn.addEventListener("click", async () => {
  await runControlAction("restart");
});

elements.controlNormalizeBtn.addEventListener("click", async () => {
  await runControlAction("normalize");
});

elements.startRunCloseBtn.addEventListener("click", () => {
  closeStartRunModal();
});

elements.startRunCancelBtn.addEventListener("click", () => {
  closeStartRunModal();
});

elements.startRunModal.addEventListener("click", (event) => {
  if (event.target === elements.startRunModal) {
    closeStartRunModal();
  }
});

elements.startRunModeAuto.addEventListener("change", () => {
  if (!elements.startRunModeAuto.checked) return;
  setStartRunMode("auto");
  renderStartRunRepoTable();
});

elements.startRunModeCustom.addEventListener("change", () => {
  if (!elements.startRunModeCustom.checked) return;
  setStartRunMode("custom");
  renderStartRunRepoTable();
});

elements.startRunSearch.addEventListener("input", (event) => {
  state.startRunSearch = String(event.target.value || "");
  renderStartRunRepoTable();
});

elements.startRunTasksPerRepo.addEventListener("change", () => {
  ensureStartRunSelectionInitialized(false);
  renderStartRunRepoTable();
});

elements.startRunMaxCyclesPerRepo.addEventListener("change", () => {
  ensureStartRunSelectionInitialized(false);
  renderStartRunRepoTable();
});

elements.startRunMaxCommitsPerRepo.addEventListener("change", () => {
  ensureStartRunSelectionInitialized(false);
  renderStartRunRepoTable();
});

elements.startRunSelectAllBtn.addEventListener("click", () => {
  setStartRunMode("custom");
  (state.repoCatalog || []).forEach((repo) => {
    const key = repoCatalogKey(repo);
    const existing = state.startRunSelection[key] || {
      enabled: true,
      tasks_per_repo: 0,
      max_cycles_per_run: 0,
      max_commits_per_run: 0,
    };
    state.startRunSelection[key] = { ...existing, enabled: true };
  });
  renderStartRunRepoTable();
});

elements.startRunSelectNoneBtn.addEventListener("click", () => {
  setStartRunMode("custom");
  (state.repoCatalog || []).forEach((repo) => {
    const key = repoCatalogKey(repo);
    const existing = state.startRunSelection[key] || {
      enabled: false,
      tasks_per_repo: 0,
      max_cycles_per_run: 0,
      max_commits_per_run: 0,
    };
    state.startRunSelection[key] = { ...existing, enabled: false };
  });
  renderStartRunRepoTable();
});

elements.startRunConfirmBtn.addEventListener("click", async () => {
  const payload = startRunRequestPayloadFromModal();
  if (!payload) return;
  setStartRunModalBusy(true);
  const result = await runControlAction(state.startRunAction || "start", { payloadOverride: payload });
  setStartRunModalBusy(false);
  if (result?.ok) {
    closeStartRunModal();
  }
});

elements.notifySaveBtn.addEventListener("click", async () => {
  await saveNotificationConfig();
});

elements.notifyTestBtn.addEventListener("click", async () => {
  await sendTestNotification();
});

elements.taskQueueAddBtn.addEventListener("click", async () => {
  await addTaskQueueItem();
});

elements.taskQueueStatus.addEventListener("change", async () => {
  await loadTaskQueue(true);
});

elements.taskQueueRepo.addEventListener("change", async () => {
  await loadTaskQueue(true);
});

elements.taskQueueRepo.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    await loadTaskQueue(true);
  }
});

elements.taskQueueTitle.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    await addTaskQueueItem();
  }
});

setInterval(() => {
  renderStreamStatus();
}, 15000);

setInterval(() => {
  void maybeRunAgentAutopilot();
}, 5000);

document.addEventListener("keydown", handleKeyboardShortcuts);
window.addEventListener("popstate", () => {
  applyUrlStateFromQuery();
  state.commitHours = Number(elements.commitHours.value || 2);
  state.repoInsightsHours = Number(elements.repoInsightsHours.value || 24);
  state.runHistorySearch = String(elements.runHistorySearch.value || "");
  state.runHistoryStateFilter = String(elements.runHistoryStateFilter.value || "all");
  state.repoInsightsSearch = String(elements.repoInsightsSearch.value || "");
  state.repoInsightsStateFilter = String(elements.repoInsightsStateFilter.value || "all");
  renderRunHistory(state.runHistory);
  renderRepoInsightsTable(state.repoInsights);
  renderRunCommitTable();
  renderEvents(state.selectedRunEvents || []);
  renderRepoDetails(state.selectedRepoDetails || null);
  if (state.route === "launch") {
    if (!state.startRunModalOpen) {
      void openStartRunModal("start");
    }
  } else {
    setStartRunModalOpen(false);
  }
});

bootstrap();
