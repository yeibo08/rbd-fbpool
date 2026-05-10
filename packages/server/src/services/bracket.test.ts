import { describe, it, expect } from "vitest";
import {
  simulateR32Qualifiers,
  propagateBracket,
  rankThirdPlaceTeams,
} from "./bracket.js";
import type { GroupStandingsMap, MatchOutcomeMap } from "./bracket.js";

// Helpers to build a standings map where group X has a clear winner/runner-up/3rd
function makeStandings(overrides: Partial<GroupStandingsMap> = {}): GroupStandingsMap {
  const groups = ["A","B","C","D","E","F","G","H","I","J","K","L"] as const;
  const standings: GroupStandingsMap = {};
  let i = 0;
  for (const g of groups) {
    const base = i * 4;
    standings[g] = [
      { position: 1, teamCode: `T${base+1}`, name: `Team${base+1}`, flagEmoji: "", played: 3, won: 3, drawn: 0, lost: 0, goalsFor: 6, goalsAgainst: 0, goalDiff: 6, points: 9 },
      { position: 2, teamCode: `T${base+2}`, name: `Team${base+2}`, flagEmoji: "", played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, goalDiff: 2, points: 6 },
      { position: 3, teamCode: `T${base+3}`, name: `Team${base+3}`, flagEmoji: "", played: 3, won: 1, drawn: 0, lost: 2, goalsFor: 2, goalsAgainst: 4, goalDiff: -2, points: 3 },
      { position: 4, teamCode: `T${base+4}`, name: `Team${base+4}`, flagEmoji: "", played: 3, won: 0, drawn: 0, lost: 3, goalsFor: 0, goalsAgainst: 6, goalDiff: -6, points: 0 },
    ];
    i++;
  }
  return { ...standings, ...overrides };
}

describe("rankThirdPlaceTeams", () => {
  it("returns exactly 8 teams from the 12 groups", () => {
    const standings = makeStandings();
    const top8 = rankThirdPlaceTeams(standings);
    expect(top8).toHaveLength(8);
  });

  it("selects third-place teams with the most points first", () => {
    const standings = makeStandings();
    // Override group A to have a 3rd-place team with 7 points (best)
    standings["A"][2] = { ...standings["A"][2], points: 7, goalDiff: 3, goalsFor: 5 };
    const top8 = rankThirdPlaceTeams(standings);
    expect(top8[0].teamCode).toBe(standings["A"][2].teamCode);
  });

  it("breaks ties by goal difference", () => {
    const standings = makeStandings();
    // Two groups have 3rd-place with 4 pts; one has better GD
    standings["A"][2] = { ...standings["A"][2], points: 4, goalDiff: 2, goalsFor: 3 };
    standings["B"][2] = { ...standings["B"][2], points: 4, goalDiff: -1, goalsFor: 3 };
    const top8 = rankThirdPlaceTeams(standings);
    const aIdx = top8.findIndex((t) => t.teamCode === standings["A"][2].teamCode);
    const bIdx = top8.findIndex((t) => t.teamCode === standings["B"][2].teamCode);
    expect(aIdx).toBeLessThan(bIdx);
  });
});

describe("simulateR32Qualifiers", () => {
  it("assigns group winners to their correct R32 slots", () => {
    const standings = makeStandings();
    const qualifiers = simulateR32Qualifiers(standings);
    // m079: home = winner Group A = T1 (standings[A][0])
    expect(qualifiers["m079"].home.teamCode).toBe("T1");
    // m073: home = runner-up Group A = T2
    expect(qualifiers["m073"].home.teamCode).toBe("T2");
  });

  it("assigns runner-up to their correct R32 slots", () => {
    const standings = makeStandings();
    const qualifiers = simulateR32Qualifiers(standings);
    // m073: away = runner-up Group B = T6 (group B, pos 2)
    expect(qualifiers["m073"].away.teamCode).toBe("T6");
  });

  it("assigns a third-place team to a slot where their group is in thirdFrom", () => {
    const standings = makeStandings();
    const qualifiers = simulateR32Qualifiers(standings);
    // Every third-place slot should have a teamCode that is one of our Tx teams
    const thirdSlots = ["m074", "m077", "m079", "m080", "m081", "m082", "m085", "m087"] as const;
    for (const slotId of thirdSlots) {
      expect(qualifiers[slotId].away.teamCode).toMatch(/^T\d+$/);
    }
  });

  it("returns 16 entries (one per R32 match)", () => {
    const standings = makeStandings();
    const qualifiers = simulateR32Qualifiers(standings);
    expect(Object.keys(qualifiers)).toHaveLength(16);
  });
});

describe("propagateBracket", () => {
  it("winning team of an R32 prediction appears in the correct R16 slot", () => {
    const standings = makeStandings();
    const qualifiers = simulateR32Qualifiers(standings);

    // User predicts m074 home team wins
    const homeTeam = qualifiers["m074"].home;
    const awayTeam = qualifiers["m074"].away;
    const outcomes: MatchOutcomeMap = {
      m074: { homeGoals: 2, awayGoals: 0, wentToPenalties: false, penaltyWinnerCode: null },
    };

    const bracket = propagateBracket(qualifiers, outcomes);
    // m089: Winner m074 vs Winner m077 — home side is winner of m074
    expect(bracket["m089"].home.teamCode).toBe(homeTeam.teamCode);
    // away side of m089 is winner of m077 — not yet determined (no outcome for m077)
    expect(bracket["m089"].away).toBeNull();
  });

  it("official penalty winner is used correctly", () => {
    const standings = makeStandings();
    const qualifiers = simulateR32Qualifiers(standings);

    const awayTeam = qualifiers["m074"].away;
    const outcomes: MatchOutcomeMap = {
      m074: {
        homeGoals: 1,
        awayGoals: 1,
        wentToPenalties: true,
        penaltyWinnerCode: awayTeam.teamCode,
      },
    };

    const bracket = propagateBracket(qualifiers, outcomes);
    expect(bracket["m089"].home.teamCode).toBe(awayTeam.teamCode);
  });

  it("null slots when no outcome provided for feeder match", () => {
    const standings = makeStandings();
    const qualifiers = simulateR32Qualifiers(standings);
    const bracket = propagateBracket(qualifiers, {});
    // No outcomes → all R16 home/away are null
    expect(bracket["m089"].home).toBeNull();
    expect(bracket["m089"].away).toBeNull();
  });

  it("propagates all the way to the Final (m104)", () => {
    const standings = makeStandings();
    const qualifiers = simulateR32Qualifiers(standings);

    // Predict every match with home team winning 1-0
    const outcomes: MatchOutcomeMap = {};
    for (const id of ["m073","m074","m075","m076","m077","m078","m079","m080",
                       "m081","m082","m083","m084","m085","m086","m087","m088",
                       "m089","m090","m091","m092","m093","m094","m095","m096",
                       "m097","m098","m099","m100","m101","m102"]) {
      outcomes[id] = { homeGoals: 1, awayGoals: 0, wentToPenalties: false, penaltyWinnerCode: null };
    }

    const bracket = propagateBracket(qualifiers, outcomes);
    // Final should have two teams
    expect(bracket["m104"].home).not.toBeNull();
    expect(bracket["m104"].away).not.toBeNull();
  });
});
