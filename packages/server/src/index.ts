import { serve } from "@hono/node-server";
import cron from "node-cron";
import { createApp } from "./app.js";
import { db } from "./db/client.js";
import { createESPNSyncService } from "./services/espn-provider.js";

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
