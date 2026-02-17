import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

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
