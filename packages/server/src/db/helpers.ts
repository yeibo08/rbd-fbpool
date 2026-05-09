import { and, eq } from "drizzle-orm";
import type { DrizzleDB } from "./types.js";
import { groupMembers } from "./schema.js";

export function requireMember(db: DrizzleDB, groupId: string, userId: string) {
  return db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
    .get();
}
