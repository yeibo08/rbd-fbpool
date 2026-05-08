import { Hono } from "hono";
import { eq, and, isNotNull } from "drizzle-orm";
import type { DrizzleDB } from "../db/types.js";
import { groupMembers, matches, predictions, scoringRules, users } from "../db/schema.js";
import { requireAuth, type AuthEnv } from "../middleware/auth.js";
import { computePoints } from "../services/scoring.js";

export function createLeaderboardRoutes(db: DrizzleDB) {
  return new Hono<AuthEnv>()
    .use("*", requireAuth)

    .get("/:groupId/leaderboard", (c) => {
      const userId = c.get("userId");
      const { groupId } = c.req.param();

      const member = db
        .select()
        .from(groupMembers)
        .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
        .get();
      if (!member) return c.json({ error: "No tienes acceso a este grupo" }, 403);

      const rules = db.select().from(scoringRules).where(eq(scoringRules.groupId, groupId)).get();
      if (!rules) return c.json({ error: "Reglas no encontradas" }, 404);

      const members = db
        .select({ userId: groupMembers.userId, role: groupMembers.role, displayName: users.displayName })
        .from(groupMembers)
        .innerJoin(users, eq(groupMembers.userId, users.id))
        .where(eq(groupMembers.groupId, groupId))
        .all();

      const completedMatches = db
        .select()
        .from(matches)
        .where(isNotNull(matches.homeGoals))
        .all();

      const groupPredictions = db
        .select()
        .from(predictions)
        .where(eq(predictions.groupId, groupId))
        .all();

      const predByUserMatch = new Map<string, { homeGoals: number; awayGoals: number }>();
      for (const p of groupPredictions) {
        predByUserMatch.set(`${p.userId}:${p.matchId}`, p);
      }

      const scores = members.map((m) => {
        let points = 0;
        for (const match of completedMatches) {
          const pred = predByUserMatch.get(`${m.userId}:${match.id}`);
          if (pred) {
            points += computePoints(
              pred,
              {
                homeGoals: match.homeGoals!,
                awayGoals: match.awayGoals!,
                wentToPenalties: match.wentToPenalties === 1,
                penaltyWinnerCode: match.penaltyWinnerCode,
                homeTeamCode: match.homeTeamCode,
                awayTeamCode: match.awayTeamCode,
              },
              rules
            );
          }
        }
        return { userId: m.userId, displayName: m.displayName, role: m.role, points };
      });

      scores.sort((a, b) => b.points - a.points);

      let rank = 1;
      const ranked = scores.map((s, i) => {
        if (i > 0 && s.points < scores[i - 1].points) rank = i + 1;
        return { ...s, rank };
      });

      return c.json(ranked);
    });
}
