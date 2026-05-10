import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { readFileSync } from "fs";
import { createAuthRoutes } from "./routes/auth.js";
import { createGroupRoutes } from "./routes/groups.js";
import { createMatchRoutes } from "./routes/matches.js";
import { createPredictionRoutes } from "./routes/predictions.js";
import { createLeaderboardRoutes } from "./routes/leaderboard.js";
import { createStandingsRoutes, createGroupStandingsRoutes } from "./routes/standings.js";
import { createBracketRoutes } from "./routes/bracket.js";
import { createAdminRoutes } from "./routes/admin.js";
import type { DrizzleDB } from "./db/types.js";

export function createApp(db: DrizzleDB) {
  const app = new Hono();

  app.route("/api/auth", createAuthRoutes(db));
  app.route("/api/groups", createGroupRoutes(db));
  app.route("/api/groups", createPredictionRoutes(db));
  app.route("/api/groups", createLeaderboardRoutes(db));
  app.route("/api/groups", createGroupStandingsRoutes(db));
  app.route("/api/groups", createBracketRoutes(db));
  app.route("/api", createStandingsRoutes(db));
  app.route("/api/matches", createMatchRoutes(db));

  if (process.env.NODE_ENV !== "production") {
    app.route("/api/admin/matches", createAdminRoutes(db));
  }

  if (process.env.NODE_ENV === "production") {
    app.use("/*", serveStatic({ root: "./packages/client/dist" }));
    app.get("/*", (c) =>
      c.html(readFileSync("./packages/client/dist/index.html", "utf-8"))
    );
  }

  return app;
}
