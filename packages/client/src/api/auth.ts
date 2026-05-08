export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  forcePasswordChange: boolean;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

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
