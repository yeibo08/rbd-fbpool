import { describe, it, expect } from "vitest";
import { createTestDb } from "../test-utils/db.js";
import { createApp } from "../app.js";
import { registerUser, authedRequest } from "../test-utils/helpers.js";

const FUTURE = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
const PAST = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

function makeApp() {
  const { db, sqlite } = createTestDb();
  sqlite.exec(`
    INSERT INTO matches (id, match_number, stage, home_team_label, away_team_label, kickoff_at)
    VALUES
      ('mA', 1, 'group', 'México',  'Argentina', '${FUTURE}'),
      ('mB', 2, 'group', 'Brasil',  'Francia',   '${PAST}');
  `);
  return { app: createApp(db), db, sqlite };
}

describe("GET /api/matches", () => {
  it("returns all matches sorted by kickoff_at ascending", async () => {
    const { app } = makeApp();
    const user = await registerUser(app);
    const res = await authedRequest(app, "/api/matches", { session: user });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
    expect(body[0].id).toBe("mB"); // past first
    expect(body[1].id).toBe("mA"); // future second
  });

  it("includes deadlineAt exactly 15 minutes before kickoff", async () => {
    const { app } = makeApp();
    const user = await registerUser(app);
    const res = await authedRequest(app, "/api/matches", { session: user });
    const body = await res.json();
    const match = body.find((m: { id: string }) => m.id === "mA");
    const diff = new Date(match.kickoffAt).getTime() - new Date(match.deadlineAt).getTime();
    expect(diff).toBe(15 * 60 * 1000);
  });

  it("returns camelCase field names", async () => {
    const { app } = makeApp();
    const user = await registerUser(app);
    const body = await (await authedRequest(app, "/api/matches", { session: user })).json();
    expect(body[0]).toHaveProperty("kickoffAt");
    expect(body[0]).toHaveProperty("homeTeamLabel");
  });

  it("returns 401 when not authenticated", async () => {
    const { app } = makeApp();
    expect((await app.request("/api/matches")).status).toBe(401);
  });
});

describe("GET /api/matches/:id", () => {
  it("returns a single match with deadlineAt", async () => {
    const { app } = makeApp();
    const user = await registerUser(app);
    const res = await authedRequest(app, "/api/matches/mA", { session: user });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("mA");
    expect(body.homeTeamLabel).toBe("México");
    expect(body.deadlineAt).toBeTruthy();
  });

  it("returns 404 for an unknown id", async () => {
    const { app } = makeApp();
    const user = await registerUser(app);
    const res = await authedRequest(app, "/api/matches/doesnotexist", { session: user });
    expect(res.status).toBe(404);
  });
});

describe("GET /api/matches — team flags and codes", () => {
  function makeAppWithCountries() {
    const { db, sqlite } = createTestDb();
    sqlite.exec(`
      INSERT INTO countries (code, name, short, flag_emoji, group_letter, flag_url)
      VALUES
        ('MX', 'México',    'MEX', '🇲🇽', 'A', 'https://flagcdn.com/w40/mx.png'),
        ('AR', 'Argentina', 'ARG', '🇦🇷', 'A', 'https://flagcdn.com/w40/ar.png');
    `);
    sqlite.exec(`
      INSERT INTO matches (id, match_number, stage, group_letter, home_team_code, away_team_code, home_team_label, away_team_label, kickoff_at)
      VALUES ('mC', 3, 'group', 'A', 'MX', 'AR', 'México', 'Argentina', '${FUTURE}');
    `);
    return { app: createApp(db), sqlite };
  }

  it("includes homeTeamShort and homeTeamFlagUrl for matches with known team codes", async () => {
    const { app } = makeAppWithCountries();
    const user = await registerUser(app);
    const body = await (await authedRequest(app, "/api/matches", { session: user })).json();
    const match = body.find((m: { id: string }) => m.id === "mC");
    expect(match.homeTeamShort).toBe("MEX");
    expect(match.homeTeamFlagEmoji).toBe("🇲🇽");
    expect(match.homeTeamFlagUrl).toBe("https://flagcdn.com/w40/mx.png");
    expect(match.awayTeamShort).toBe("ARG");
    expect(match.awayTeamFlagEmoji).toBe("🇦🇷");
    expect(match.awayTeamFlagUrl).toBe("https://flagcdn.com/w40/ar.png");
  });

  it("returns null flag fields for TBD matches without a team code", async () => {
    const { app } = makeApp();
    const user = await registerUser(app);
    const body = await (await authedRequest(app, "/api/matches", { session: user })).json();
    const match = body[0];
    expect(match.homeTeamShort).toBeNull();
    expect(match.homeTeamFlagUrl).toBeNull();
    expect(match.awayTeamShort).toBeNull();
    expect(match.awayTeamFlagUrl).toBeNull();
  });

  it("GET /api/matches/:id also includes flag fields", async () => {
    const { app } = makeAppWithCountries();
    const user = await registerUser(app);
    const body = await (await authedRequest(app, "/api/matches/mC", { session: user })).json();
    expect(body.homeTeamShort).toBe("MEX");
    expect(body.awayTeamShort).toBe("ARG");
  });
});
