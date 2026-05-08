import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb } from "../test-utils/db.js";
import { createApp } from "../app.js";

function makeApp() {
  const { db, sqlite } = createTestDb();
  const app = createApp(db);
  return { app, db, sqlite };
}

const VALID_USER = {
  email: "user@example.com",
  displayName: "Test User",
  password: "Secure#1pass",
};

async function registerAndLogin(app: ReturnType<typeof makeApp>["app"], overrides = {}) {
  const body = { ...VALID_USER, ...overrides };
  const res = await app.request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res;
}

describe("POST /api/auth/register", () => {
  it("registers a new user and returns 201 with user data", async () => {
    const { app } = makeApp();
    const res = await registerAndLogin(app);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.email).toBe(VALID_USER.email);
    expect(body.displayName).toBe(VALID_USER.displayName);
    expect(body.id).toBeTruthy();
    expect(body.password).toBeUndefined();
    expect(body.passwordHash).toBeUndefined();
  });

  it("sets an httpOnly token cookie on success", async () => {
    const { app } = makeApp();
    const res = await registerAndLogin(app);
    expect(res.headers.get("set-cookie")).toContain("token=");
    expect(res.headers.get("set-cookie")).toContain("HttpOnly");
  });

  it("returns 409 when email is already registered", async () => {
    const { app } = makeApp();
    await registerAndLogin(app);
    const res = await registerAndLogin(app);
    expect(res.status).toBe(409);
  });

  it("returns 400 for a weak password", async () => {
    const { app } = makeApp();
    const res = await registerAndLogin(app, { password: "weak" });
    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid email", async () => {
    const { app } = makeApp();
    const res = await registerAndLogin(app, { email: "not-an-email" });
    expect(res.status).toBe(400);
  });

  it("stores email in lowercase", async () => {
    const { app } = makeApp();
    const res = await registerAndLogin(app, { email: "UPPER@Example.COM" });
    const body = await res.json();
    expect(body.email).toBe("upper@example.com");
  });
});

describe("POST /api/auth/login", () => {
  it("returns user data and sets cookie for valid credentials", async () => {
    const { app } = makeApp();
    await registerAndLogin(app);
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: VALID_USER.email, password: VALID_USER.password }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.email).toBe(VALID_USER.email);
    expect(res.headers.get("set-cookie")).toContain("token=");
  });

  it("returns 401 for wrong password", async () => {
    const { app } = makeApp();
    await registerAndLogin(app);
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: VALID_USER.email, password: "Wrong#1pass" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 401 for unknown email", async () => {
    const { app } = makeApp();
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nobody@example.com", password: VALID_USER.password }),
    });
    expect(res.status).toBe(401);
  });

  it("is case-insensitive for email", async () => {
    const { app } = makeApp();
    await registerAndLogin(app);
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: VALID_USER.email.toUpperCase(), password: VALID_USER.password }),
    });
    expect(res.status).toBe(200);
  });
});

describe("POST /api/auth/logout", () => {
  it("clears the token cookie", async () => {
    const { app } = makeApp();
    const res = await app.request("/api/auth/logout", { method: "POST" });
    expect(res.status).toBe(200);
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(/token=;|token=(?:;|$)/);
  });
});

describe("GET /api/auth/me", () => {
  it("returns the current user when authenticated", async () => {
    const { app } = makeApp();
    const regRes = await registerAndLogin(app);
    const cookie = regRes.headers.get("set-cookie")!;

    const res = await app.request("/api/auth/me", {
      headers: { Cookie: cookie.split(";")[0] },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.email).toBe(VALID_USER.email);
  });

  it("returns 401 when not authenticated", async () => {
    const { app } = makeApp();
    const res = await app.request("/api/auth/me");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/forgot-password", () => {
  it("returns ok=true and a tempPassword for a known email", async () => {
    const { app } = makeApp();
    await registerAndLogin(app);
    const res = await app.request("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: VALID_USER.email }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.tempPassword).toBeTruthy();
  });

  it("returns ok=true (no leak) for an unknown email", async () => {
    const { app } = makeApp();
    const res = await app.request("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nobody@example.com" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.tempPassword).toBeUndefined();
  });

  it("generated temp password can be used to log in", async () => {
    const { app } = makeApp();
    await registerAndLogin(app);
    const forgotRes = await app.request("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: VALID_USER.email }),
    });
    const { tempPassword } = await forgotRes.json();

    const loginRes = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: VALID_USER.email, password: tempPassword }),
    });
    expect(loginRes.status).toBe(200);
    const body = await loginRes.json();
    expect(body.forcePasswordChange).toBe(true);
  });
});

describe("POST /api/auth/change-password", () => {
  it("changes password successfully", async () => {
    const { app } = makeApp();
    const regRes = await registerAndLogin(app);
    const cookie = regRes.headers.get("set-cookie")!.split(";")[0];

    const res = await app.request("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ currentPassword: VALID_USER.password, newPassword: "NewPass#2" }),
    });
    expect(res.status).toBe(200);

    // Old password no longer works
    const loginOld = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: VALID_USER.email, password: VALID_USER.password }),
    });
    expect(loginOld.status).toBe(401);

    // New password works
    const loginNew = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: VALID_USER.email, password: "NewPass#2" }),
    });
    expect(loginNew.status).toBe(200);
  });

  it("returns 400 for wrong current password", async () => {
    const { app } = makeApp();
    const regRes = await registerAndLogin(app);
    const cookie = regRes.headers.get("set-cookie")!.split(";")[0];

    const res = await app.request("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ currentPassword: "Wrong#1pass", newPassword: "NewPass#2" }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for a weak new password", async () => {
    const { app } = makeApp();
    const regRes = await registerAndLogin(app);
    const cookie = regRes.headers.get("set-cookie")!.split(";")[0];

    const res = await app.request("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ currentPassword: VALID_USER.password, newPassword: "weak" }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    const { app } = makeApp();
    const res = await app.request("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: VALID_USER.password, newPassword: "NewPass#2" }),
    });
    expect(res.status).toBe(401);
  });
});
