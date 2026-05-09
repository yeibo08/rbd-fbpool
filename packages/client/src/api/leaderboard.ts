export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  role: "owner" | "manager" | "member";
  points: number;
  rank: number;
}

import { apiFetch } from "../lib/api.js";

export const leaderboardApi = {
  get: (groupId: string): Promise<LeaderboardEntry[]> =>
    apiFetch(`/api/groups/${groupId}/leaderboard`),
};
