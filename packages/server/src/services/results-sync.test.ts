import { describe, it, expect, vi } from "vitest";
import { createTestDb } from "../test-utils/db.js";
import { ResultsSyncService, type ResultsProvider, type MatchResult } from "./results-sync.js";

const past = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
const future = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

function mockProvider(result: MatchResult | null): ResultsProvider {
  return { getResult: vi.fn().mockResolvedValue(result) };
}

const FINISHED: MatchResult = { homeGoals: 2, awayGoals: 1, finished: true, wentToPenalties: false, penaltyWinnerCode: null };

describe("ResultsSyncService.sync()", () => {
  it("updates a finished match that kicked off 2h ago", async () => {
    const { db, sqlite } = createTestDb();
    sqlite.exec(`INSERT INTO matches (id, match_number, stage, home_team_label, away_team_label, kickoff_at)
      VALUES ('m1', 1, 'group', 'A', 'B', '${past(2)}')`);

    await new ResultsSyncService(db, mockProvider(FINISHED)).sync();

    const row = sqlite.prepare("SELECT * FROM matches WHERE id = 'm1'").get() as Record<string, unknown>;
    expect(row.home_goals).toBe(2);
    expect(row.away_goals).toBe(1);
    expect(row.result_fetched_at).toBeTruthy();
  });

  it("skips a match that kicked off less than 90 minutes ago", async () => {
    const { db, sqlite } = createTestDb();
    sqlite.exec(`INSERT INTO matches (id, match_number, stage, home_team_label, away_team_label, kickoff_at)
      VALUES ('m1', 1, 'group', 'A', 'B', '${past(1)}')`);

    const provider = mockProvider(FINISHED);
    await new ResultsSyncService(db, provider).sync();

    expect(provider.getResult).not.toHaveBeenCalled();
    const row = sqlite.prepare("SELECT home_goals FROM matches WHERE id = 'm1'").get() as Record<string, unknown>;
    expect(row.home_goals).toBeNull();
  });

  it("skips future matches", async () => {
    const { db, sqlite } = createTestDb();
    sqlite.exec(`INSERT INTO matches (id, match_number, stage, home_team_label, away_team_label, kickoff_at)
      VALUES ('m1', 1, 'group', 'A', 'B', '${future(2)}')`);

    const provider = mockProvider(FINISHED);
    await new ResultsSyncService(db, provider).sync();

    expect(provider.getResult).not.toHaveBeenCalled();
  });

  it("skips matches that already have results", async () => {
    const { db, sqlite } = createTestDb();
    sqlite.exec(`INSERT INTO matches (id, match_number, stage, home_team_label, away_team_label, kickoff_at, home_goals, away_goals)
      VALUES ('m1', 1, 'group', 'A', 'B', '${past(3)}', 1, 0)`);

    const provider = mockProvider(FINISHED);
    await new ResultsSyncService(db, provider).sync();

    expect(provider.getResult).not.toHaveBeenCalled();
  });

  it("does not write when provider returns null", async () => {
    const { db, sqlite } = createTestDb();
    sqlite.exec(`INSERT INTO matches (id, match_number, stage, home_team_label, away_team_label, kickoff_at)
      VALUES ('m1', 1, 'group', 'A', 'B', '${past(2)}')`);

    await new ResultsSyncService(db, mockProvider(null)).sync();

    const row = sqlite.prepare("SELECT home_goals FROM matches WHERE id = 'm1'").get() as Record<string, unknown>;
    expect(row.home_goals).toBeNull();
  });

  it("does not write when provider returns finished=false", async () => {
    const { db, sqlite } = createTestDb();
    sqlite.exec(`INSERT INTO matches (id, match_number, stage, home_team_label, away_team_label, kickoff_at)
      VALUES ('m1', 1, 'group', 'A', 'B', '${past(2)}')`);

    const inProgress: MatchResult = { ...FINISHED, finished: false };
    await new ResultsSyncService(db, mockProvider(inProgress)).sync();

    const row = sqlite.prepare("SELECT home_goals FROM matches WHERE id = 'm1'").get() as Record<string, unknown>;
    expect(row.home_goals).toBeNull();
  });

  it("stores penalty info when wentToPenalties is true", async () => {
    const { db, sqlite } = createTestDb();
    sqlite.exec(`INSERT INTO matches (id, match_number, stage, home_team_label, away_team_label, kickoff_at)
      VALUES ('m1', 1, 'final', 'A', 'B', '${past(3)}')`);

    const pens: MatchResult = { homeGoals: 1, awayGoals: 1, finished: true, wentToPenalties: true, penaltyWinnerCode: "AR" };
    await new ResultsSyncService(db, mockProvider(pens)).sync();

    const row = sqlite.prepare("SELECT * FROM matches WHERE id = 'm1'").get() as Record<string, unknown>;
    expect(row.went_to_penalties).toBe(1);
    expect(row.penalty_winner_code).toBe("AR");
  });

  it("continues processing other matches when one provider call throws", async () => {
    const { db, sqlite } = createTestDb();
    sqlite.exec(`INSERT INTO matches (id, match_number, stage, home_team_label, away_team_label, kickoff_at) VALUES
      ('m1', 1, 'group', 'A', 'B', '${past(2)}'),
      ('m2', 2, 'group', 'C', 'D', '${past(3)}')`);

    const provider: ResultsProvider = {
      getResult: vi.fn()
        .mockRejectedValueOnce(new Error("network error"))
        .mockResolvedValueOnce({ homeGoals: 3, awayGoals: 0, finished: true, wentToPenalties: false, penaltyWinnerCode: null }),
    };
    await expect(new ResultsSyncService(db, provider).sync()).resolves.not.toThrow();

    const m2 = sqlite.prepare("SELECT home_goals FROM matches WHERE id = 'm2'").get() as Record<string, unknown>;
    expect(m2.home_goals).toBe(3);
  });
});
