import { sql } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  forcePasswordChange: integer("force_password_change").default(0).notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const groups = sqliteTable("groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id),
  inviteToken: text("invite_token").notNull().unique(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const groupMembers = sqliteTable(
  "group_members",
  {
    groupId: text("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"), // 'owner' | 'manager' | 'member'
    joinedAt: text("joined_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [
    primaryKey({ columns: [t.groupId, t.userId] }),
    index("idx_group_members_user").on(t.userId),
  ]
);

export const scoringRules = sqliteTable("scoring_rules", {
  groupId: text("group_id")
    .primaryKey()
    .references(() => groups.id, { onDelete: "cascade" }),
  ptsCorrectResult: integer("pts_correct_result").notNull().default(1),
  ptsCorrectHome: integer("pts_correct_home").notNull().default(1),
  ptsCorrectAway: integer("pts_correct_away").notNull().default(1),
  ptsCorrectTotal: integer("pts_correct_total").notNull().default(1),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const countries = sqliteTable("countries", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  short: text("short").notNull(),
  flagEmoji: text("flag_emoji").notNull(),
  groupLetter: text("group_letter").notNull(),
  flagUrl: text("flag_url").notNull(),
});

export const venues = sqliteTable("venues", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
});

export const matches = sqliteTable(
  "matches",
  {
    id: text("id").primaryKey(),
    matchNumber: integer("match_number").notNull().unique(),
    stage: text("stage").notNull(), // 'group'|'round_of_32'|'round_of_16'|'quarterfinal'|'semifinal'|'third_place'|'final'
    groupLetter: text("group_letter"), // NULL for knockout
    homeTeamCode: text("home_team_code").references(() => countries.code),
    awayTeamCode: text("away_team_code").references(() => countries.code),
    homeTeamLabel: text("home_team_label").notNull(),
    awayTeamLabel: text("away_team_label").notNull(),
    kickoffAt: text("kickoff_at").notNull(), // ISO 8601 UTC
    venueId: integer("venue_id").references(() => venues.id),
    homeGoals: integer("home_goals"),
    awayGoals: integer("away_goals"),
    wentToPenalties: integer("went_to_penalties").default(0).notNull(),
    penaltyWinnerCode: text("penalty_winner_code"),
    resultFetchedAt: text("result_fetched_at"),
  },
  (t) => [
    index("idx_matches_kickoff").on(t.kickoffAt),
    index("idx_matches_stage").on(t.stage),
  ]
);

export const predictions = sqliteTable(
  "predictions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    groupId: text("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    matchId: text("match_id")
      .notNull()
      .references(() => matches.id),
    homeGoals: integer("home_goals").notNull(),
    awayGoals: integer("away_goals").notNull(),
    submittedAt: text("submitted_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [
    uniqueIndex("uq_prediction").on(t.userId, t.groupId, t.matchId),
    index("idx_predictions_match").on(t.matchId),
    index("idx_predictions_group_user").on(t.groupId, t.userId),
  ]
);

export type User = typeof users.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type GroupMember = typeof groupMembers.$inferSelect;
export type ScoringRules = typeof scoringRules.$inferSelect;
export type Country = typeof countries.$inferSelect;
export type Venue = typeof venues.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type Prediction = typeof predictions.$inferSelect;
