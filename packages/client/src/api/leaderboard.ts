export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  role: "owner" | "manager" | "member";
  points: number;
  rank: number;
}

export const leaderboardApi = {
  get: async (groupId: string): Promise<LeaderboardEntry[]> => {
    const res = await fetch(`/api/groups/${groupId}/leaderboard`, { credentials: "include" });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  },
};
