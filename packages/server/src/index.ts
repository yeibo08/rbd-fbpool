import { serve } from "@hono/node-server";
import cron from "node-cron";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import { fileURLToPath } from "url";
import { createApp } from "./app.js";
import { db } from "./db/client.js";
import { createESPNSyncService } from "./services/espn-provider.js";

if (process.env.NODE_ENV === "production") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  migrate(db, { migrationsFolder: path.join(__dirname, "db/migrations") });
  console.log("Migrations applied");
}

const app = createApp(db);
const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Sync match results every 5 minutes.
// The job is a no-op outside of match days since ResultsSyncService only queries
// matches whose kickoff was > 90 min ago and whose result is still NULL.
const syncService = createESPNSyncService(db);

cron.schedule("*/5 * * * *", async () => {
  try {
    await syncService.sync();
  } catch (err) {
    console.error("[cron] Unhandled error in results sync:", err);
  }
});
