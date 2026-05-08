import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { verifyToken } from "../lib/token.js";

export type AuthEnv = {
  Variables: {
    userId: string;
    userEmail: string;
  };
};

export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const token = getCookie(c, "token");
  if (!token) {
    return c.json({ error: "No autorizado" }, 401);
  }
  try {
    const payload = await verifyToken(token);
    c.set("userId", payload.sub);
    c.set("userEmail", payload.email);
    await next();
  } catch {
    return c.json({ error: "Sesión expirada" }, 401);
  }
});
