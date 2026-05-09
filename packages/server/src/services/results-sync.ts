import { and, eq, isNull, lt } from "drizzle-orm";
import type { DrizzleDB } from "../db/types.js";
import { matches } from "../db/schema.js";

export interface MatchResult {
  homeGoals: number;
  awayGoals: number;
  finished: boolean;
  wentToPenalties: boolean;
  penaltyWinnerCode: string | null;
}

export interface ResultsProvider {
  getResult(matchNumber: number): Promise<MatchResult | null>;
}

const MIN_MATCH_DURATION_MS = 90 * 60 * 1000;

export class ResultsSyncService {
  constructor(
    private db: DrizzleDB,
    private provider: ResultsProvider
  ) {}

  async sync(): Promise<void> {
    const cutoff = new Date(Date.now() - MIN_MATCH_DURATION_MS).toISOString();

    const pending = this.db
      .select()
      .from(matches)
      .where(and(lt(matches.kickoffAt, cutoff), isNull(matches.homeGoals)))
      .all();

    for (const match of pending) {
      try {
        const result = await this.provider.getResult(match.matchNumber);
        if (!result || !result.finished) continue;

        this.db
          .update(matches)
          .set({
            homeGoals: result.homeGoals,
            awayGoals: result.awayGoals,
            wentToPenalties: result.wentToPenalties ? 1 : 0,
            penaltyWinnerCode: result.penaltyWinnerCode,
            resultFetchedAt: new Date().toISOString(),
          })
          .where(eq(matches.id, match.id))
          .run();
      } catch (err) {
        console.error(`[sync] Failed to fetch result for match #${match.matchNumber}:`, err);
      }
    }
  }
}
