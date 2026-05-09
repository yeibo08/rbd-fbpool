import { eq } from "drizzle-orm";
import { matches } from "../db/schema.js";
import type { DrizzleDB } from "../db/types.js";
import { ResultsSyncService, type ResultsProvider, type MatchResult } from "./results-sync.js";

const SCOREBOARD = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";
const SUMMARY = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary";

const STATUS_SHOOTOUT = "23";

interface ESPNCompetitor {
  homeAway: "home" | "away";
  score: string;
  team: { abbreviation: string };
  winner?: boolean;
}

interface ESPNEvent {
  id: string;
  competitions: Array<{
    competitors: ESPNCompetitor[];
    status: { type: { id: string; completed: boolean } };
  }>;
}

// Day-level cache so repeat calls within the same sync run hit the network once per day.
const dayCache = new Map<string, ESPNEvent[]>();

async function fetchEventsForDay(dateStr: string): Promise<ESPNEvent[]> {
  if (dayCache.has(dateStr)) return dayCache.get(dateStr)!;
  const res = await fetch(`${SCOREBOARD}?dates=${dateStr}`);
  if (!res.ok) throw new Error(`ESPN scoreboard HTTP ${res.status}`);
  const data = await res.json() as { events?: ESPNEvent[] };
  const events = data.events ?? [];
  dayCache.set(dateStr, events);
  return events;
}

async function fetchPenaltyWinner(eventId: string): Promise<string | null> {
  const res = await fetch(`${SUMMARY}?event=${eventId}`);
  if (!res.ok) return null;
  const data = await res.json() as {
    header?: { competitions?: Array<{ competitors: ESPNCompetitor[] }> };
  };
  const competitors = data.header?.competitions?.[0]?.competitors ?? [];
  return competitors.find((c) => c.winner)?.team.abbreviation ?? null;
}

async function getResultByMatch(opts: {
  kickoffAt: string;
  homeTeamCode: string | null;
  awayTeamCode: string | null;
}): Promise<MatchResult | null> {
  if (!opts.homeTeamCode || !opts.awayTeamCode) return null;

  const dateStr = opts.kickoffAt.slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const events = await fetchEventsForDay(dateStr);

  const event = events.find((e) => {
    const comp = e.competitions[0];
    if (!comp) return false;
    const home = comp.competitors.find((c) => c.homeAway === "home");
    const away = comp.competitors.find((c) => c.homeAway === "away");
    return (
      home?.team.abbreviation.toUpperCase() === opts.homeTeamCode!.toUpperCase() &&
      away?.team.abbreviation.toUpperCase() === opts.awayTeamCode!.toUpperCase()
    );
  });

  if (!event) return null;

  const comp = event.competitions[0];
  const { type } = comp.status;
  if (!type.completed) {
    return { homeGoals: 0, awayGoals: 0, finished: false, wentToPenalties: false, penaltyWinnerCode: null };
  }

  const home = comp.competitors.find((c) => c.homeAway === "home")!;
  const away = comp.competitors.find((c) => c.homeAway === "away")!;
  const wentToPenalties = type.id === STATUS_SHOOTOUT;
  const penaltyWinnerCode = wentToPenalties ? await fetchPenaltyWinner(event.id) : null;

  return {
    homeGoals: parseInt(home.score, 10),
    awayGoals: parseInt(away.score, 10),
    finished: true,
    wentToPenalties,
    penaltyWinnerCode,
  };
}

// Provider that resolves a match number → team codes via the DB, then calls ESPN.
function createESPNProvider(db: DrizzleDB): ResultsProvider {
  return {
    async getResult(matchNumber: number): Promise<MatchResult | null> {
      const match = db.select().from(matches).where(eq(matches.matchNumber, matchNumber)).get();
      if (!match) return null;
      return getResultByMatch({
        kickoffAt: match.kickoffAt,
        homeTeamCode: match.homeTeamCode,
        awayTeamCode: match.awayTeamCode,
      });
    },
  };
}

export function createESPNSyncService(db: DrizzleDB): ResultsSyncService {
  dayCache.clear();
  return new ResultsSyncService(db, createESPNProvider(db));
}
