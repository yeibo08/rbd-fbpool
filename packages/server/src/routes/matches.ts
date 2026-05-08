import { Hono } from "hono";
import { eq } from "drizzle-orm";
import type { DrizzleDB } from "../db/types.js";
import { matches } from "../db/schema.js";
import { requireAuth, type AuthEnv } from "../middleware/auth.js";

function withDeadline<T extends { kickoffAt: string }>(match: T) {
  const deadlineAt = new Date(new Date(match.kickoffAt).getTime() - 15 * 60 * 1000).toISOString();
  return { ...match, deadlineAt };
}

export function createMatchRoutes(db: DrizzleDB) {
  return new Hono<AuthEnv>()
    .use("*", requireAuth)

    .get("/", (c) => {
      const all = db.select().from(matches).orderBy(matches.kickoffAt).all();
      return c.json(all.map(withDeadline));
    })

    .get("/:id", (c) => {
      const { id } = c.req.param();
      const match = db.select().from(matches).where(eq(matches.id, id)).get();
      if (!match) return c.json({ error: "Partido no encontrado" }, 404);
      return c.json(withDeadline(match));
    });
}
