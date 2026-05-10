import { describe, it, expect } from "vitest";
import { computeGroupStandings, computeAllGroupStandings } from "./standings.js";

const TEAMS = [
  { code: "MX", name: "México",    flagEmoji: "🇲🇽" },
  { code: "AR", name: "Argentina", flagEmoji: "🇦🇷" },
  { code: "BR", name: "Brasil",    flagEmoji: "🇧🇷" },
  { code: "UY", name: "Uruguay",   flagEmoji: "🇺🇾" },
];

describe("computeGroupStandings", () => {
  it("returns all zeros when no results provided", () => {
    const standings = computeGroupStandings(TEAMS, []);
    expect(standings).toHaveLength(4);
    for (const t of standings) {
      expect(t.played).toBe(0);
      expect(t.points).toBe(0);
      expect(t.goalsFor).toBe(0);
      expect(t.goalsAgainst).toBe(0);
      expect(t.goalDiff).toBe(0);
    }
  });

  it("orders alphabetically when all teams have zero points", () => {
    const standings = computeGroupStandings(TEAMS, []);
    expect(standings.map((t) => t.teamCode)).toEqual(["AR", "BR", "MX", "UY"]);
  });

  it("win gives 3 points, draw gives 1 point, loss gives 0 points", () => {
    const results = [
      { homeTeamCode: "MX", awayTeamCode: "AR", homeGoals: 2, awayGoals: 0 }, // MX wins
      { homeTeamCode: "BR", awayTeamCode: "UY", homeGoals: 1, awayGoals: 1 }, // draw
    ];
    const standings = computeGroupStandings(TEAMS, results);
    const mx = standings.find((t) => t.teamCode === "MX")!;
    const ar = standings.find((t) => t.teamCode === "AR")!;
    const br = standings.find((t) => t.teamCode === "BR")!;
    const uy = standings.find((t) => t.teamCode === "UY")!;
    expect(mx.points).toBe(3);
    expect(mx.won).toBe(1);
    expect(ar.points).toBe(0);
    expect(ar.lost).toBe(1);
    expect(br.points).toBe(1);
    expect(br.drawn).toBe(1);
    expect(uy.points).toBe(1);
    expect(uy.drawn).toBe(1);
  });

  it("accumulates goals for and against correctly", () => {
    const results = [
      { homeTeamCode: "MX", awayTeamCode: "AR", homeGoals: 3, awayGoals: 1 },
      { homeTeamCode: "MX", awayTeamCode: "BR", homeGoals: 2, awayGoals: 2 },
    ];
    const standings = computeGroupStandings(TEAMS, results);
    const mx = standings.find((t) => t.teamCode === "MX")!;
    expect(mx.goalsFor).toBe(5);
    expect(mx.goalsAgainst).toBe(3);
    expect(mx.goalDiff).toBe(2);
    expect(mx.played).toBe(2);
  });

  it("sorts by points descending", () => {
    const results = [
      { homeTeamCode: "MX", awayTeamCode: "AR", homeGoals: 1, awayGoals: 0 },
      { homeTeamCode: "BR", awayTeamCode: "UY", homeGoals: 2, awayGoals: 0 },
    ];
    const standings = computeGroupStandings(TEAMS, results);
    expect(standings[0].teamCode).toBe("BR"); // 3 pts, 2 GF
    expect(standings[1].teamCode).toBe("MX"); // 3 pts, 1 GF
    // BR and MX both have 3 pts but BR has higher GF
  });

  it("breaks pts tie by goal difference", () => {
    // MX: beat AR 2-0 (GD +2), BR: beat UY 1-0 (GD +1), both have 3 pts
    const results = [
      { homeTeamCode: "MX", awayTeamCode: "AR", homeGoals: 2, awayGoals: 0 },
      { homeTeamCode: "BR", awayTeamCode: "UY", homeGoals: 1, awayGoals: 0 },
    ];
    const standings = computeGroupStandings(TEAMS, results);
    expect(standings[0].teamCode).toBe("MX"); // better GD
    expect(standings[1].teamCode).toBe("BR");
  });

  it("breaks pts+GD tie by goals scored", () => {
    // MX: beat AR 2-0 (GD+2, GF=2), BR: beat UY 2-0 (GD+2, GF=2), tie broken alphabetically
    // Change MX to 3-1 so GD same, GF different
    // MX beats AR 3-1 (GD+2, GF=3), BR beats UY 2-0 (GD+2, GF=2)
    const results = [
      { homeTeamCode: "MX", awayTeamCode: "AR", homeGoals: 3, awayGoals: 1 },
      { homeTeamCode: "BR", awayTeamCode: "UY", homeGoals: 2, awayGoals: 0 },
    ];
    const standings = computeGroupStandings(TEAMS, results);
    expect(standings[0].teamCode).toBe("MX"); // GD+2, GF=3
    expect(standings[1].teamCode).toBe("BR"); // GD+2, GF=2
  });

  it("breaks all ties alphabetically by team code", () => {
    // AR and MX draw head-to-head — same pts, GD, GF; AR comes before MX alphabetically
    const results = [
      { homeTeamCode: "AR", awayTeamCode: "MX", homeGoals: 0, awayGoals: 0 },
    ];
    const standings = computeGroupStandings(TEAMS, results);
    const topTwo = standings.slice(0, 2).map((t) => t.teamCode);
    expect(topTwo).toEqual(["AR", "MX"]);
  });

  it("assigns correct positions 1-4", () => {
    const standings = computeGroupStandings(TEAMS, []);
    expect(standings.map((t) => t.position)).toEqual([1, 2, 3, 4]);
  });
});

