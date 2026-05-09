import { describe, it, expect } from "vitest";
import { createTestDb } from "../test-utils/db.js";
import { createApp } from "../app.js";
import { registerUser, authedRequest } from "../test-utils/helpers.js";

function makeApp() {
  const { db, sqlite } = createTestDb();
  return { app: createApp(db), db, sqlite };
}

// ── POST /api/groups ──────────────────────────────────────────────────────

describe("POST /api/groups", () => {
  it("creates a group and returns it with the creator as owner", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app);

    const res = await authedRequest(app, "/api/groups", {
      session: owner,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Los Compadres" }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe("Los Compadres");
    expect(body.id).toBeTruthy();
    expect(body.inviteToken).toBeTruthy();
    expect(body.members).toHaveLength(1);
    expect(body.members[0].role).toBe("owner");
    expect(body.members[0].userId).toBe(owner.userId);
  });

  it("creates default scoring rules for the new group", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app);

    const createRes = await authedRequest(app, "/api/groups", {
      session: owner,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Group" }),
    });
    const { id } = await createRes.json();

    const rulesRes = await authedRequest(app, `/api/groups/${id}/rules`, {
      session: owner,
    });
    expect(rulesRes.status).toBe(200);
    const rules = await rulesRes.json();
    expect(rules.ptsCorrectResult).toBe(1);
    expect(rules.ptsCorrectHome).toBe(1);
    expect(rules.ptsCorrectAway).toBe(1);
    expect(rules.ptsCorrectTotal).toBe(1);
  });

  it("returns 401 when not authenticated", async () => {
    const { app } = makeApp();
    const res = await app.request("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 400 for missing name", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app);
    const res = await authedRequest(app, "/api/groups", {
      session: owner,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });
});

// ── GET /api/groups ───────────────────────────────────────────────────────

describe("GET /api/groups", () => {
  it("returns only groups the user belongs to", async () => {
    const { app } = makeApp();
    const alice = await registerUser(app, { email: "alice@test.com" });
    const bob = await registerUser(app, { email: "bob@test.com" });

    await authedRequest(app, "/api/groups", {
      session: alice,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Alice's Group" }),
    });
    await authedRequest(app, "/api/groups", {
      session: bob,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Bob's Group" }),
    });

    const res = await authedRequest(app, "/api/groups", { session: alice });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe("Alice's Group");
  });

  it("returns 401 when not authenticated", async () => {
    const { app } = makeApp();
    expect((await app.request("/api/groups")).status).toBe(401);
  });
});

// ── GET /api/groups/:id ───────────────────────────────────────────────────

describe("GET /api/groups/:id", () => {
  it("returns group detail with members for a member", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app);
    const createRes = await authedRequest(app, "/api/groups", {
      session: owner,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Group" }),
    });
    const { id } = await createRes.json();

    const res = await authedRequest(app, `/api/groups/${id}`, { session: owner });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(id);
    expect(body.members).toHaveLength(1);
    expect(body.members[0].userId).toBe(owner.userId);
    expect(body.members[0].displayName).toBe("Test User");
    expect(body.members[0].role).toBe("owner");
  });

  it("returns 403 for a non-member", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app, { email: "owner@test.com" });
    const stranger = await registerUser(app, { email: "stranger@test.com" });

    const createRes = await authedRequest(app, "/api/groups", {
      session: owner,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Private Group" }),
    });
    const { id } = await createRes.json();

    const res = await authedRequest(app, `/api/groups/${id}`, { session: stranger });
    expect(res.status).toBe(403);
  });

  it("returns 404 for a non-existent group", async () => {
    const { app } = makeApp();
    const user = await registerUser(app);
    const res = await authedRequest(app, "/api/groups/doesnotexist", { session: user });
    expect(res.status).toBe(404);
  });
});

// ── DELETE /api/groups/:id ────────────────────────────────────────────────

