import { describe, it, expect } from "vitest";
import { createTestDb } from "../test-utils/db.js";
import { createApp } from "../app.js";
import { registerUser, authedRequest } from "../test-utils/helpers.js";

function makeApp() {
  const { db, sqlite } = createTestDb();
  // Seed 8 countries in 2 groups (A and B, 4 teams each)
  sqlite.exec(`
    INSERT INTO countries (code, name, short, flag_emoji, group_letter, flag_url) VALUES
      ('MX', 'México',    'MEX', '🇲🇽', 'A', 'https://flagcdn.com/w40/mx.png'),
      ('AR', 'Argentina', 'ARG', '🇦🇷', 'A', 'https://flagcdn.com/w40/ar.png'),
      ('BR', 'Brasil',    'BRA', '🇧🇷', 'A', 'https://flagcdn.com/w40/br.png'),
      ('UY', 'Uruguay',   'URU', '🇺🇾', 'A', 'https://flagcdn.com/w40/uy.png'),
      ('DE', 'Alemania',  'GER', '🇩🇪', 'B', 'https://flagcdn.com/w40/de.png'),
      ('FR', 'Francia',   'FRA', '🇫🇷', 'B', 'https://flagcdn.com/w40/fr.png'),
      ('ES', 'España',    'ESP', '🇪🇸', 'B', 'https://flagcdn.com/w40/es.png'),
      ('PT', 'Portugal',  'POR', '🇵🇹', 'B', 'https://flagcdn.com/w40/pt.png');
  `);
  // Seed 2 group A matches (no results yet)
  sqlite.exec(`
    INSERT INTO matches (id, match_number, stage, group_letter, home_team_code, away_team_code, home_team_label, away_team_label, kickoff_at) VALUES
      ('mA1', 1, 'group', 'A', 'MX', 'AR', 'México', 'Argentina', '2026-06-11T21:00:00Z'),
      ('mA2', 2, 'group', 'A', 'BR', 'UY', 'Brasil', 'Uruguay',   '2026-06-11T23:00:00Z'),
      ('mB1', 3, 'group', 'B', 'DE', 'FR', 'Alemania','Francia',   '2026-06-12T21:00:00Z');
  `);
  return { app: createApp(db), sqlite, db };
}

describe("GET /api/standings", () => {
  it("returns 200 without authentication", async () => {
    const { app } = makeApp();
    const res = await app.request("/api/standings");
    expect(res.status).toBe(200);
  });

  it("returns a groups object with entries for each seeded group", async () => {
    const { app } = makeApp();
    const body = await (await app.request("/api/standings")).json();
    expect(body.groups).toBeDefined();
    expect(Object.keys(body.groups)).toContain("A");
    expect(Object.keys(body.groups)).toContain("B");
  });

  it("each group has exactly 4 teams", async () => {
    const { app } = makeApp();
    const body = await (await app.request("/api/standings")).json();
    expect(body.groups["A"]).toHaveLength(4);
    expect(body.groups["B"]).toHaveLength(4);
  });

  it("all stats are zero before any results", async () => {
    const { app } = makeApp();
    const body = await (await app.request("/api/standings")).json();
    for (const team of body.groups["A"]) {
      expect(team.points).toBe(0);
      expect(team.played).toBe(0);
      expect(team.goalsFor).toBe(0);
    }
  });

  it("updates correctly after seeding a match result", async () => {
    const { app, sqlite } = makeApp();
    sqlite.exec(`UPDATE matches SET home_goals = 2, away_goals = 0 WHERE id = 'mA1';`);
    const body = await (await app.request("/api/standings")).json();
    const mx = body.groups["A"].find((t: { teamCode: string }) => t.teamCode === "MX");
    const ar = body.groups["A"].find((t: { teamCode: string }) => t.teamCode === "AR");
    expect(mx.points).toBe(3);
    expect(mx.goalsFor).toBe(2);
    expect(ar.points).toBe(0);
    expect(ar.goalsAgainst).toBe(2);
  });

  it("teams include name and flagEmoji", async () => {
    const { app } = makeApp();
    const body = await (await app.request("/api/standings")).json();
    const mx = body.groups["A"].find((t: { teamCode: string }) => t.teamCode === "MX");
    expect(mx.name).toBe("México");
    expect(mx.flagEmoji).toBe("🇲🇽");
  });

  it("teams have position 1-4", async () => {
    const { app } = makeApp();
    const body = await (await app.request("/api/standings")).json();
    const positions = body.groups["A"].map((t: { position: number }) => t.position);
    expect(positions).toEqual([1, 2, 3, 4]);
  });
});

