export interface Member {
  groupId: string;
  userId: string;
  role: "owner" | "manager" | "member";
  joinedAt: string;
  displayName: string;
}

export interface Group {
  id: string;
  name: string;
  ownerId: string;
  inviteToken: string;
  createdAt: string;
}

export interface GroupDetail extends Group {
  members: Member[];
}

export interface ScoringRules {
  ptsCorrectResult: number;
  ptsCorrectHome: number;
  ptsCorrectAway: number;
  ptsCorrectTotal: number;
}

import { apiFetch } from "../lib/api.js";

export const groupsApi = {
  list: () => apiFetch<Group[]>("/api/groups"),

  create: (name: string) =>
    apiFetch<GroupDetail>("/api/groups", { method: "POST", body: JSON.stringify({ name }) }),

  get: (id: string) => apiFetch<GroupDetail>(`/api/groups/${id}`),

  delete: (id: string) => apiFetch<{ ok: boolean }>(`/api/groups/${id}`, { method: "DELETE" }),

  join: (token: string) =>
    apiFetch<{ ok: boolean; groupId: string }>(`/api/groups/join/${token}`, { method: "POST" }),

  resetInvite: (id: string) =>
    apiFetch<{ inviteToken: string }>(`/api/groups/${id}/invite/reset`, { method: "POST" }),

  getRules: (id: string) => apiFetch<ScoringRules>(`/api/groups/${id}/rules`),

  updateRules: (id: string, rules: ScoringRules) =>
    apiFetch<{ ok: boolean }>(`/api/groups/${id}/rules`, {
      method: "PUT",
      body: JSON.stringify(rules),
    }),

  updateMemberRole: (groupId: string, userId: string, role: "manager" | "member") =>
    apiFetch<{ ok: boolean }>(`/api/groups/${groupId}/members/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  removeMember: (groupId: string, userId: string) =>
    apiFetch<{ ok: boolean }>(`/api/groups/${groupId}/members/${userId}`, { method: "DELETE" }),
};
