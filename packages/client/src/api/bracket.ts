import { apiFetch } from "../lib/api.js";

export interface BracketMatch {
  matchId: string;
  matchNumber: number;
  stage: string;
  kickoffAt: string;
  homeTeamCode: string | null;
  homeTeamLabel: string;
  homeTeamFlagEmoji: string | null;
  awayTeamCode: string | null;
  awayTeamLabel: string;
  awayTeamFlagEmoji: string | null;
  homeGoals: number | null;
  awayGoals: number | null;
  wentToPenalties: boolean;
  penaltyWinnerCode: string | null;
  predictedHomeGoals: number | null;
  predictedAwayGoals: number | null;
  pointsEarned: number | null;
}

export interface BracketResponse {
  round_of_32: BracketMatch[];
  round_of_16: BracketMatch[];
  quarterfinal: BracketMatch[];
  semifinal: BracketMatch[];
  third_place: BracketMatch[];
  final: BracketMatch[];
}

export const bracketApi = {
  get: (groupId: string): Promise<BracketResponse> =>
    apiFetch(`/api/groups/${groupId}/bracket`),
};
