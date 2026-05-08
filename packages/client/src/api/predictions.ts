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

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

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
};