describe("GET /api/groups/:id/standings", () => {
  it("returns 401 when not authenticated", async () => {
    const { app } = makeApp();
    // Create a group first
    const owner = await registerUser(app);
    const groupRes = await authedRequest(app, "/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Mi Grupo" }),
      session: owner,
    });
    const group = await groupRes.json();
    const res = await app.request(`/api/groups/${group.id}/standings`);
    expect(res.status).toBe(401);
  });

  it("returns 403 for a non-member", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app);
    const groupRes = await authedRequest(app, "/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Mi Grupo" }),
      session: owner,
    });
    const group = await groupRes.json();
    const stranger = await registerUser(app, { email: "stranger@example.com" });
    const res = await authedRequest(app, `/api/groups/${group.id}/standings`, { session: stranger });
    expect(res.status).toBe(403);
  });

  it("returns 200 with group standings structure for a member", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app);
    const groupRes = await authedRequest(app, "/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Mi Grupo" }),
      session: owner,
    });
    const group = await groupRes.json();
    const res = await authedRequest(app, `/api/groups/${group.id}/standings`, { session: owner });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.groups).toBeDefined();
    expect(body.groups["A"]).toHaveLength(4);
  });

  it("simulated standings reflect user predictions", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app);
    const groupRes = await authedRequest(app, "/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Mi Grupo" }),
      session: owner,
    });
    const group = await groupRes.json();

    // User predicts MX wins 3-0 vs AR
    await authedRequest(app, `/api/groups/${group.id}/predictions/mA1`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeGoals: 3, awayGoals: 0 }),
      session: owner,
    });

    const res = await authedRequest(app, `/api/groups/${group.id}/standings`, { session: owner });
    const body = await res.json();
    const mx = body.groups["A"].find((t: { teamCode: string }) => t.teamCode === "MX");
    expect(mx.points).toBe(3);
    expect(mx.goalsFor).toBe(3);
    expect(mx.position).toBe(1);
  });

  it("official result takes precedence over prediction", async () => {
    const { app, sqlite } = makeApp();
    // Set official result: AR wins 2-0 (AR is the away team in mA1)
    sqlite.exec(`UPDATE matches SET home_goals = 0, away_goals = 2 WHERE id = 'mA1';`);

    const owner = await registerUser(app);
    const groupRes = await authedRequest(app, "/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Mi Grupo" }),
      session: owner,
    });
    const group = await groupRes.json();

    // User predicts MX wins — but official says AR wins
    await authedRequest(app, `/api/groups/${group.id}/predictions/mA1`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeGoals: 5, awayGoals: 0 }),
      session: owner,
    });

    const res = await authedRequest(app, `/api/groups/${group.id}/standings`, { session: owner });
    const body = await res.json();
    const mx = body.groups["A"].find((t: { teamCode: string }) => t.teamCode === "MX");
    const ar = body.groups["A"].find((t: { teamCode: string }) => t.teamCode === "AR");
    // Official result should be used: AR wins 2-0
    expect(ar.points).toBe(3);
    expect(mx.points).toBe(0);
    expect(mx.goalsFor).toBe(0); // not 5 from prediction
  });
});
