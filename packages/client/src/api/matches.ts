export interface Match {
  id: string;
  matchNumber: number;
  stage: string;
  groupLetter: string | null;
  homeTeamCode: string | null;
  awayTeamCode: string | null;
  homeTeamLabel: string;
  awayTeamLabel: string;
  kickoffAt: string;
  deadlineAt: string;
  venueId: number | null;
  homeGoals: number | null;
  awayGoals: number | null;
  wentToPenalties: number;
  penaltyWinnerCode: string | null;
  resultFetchedAt: string | null;
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: "include" });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json() as Promise<T>;
}

export const matchesApi = {
  list: () => apiFetch<Match[]>("/api/matches"),
  get: (id: string) => apiFetch<Match>(`/api/matches/${id}`),
};
