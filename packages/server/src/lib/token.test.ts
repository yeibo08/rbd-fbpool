import { describe, it, expect } from "vitest";
import { signToken, verifyToken } from "./token.js";

const PAYLOAD = { sub: "user123", email: "test@example.com" };

describe("signToken / verifyToken", () => {
  it("verifies a freshly signed token", async () => {
    const token = await signToken(PAYLOAD);
    const result = await verifyToken(token);
    expect(result.sub).toBe(PAYLOAD.sub);
    expect(result.email).toBe(PAYLOAD.email);
  });

  it("rejects a tampered token", async () => {
    const token = await signToken(PAYLOAD);
    const tampered = token.slice(0, -5) + "XXXXX";
    await expect(verifyToken(tampered)).rejects.toThrow();
  });

  it("rejects a completely invalid string", async () => {
    await expect(verifyToken("not-a-jwt")).rejects.toThrow();
  });
});
