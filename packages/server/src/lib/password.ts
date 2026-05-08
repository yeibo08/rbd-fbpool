import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const SALT_ROUNDS = 10;

// Password must be >=8 chars, at least 1 uppercase, 1 digit, 1 of !#$?
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!#$?]).{8,}$/;

export function validatePassword(password: string): string | null {
  if (!PASSWORD_REGEX.test(password)) {
    return "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y uno de los símbolos: !#$?";
  }
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateTempPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const symbols = "!#$?";
  const lower = "abcdefghjkmnpqrstuvwxyz";

  // Guarantee at least one of each required character class
  const pick = (set: string) => set[randomBytes(1)[0] % set.length];
  const required = [pick(upper), pick(digits), pick(symbols), pick(lower)];

  // Fill remaining 8 chars from combined set
  const all = upper + digits + symbols + lower;
  const extra = Array.from({ length: 8 }, () => pick(all));

  // Shuffle
  const chars = [...required, ...extra];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomBytes(1)[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}
