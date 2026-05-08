import { describe, it, expect } from "vitest";
import { createTestDb } from "../test-utils/db.js";
import { createApp } from "../app.js";
import { registerUser, authedRequest } from "../test-utils/helpers.js";

const PAST = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

function makeApp() {
  const { db, sqlite } = createTestDb();
  sqlite.exec(`
    INSERT INTO matches (id, match_number, stage, home_team_label, away_team_label, kickoff_at)
    VALUES ('mPast', 1, 'group', 'México', 'Argentina', '${PAST}');
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

describe("GET /api/groups/:groupId/leaderboard", () => {
  it("returns members ranked by total points descending", async () => {
    const { app, sqlite } = makeApp();
    const userA = await registerUser(app, { email: "a@test.com", displayName: "Alice" });
    const userB = await registerUser(app, { email: "b@test.com", displayName: "Bob" });
    const { id: groupId, inviteToken } = await makeGroup(app, userA);
    await authedRequest(app, `/api/groups/join/${inviteToken}`, { session: userB, method: "POST" });

    sqlite.exec(`UPDATE matches SET home_goals = 2, away_goals = 1 WHERE id = 'mPast'`);
    // Alice: exact score → 4 pts; Bob: correct result only → 1 pt
    sqlite.exec(`
      INSERT INTO predictions (id, user_id, group_id, match_id, home_goals, away_goals) VALUES
        ('pA', '${userA.userId}', '${groupId}', 'mPast', 2, 1),
        ('pB', '${userB.userId}', '${groupId}', 'mPast', 1, 0);
    `);

    const res = await authedRequest(app, `/api/groups/${groupId}/leaderboard`, { session: userA });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
    expect(body[0].displayName).toBe("Alice");
    expect(body[0].points).toBe(4);
    expect(body[0].rank).toBe(1);
    expect(body[1].displayName).toBe("Bob");
    expect(body[1].points).toBe(1);
    expect(body[1].rank).toBe(2);
  });

  it("assigns the same rank to tied members", async () => {
    const { app, sqlite } = makeApp();
    const userA = await registerUser(app, { email: "a@test.com", displayName: "Alice" });
    const userB = await registerUser(app, { email: "b@test.com", displayName: "Bob" });
    const { id: groupId, inviteToken } = await makeGroup(app, userA);
    await authedRequest(app, `/api/groups/join/${inviteToken}`, { session: userB, method: "POST" });

    sqlite.exec(`UPDATE matches SET home_goals = 2, away_goals = 1 WHERE id = 'mPast'`);
    // Both predict exact score → tie at 4 pts
    sqlite.exec(`
      INSERT INTO predictions (id, user_id, group_id, match_id, home_goals, away_goals) VALUES
        ('pA', '${userA.userId}', '${groupId}', 'mPast', 2, 1),
        ('pB', '${userB.userId}', '${groupId}', 'mPast', 2, 1);
    `);

    const res = await authedRequest(app, `/api/groups/${groupId}/leaderboard`, { session: userA });
    const body = await res.json();
    expect(body[0].rank).toBe(1);
    expect(body[1].rank).toBe(1);
  });

  it("gives 0 points to members with no predictions", async () => {
    const { app, sqlite } = makeApp();
    const userA = await registerUser(app, { email: "a@test.com", displayName: "Alice" });
    const userB = await registerUser(app, { email: "b@test.com", displayName: "Bob" });
    const { id: groupId, inviteToken } = await makeGroup(app, userA);
    await authedRequest(app, `/api/groups/join/${inviteToken}`, { session: userB, method: "POST" });

    sqlite.exec(`UPDATE matches SET home_goals = 1, away_goals = 0 WHERE id = 'mPast'`);
    // Only Alice predicts
    sqlite.exec(`
      INSERT INTO predictions (id, user_id, group_id, match_id, home_goals, away_goals) VALUES
        ('pA', '${userA.userId}', '${groupId}', 'mPast', 1, 0);
    `);

    const res = await authedRequest(app, `/api/groups/${groupId}/leaderboard`, { session: userA });
    const body = await res.json();
    const bob = body.find((m: { displayName: string }) => m.displayName === "Bob");
    expect(bob.points).toBe(0);
  });

  it("accumulates points across multiple completed matches", async () => {
    const { db, sqlite } = createTestDb();
    const PAST2 = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    sqlite.exec(`
      INSERT INTO matches (id, match_number, stage, home_team_label, away_team_label, kickoff_at) VALUES
        ('m1', 1, 'group', 'A', 'B', '${PAST}'),
        ('m2', 2, 'group', 'C', 'D', '${PAST2}');
    `);
    const app = createApp(db);
    const userA = await registerUser(app, { email: "a@test.com", displayName: "Alice" });
    const { id: groupId } = await makeGroup(app, userA);

    sqlite.exec(`UPDATE matches SET home_goals = 1, away_goals = 0 WHERE id = 'm1'`);
    sqlite.exec(`UPDATE matches SET home_goals = 2, away_goals = 2 WHERE id = 'm2'`);
    // Alice: m1 exact (4pts) + m2 exact (4pts) = 8pts
    sqlite.exec(`
      INSERT INTO predictions (id, user_id, group_id, match_id, home_goals, away_goals) VALUES
        ('p1', '${userA.userId}', '${groupId}', 'm1', 1, 0),
        ('p2', '${userA.userId}', '${groupId}', 'm2', 2, 2);
    `);

    const res = await authedRequest(app, `/api/groups/${groupId}/leaderboard`, { session: userA });
    const body = await res.json();
    expect(body[0].points).toBe(8);
  });

  it("returns 403 for a non-member", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app, { email: "owner@test.com" });
    const stranger = await registerUser(app, { email: "stranger@test.com" });
    const { id: groupId } = await makeGroup(app, owner);

    const res = await authedRequest(app, `/api/groups/${groupId}/leaderboard`, { session: stranger });
    expect(res.status).toBe(403);
  });
});
