import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { setCookie, deleteCookie } from "hono/cookie";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { DrizzleDB } from "../db/types.js";
import { users } from "../db/schema.js";
import {
  hashPassword,
  verifyPassword,
  validatePassword,
  generateTempPassword,
} from "../lib/password.js";
import { signToken } from "../lib/token.js";
import { requireAuth, type AuthEnv } from "../middleware/auth.js";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "Strict" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: 15 * 60,
};

const registerSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(50),
  password: z.string(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50),
});

function findUserByEmail(db: DrizzleDB, email: string) {
  return db.select().from(users).where(eq(users.email, email)).get();
}

function findUserById(db: DrizzleDB, id: string) {
  return db.select().from(users).where(eq(users.id, id)).get();
}

export function createAuthRoutes(db: DrizzleDB) {
  return new Hono<AuthEnv>()
    .post("/register", zValidator("json", registerSchema), async (c) => {
      const { email, displayName, password } = c.req.valid("json");

      const err = validatePassword(password);
      if (err) return c.json({ error: err }, 400);

      const existing = findUserByEmail(db, email.toLowerCase());
      if (existing) return c.json({ error: "El correo ya está registrado" }, 409);

      const id = nanoid(10);
      const passwordHash = await hashPassword(password);
      db.insert(users).values({ id, email: email.toLowerCase(), displayName, passwordHash }).run();

      const token = await signToken({ sub: id, email: email.toLowerCase() });
      setCookie(c, "token", token, COOKIE_OPTS);
      return c.json({ id, email: email.toLowerCase(), displayName }, 201);
    })

    .post("/login", zValidator("json", loginSchema), async (c) => {
      const { email, password } = c.req.valid("json");

      const user = findUserByEmail(db, email.toLowerCase());
      if (!user) return c.json({ error: "Credenciales inválidas" }, 401);

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) return c.json({ error: "Credenciales inválidas" }, 401);

      const token = await signToken({ sub: user.id, email: user.email });
      setCookie(c, "token", token, COOKIE_OPTS);
      return c.json({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        forcePasswordChange: user.forcePasswordChange === 1,
      });
    })

    .post("/logout", (c) => {
      deleteCookie(c, "token", { path: "/" });
      return c.json({ ok: true });
    })

    .get("/me", requireAuth, (c) => {
      const userId = c.get("userId");
      const user = findUserById(db, userId);
      if (!user) return c.json({ error: "Usuario no encontrado" }, 404);
      return c.json({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        forcePasswordChange: user.forcePasswordChange === 1,
      });
    })

    .post("/forgot-password", zValidator("json", forgotPasswordSchema), async (c) => {
      const { email } = c.req.valid("json");
      const user = findUserByEmail(db, email.toLowerCase());
      if (!user) return c.json({ ok: true }); // no leak — no tempPassword in response

      const tempPassword = generateTempPassword();
      const passwordHash = await hashPassword(tempPassword);
      db.update(users)
        .set({ passwordHash, forcePasswordChange: 1 })
        .where(eq(users.id, user.id))
        .run();

      return c.json({ ok: true, tempPassword });
    })

    .post("/change-password", requireAuth, zValidator("json", changePasswordSchema), async (c) => {
      const userId = c.get("userId");
      const { currentPassword, newPassword } = c.req.valid("json");

      const user = findUserById(db, userId);
      if (!user) return c.json({ error: "Usuario no encontrado" }, 404);

      const valid = await verifyPassword(currentPassword, user.passwordHash);
      if (!valid) return c.json({ error: "Contraseña actual incorrecta" }, 400);

      const err = validatePassword(newPassword);
      if (err) return c.json({ error: err }, 400);

      const passwordHash = await hashPassword(newPassword);
      db.update(users)
        .set({ passwordHash, forcePasswordChange: 0 })
        .where(eq(users.id, userId))
        .run();

      return c.json({ ok: true });
    })

    .patch("/me", requireAuth, zValidator("json", updateProfileSchema), async (c) => {
      const userId = c.get("userId");
      const { displayName } = c.req.valid("json");

      const user = findUserById(db, userId);
      if (!user) return c.json({ error: "Usuario no encontrado" }, 404);

      db.update(users).set({ displayName }).where(eq(users.id, userId)).run();

      const token = await signToken({ sub: userId, email: user.email });
      setCookie(c, "token", token, COOKIE_OPTS);

      return c.json({
        id: userId,
        email: user.email,
        displayName,
        forcePasswordChange: user.forcePasswordChange === 1,
      });
    });
}
