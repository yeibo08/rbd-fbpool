export interface Prediction {
  id: string;
  userId: string;
  groupId: string;
  matchId: string;
  homeGoals: number;
  awayGoals: number;
  submittedAt: string;
  updatedAt: string;
}

export interface PredictionResult {
  matchId: string;
  match: import("./matches.js").Match;
  prediction: Prediction | null;
  points: number;
}

import { apiFetch } from "../lib/api.js";

export const predictionsApi = {
  list: (groupId: string) =>
    apiFetch<Prediction[]>(`/api/groups/${groupId}/predictions`),

  upsert: (groupId: string, matchId: string, homeGoals: number, awayGoals: number) =>
    apiFetch<Prediction>(`/api/groups/${groupId}/predictions/${matchId}`, {
      method: "PUT",
      body: JSON.stringify({ homeGoals, awayGoals }),
    }),

  results: (groupId: string) =>
    apiFetch<PredictionResult[]>(`/api/groups/${groupId}/predictions/results`),

  progress: (groupId: string) =>
    apiFetch<{ predicted: number; total: number }>(`/api/groups/${groupId}/predictions/progress`),
};
