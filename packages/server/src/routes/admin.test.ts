import { describe, it, expect } from "vitest";
import { createTestDb } from "../test-utils/db.js";
import { createApp } from "../app.js";
import { registerUser, authedRequest } from "../test-utils/helpers.js";

function makeApp() {
  const { db, sqlite } = createTestDb();
  sqlite.exec(`INSERT INTO matches (id, match_number, stage, home_team_label, away_team_label, kickoff_at)
    VALUES ('m1', 1, 'group', 'México', 'Argentina', '2026-06-12T18:00:00.000Z')`);
  return { app: createApp(db), sqlite };
}

// ── PUT /api/admin/matches/:id/result ─────────────────────────────────────

describe("PUT /api/admin/matches/:id/result", () => {
  it("returns 401 without auth cookie", async () => {
    const { app } = makeApp();
    const res = await app.request("/api/admin/matches/m1/result", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeGoals: 2, awayGoals: 1 }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 404 for an unknown match id", async () => {
    const { app } = makeApp();
    const user = await registerUser(app);
    const res = await authedRequest(app, "/api/admin/matches/unknown/result", {
      session: user,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeGoals: 1, awayGoals: 0 }),
    });
    expect(res.status).toBe(404);
  });

  it("sets homeGoals and awayGoals in the DB", async () => {
    const { app, sqlite } = makeApp();
    const user = await registerUser(app);
    const res = await authedRequest(app, "/api/admin/matches/m1/result", {
      session: user,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeGoals: 3, awayGoals: 0 }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    const row = sqlite.prepare("SELECT home_goals, away_goals FROM matches WHERE id = 'm1'").get() as Record<string, unknown>;
    expect(row.home_goals).toBe(3);
    expect(row.away_goals).toBe(0);
  });

  it("stores wentToPenalties and penaltyWinnerCode", async () => {
    const { app, sqlite } = makeApp();
    const user = await registerUser(app);
    await authedRequest(app, "/api/admin/matches/m1/result", {
      session: user,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeGoals: 1, awayGoals: 1, wentToPenalties: true, penaltyWinnerCode: "MX" }),
    });
    const row = sqlite.prepare("SELECT went_to_penalties, penalty_winner_code FROM matches WHERE id = 'm1'").get() as Record<string, unknown>;
    expect(row.went_to_penalties).toBe(1);
    expect(row.penalty_winner_code).toBe("MX");
  });
});

// ── DELETE /api/admin/matches/:id/result ──────────────────────────────────

describe("DELETE /api/admin/matches/:id/result", () => {
  it("returns 401 without auth cookie", async () => {
    const { app } = makeApp();
    const res = await app.request("/api/admin/matches/m1/result", { method: "DELETE" });
    expect(res.status).toBe(401);
  });

  it("clears goals back to null", async () => {
    const { app, sqlite } = makeApp();
    sqlite.exec(`UPDATE matches SET home_goals = 2, away_goals = 1 WHERE id = 'm1'`);
    const user = await registerUser(app);
    const res = await authedRequest(app, "/api/admin/matches/m1/result", {
      session: user,
      method: "DELETE",
    });
    expect(res.status).toBe(200);
    const row = sqlite.prepare("SELECT home_goals, away_goals FROM matches WHERE id = 'm1'").get() as Record<string, unknown>;
    expect(row.home_goals).toBeNull();
    expect(row.away_goals).toBeNull();
  });
});
