import path from "node:path";
import { migrate, openDb } from "./index.js";

const dbPath = process.env.CLONE_STATE_DB || path.resolve(process.cwd(), "logs/clone_state_v2.db");
const db = openDb(dbPath);
migrate(db);
console.log(`migrated ${dbPath}`);
