export interface TeamStanding {
  position: number;
  teamCode: string;
  name: string;
  flagEmoji: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

interface TeamInput {
  code: string;
  name: string;
  flagEmoji: string;
}

interface MatchResult {
  homeTeamCode: string;
  awayTeamCode: string;
  homeGoals: number;
  awayGoals: number;
}

interface CountryInput extends TeamInput {
  groupLetter: string;
}

interface GroupedResult extends MatchResult {
  groupLetter: string;
}

export function computeGroupStandings(
  teams: TeamInput[],
  results: MatchResult[]
): TeamStanding[] {
  const statsMap = new Map<string, Omit<TeamStanding, "position">>();

  for (const team of teams) {
    statsMap.set(team.code, {
      teamCode: team.code,
      name: team.name,
      flagEmoji: team.flagEmoji,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
    });
  }

  for (const r of results) {
    const home = statsMap.get(r.homeTeamCode);
    const away = statsMap.get(r.awayTeamCode);
    if (!home || !away) continue;

    home.played++;
    away.played++;
    home.goalsFor += r.homeGoals;
    home.goalsAgainst += r.awayGoals;
    away.goalsFor += r.awayGoals;
    away.goalsAgainst += r.homeGoals;

    if (r.homeGoals > r.awayGoals) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (r.homeGoals < r.awayGoals) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.points++;
      away.points++;
    }

    home.goalDiff = home.goalsFor - home.goalsAgainst;
    away.goalDiff = away.goalsFor - away.goalsAgainst;
  }

  const sorted = [...statsMap.values()].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamCode.localeCompare(b.teamCode);
  });

  return sorted.map((t, i) => ({ ...t, position: i + 1 }));
}

export function computeAllGroupStandings(
  countries: CountryInput[],
  results: GroupedResult[]
): Record<string, TeamStanding[]> {
  const teamsByGroup = new Map<string, TeamInput[]>();
  for (const c of countries) {
    const group = teamsByGroup.get(c.groupLetter) ?? [];
    group.push({ code: c.code, name: c.name, flagEmoji: c.flagEmoji });
    teamsByGroup.set(c.groupLetter, group);
  }

  const resultsByGroup = new Map<string, MatchResult[]>();
  for (const r of results) {
    const group = resultsByGroup.get(r.groupLetter) ?? [];
    group.push(r);
    resultsByGroup.set(r.groupLetter, group);
  }

  const output: Record<string, TeamStanding[]> = {};
  for (const [letter, teams] of teamsByGroup) {
    output[letter] = computeGroupStandings(teams, resultsByGroup.get(letter) ?? []);
  }
  return output;
}
