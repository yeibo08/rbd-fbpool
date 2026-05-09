export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  forcePasswordChange: boolean;
}

import { apiFetch } from "../lib/api.js";

export const authApi = {
  register: (data: { email: string; displayName: string; password: string }) =>
    apiFetch<AuthUser>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiFetch<AuthUser>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiFetch<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),

  me: () => apiFetch<AuthUser>("/api/auth/me"),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiFetch<{ ok: boolean }>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
