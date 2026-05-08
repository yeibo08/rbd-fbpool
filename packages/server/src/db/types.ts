import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type * as schema from "./schema.js";

export type DrizzleDB = BetterSQLite3Database<typeof schema>;
