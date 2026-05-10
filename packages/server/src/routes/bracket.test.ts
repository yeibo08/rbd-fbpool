import { describe, it, expect } from "vitest";
import { createTestDb } from "../test-utils/db.js";
import { createApp } from "../app.js";
import { registerUser, authedRequest } from "../test-utils/helpers.js";

// Seed a minimal fixture: all 48 countries in 12 groups + 2 knockout matches
function makeApp() {
  const { db, sqlite } = createTestDb();

  // 12 groups × 4 teams each
  const groups = ["A","B","C","D","E","F","G","H","I","J","K","L"];
  const insertCountries: string[] = [];
  const insertGroupMatches: string[] = [];
  let matchNum = 1;

  for (const g of groups) {
    const i = groups.indexOf(g);
    const codes = [`T${i*4+1}`,`T${i*4+2}`,`T${i*4+3}`,`T${i*4+4}`];
    for (const code of codes) {
      insertCountries.push(
        `('${code}', 'Team ${code}', '${code}', '🏳', '${g}', 'https://example.com/${code}.png')`
      );
    }
    // One match per group (simplified — only 1 of 6 to keep fixture small)
    insertGroupMatches.push(
      `('mg${g}', ${matchNum++}, 'group', '${g}', '${codes[0]}', '${codes[1]}', 'Team ${codes[0]}', 'Team ${codes[1]}', '2026-06-11T21:00:00Z')`
    );
  }

  sqlite.exec(`INSERT INTO countries (code, name, short, flag_emoji, group_letter, flag_url) VALUES ${insertCountries.join(",")};`);
  sqlite.exec(`INSERT INTO matches (id, match_number, stage, group_letter, home_team_code, away_team_code, home_team_label, away_team_label, kickoff_at) VALUES ${insertGroupMatches.join(",")};`);

  // Seed all 32 knockout matches with TBD labels
  const pad = (n: number) => `m${String(n).padStart(3, "0")}`;
  const knockoutStages = [
    ...Array.from({ length: 16 }, (_, i) => ({ id: pad(73+i), num: 73+i, stage: "round_of_32" })),
    ...Array.from({ length: 8  }, (_, i) => ({ id: pad(89+i), num: 89+i, stage: "round_of_16" })),
    ...Array.from({ length: 4  }, (_, i) => ({ id: pad(97+i), num: 97+i, stage: "quarterfinal" })),
    ...Array.from({ length: 2  }, (_, i) => ({ id: pad(101+i), num: 101+i, stage: "semifinal" })),
    { id: "m103", num: 103, stage: "third_place" },
    { id: "m104", num: 104, stage: "final" },
  ];
  const knockoutRows = knockoutStages.map(
    (m) => `('${m.id}', ${m.num}, '${m.stage}', NULL, NULL, NULL, 'Por definir', 'Por definir', '2026-07-01T00:00:00Z')`
  );
  sqlite.exec(`INSERT INTO matches (id, match_number, stage, group_letter, home_team_code, away_team_code, home_team_label, away_team_label, kickoff_at) VALUES ${knockoutRows.join(",")};`);

  return { app: createApp(db), sqlite, db };
}

async function makeGroupWithMember(app: ReturnType<typeof makeApp>["app"]) {
  const owner = await registerUser(app);
  const res = await authedRequest(app, "/api/groups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Mi Grupo" }),
    session: owner,
  });
  const group = await res.json();
  return { owner, group };
}

