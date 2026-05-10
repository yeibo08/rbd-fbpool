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
  homeTeamShort: string | null;
  homeTeamFlagEmoji: string | null;
  homeTeamFlagUrl: string | null;
  awayTeamShort: string | null;
  awayTeamFlagEmoji: string | null;
  awayTeamFlagUrl: string | null;
}

import { apiFetch } from "../lib/api.js";

export const matchesApi = {
  list: () => apiFetch<Match[]>("/api/matches"),
  get: (id: string) => apiFetch<Match>(`/api/matches/${id}`),
};
