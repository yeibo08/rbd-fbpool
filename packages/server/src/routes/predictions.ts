import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, and, isNotNull, count } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { DrizzleDB } from "../db/types.js";
import { predictions, matches, scoringRules } from "../db/schema.js";
import { requireAuth, type AuthEnv } from "../middleware/auth.js";
import { computePoints } from "../services/scoring.js";
import { requireMember } from "../db/helpers.js";

const predictionSchema = z.object({
  homeGoals: z.number().int().min(0),
  awayGoals: z.number().int().min(0),
});

export function createPredictionRoutes(db: DrizzleDB) {
  return new Hono<AuthEnv>()
    .use("*", requireAuth)

    // Static sub-paths registered before /:groupId/predictions/:matchId to avoid capture
    .get("/:groupId/predictions/progress", (c) => {
      const userId = c.get("userId");
      const { groupId } = c.req.param();

      if (!requireMember(db, groupId, userId)) {
        return c.json({ error: "No tienes acceso a este grupo" }, 403);
      }

      const total = db.select({ value: count() }).from(matches).get()?.value ?? 0;
      const predicted = db
        .select({ value: count() })
        .from(predictions)
        .where(and(eq(predictions.groupId, groupId), eq(predictions.userId, userId)))
        .get()?.value ?? 0;

      return c.json({ predicted, total });
    })

    .get("/:groupId/predictions/results", (c) => {
      const userId = c.get("userId");
      const { groupId } = c.req.param();

      if (!requireMember(db, groupId, userId)) {
        return c.json({ error: "No tienes acceso a este grupo" }, 403);
      }

      const rules = db.select().from(scoringRules).where(eq(scoringRules.groupId, groupId)).get();
      if (!rules) return c.json({ error: "Reglas no encontradas" }, 404);

      const completedMatches = db
        .select()
        .from(matches)
        .where(isNotNull(matches.homeGoals))
        .orderBy(matches.kickoffAt)
        .all();

      const userPredictions = db
        .select()
        .from(predictions)
        .where(and(eq(predictions.groupId, groupId), eq(predictions.userId, userId)))
        .all();

      const predByMatch = Object.fromEntries(userPredictions.map((p) => [p.matchId, p]));

      const results = completedMatches.map((match) => {
        const prediction = predByMatch[match.id] ?? null;
        const points = prediction
          ? computePoints(
              prediction,
              {
                homeGoals: match.homeGoals!,
                awayGoals: match.awayGoals!,
                wentToPenalties: match.wentToPenalties === 1,
                penaltyWinnerCode: match.penaltyWinnerCode,
                homeTeamCode: match.homeTeamCode,
                awayTeamCode: match.awayTeamCode,
              },
              rules
            )
          : 0;
        return { matchId: match.id, match, prediction, points };
      });

      return c.json(results);
    })

    .get("/:groupId/predictions", (c) => {
      const userId = c.get("userId");
      const { groupId } = c.req.param();

      if (!requireMember(db, groupId, userId)) {
        return c.json({ error: "No tienes acceso a este grupo" }, 403);
      }

      const userPredictions = db
        .select()
        .from(predictions)
        .where(and(eq(predictions.groupId, groupId), eq(predictions.userId, userId)))
        .all();

      return c.json(userPredictions);
    })

    .put("/:groupId/predictions/:matchId", zValidator("json", predictionSchema), (c) => {
      const userId = c.get("userId");
      const { groupId, matchId } = c.req.param();
      const { homeGoals, awayGoals } = c.req.valid("json");

      if (!requireMember(db, groupId, userId)) {
        return c.json({ error: "No tienes acceso a este grupo" }, 403);
      }

      const match = db.select().from(matches).where(eq(matches.id, matchId)).get();
      if (!match) return c.json({ error: "Partido no encontrado" }, 404);

      const deadline = new Date(match.kickoffAt).getTime() - 15 * 60 * 1000;
      if (Date.now() >= deadline) {
        return c.json({ error: "El plazo para este partido ha cerrado" }, 403);
      }

      const existing = db
        .select()
        .from(predictions)
        .where(
          and(
            eq(predictions.userId, userId),
            eq(predictions.groupId, groupId),
            eq(predictions.matchId, matchId)
          )
        )
        .get();

      if (existing) {
        db.update(predictions)
          .set({ homeGoals, awayGoals, updatedAt: new Date().toISOString() })
          .where(eq(predictions.id, existing.id))
          .run();
        return c.json({ ...existing, homeGoals, awayGoals });
      }

      const id = nanoid(10);
      db.insert(predictions).values({ id, userId, groupId, matchId, homeGoals, awayGoals }).run();
      const created = db.select().from(predictions).where(eq(predictions.id, id)).get()!;
      return c.json(created);
    });
}
