import type { Hono } from "hono";

export interface AuthSession {
  userId: string;
  cookie: string;
}

export async function registerUser(
  app: Hono,
  overrides: { email?: string; displayName?: string; password?: string } = {}
): Promise<AuthSession> {
  const body = {
    email: overrides.email ?? "user@example.com",
    displayName: overrides.displayName ?? "Test User",
    password: overrides.password ?? "Secure#1pass",
  };
  const res = await app.request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status !== 201) {
    throw new Error(`Registration failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  const rawCookie = res.headers.get("set-cookie")!;
  const cookie = rawCookie.split(";")[0]; // "token=<value>"
  return { userId: data.id, cookie };
}

export function authedRequest(
  app: Hono,
  path: string,
  options: RequestInit & { session: AuthSession }
) {
  const { session, headers = {}, ...rest } = options;
  return app.request(path, {
    ...rest,
    headers: {
      ...(headers as Record<string, string>),
      Cookie: session.cookie,
    },
  });
}