describe("DELETE /api/groups/:id", () => {
  it("allows the owner to delete the group", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app);
    const createRes = await authedRequest(app, "/api/groups", {
      session: owner,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Doomed Group" }),
    });
    const { id } = await createRes.json();

    const delRes = await authedRequest(app, `/api/groups/${id}`, {
      session: owner,
      method: "DELETE",
    });
    expect(delRes.status).toBe(200);

    const getRes = await authedRequest(app, `/api/groups/${id}`, { session: owner });
    expect(getRes.status).toBe(404);
  });

  it("cascades delete to group_members, scoring_rules, and predictions", async () => {
    const { app, sqlite } = makeApp();
    const owner = await registerUser(app, { email: "owner@test.com" });
    const member = await registerUser(app, { email: "member@test.com" });

    const createRes = await authedRequest(app, "/api/groups", {
      session: owner,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Cascade Group" }),
    });
    const { id: groupId, inviteToken } = await createRes.json();

    // Member joins and submits a prediction
    await authedRequest(app, `/api/groups/join/${inviteToken}`, { session: member, method: "POST" });
    sqlite.exec(`INSERT INTO matches (id, match_number, stage, home_team_label, away_team_label, kickoff_at)
      VALUES ('mFuture', 99, 'group', 'A', 'B', '${new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()}')`);
    await authedRequest(app, `/api/groups/${groupId}/predictions/mFuture`, {
      session: member,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeGoals: 1, awayGoals: 0 }),
    });

    // Delete the group
    await authedRequest(app, `/api/groups/${groupId}`, { session: owner, method: "DELETE" });

    // All related rows should be gone
    const members = sqlite.prepare("SELECT * FROM group_members WHERE group_id = ?").all(groupId);
    const rules = sqlite.prepare("SELECT * FROM scoring_rules WHERE group_id = ?").all(groupId);
    const preds = sqlite.prepare("SELECT * FROM predictions WHERE group_id = ?").all(groupId);
    expect(members).toHaveLength(0);
    expect(rules).toHaveLength(0);
    expect(preds).toHaveLength(0);
  });

  it("returns 403 for a non-owner member", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app, { email: "owner@test.com" });
    const member = await registerUser(app, { email: "member@test.com" });

    const createRes = await authedRequest(app, "/api/groups", {
      session: owner,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Group" }),
    });
    const group = await createRes.json();

    // member joins via invite
    await authedRequest(app, `/api/groups/join/${group.inviteToken}`, {
      session: member,
      method: "POST",
    });

    const res = await authedRequest(app, `/api/groups/${group.id}`, {
      session: member,
      method: "DELETE",
    });
    expect(res.status).toBe(403);
  });
});

// ── POST /api/groups/join/:token ──────────────────────────────────────────

describe("POST /api/groups/join/:token", () => {
  it("lets a user join via invite token and become a member", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app, { email: "owner@test.com" });
    const joiner = await registerUser(app, { email: "joiner@test.com" });

    const createRes = await authedRequest(app, "/api/groups", {
      session: owner,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Open Group" }),
    });
    const { id, inviteToken } = await createRes.json();

    const joinRes = await authedRequest(app, `/api/groups/join/${inviteToken}`, {
      session: joiner,
      method: "POST",
    });
    expect(joinRes.status).toBe(200);

    const groupRes = await authedRequest(app, `/api/groups/${id}`, { session: joiner });
    const group = await groupRes.json();
    expect(group.members).toHaveLength(2);
    const joinerMember = group.members.find((m: { userId: string }) => m.userId === joiner.userId);
    expect(joinerMember?.role).toBe("member");
  });

  it("returns 409 if the user is already a member", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app, { email: "owner@test.com" });
    const joiner = await registerUser(app, { email: "joiner@test.com" });

    const createRes = await authedRequest(app, "/api/groups", {
      session: owner,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Group" }),
    });
    const { inviteToken } = await createRes.json();

    await authedRequest(app, `/api/groups/join/${inviteToken}`, { session: joiner, method: "POST" });
    const res = await authedRequest(app, `/api/groups/join/${inviteToken}`, { session: joiner, method: "POST" });
    expect(res.status).toBe(409);
  });

  it("returns 404 for an invalid token", async () => {
    const { app } = makeApp();
    const user = await registerUser(app);
    const res = await authedRequest(app, "/api/groups/join/invalid-token-xyz", {
      session: user,
      method: "POST",
    });
    expect(res.status).toBe(404);
  });

  it("returns 409 when the group is full (max 20)", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app, { email: "owner@test.com" });
    const createRes = await authedRequest(app, "/api/groups", {
      session: owner,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Full Group" }),
    });
    const { inviteToken } = await createRes.json();

    // Register and join 19 more users (owner is 1, so total = 20)
    for (let i = 0; i < 19; i++) {
      const u = await registerUser(app, { email: `user${i}@test.com` });
      await authedRequest(app, `/api/groups/join/${inviteToken}`, { session: u, method: "POST" });
    }

    // 21st user should be rejected
    const extra = await registerUser(app, { email: "extra@test.com" });
    const res = await authedRequest(app, `/api/groups/join/${inviteToken}`, {
      session: extra,
      method: "POST",
    });
    expect(res.status).toBe(409);
  });
});

// ── POST /api/groups/:id/invite/reset ────────────────────────────────────

