import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import type { RunEvent } from "@clone/contracts";

export type CloneDb = Database.Database;

function readMigrationSql(): string {
  const filePath = path.resolve(process.cwd(), "packages/db/src/migrations/0001_init.sql");
  return fs.readFileSync(filePath, "utf8");
}

export function openDb(dbFile: string): CloneDb {
  const dir = path.dirname(dbFile);
  fs.mkdirSync(dir, { recursive: true });
  const db = new Database(dbFile);
  db.pragma("journal_mode = WAL");
  return db;
}

export function migrate(db: CloneDb): void {
  db.exec(readMigrationSql());
}

export function ensureRun(db: CloneDb, runId: string, state = "running"): void {
  const now = new Date().toISOString();
  db.prepare(
    `
      INSERT INTO runs (id, state, started_at, ended_at, config_json)
      VALUES (@id, @state, @started_at, NULL, '{}')
      ON CONFLICT(id) DO UPDATE SET state = excluded.state
    `,
  ).run({
    id: runId,
    state,
    started_at: now,
  });
}

export function setRunState(db: CloneDb, runId: string, state: string): void {
  const now = new Date().toISOString();
  db.prepare(
    `
      UPDATE runs
      SET state = @state,
          ended_at = CASE WHEN @state IN ('stopped', 'finished', 'failed') THEN @ended_at ELSE ended_at END
      WHERE id = @id
    `,
  ).run({
    id: runId,
    state,
    ended_at: now,
  });
}

export function appendRunEvent(db: CloneDb, runId: string, event: RunEvent): void {
  db.prepare(
    `
      INSERT OR IGNORE INTO run_events (run_id, cursor, topic, type, ts, payload_json)
      VALUES (@run_id, @cursor, @topic, @type, @ts, @payload_json)
    `,
  ).run({
    run_id: runId,
    cursor: event.cursor,
    topic: event.topic,
    type: event.type,
    ts: event.ts,
    payload_json: JSON.stringify(event.payload || {}),
  });
}

export function upsertKvState(db: CloneDb, key: string, value: Record<string, unknown>): void {
  const now = new Date().toISOString();
  db.prepare(
    `
      INSERT INTO kv_state (key, value_json, updated_at)
      VALUES (@key, @value_json, @updated_at)
      ON CONFLICT(key) DO UPDATE SET
        value_json = excluded.value_json,
        updated_at = excluded.updated_at
    `,
  ).run({
    key,
    value_json: JSON.stringify(value || {}),
    updated_at: now,
  });
}
