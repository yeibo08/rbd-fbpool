import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import type { DrizzleDB } from "../db/types.js";
import { countries, matches, predictions } from "../db/schema.js";
import { requireAuth, type AuthEnv } from "../middleware/auth.js";
import { requireMember } from "../db/helpers.js";
import { computeAllGroupStandings } from "../services/standings.js";

function getAllCountries(db: DrizzleDB) {
  return db.select({
    code: countries.code,
    name: countries.name,
    flagEmoji: countries.flagEmoji,
    groupLetter: countries.groupLetter,
  }).from(countries).all();
}

function getGroupStageMatches(db: DrizzleDB) {
  return db.select({
    id: matches.id,
    homeTeamCode: matches.homeTeamCode,
    awayTeamCode: matches.awayTeamCode,
    groupLetter: matches.groupLetter,
    homeGoals: matches.homeGoals,
    awayGoals: matches.awayGoals,
  }).from(matches).where(eq(matches.stage, "group")).all();
}

export function createStandingsRoutes(db: DrizzleDB) {
  const router = new Hono<AuthEnv>();

  // Public — official standings from actual results
  router.get("/standings", (c) => {
    const allCountries = getAllCountries(db);
    const groupMatches = getGroupStageMatches(db);

    const results = groupMatches
      .filter((m) => m.homeGoals !== null && m.awayGoals !== null && m.homeTeamCode && m.awayTeamCode && m.groupLetter)
      .map((m) => ({
        homeTeamCode: m.homeTeamCode!,
        awayTeamCode: m.awayTeamCode!,
        homeGoals: m.homeGoals!,
        awayGoals: m.awayGoals!,
        groupLetter: m.groupLetter!,
      }));

    const groups = computeAllGroupStandings(allCountries, results);
    return c.json({ groups });
  });

  return router;
}

// Per-pool-group simulated standings (auth + member required)
export function createGroupStandingsRoutes(db: DrizzleDB) {
  return new Hono<AuthEnv>()
    .use("*", requireAuth)

    .get("/:groupId/standings", (c) => {
      const userId = c.get("userId");
      const { groupId } = c.req.param();

      if (!requireMember(db, groupId, userId)) {
        return c.json({ error: "No tienes acceso a este grupo" }, 403);
      }

      const allCountries = getAllCountries(db);
      const groupMatches = getGroupStageMatches(db);

      // Fetch user's predictions for this pool group
      const userPredictions = db
        .select({
          matchId: predictions.matchId,
          homeGoals: predictions.homeGoals,
          awayGoals: predictions.awayGoals,
        })
        .from(predictions)
        .where(and(eq(predictions.groupId, groupId), eq(predictions.userId, userId)))
        .all();

      const predByMatch = new Map(userPredictions.map((p) => [p.matchId, p]));

      // Merge: official result wins over prediction
      const results = groupMatches
        .filter((m) => m.homeTeamCode && m.awayTeamCode && m.groupLetter)
        .flatMap((m) => {
          if (m.homeGoals !== null && m.awayGoals !== null) {
            return [{
              homeTeamCode: m.homeTeamCode!,
              awayTeamCode: m.awayTeamCode!,
              homeGoals: m.homeGoals,
              awayGoals: m.awayGoals,
              groupLetter: m.groupLetter!,
            }];
          }
          const pred = predByMatch.get(m.id);
          if (pred) {
            return [{
              homeTeamCode: m.homeTeamCode!,
              awayTeamCode: m.awayTeamCode!,
              homeGoals: pred.homeGoals,
              awayGoals: pred.awayGoals,
              groupLetter: m.groupLetter!,
            }];
          }
          return [];
        });

      const groups = computeAllGroupStandings(allCountries, results);
      return c.json({ groups });
    });
}
