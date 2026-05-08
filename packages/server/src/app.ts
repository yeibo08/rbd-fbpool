import { Hono } from "hono";
import { createAuthRoutes } from "./routes/auth.js";
import type { DrizzleDB } from "./db/types.js";

export function createApp(db: DrizzleDB) {
  const app = new Hono();

  app.route("/api/auth", createAuthRoutes(db));

  return app;
}