describe("POST /api/groups/:id/invite/reset", () => {
  it("generates a new invite token (owner can do it)", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app);
    const createRes = await authedRequest(app, "/api/groups", {
      session: owner,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Group" }),
    });
    const { id, inviteToken: oldToken } = await createRes.json();

    const res = await authedRequest(app, `/api/groups/${id}/invite/reset`, {
      session: owner,
      method: "POST",
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.inviteToken).not.toBe(oldToken);
  });

  it("returns 403 for a common member", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app, { email: "owner@test.com" });
    const member = await registerUser(app, { email: "member@test.com" });

    const createRes = await authedRequest(app, "/api/groups", {
      session: owner,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Group" }),
    });
    const { id, inviteToken } = await createRes.json();
    await authedRequest(app, `/api/groups/join/${inviteToken}`, { session: member, method: "POST" });

    const res = await authedRequest(app, `/api/groups/${id}/invite/reset`, {
      session: member,
      method: "POST",
    });
    expect(res.status).toBe(403);
  });
});

// ── PATCH /api/groups/:id/members/:userId ────────────────────────────────

describe("PATCH /api/groups/:id/members/:userId (role change)", () => {
  it("owner can promote a member to manager", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app, { email: "owner@test.com" });
    const member = await registerUser(app, { email: "member@test.com" });

    const createRes = await authedRequest(app, "/api/groups", {
      session: owner,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Group" }),
    });
    const { id, inviteToken } = await createRes.json();
    await authedRequest(app, `/api/groups/join/${inviteToken}`, { session: member, method: "POST" });

    const res = await authedRequest(app, `/api/groups/${id}/members/${member.userId}`, {
      session: owner,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "manager" }),
    });
    expect(res.status).toBe(200);

    const groupRes = await authedRequest(app, `/api/groups/${id}`, { session: owner });
    const group = await groupRes.json();
    const m = group.members.find((x: { userId: string }) => x.userId === member.userId);
    expect(m.role).toBe("manager");
  });

  it("returns 403 for a non-owner", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app, { email: "owner@test.com" });
    const manager = await registerUser(app, { email: "manager@test.com" });
    const target = await registerUser(app, { email: "target@test.com" });

    const createRes = await authedRequest(app, "/api/groups", {
      session: owner,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Group" }),
    });
    const { id, inviteToken } = await createRes.json();
    await authedRequest(app, `/api/groups/join/${inviteToken}`, { session: manager, method: "POST" });
    await authedRequest(app, `/api/groups/join/${inviteToken}`, { session: target, method: "POST" });
    // promote manager
    await authedRequest(app, `/api/groups/${id}/members/${manager.userId}`, {
      session: owner,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "manager" }),
    });

    // manager tries to change target's role — should fail (only owner can)
    const res = await authedRequest(app, `/api/groups/${id}/members/${target.userId}`, {
      session: manager,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "manager" }),
    });
    expect(res.status).toBe(403);
  });
});

// ── DELETE /api/groups/:id/members/:userId ───────────────────────────────

describe("DELETE /api/groups/:id/members/:userId", () => {
  it("owner can remove a member", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app, { email: "owner@test.com" });
    const member = await registerUser(app, { email: "member@test.com" });

    const createRes = await authedRequest(app, "/api/groups", {
      session: owner,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Group" }),
    });
    const { id, inviteToken } = await createRes.json();
    await authedRequest(app, `/api/groups/join/${inviteToken}`, { session: member, method: "POST" });

    const res = await authedRequest(app, `/api/groups/${id}/members/${member.userId}`, {
      session: owner,
      method: "DELETE",
    });
    expect(res.status).toBe(200);

    const groupRes = await authedRequest(app, `/api/groups/${id}`, { session: owner });
    const group = await groupRes.json();
    expect(group.members).toHaveLength(1);
  });

  it("returns 403 for a common member trying to remove someone", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app, { email: "owner@test.com" });
    const member = await registerUser(app, { email: "member@test.com" });
    const other = await registerUser(app, { email: "other@test.com" });

    const createRes = await authedRequest(app, "/api/groups", {
      session: owner,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Group" }),
    });
    const { id, inviteToken } = await createRes.json();
    await authedRequest(app, `/api/groups/join/${inviteToken}`, { session: member, method: "POST" });
    await authedRequest(app, `/api/groups/join/${inviteToken}`, { session: other, method: "POST" });

    const res = await authedRequest(app, `/api/groups/${id}/members/${other.userId}`, {
      session: member,
      method: "DELETE",
    });
    expect(res.status).toBe(403);
  });
});

// ── PUT /api/groups/:id/rules ─────────────────────────────────────────────

