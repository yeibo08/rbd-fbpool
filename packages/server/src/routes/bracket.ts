import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import type { DrizzleDB } from "../db/types.js";
import { countries, matches, predictions, scoringRules } from "../db/schema.js";
import { requireAuth, type AuthEnv } from "../middleware/auth.js";
import { requireMember } from "../db/helpers.js";
import { computeAllGroupStandings } from "../services/standings.js";
import { simulateR32Qualifiers, propagateBracket } from "../services/bracket.js";
import { computePoints } from "../services/scoring.js";

const KNOCKOUT_STAGES = ["round_of_32","round_of_16","quarterfinal","semifinal","third_place","final"] as const;
type KnockoutStage = typeof KNOCKOUT_STAGES[number];

export function createBracketRoutes(db: DrizzleDB) {
  return new Hono<AuthEnv>()
    .use("*", requireAuth)

    .get("/:groupId/bracket", (c) => {
      const userId = c.get("userId");
      const { groupId } = c.req.param();

      if (!requireMember(db, groupId, userId)) {
        return c.json({ error: "No tienes acceso a este grupo" }, 403);
      }

      // Fetch scoring rules (default if not set)
      const rules = db.select().from(scoringRules).where(eq(scoringRules.groupId, groupId)).get() ?? {
        ptsCorrectResult: 1, ptsCorrectHome: 1, ptsCorrectAway: 1, ptsCorrectTotal: 1,
      };

      // All countries for group-stage standings computation
      const allCountries = db.select({
        code: countries.code, name: countries.name, flagEmoji: countries.flagEmoji, groupLetter: countries.groupLetter,
      }).from(countries).all();

      // All matches split by stage
      const allMatches = db.select().from(matches).orderBy(matches.matchNumber).all();
      const groupMatches = allMatches.filter((m) => m.stage === "group");
      const knockoutMatches = allMatches.filter((m) => (KNOCKOUT_STAGES as readonly string[]).includes(m.stage));

      // User predictions for this pool group
      const userPreds = db.select().from(predictions).where(and(eq(predictions.groupId, groupId), eq(predictions.userId, userId))).all();
      const predByMatch = new Map(userPreds.map((p) => [p.matchId, p]));

      // Build merged group-stage results (official wins over prediction)
      const groupResults = groupMatches
        .filter((m) => m.homeTeamCode && m.awayTeamCode && m.groupLetter)
        .flatMap((m) => {
          if (m.homeGoals !== null && m.awayGoals !== null) {
            return [{ homeTeamCode: m.homeTeamCode!, awayTeamCode: m.awayTeamCode!, homeGoals: m.homeGoals, awayGoals: m.awayGoals, groupLetter: m.groupLetter! }];
          }
          const pred = predByMatch.get(m.id);
          if (pred) {
            return [{ homeTeamCode: m.homeTeamCode!, awayTeamCode: m.awayTeamCode!, homeGoals: pred.homeGoals, awayGoals: pred.awayGoals, groupLetter: m.groupLetter! }];
          }
          return [];
        });

      // Compute simulated standings and R32 qualifiers
      const groupStandings = computeAllGroupStandings(allCountries, groupResults);
      const hasAllGroups = Object.keys(groupStandings).length === 12 && groupResults.length > 0;
      const r32Qualifiers = hasAllGroups ? simulateR32Qualifiers(groupStandings) : {};

      // Build knockout match outcome map (official results for resolved matches)
      const outcomeMap: Record<string, { homeGoals: number; awayGoals: number; wentToPenalties: boolean; penaltyWinnerCode: string | null }> = {};
      for (const m of knockoutMatches) {
        if (m.homeGoals !== null && m.awayGoals !== null) {
          outcomeMap[m.id] = {
            homeGoals: m.homeGoals,
            awayGoals: m.awayGoals,
            wentToPenalties: m.wentToPenalties === 1,
            penaltyWinnerCode: m.penaltyWinnerCode,
          };
        } else {
          const pred = predByMatch.get(m.id);
          if (pred) {
            outcomeMap[m.id] = { homeGoals: pred.homeGoals, awayGoals: pred.awayGoals, wentToPenalties: false, penaltyWinnerCode: null };
          }
        }
      }

      // Propagate bracket
      const bracketMap = hasAllGroups ? propagateBracket(r32Qualifiers, outcomeMap) : {};

      // Build response grouped by stage
      const response: Record<KnockoutStage, unknown[]> = {
        round_of_32: [], round_of_16: [], quarterfinal: [], semifinal: [], third_place: [], final: [],
      };

      for (const m of knockoutMatches) {
        const stage = m.stage as KnockoutStage;
        const slot = bracketMap[m.id];
        const pred = predByMatch.get(m.id);

        let pointsEarned: number | null = null;
        if (m.homeGoals !== null && m.awayGoals !== null && pred) {
          pointsEarned = computePoints(pred, {
            homeGoals: m.homeGoals,
            awayGoals: m.awayGoals,
            wentToPenalties: m.wentToPenalties === 1,
            penaltyWinnerCode: m.penaltyWinnerCode,
            homeTeamCode: m.homeTeamCode,
            awayTeamCode: m.awayTeamCode,
          }, rules);
        }

        response[stage].push({
          matchId: m.id,
          matchNumber: m.matchNumber,
          stage: m.stage,
          kickoffAt: m.kickoffAt,
          // Resolved team (from simulation or official)
          homeTeamCode: slot?.home?.teamCode ?? m.homeTeamCode,
          homeTeamLabel: slot?.home?.name ?? m.homeTeamLabel,
          homeTeamFlagEmoji: slot?.home?.flagEmoji ?? null,
          awayTeamCode: slot?.away?.teamCode ?? m.awayTeamCode,
          awayTeamLabel: slot?.away?.name ?? m.awayTeamLabel,
          awayTeamFlagEmoji: slot?.away?.flagEmoji ?? null,
          // Official result
          homeGoals: m.homeGoals,
          awayGoals: m.awayGoals,
          wentToPenalties: m.wentToPenalties === 1,
          penaltyWinnerCode: m.penaltyWinnerCode,
          // User prediction
          predictedHomeGoals: pred?.homeGoals ?? null,
          predictedAwayGoals: pred?.awayGoals ?? null,
          pointsEarned,
        });
      }

      return c.json(response);
    });
}
