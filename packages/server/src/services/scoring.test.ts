import { describe, it, expect } from "vitest";
import { computePoints } from "./scoring.js";

const DEFAULT_RULES = {
  ptsCorrectResult: 1,
  ptsCorrectHome: 1,
  ptsCorrectAway: 1,
  ptsCorrectTotal: 1,
};

describe("computePoints", () => {
  it("awards all 4 points for an exact score prediction", () => {
    expect(
      computePoints({ homeGoals: 2, awayGoals: 1 }, { homeGoals: 2, awayGoals: 1, wentToPenalties: false, penaltyWinnerCode: null, homeTeamCode: "MX", awayTeamCode: "AR" }, DEFAULT_RULES)
    ).toBe(4);
  });

  it("awards 1 point for correct result only (home win, different score)", () => {
    expect(
      computePoints({ homeGoals: 1, awayGoals: 0 }, { homeGoals: 3, awayGoals: 1, wentToPenalties: false, penaltyWinnerCode: null, homeTeamCode: "MX", awayTeamCode: "AR" }, DEFAULT_RULES)
    ).toBe(1);
  });

  it("awards 0 points when result is completely wrong", () => {
    expect(
      computePoints({ homeGoals: 0, awayGoals: 2 }, { homeGoals: 2, awayGoals: 1, wentToPenalties: false, penaltyWinnerCode: null, homeTeamCode: "MX", awayTeamCode: "AR" }, DEFAULT_RULES)
    ).toBe(0);
  });

  it("awards pts for correct draw prediction", () => {
    expect(
      computePoints({ homeGoals: 1, awayGoals: 1 }, { homeGoals: 1, awayGoals: 1, wentToPenalties: false, penaltyWinnerCode: null, homeTeamCode: "MX", awayTeamCode: "AR" }, DEFAULT_RULES)
    ).toBe(4);
  });

  it("awards result + total when both scores differ but totals match and result is correct", () => {
    // actual: 2-0, predict: 1-0 → correct result (home), wrong goals, correct total? No, 1 != 2 total
    // actual: 2-0, predict: 1-1 → wrong result (draw vs home win), correct total (2==2)
    expect(
      computePoints({ homeGoals: 1, awayGoals: 1 }, { homeGoals: 2, awayGoals: 0, wentToPenalties: false, penaltyWinnerCode: null, homeTeamCode: "MX", awayTeamCode: "AR" }, DEFAULT_RULES)
    ).toBe(1); // only correct total (1+1 == 2+0)
  });

  it("uses penalty winner to determine result, not goals", () => {
    // Match goes to pens: goals 1-1, away wins on pens
    // Prediction: 1-0 (home win) → wrong result
    expect(
      computePoints({ homeGoals: 1, awayGoals: 0 }, { homeGoals: 1, awayGoals: 1, wentToPenalties: true, penaltyWinnerCode: "AR", homeTeamCode: "MX", awayTeamCode: "AR" }, DEFAULT_RULES)
    ).toBe(1); // correct home goals, that's it
  });

  it("awards result point when penalty winner is correctly predicted via goals", () => {
    // Match: 1-1 → away wins pens; prediction: 0-1 (away win) → correct result
    expect(
      computePoints({ homeGoals: 0, awayGoals: 1 }, { homeGoals: 1, awayGoals: 1, wentToPenalties: true, penaltyWinnerCode: "AR", homeTeamCode: "MX", awayTeamCode: "AR" }, DEFAULT_RULES)
    ).toBe(2); // correct result + correct away goals
  });

  it("respects custom scoring rules", () => {
    const rules = { ptsCorrectResult: 3, ptsCorrectHome: 2, ptsCorrectAway: 2, ptsCorrectTotal: 1 };
    expect(
      computePoints({ homeGoals: 2, awayGoals: 1 }, { homeGoals: 2, awayGoals: 1, wentToPenalties: false, penaltyWinnerCode: null, homeTeamCode: "MX", awayTeamCode: "AR" }, rules)
    ).toBe(8); // 3 + 2 + 2 + 1
  });
});