describe("GET /api/groups/:id/bracket", () => {
  it("returns 401 without auth", async () => {
    const { app } = makeApp();
    const { group } = await makeGroupWithMember(app);
    const res = await app.request(`/api/groups/${group.id}/bracket`);
    expect(res.status).toBe(401);
  });

  it("returns 403 for a non-member", async () => {
    const { app } = makeApp();
    const { group } = await makeGroupWithMember(app);
    const stranger = await registerUser(app, { email: "stranger@example.com" });
    const res = await authedRequest(app, `/api/groups/${group.id}/bracket`, { session: stranger });
    expect(res.status).toBe(403);
  });

  it("returns 200 with all 6 stage arrays", async () => {
    const { app } = makeApp();
    const { owner, group } = await makeGroupWithMember(app);
    const res = await authedRequest(app, `/api/groups/${group.id}/bracket`, { session: owner });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.round_of_32).toHaveLength(16);
    expect(body.round_of_16).toHaveLength(8);
    expect(body.quarterfinal).toHaveLength(4);
    expect(body.semifinal).toHaveLength(2);
    expect(body.third_place).toHaveLength(1);
    expect(body.final).toHaveLength(1);
  });

  it("homeTeamCode is null for R32 when no group stage predictions or results exist", async () => {
    const { app } = makeApp();
    const { owner, group } = await makeGroupWithMember(app);
    const res = await authedRequest(app, `/api/groups/${group.id}/bracket`, { session: owner });
    const body = await res.json();
    // No predictions or results → all slots should be null
    for (const match of body.round_of_32) {
      expect(match.homeTeamCode).toBeNull();
      expect(match.awayTeamCode).toBeNull();
    }
  });

  it("resolves R32 slots after group stage predictions are set", async () => {
    const { app } = makeApp();
    const { owner, group } = await makeGroupWithMember(app);

    // Predict all group stage matches so standings can be computed
    const groups = ["A","B","C","D","E","F","G","H","I","J","K","L"];
    for (const g of groups) {
      await authedRequest(app, `/api/groups/${group.id}/predictions/mg${g}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeGoals: 2, awayGoals: 0 }), // home team wins each group
        session: owner,
      });
    }

    const res = await authedRequest(app, `/api/groups/${group.id}/bracket`, { session: owner });
    const body = await res.json();
    // m079: winner of Group A (home = T1)
    const m079 = body.round_of_32.find((m: { matchId: string }) => m.matchId === "m079");
    expect(m079).toBeDefined();
    expect(m079.homeTeamCode).toBe("T1");
  });

  it("includes predictedHomeGoals when user has prediction for knockout match", async () => {
    const { app } = makeApp();
    const { owner, group } = await makeGroupWithMember(app);

    // Predict a knockout match directly (no group stage needed for this test)
    await authedRequest(app, `/api/groups/${group.id}/predictions/m073`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeGoals: 3, awayGoals: 1 }),
      session: owner,
    });

    const res = await authedRequest(app, `/api/groups/${group.id}/bracket`, { session: owner });
    const body = await res.json();
    const m073 = body.round_of_32.find((m: { matchId: string }) => m.matchId === "m073");
    expect(m073.predictedHomeGoals).toBe(3);
    expect(m073.predictedAwayGoals).toBe(1);
  });

  it("pointsEarned is null when no official result exists", async () => {
    const { app } = makeApp();
    const { owner, group } = await makeGroupWithMember(app);
    const res = await authedRequest(app, `/api/groups/${group.id}/bracket`, { session: owner });
    const body = await res.json();
    for (const match of body.round_of_32) {
      expect(match.pointsEarned).toBeNull();
    }
  });

  it("pointsEarned is computed when official result exists and user predicted", async () => {
    const { app, sqlite } = makeApp();
    const { owner, group } = await makeGroupWithMember(app);

    // Set official result for m073
    sqlite.exec(`UPDATE matches SET home_goals = 2, away_goals = 1 WHERE id = 'm073';`);

    // User predicts exact score
    await authedRequest(app, `/api/groups/${group.id}/predictions/m073`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeGoals: 2, awayGoals: 1 }),
      session: owner,
    });

    const res = await authedRequest(app, `/api/groups/${group.id}/bracket`, { session: owner });
    const body = await res.json();
    const m073 = body.round_of_32.find((m: { matchId: string }) => m.matchId === "m073");
    // Correct result (1pt) + correct home (1pt) + correct away (1pt) + correct total (1pt) = 4
    expect(m073.pointsEarned).toBe(4);
  });
});
