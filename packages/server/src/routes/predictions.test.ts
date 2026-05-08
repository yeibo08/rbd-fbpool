import { describe, it, expect } from "vitest";
import { createTestDb } from "../test-utils/db.js";
import { createApp } from "../app.js";
import { registerUser, authedRequest } from "../test-utils/helpers.js";

const FUTURE = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
const PAST = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

function makeApp() {
  const { db, sqlite } = createTestDb();
  sqlite.exec(`
    INSERT INTO matches (id, match_number, stage, home_team_label, away_team_label, kickoff_at)
    VALUES
      ('mFuture', 1, 'group', 'México',  'Argentina', '${FUTURE}'),
      ('mPast',   2, 'group', 'Brasil',  'Francia',   '${PAST}');
  `);
  return { app: createApp(db), db, sqlite };
}

async function makeGroup(app: ReturnType<typeof makeApp>["app"], owner: { userId: string; cookie: string }) {
  const res = await authedRequest(app, "/api/groups", {
    session: owner,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Test Group" }),
  });
  return res.json() as Promise<{ id: string; inviteToken: string }>;
}

// ── PUT /api/groups/:groupId/predictions/:matchId ─────────────────────────

describe("PUT /api/groups/:groupId/predictions/:matchId", () => {
  it("creates a prediction for a future match", async () => {
    const { app } = makeApp();
    const user = await registerUser(app);
    const { id: groupId } = await makeGroup(app, user);

    const res = await authedRequest(app, `/api/groups/${groupId}/predictions/mFuture`, {
      session: user,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeGoals: 2, awayGoals: 1 }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.homeGoals).toBe(2);
    expect(body.awayGoals).toBe(1);
    expect(body.matchId).toBe("mFuture");
  });

  it("updates an existing prediction (upsert)", async () => {
    const { app } = makeApp();
    const user = await registerUser(app);
    const { id: groupId } = await makeGroup(app, user);

    await authedRequest(app, `/api/groups/${groupId}/predictions/mFuture`, {
      session: user, method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeGoals: 1, awayGoals: 0 }),
    });
    const res = await authedRequest(app, `/api/groups/${groupId}/predictions/mFuture`, {
      session: user, method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeGoals: 3, awayGoals: 2 }),
    });
    expect(res.status).toBe(200);
    expect((await res.json()).homeGoals).toBe(3);
  });

  it("returns 403 when the deadline has passed", async () => {
    const { app } = makeApp();
    const user = await registerUser(app);
    const { id: groupId } = await makeGroup(app, user);

    const res = await authedRequest(app, `/api/groups/${groupId}/predictions/mPast`, {
      session: user, method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeGoals: 1, awayGoals: 1 }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 401 when not authenticated", async () => {
    const { app } = makeApp();
    const user = await registerUser(app);
    const { id: groupId } = await makeGroup(app, user);

    const res = await app.request(`/api/groups/${groupId}/predictions/mFuture`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeGoals: 1, awayGoals: 0 }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 403 for a user not in the group", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app, { email: "owner@test.com" });
    const stranger = await registerUser(app, { email: "stranger@test.com" });
    const { id: groupId } = await makeGroup(app, owner);

    const res = await authedRequest(app, `/api/groups/${groupId}/predictions/mFuture`, {
      session: stranger, method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeGoals: 1, awayGoals: 0 }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 400 for negative goal values", async () => {
    const { app } = makeApp();
    const user = await registerUser(app);
    const { id: groupId } = await makeGroup(app, user);

    const res = await authedRequest(app, `/api/groups/${groupId}/predictions/mFuture`, {
      session: user, method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeGoals: -1, awayGoals: 0 }),
    });
    expect(res.status).toBe(400);
  });
});

// ── GET /api/groups/:groupId/predictions ─────────────────────────────────

