import { describe, it, expect } from "vitest";
import {
  validatePassword,
  hashPassword,
  verifyPassword,
  generateTempPassword,
} from "./password.js";

const VALID_PW = "Secure#1";
const VALID_PW2 = "Hello$2world";

describe("validatePassword", () => {
  it("accepts a valid password", () => {
    expect(validatePassword(VALID_PW)).toBeNull();
    expect(validatePassword(VALID_PW2)).toBeNull();
  });

  it("rejects password shorter than 8 characters", () => {
    expect(validatePassword("Ab1!")).not.toBeNull();
  });

  it("rejects password without uppercase", () => {
    expect(validatePassword("secure#1")).not.toBeNull();
  });

  it("rejects password without a digit", () => {
    expect(validatePassword("SecureABC!")).not.toBeNull();
  });

  it("rejects password without a required symbol (!#$?)", () => {
    expect(validatePassword("SecureA1B")).not.toBeNull();
  });

  it("accepts each required symbol individually", () => {
    for (const sym of ["!", "#", "$", "?"]) {
      expect(validatePassword(`Abcdef1${sym}`)).toBeNull(); // 8 chars
    }
  });
});

describe("hashPassword / verifyPassword", () => {
  it("verifies correct password against hash", async () => {
    const hash = await hashPassword(VALID_PW);
    expect(await verifyPassword(VALID_PW, hash)).toBe(true);
  });

  it("rejects wrong password", async () => {
    const hash = await hashPassword(VALID_PW);
    expect(await verifyPassword("wrongpassword", hash)).toBe(false);
  });

  it("produces different hashes for the same password", async () => {
    const h1 = await hashPassword(VALID_PW);
    const h2 = await hashPassword(VALID_PW);
    expect(h1).not.toBe(h2);
  });
});

describe("generateTempPassword", () => {
  it("generates a password that passes all validation rules", () => {
    for (let i = 0; i < 20; i++) {
      const pw = generateTempPassword();
      expect(validatePassword(pw)).toBeNull();
    }
  });

  it("generates different passwords each time", () => {
    const passwords = new Set(Array.from({ length: 10 }, () => generateTempPassword()));
    expect(passwords.size).toBeGreaterThan(1);
  });
});
