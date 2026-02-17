CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  config_json TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS run_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL,
  cursor TEXT NOT NULL UNIQUE,
  topic TEXT NOT NULL,
  type TEXT NOT NULL,
  ts TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  FOREIGN KEY (run_id) REFERENCES runs(id)
);

CREATE TABLE IF NOT EXISTS task_queue (
  id TEXT PRIMARY KEY,
  repo TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 3,
  is_interrupt INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS launch_presets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code_root TEXT NOT NULL,
  preset_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS kv_state (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_run_events_run_id_id ON run_events(run_id, id);
CREATE INDEX IF NOT EXISTS idx_task_queue_status_priority_created ON task_queue(status, priority, created_at);