describe("GET /api/groups/:groupId/predictions", () => {
  it("returns the user's own predictions for the group", async () => {
    const { app } = makeApp();
    const user = await registerUser(app);
    const { id: groupId } = await makeGroup(app, user);

    await authedRequest(app, `/api/groups/${groupId}/predictions/mFuture`, {
      session: user, method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeGoals: 2, awayGoals: 0 }),
    });

    const res = await authedRequest(app, `/api/groups/${groupId}/predictions`, { session: user });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].matchId).toBe("mFuture");
    expect(body[0].homeGoals).toBe(2);
  });

  it("does not return other users' predictions", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app, { email: "owner@test.com" });
    const member = await registerUser(app, { email: "member@test.com" });
    const { id: groupId, inviteToken } = await makeGroup(app, owner);
    await authedRequest(app, `/api/groups/join/${inviteToken}`, { session: member, method: "POST" });

    await authedRequest(app, `/api/groups/${groupId}/predictions/mFuture`, {
      session: owner, method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeGoals: 1, awayGoals: 0 }),
    });

    const res = await authedRequest(app, `/api/groups/${groupId}/predictions`, { session: member });
    expect((await res.json())).toHaveLength(0);
  });

  it("returns 403 for a non-member", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app, { email: "owner@test.com" });
    const stranger = await registerUser(app, { email: "stranger@test.com" });
    const { id: groupId } = await makeGroup(app, owner);

    const res = await authedRequest(app, `/api/groups/${groupId}/predictions`, { session: stranger });
    expect(res.status).toBe(403);
  });
});

// ── GET /api/groups/:groupId/predictions/results ──────────────────────────

describe("GET /api/groups/:groupId/predictions/results", () => {
  it("returns completed matches with prediction and points (exact score = 4 pts)", async () => {
    const { app, sqlite } = makeApp();
    const user = await registerUser(app);
    const { id: groupId } = await makeGroup(app, user);

    sqlite.exec(`UPDATE matches SET home_goals = 2, away_goals = 1 WHERE id = 'mPast'`);
    sqlite.exec(`
      INSERT INTO predictions (id, user_id, group_id, match_id, home_goals, away_goals)
      VALUES ('p1', '${user.userId}', '${groupId}', 'mPast', 2, 1)
    `);

    const res = await authedRequest(app, `/api/groups/${groupId}/predictions/results`, { session: user });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].matchId).toBe("mPast");
    expect(body[0].prediction.homeGoals).toBe(2);
    expect(body[0].points).toBe(4); // result + home + away + total
  });

  it("returns 0 points for a fully wrong prediction", async () => {
    const { app, sqlite } = makeApp();
    const user = await registerUser(app);
    const { id: groupId } = await makeGroup(app, user);

    sqlite.exec(`UPDATE matches SET home_goals = 2, away_goals = 1 WHERE id = 'mPast'`);
    sqlite.exec(`
      INSERT INTO predictions (id, user_id, group_id, match_id, home_goals, away_goals)
      VALUES ('p1', '${user.userId}', '${groupId}', 'mPast', 0, 2)
    `);

    const res = await authedRequest(app, `/api/groups/${groupId}/predictions/results`, { session: user });
    expect((await res.json())[0].points).toBe(0);
  });

  it("returns null prediction and 0 points for matches the user did not predict", async () => {
    const { app, sqlite } = makeApp();
    const user = await registerUser(app);
    const { id: groupId } = await makeGroup(app, user);

    sqlite.exec(`UPDATE matches SET home_goals = 1, away_goals = 0 WHERE id = 'mPast'`);

    const res = await authedRequest(app, `/api/groups/${groupId}/predictions/results`, { session: user });
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].prediction).toBeNull();
    expect(body[0].points).toBe(0);
  });

  it("returns 403 for a non-member", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app, { email: "owner@test.com" });
    const stranger = await registerUser(app, { email: "stranger@test.com" });
    const { id: groupId } = await makeGroup(app, owner);

    const res = await authedRequest(app, `/api/groups/${groupId}/predictions/results`, { session: stranger });
    expect(res.status).toBe(403);
  });
});
