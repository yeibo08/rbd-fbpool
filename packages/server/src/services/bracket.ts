import type { TeamStanding } from "./standings.js";

export type GroupStandingsMap = Record<string, TeamStanding[]>;

export interface TeamRef {
  teamCode: string;
  name: string;
  flagEmoji: string;
}

export interface BracketSlot {
  home: TeamRef;
  away: TeamRef;
}

export interface MatchOutcome {
  homeGoals: number;
  awayGoals: number;
  wentToPenalties: boolean;
  penaltyWinnerCode: string | null;
}

export type MatchOutcomeMap = Record<string, MatchOutcome>;

export interface ResolvedSlot {
  home: TeamRef | null;
  away: TeamRef | null;
}

export type BracketMap = Record<string, ResolvedSlot>;

// Official FIFA 2026 R32 bracket pairings.
// pos: 1 = group winner, 2 = runner-up, 3 = best third-place qualifier
// thirdFrom: groups from which the third-place team for this slot is drawn (greedy assignment)
const R32_SLOTS = [
  { matchId: "m073", home: { pos: 2, group: "A" }, away: { pos: 2, group: "B" } },
  { matchId: "m074", home: { pos: 1, group: "E" }, away: { pos: 3, thirdFrom: ["A","B","C","D","F"] } },
  { matchId: "m075", home: { pos: 1, group: "F" }, away: { pos: 2, group: "C" } },
  { matchId: "m076", home: { pos: 1, group: "C" }, away: { pos: 2, group: "F" } },
  { matchId: "m077", home: { pos: 1, group: "I" }, away: { pos: 3, thirdFrom: ["C","D","F","G","H"] } },
  { matchId: "m078", home: { pos: 2, group: "E" }, away: { pos: 2, group: "I" } },
  { matchId: "m079", home: { pos: 1, group: "A" }, away: { pos: 3, thirdFrom: ["C","E","F","H","I"] } },
  { matchId: "m080", home: { pos: 1, group: "L" }, away: { pos: 3, thirdFrom: ["E","H","I","J","K"] } },
  { matchId: "m081", home: { pos: 1, group: "D" }, away: { pos: 3, thirdFrom: ["B","E","F","I","J"] } },
  { matchId: "m082", home: { pos: 1, group: "G" }, away: { pos: 3, thirdFrom: ["A","E","H","I","J"] } },
  { matchId: "m083", home: { pos: 2, group: "K" }, away: { pos: 2, group: "L" } },
  { matchId: "m084", home: { pos: 1, group: "H" }, away: { pos: 2, group: "J" } },
  { matchId: "m085", home: { pos: 1, group: "B" }, away: { pos: 3, thirdFrom: ["E","F","G","I","J"] } },
  { matchId: "m086", home: { pos: 1, group: "J" }, away: { pos: 2, group: "H" } },
  { matchId: "m087", home: { pos: 1, group: "K" }, away: { pos: 3, thirdFrom: ["D","E","I","J","L"] } },
  { matchId: "m088", home: { pos: 2, group: "D" }, away: { pos: 2, group: "G" } },
] as const;

// R16 match connections: which R32 winner feeds into each R16 slot
const BRACKET_CONNECTIONS: Record<string, { home: string; away: string; losers?: true }> = {
  m089: { home: "m074", away: "m077" },
  m090: { home: "m073", away: "m075" },
  m091: { home: "m076", away: "m078" },
  m092: { home: "m079", away: "m080" },
  m093: { home: "m083", away: "m084" },
  m094: { home: "m081", away: "m082" },
  m095: { home: "m086", away: "m088" },
  m096: { home: "m085", away: "m087" },
  // QF
  m097: { home: "m089", away: "m090" },
  m098: { home: "m091", away: "m092" },
  m099: { home: "m093", away: "m094" },
  m100: { home: "m095", away: "m096" },
  // SF
  m101: { home: "m097", away: "m098" },
  m102: { home: "m099", away: "m100" },
  // 3rd place: losers of SFs
  m103: { home: "m101", away: "m102", losers: true },
  // Final
  m104: { home: "m101", away: "m102" },
};

