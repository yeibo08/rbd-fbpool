import { apiFetch } from "../lib/api.js";

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

export interface StandingsResponse {
  groups: Record<string, TeamStanding[]>;
}

export const standingsApi = {
  official: (): Promise<StandingsResponse> =>
    apiFetch("/api/standings"),
  predicted: (groupId: string): Promise<StandingsResponse> =>
    apiFetch(`/api/groups/${groupId}/standings`),
};
