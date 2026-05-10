import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import type { DrizzleDB } from "../db/types.js";
import { matches, countries } from "../db/schema.js";
import { requireAuth, type AuthEnv } from "../middleware/auth.js";

const homeCountry = alias(countries, "homeCountry");
const awayCountry = alias(countries, "awayCountry");

const enrichedMatchSelect = {
  id: matches.id,
  matchNumber: matches.matchNumber,
  stage: matches.stage,
  groupLetter: matches.groupLetter,
  homeTeamCode: matches.homeTeamCode,
  awayTeamCode: matches.awayTeamCode,
  homeTeamLabel: matches.homeTeamLabel,
  awayTeamLabel: matches.awayTeamLabel,
  kickoffAt: matches.kickoffAt,
  venueId: matches.venueId,
  homeGoals: matches.homeGoals,
  awayGoals: matches.awayGoals,
  wentToPenalties: matches.wentToPenalties,
  penaltyWinnerCode: matches.penaltyWinnerCode,
  resultFetchedAt: matches.resultFetchedAt,
  homeTeamShort: homeCountry.short,
  homeTeamFlagEmoji: homeCountry.flagEmoji,
  homeTeamFlagUrl: homeCountry.flagUrl,
  awayTeamShort: awayCountry.short,
  awayTeamFlagEmoji: awayCountry.flagEmoji,
  awayTeamFlagUrl: awayCountry.flagUrl,
};

function withDeadline<T extends { kickoffAt: string }>(match: T) {
  const deadlineAt = new Date(new Date(match.kickoffAt).getTime() - 15 * 60 * 1000).toISOString();
  return { ...match, deadlineAt };
}

export function createMatchRoutes(db: DrizzleDB) {
  return new Hono<AuthEnv>()
    .use("*", requireAuth)

    .get("/", (c) => {
      const all = db
        .select(enrichedMatchSelect)
        .from(matches)
        .leftJoin(homeCountry, eq(matches.homeTeamCode, homeCountry.code))
        .leftJoin(awayCountry, eq(matches.awayTeamCode, awayCountry.code))
        .orderBy(matches.kickoffAt)
        .all();
      return c.json(all.map(withDeadline));
    })

    .get("/:id", (c) => {
      const { id } = c.req.param();
      const match = db
        .select(enrichedMatchSelect)
        .from(matches)
        .leftJoin(homeCountry, eq(matches.homeTeamCode, homeCountry.code))
        .leftJoin(awayCountry, eq(matches.awayTeamCode, awayCountry.code))
        .where(eq(matches.id, id))
        .get();
      if (!match) return c.json({ error: "Partido no encontrado" }, 404);
      return c.json(withDeadline(match));
    });
}
