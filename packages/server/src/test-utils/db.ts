import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema.js";

// Creates an isolated in-memory DB with all tables for use in tests.
// Inline DDL keeps tests self-contained without requiring generated migrations.
export function createTestDb() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      force_password_change INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner_id TEXT NOT NULL REFERENCES users(id),
      invite_token TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS group_members (
      group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      user_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'member',
      joined_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (group_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS scoring_rules (
      group_id TEXT PRIMARY KEY REFERENCES groups(id) ON DELETE CASCADE,
      pts_correct_result INTEGER NOT NULL DEFAULT 1,
      pts_correct_home   INTEGER NOT NULL DEFAULT 1,
      pts_correct_away   INTEGER NOT NULL DEFAULT 1,
      pts_correct_total  INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS countries (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short TEXT NOT NULL,
      flag_emoji TEXT NOT NULL,
      group_letter TEXT NOT NULL,
      flag_url TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS venues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      match_number INTEGER NOT NULL UNIQUE,
      stage TEXT NOT NULL,
      group_letter TEXT,
      home_team_code TEXT REFERENCES countries(code),
      away_team_code TEXT REFERENCES countries(code),
      home_team_label TEXT NOT NULL,
      away_team_label TEXT NOT NULL,
      kickoff_at TEXT NOT NULL,
      venue_id INTEGER REFERENCES venues(id),
      home_goals INTEGER,
      away_goals INTEGER,
      went_to_penalties INTEGER NOT NULL DEFAULT 0,
      penalty_winner_code TEXT,
      result_fetched_at TEXT
    );

    CREATE TABLE IF NOT EXISTS predictions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      match_id TEXT NOT NULL REFERENCES matches(id),
      home_goals INTEGER NOT NULL,
      away_goals INTEGER NOT NULL,
      submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, group_id, match_id)
    );
  `);

  return { db: drizzle(sqlite, { schema }), sqlite };
}
