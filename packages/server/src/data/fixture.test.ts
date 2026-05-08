import { describe, it, expect } from "vitest";
import { countries, venues, matches } from "./fixture.js";

describe("fixture data", () => {
  it("has 48 countries", () => {
    expect(countries).toHaveLength(48);
  });

  it("has exactly 12 groups (A–L) each with 4 teams", () => {
    const groups: Record<string, string[]> = {};
    for (const c of countries) {
      if (!groups[c.groupLetter]) groups[c.groupLetter] = [];
      groups[c.groupLetter].push(c.code);
    }
    expect(Object.keys(groups).sort()).toEqual(
      ["A","B","C","D","E","F","G","H","I","J","K","L"]
    );
    for (const g of Object.values(groups)) {
      expect(g).toHaveLength(4);
    }
  });

  it("has no duplicate country codes", () => {
    const codes = countries.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("has 16 venues", () => {
    expect(venues).toHaveLength(16);
  });

  it("has no duplicate venue names", () => {
    const names = venues.map((v) => v.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("has 104 matches", () => {
    expect(matches).toHaveLength(104);
  });

  it("has 72 group stage matches", () => {
    expect(matches.filter((m) => m.stage === "group")).toHaveLength(72);
  });

  it("has 16 round_of_32 matches", () => {
    expect(matches.filter((m) => m.stage === "round_of_32")).toHaveLength(16);
  });

  it("has 8 round_of_16 matches", () => {
    expect(matches.filter((m) => m.stage === "round_of_16")).toHaveLength(8);
  });

  it("has 4 quarterfinal matches", () => {
    expect(matches.filter((m) => m.stage === "quarterfinal")).toHaveLength(4);
  });

  it("has 2 semifinal matches", () => {
    expect(matches.filter((m) => m.stage === "semifinal")).toHaveLength(2);
  });

  it("has 1 third_place match", () => {
    expect(matches.filter((m) => m.stage === "third_place")).toHaveLength(1);
  });

  it("has 1 final match", () => {
    expect(matches.filter((m) => m.stage === "final")).toHaveLength(1);
  });

  it("has sequential unique match numbers 1–104", () => {
    const numbers = matches.map((m) => m.matchNumber).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 104 }, (_, i) => i + 1));
  });

  it("all group stage matches have team codes", () => {
    for (const m of matches.filter((m) => m.stage === "group")) {
      expect(m.homeTeamCode).not.toBeNull();
      expect(m.awayTeamCode).not.toBeNull();
    }
  });

  it("all group stage team codes exist in countries", () => {
    const validCodes = new Set(countries.map((c) => c.code));
    for (const m of matches.filter((m) => m.stage === "group")) {
      expect(validCodes.has(m.homeTeamCode!)).toBe(true);
      expect(validCodes.has(m.awayTeamCode!)).toBe(true);
    }
  });

  it("all kickoff times are valid ISO 8601 UTC strings", () => {
    for (const m of matches) {
      const d = new Date(m.kickoffAt);
      expect(d.toString()).not.toBe("Invalid Date");
      expect(m.kickoffAt.endsWith("Z")).toBe(true);
    }
  });

  it("all venue names in matches exist in venues list", () => {
    const venueNames = new Set(venues.map((v) => v.name));
    for (const m of matches) {
      expect(venueNames.has(m.venueName)).toBe(true);
    }
  });

  it("each country plays exactly 3 group stage matches", () => {
    const playCounts: Record<string, number> = {};
    for (const m of matches.filter((m) => m.stage === "group")) {
      playCounts[m.homeTeamCode!] = (playCounts[m.homeTeamCode!] ?? 0) + 1;
      playCounts[m.awayTeamCode!] = (playCounts[m.awayTeamCode!] ?? 0) + 1;
    }
    for (const c of countries) {
      expect(playCounts[c.code]).toBe(3);
    }
  });

  it("first match starts June 11 2026 and final is July 19 2026", () => {
    const sorted = [...matches].sort(
      (a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime()
    );
    expect(sorted[0].kickoffAt.startsWith("2026-06-11")).toBe(true);
    expect(sorted[sorted.length - 1].kickoffAt.startsWith("2026-07-19")).toBe(true);
  });
});