describe("computeAllGroupStandings", () => {
  it("returns a record keyed by group letter A-L with 4 teams each", () => {
    const countries = [
      { code: "MX", name: "México",    flagEmoji: "🇲🇽", groupLetter: "A" },
      { code: "AR", name: "Argentina", flagEmoji: "🇦🇷", groupLetter: "A" },
      { code: "BR", name: "Brasil",    flagEmoji: "🇧🇷", groupLetter: "A" },
      { code: "UY", name: "Uruguay",   flagEmoji: "🇺🇾", groupLetter: "A" },
    ];
    const result = computeAllGroupStandings(countries, []);
    expect(Object.keys(result)).toHaveLength(1);
    expect(result["A"]).toHaveLength(4);
  });

  it("only includes results whose groupLetter matches the group", () => {
    const countries = [
      { code: "MX", name: "México",    flagEmoji: "🇲🇽", groupLetter: "A" },
      { code: "AR", name: "Argentina", flagEmoji: "🇦🇷", groupLetter: "A" },
      { code: "BR", name: "Brasil",    flagEmoji: "🇧🇷", groupLetter: "A" },
      { code: "UY", name: "Uruguay",   flagEmoji: "🇺🇾", groupLetter: "A" },
      { code: "DE", name: "Alemania",  flagEmoji: "🇩🇪", groupLetter: "B" },
      { code: "FR", name: "Francia",   flagEmoji: "🇫🇷", groupLetter: "B" },
      { code: "ES", name: "España",    flagEmoji: "🇪🇸", groupLetter: "B" },
      { code: "PT", name: "Portugal",  flagEmoji: "🇵🇹", groupLetter: "B" },
    ];
    const results = [
      { homeTeamCode: "MX", awayTeamCode: "AR", homeGoals: 2, awayGoals: 0, groupLetter: "A" },
      { homeTeamCode: "DE", awayTeamCode: "FR", homeGoals: 1, awayGoals: 1, groupLetter: "B" },
    ];
    const standing = computeAllGroupStandings(countries, results);
    const mx = standing["A"].find((t) => t.teamCode === "MX")!;
    const ar = standing["A"].find((t) => t.teamCode === "AR")!;
    const de = standing["B"].find((t) => t.teamCode === "DE")!;
    expect(mx.points).toBe(3);
    expect(ar.points).toBe(0);
    expect(de.points).toBe(1);
  });
});