describe("PUT /api/groups/:id/rules", () => {
  it("owner can update scoring rules", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app);
    const createRes = await authedRequest(app, "/api/groups", {
      session: owner,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Group" }),
    });
    const { id } = await createRes.json();

    const res = await authedRequest(app, `/api/groups/${id}/rules`, {
      session: owner,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ptsCorrectResult: 3,
        ptsCorrectHome: 2,
        ptsCorrectAway: 2,
        ptsCorrectTotal: 1,
      }),
    });
    expect(res.status).toBe(200);

    const rulesRes = await authedRequest(app, `/api/groups/${id}/rules`, { session: owner });
    const rules = await rulesRes.json();
    expect(rules.ptsCorrectResult).toBe(3);
    expect(rules.ptsCorrectHome).toBe(2);
  });

  it("manager can update scoring rules", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app, { email: "owner@test.com" });
    const manager = await registerUser(app, { email: "manager@test.com" });

    const createRes = await authedRequest(app, "/api/groups", {
      session: owner,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Group" }),
    });
    const { id, inviteToken } = await createRes.json();
    await authedRequest(app, `/api/groups/join/${inviteToken}`, { session: manager, method: "POST" });
    await authedRequest(app, `/api/groups/${id}/members/${manager.userId}`, {
      session: owner,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "manager" }),
    });

    const res = await authedRequest(app, `/api/groups/${id}/rules`, {
      session: manager,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ptsCorrectResult: 5, ptsCorrectHome: 3, ptsCorrectAway: 3, ptsCorrectTotal: 2 }),
    });
    expect(res.status).toBe(200);
  });

  it("returns 403 for a common member", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app, { email: "owner@test.com" });
    const member = await registerUser(app, { email: "member@test.com" });

    const createRes = await authedRequest(app, "/api/groups", {
      session: owner,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Group" }),
    });
    const { id, inviteToken } = await createRes.json();
    await authedRequest(app, `/api/groups/join/${inviteToken}`, { session: member, method: "POST" });

    const res = await authedRequest(app, `/api/groups/${id}/rules`, {
      session: member,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ptsCorrectResult: 5, ptsCorrectHome: 3, ptsCorrectAway: 3, ptsCorrectTotal: 2 }),
    });
    expect(res.status).toBe(403);
  });
});

// ── PATCH /api/groups/:id (rename) ───────────────────────────────────────

async function createGroup(app: ReturnType<typeof makeApp>["app"], session: import("../test-utils/helpers.js").AuthSession, name = "Original Name") {
  const res = await authedRequest(app, "/api/groups", {
    session,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json() as Promise<{ id: string; name: string }>;
}

describe("PATCH /api/groups/:id", () => {
  it("owner can rename the group and response reflects new name", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app);
    const { id } = await createGroup(app, owner);

    const res = await authedRequest(app, `/api/groups/${id}`, {
      session: owner,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Nuevo Nombre" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Nuevo Nombre");
  });

  it("manager can rename the group", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app, { email: "owner@test.com" });
    const manager = await registerUser(app, { email: "manager@test.com" });
    const { id, inviteToken } = await createGroup(app, owner) as { id: string; inviteToken: string; name: string };

    await authedRequest(app, `/api/groups/join/${inviteToken}`, { session: manager, method: "POST" });
    await authedRequest(app, `/api/groups/${id}/members/${manager.userId}`, {
      session: owner,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "manager" }),
    });

    const res = await authedRequest(app, `/api/groups/${id}`, {
      session: manager,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Renombrado por Gestor" }),
    });

    expect(res.status).toBe(200);
    expect((await res.json()).name).toBe("Renombrado por Gestor");
  });

  it("member cannot rename the group (403)", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app, { email: "owner@test.com" });
    const member = await registerUser(app, { email: "member@test.com" });
    const { id, inviteToken } = await createGroup(app, owner) as { id: string; inviteToken: string; name: string };

    await authedRequest(app, `/api/groups/join/${inviteToken}`, { session: member, method: "POST" });

    const res = await authedRequest(app, `/api/groups/${id}`, {
      session: member,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Intento Fallido" }),
    });

    expect(res.status).toBe(403);
  });

  it("returns 404 for unknown group id", async () => {
    const { app } = makeApp();
    const user = await registerUser(app);

    const res = await authedRequest(app, "/api/groups/nonexistent", {
      session: user,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ghost Group" }),
    });

    expect(res.status).toBe(404);
  });

  it("returns 401 when not authenticated", async () => {
    const { app } = makeApp();
    const res = await app.request("/api/groups/any-id", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "No Auth" }),
    });
    expect(res.status).toBe(401);
  });

  it("persists the new name — GET after rename returns updated name", async () => {
    const { app } = makeApp();
    const owner = await registerUser(app);
    const { id } = await createGroup(app, owner);

    await authedRequest(app, `/api/groups/${id}`, {
      session: owner,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Nombre Persistido" }),
    });

    const getRes = await authedRequest(app, `/api/groups/${id}`, { session: owner });
    expect((await getRes.json()).name).toBe("Nombre Persistido");
  });
});