function toRef(t: TeamStanding): TeamRef {
  return { teamCode: t.teamCode, name: t.name, flagEmoji: t.flagEmoji };
}

function getWinner(outcome: MatchOutcome, home: TeamRef, away: TeamRef): TeamRef {
  if (outcome.wentToPenalties && outcome.penaltyWinnerCode) {
    return outcome.penaltyWinnerCode === home.teamCode ? home : away;
  }
  if (outcome.homeGoals > outcome.awayGoals) return home;
  if (outcome.awayGoals > outcome.homeGoals) return away;
  // Draw with no penalties — shouldn't happen in knockout but default to home
  return home;
}

function getLoser(outcome: MatchOutcome, home: TeamRef, away: TeamRef): TeamRef {
  const winner = getWinner(outcome, home, away);
  return winner.teamCode === home.teamCode ? away : home;
}

export function rankThirdPlaceTeams(standings: GroupStandingsMap): (TeamStanding & { groupLetter: string })[] {
  const thirdPlacers = Object.entries(standings)
    .map(([letter, teams]) => ({ ...teams[2], groupLetter: letter }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.teamCode.localeCompare(b.teamCode);
    });
  return thirdPlacers.slice(0, 8);
}

export function simulateR32Qualifiers(standings: GroupStandingsMap): BracketMap {
  const top8ThirdPlace = rankThirdPlaceTeams(standings);

  const assignedGroups = new Set<string>();
  function assignThirdPlace(thirdFrom: readonly string[]): TeamRef | null {
    for (const qualifier of top8ThirdPlace) {
      if (!assignedGroups.has(qualifier.groupLetter) && thirdFrom.includes(qualifier.groupLetter)) {
        assignedGroups.add(qualifier.groupLetter);
        return toRef(qualifier);
      }
    }
    return null;
  }

  const result: BracketMap = {};

  for (const slot of R32_SLOTS) {
    const resolveSlot = (side: typeof slot.home | typeof slot.away): TeamRef | null => {
      if ("group" in side && side.pos !== 3) {
        const group = standings[side.group];
        if (!group) return null;
        return toRef(group[side.pos - 1]);
      }
      if ("thirdFrom" in side) {
        return assignThirdPlace(side.thirdFrom);
      }
      return null;
    };

    result[slot.matchId] = {
      home: resolveSlot(slot.home),
      away: resolveSlot(slot.away),
    };
  }

  return result;
}

export function propagateBracket(
  r32Qualifiers: BracketMap,
  outcomes: MatchOutcomeMap
): BracketMap {
  // Start with R32 slots resolved
  const resolved: BracketMap = { ...r32Qualifiers };

  // Process matches in order — connections go R32 → R16 → QF → SF → 3rd/Final
  const order = [
    "m089","m090","m091","m092","m093","m094","m095","m096",
    "m097","m098","m099","m100",
    "m101","m102",
    "m103","m104",
  ];

  for (const matchId of order) {
    const conn = BRACKET_CONNECTIONS[matchId];
    if (!conn) continue;

    const homeFeeder = resolved[conn.home];
    const awayFeeder = resolved[conn.away];
    const homeOutcome = outcomes[conn.home];
    const awayOutcome = outcomes[conn.away];

    const pick = (
      slot: ResolvedSlot | undefined,
      outcome: MatchOutcome | undefined,
      useLosers: boolean
    ): TeamRef | null => {
      if (!slot?.home || !slot?.away) return null;
      if (!outcome) return null;
      return useLosers
        ? getLoser(outcome, slot.home, slot.away)
        : getWinner(outcome, slot.home, slot.away);
    };

    const useLosers = conn.losers === true;
    resolved[matchId] = {
      home: pick(homeFeeder, homeOutcome, useLosers),
      away: pick(awayFeeder, awayOutcome, useLosers),
    };
  }

  return resolved;
}
