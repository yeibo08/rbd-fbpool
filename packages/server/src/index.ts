import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { db } from "./db/client.js";

const app = createApp(db);
const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}`);
});
