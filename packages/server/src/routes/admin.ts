import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { DrizzleDB } from "../db/types.js";
import { matches } from "../db/schema.js";
import { requireAuth, type AuthEnv } from "../middleware/auth.js";

const setResultSchema = z.object({
  homeGoals: z.number().int().min(0),
  awayGoals: z.number().int().min(0),
  wentToPenalties: z.boolean().optional().default(false),
  penaltyWinnerCode: z.string().nullable().optional().default(null),
});

export function createAdminRoutes(db: DrizzleDB) {
  return new Hono<AuthEnv>()
    .use("*", requireAuth)

    .put("/:id/result", zValidator("json", setResultSchema), (c) => {
      const { id } = c.req.param();
      const { homeGoals, awayGoals, wentToPenalties, penaltyWinnerCode } = c.req.valid("json");

      const match = db.select().from(matches).where(eq(matches.id, id)).get();
      if (!match) return c.json({ error: "Partido no encontrado" }, 404);

      db.update(matches)
        .set({
          homeGoals,
          awayGoals,
          wentToPenalties: wentToPenalties ? 1 : 0,
          penaltyWinnerCode: penaltyWinnerCode ?? null,
          resultFetchedAt: new Date().toISOString(),
        })
        .where(eq(matches.id, id))
        .run();

      return c.json({ ok: true, id, homeGoals, awayGoals });
    })

    .delete("/:id/result", (c) => {
      const { id } = c.req.param();

      db.update(matches)
        .set({ homeGoals: null, awayGoals: null, wentToPenalties: 0, penaltyWinnerCode: null, resultFetchedAt: null })
        .where(eq(matches.id, id))
        .run();

      return c.json({ ok: true });
    });
}
