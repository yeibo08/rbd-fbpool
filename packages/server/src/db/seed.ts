import { db, sqlite } from "./client.js";
import { countries, venues, matches } from "../data/fixture.js";
import {
  countries as countriesTable,
  venues as venuesTable,
  matches as matchesTable,
} from "./schema.js";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(__dirname, "./migrations");

console.log("Running migrations...");
migrate(db, { migrationsFolder });

console.log("Seeding countries...");
for (const c of countries) {
  db.insert(countriesTable)
    .values({
      code: c.code,
      name: c.name,
      short: c.short,
      flagEmoji: c.flagEmoji,
      groupLetter: c.groupLetter,
      flagUrl: c.flagUrl,
    })
    .onConflictDoNothing()
    .run();
}
console.log(`  ${countries.length} countries OK`);

console.log("Seeding venues...");
const venueIdByName = new Map<string, number>();
for (const v of venues) {
  const existing = db
    .select({ id: venuesTable.id })
    .from(venuesTable)
    .where(eq(venuesTable.name, v.name))
    .get();
  if (existing) {
    venueIdByName.set(v.name, existing.id);
  } else {
    const stmt = db
      .insert(venuesTable)
      .values({ name: v.name, city: v.city, country: v.country })
      .run();
    venueIdByName.set(v.name, Number(stmt.lastInsertRowid));
  }
}
console.log(`  ${venues.length} venues OK`);

console.log("Seeding matches...");
for (const m of matches) {
  const venueId = venueIdByName.get(m.venueName);
  if (!venueId) {
    throw new Error(`Venue not found: ${m.venueName}`);
  }
  db.insert(matchesTable)
    .values({
      id: m.id,
      matchNumber: m.matchNumber,
      stage: m.stage,
      groupLetter: m.groupLetter,
      homeTeamCode: m.homeTeamCode,
      awayTeamCode: m.awayTeamCode,
      homeTeamLabel: m.homeTeamLabel,
      awayTeamLabel: m.awayTeamLabel,
      kickoffAt: m.kickoffAt,
      venueId,
    })
    .onConflictDoNothing()
    .run();
}
console.log(`  ${matches.length} matches OK`);

console.log("Seed complete.");
sqlite.close();
