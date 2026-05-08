import { Hono } from "hono";
import { createAuthRoutes } from "./routes/auth.js";
import { createGroupRoutes } from "./routes/groups.js";
import { createMatchRoutes } from "./routes/matches.js";
import { createPredictionRoutes } from "./routes/predictions.js";
import { createLeaderboardRoutes } from "./routes/leaderboard.js";
import type { DrizzleDB } from "./db/types.js";

export function createApp(db: DrizzleDB) {
  const app = new Hono();

  app.route("/api/auth", createAuthRoutes(db));
  app.route("/api/groups", createGroupRoutes(db));
  app.route("/api/groups", createPredictionRoutes(db));
  app.route("/api/groups", createLeaderboardRoutes(db));
  app.route("/api/matches", createMatchRoutes(db));

  return app;
}
