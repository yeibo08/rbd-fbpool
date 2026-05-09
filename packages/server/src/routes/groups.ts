import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, and, inArray, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { DrizzleDB } from "../db/types.js";
import { groups, groupMembers, scoringRules, users } from "../db/schema.js";
import { requireAuth, type AuthEnv } from "../middleware/auth.js";
import { requireMember } from "../db/helpers.js";

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
});

const updateRulesSchema = z.object({
  ptsCorrectResult: z.number().int().min(0),
  ptsCorrectHome: z.number().int().min(0),
  ptsCorrectAway: z.number().int().min(0),
  ptsCorrectTotal: z.number().int().min(0),
});

const updateRoleSchema = z.object({
  role: z.enum(["manager", "member"]),
});

function getGroup(db: DrizzleDB, groupId: string) {
  return db.select().from(groups).where(eq(groups.id, groupId)).get();
}


function listGroupMembers(db: DrizzleDB, groupId: string) {
  return db
    .select({
      groupId: groupMembers.groupId,
      userId: groupMembers.userId,
      role: groupMembers.role,
      joinedAt: groupMembers.joinedAt,
      displayName: users.displayName,
    })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, groupId))
    .all();
}

export function createGroupRoutes(db: DrizzleDB) {
  return new Hono<AuthEnv>()
    .use("*", requireAuth)

    .post("/", zValidator("json", createGroupSchema), (c) => {
      const userId = c.get("userId");
      const { name } = c.req.valid("json");

      const id = nanoid(8);
      const inviteToken = nanoid(16);

      db.insert(groups).values({ id, name, ownerId: userId, inviteToken }).run();
      db.insert(groupMembers).values({ groupId: id, userId, role: "owner" }).run();
      db.insert(scoringRules).values({ groupId: id }).run();

      const members = listGroupMembers(db, id);

      return c.json({ id, name, inviteToken, members }, 201);
    })

    .get("/", (c) => {
      const userId = c.get("userId");

      const memberships = db
        .select({ groupId: groupMembers.groupId })
        .from(groupMembers)
        .where(eq(groupMembers.userId, userId))
        .all();

      if (memberships.length === 0) return c.json([]);

      const groupIds = memberships.map((m) => m.groupId);
      const userGroups = db
        .select()
        .from(groups)
        .where(inArray(groups.id, groupIds))
        .all();

      return c.json(userGroups);
    })

    .post("/join/:token", (c) => {
      const userId = c.get("userId");
      const { token } = c.req.param();

      const group = db.select().from(groups).where(eq(groups.inviteToken, token)).get();
      if (!group) return c.json({ error: "Token inválido" }, 404);

      const existing = requireMember(db, group.id, userId);
      if (existing) return c.json({ error: "Ya eres miembro de este grupo" }, 409);

      const row = db
        .select({ count: sql<number>`count(*)` })
        .from(groupMembers)
        .where(eq(groupMembers.groupId, group.id))
        .get();
      if ((row?.count ?? 0) >= 20) return c.json({ error: "El grupo está lleno (máximo 20)" }, 409);

      db.insert(groupMembers).values({ groupId: group.id, userId, role: "member" }).run();

      return c.json({ ok: true, groupId: group.id });
    })

    .get("/:id", (c) => {
      const userId = c.get("userId");
      const { id } = c.req.param();

      const group = getGroup(db, id);
      if (!group) return c.json({ error: "Grupo no encontrado" }, 404);

      const member = requireMember(db, id, userId);
      if (!member) return c.json({ error: "No tienes acceso a este grupo" }, 403);

      const members = listGroupMembers(db, id);

      return c.json({ ...group, members });
    })

    .delete("/:id", (c) => {
      const userId = c.get("userId");
      const { id } = c.req.param();

      const group = getGroup(db, id);
      if (!group) return c.json({ error: "Grupo no encontrado" }, 404);

      const member = requireMember(db, id, userId);
      if (!member || member.role !== "owner") {
        return c.json({ error: "Solo el propietario puede eliminar el grupo" }, 403);
      }

      db.delete(groups).where(eq(groups.id, id)).run();

      return c.json({ ok: true });
    })

    .post("/:id/invite/reset", (c) => {
      const userId = c.get("userId");
      const { id } = c.req.param();

      const group = getGroup(db, id);
      if (!group) return c.json({ error: "Grupo no encontrado" }, 404);

      const member = requireMember(db, id, userId);
      if (!member || (member.role !== "owner" && member.role !== "manager")) {
        return c.json({ error: "Solo propietarios y gestores pueden regenerar el enlace" }, 403);
      }

      const inviteToken = nanoid(16);
      db.update(groups).set({ inviteToken }).where(eq(groups.id, id)).run();

      return c.json({ inviteToken });
    })

    .patch("/:id/members/:userId", zValidator("json", updateRoleSchema), (c) => {
      const requesterId = c.get("userId");
      const { id, userId: targetUserId } = c.req.param();
      const { role } = c.req.valid("json");

      const group = getGroup(db, id);
      if (!group) return c.json({ error: "Grupo no encontrado" }, 404);

      const requester = requireMember(db, id, requesterId);
      if (!requester || requester.role !== "owner") {
        return c.json({ error: "Solo el propietario puede cambiar roles" }, 403);
      }

      db.update(groupMembers)
        .set({ role })
        .where(and(eq(groupMembers.groupId, id), eq(groupMembers.userId, targetUserId)))
        .run();

      return c.json({ ok: true });
    })

    .delete("/:id/members/:userId", (c) => {
      const requesterId = c.get("userId");
      const { id, userId: targetUserId } = c.req.param();

      const group = getGroup(db, id);
      if (!group) return c.json({ error: "Grupo no encontrado" }, 404);

      const requester = requireMember(db, id, requesterId);
      if (!requester || (requester.role !== "owner" && requester.role !== "manager")) {
        return c.json({ error: "Sin permisos para eliminar miembros" }, 403);
      }

      db.delete(groupMembers)
        .where(and(eq(groupMembers.groupId, id), eq(groupMembers.userId, targetUserId)))
        .run();

      return c.json({ ok: true });
    })

    .get("/:id/rules", (c) => {
      const userId = c.get("userId");
      const { id } = c.req.param();

      const group = getGroup(db, id);
      if (!group) return c.json({ error: "Grupo no encontrado" }, 404);

      const member = requireMember(db, id, userId);
      if (!member) return c.json({ error: "No tienes acceso a este grupo" }, 403);

      const rules = db.select().from(scoringRules).where(eq(scoringRules.groupId, id)).get();
      if (!rules) return c.json({ error: "Reglas no encontradas" }, 404);

      return c.json({
        ptsCorrectResult: rules.ptsCorrectResult,
        ptsCorrectHome: rules.ptsCorrectHome,
        ptsCorrectAway: rules.ptsCorrectAway,
        ptsCorrectTotal: rules.ptsCorrectTotal,
      });
    })

    .put("/:id/rules", zValidator("json", updateRulesSchema), (c) => {
      const userId = c.get("userId");
      const { id } = c.req.param();
      const body = c.req.valid("json");

      const group = getGroup(db, id);
      if (!group) return c.json({ error: "Grupo no encontrado" }, 404);

      const member = requireMember(db, id, userId);
      if (!member || (member.role !== "owner" && member.role !== "manager")) {
        return c.json({ error: "Solo propietarios y gestores pueden actualizar las reglas" }, 403);
      }

      db.update(scoringRules)
        .set({
          ptsCorrectResult: body.ptsCorrectResult,
          ptsCorrectHome: body.ptsCorrectHome,
          ptsCorrectAway: body.ptsCorrectAway,
          ptsCorrectTotal: body.ptsCorrectTotal,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(scoringRules.groupId, id))
        .run();

      return c.json({ ok: true });
    });
}
