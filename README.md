# rbd-fbpool — Quiniela Mundial 2026

A web-based football pool for FIFA World Cup 2026. Users join groups of friends, predict match scores, and earn points based on customizable rules.

## Tech stack

| Layer | Technology |
|---|---|
| Monorepo | npm workspaces |
| Backend | Hono + `@hono/node-server` + TypeScript |
| Database | SQLite via `better-sqlite3` + Drizzle ORM |
| Auth | JWT in httpOnly cookie (15-min expiry) |
| Results sync | ESPN public API + node-cron |
| Frontend | Vite + React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Server state | TanStack Query v5 |
| Client state | Zustand |
| Validation | Zod (shared server + client) |

## Prerequisites

- Node.js ≥ 20
- npm ≥ 10

## Getting started

```bash
# 1. Install all dependencies (run from repo root)
npm install

# 2. Set up environment variables
cp packages/server/.env.example packages/server/.env
# Edit .env and set JWT_SECRET and DATABASE_PATH

# 3. Create the database schema
npm run db:migrate

# 4. Seed all 104 matches and 48 countries
npm run db:seed

# 5. Start both server and client in dev mode
npm run dev
```

The app is available at `http://localhost:5173`. The API server runs on port `3000`.

## Environment variables

All variables live in `packages/server/.env`:

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | yes | Secret for signing JWTs — use a long random string |
| `DATABASE_PATH` | yes | Path to the SQLite file, e.g. `./data/pool.db` |
| `NODE_ENV` | no | Set to `production` to disable the dev admin routes |
| `RESULTS_PROVIDER` | no | `espn` (default, no key needed) or `football-data` |
| `FOOTBALL_DATA_API_KEY` | no | Required only when `RESULTS_PROVIDER=football-data` |

## Project structure

```
packages/
├── server/src/
│   ├── routes/          # Hono route handlers (auth, groups, matches, predictions, leaderboard, standings, bracket, admin)
│   ├── services/        # scoring.ts, standings.ts, bracket.ts, results-sync.ts, espn-provider.ts
│   ├── db/              # Drizzle schema, migrations, seed, helpers
│   ├── middleware/       # JWT auth middleware
│   ├── lib/             # password hashing, token signing
│   ├── data/            # fixture.ts — all 104 matches + 48 teams
│   └── test-utils/      # in-memory test DB + helpers
└── client/src/
    ├── api/             # TanStack Query fetch wrappers (uses shared lib/api.ts)
    ├── components/
    │   └── layout/      # AppNav — shared nav bar with hamburger drawer
    ├── pages/           # Login, Register, Grupos, GroupDetail, MatchCenter, Leaderboard, JoinGroup, Faq, Standings, Bracket
    ├── store/           # Zustand auth store
    └── lib/             # apiFetch, utils
```

## Running tests

```bash
# Run all server tests once
npm run test --workspace=packages/server

# Watch mode during development
npm run test:watch --workspace=packages/server
```

Tests use Vitest with an in-memory SQLite database — no external dependencies needed. Each test file creates its own isolated DB instance.

## Database commands

```bash
# Generate a new migration after editing schema.ts
npm run db:generate

# Apply pending migrations
npm run db:migrate

# Re-seed match and country data (idempotent — safe to re-run)
npm run db:seed

# Open Drizzle Studio (visual DB browser)
npm run db:studio --workspace=packages/server
```

## API overview

All routes require authentication (JWT cookie) except `/api/auth/register` and `/api/auth/login`.

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Log in, receive cookie |
| `POST` | `/api/auth/logout` | Clear cookie |
| `GET` | `/api/auth/me` | Current user |
| `POST` | `/api/auth/forgot-password` | Generate temp password |
| `POST` | `/api/auth/change-password` | Change password |
| `PATCH` | `/api/auth/me` | Update display name |
| `GET` | `/api/groups` | List user's groups |
| `POST` | `/api/groups` | Create group |
| `GET` | `/api/groups/:id` | Group detail + members |
| `PATCH` | `/api/groups/:id` | Rename group (owner or manager) |
| `DELETE` | `/api/groups/:id` | Delete group (owner only) |
| `POST` | `/api/groups/join/:token` | Join via invite link |
| `POST` | `/api/groups/:id/invite/reset` | Regenerate invite token |
| `PATCH` | `/api/groups/:id/members/:userId` | Change member role |
| `DELETE` | `/api/groups/:id/members/:userId` | Remove member |
| `GET` | `/api/groups/:id/rules` | Get scoring rules |
| `PUT` | `/api/groups/:id/rules` | Update scoring rules |
| `GET` | `/api/matches` | All 104 matches (with `deadlineAt`, flag URLs, 3-letter codes) |
| `GET` | `/api/matches/:id` | Single match (same enriched fields) |
| `GET` | `/api/standings` | Official group stage standings — all 12 groups (public) |
| `GET` | `/api/groups/:id/predictions` | User's predictions |
| `PUT` | `/api/groups/:id/predictions/:matchId` | Save/update prediction |
| `GET` | `/api/groups/:id/predictions/results` | Completed matches + earned points |
| `GET` | `/api/groups/:id/predictions/progress` | `{ predicted, total }` count |
| `GET` | `/api/groups/:id/leaderboard` | Ranked members by points |
| `GET` | `/api/groups/:id/standings` | Simulated standings from user's group-stage predictions |
| `GET` | `/api/groups/:id/bracket` | Full knockout bracket with simulated qualifiers + predictions |

**Dev-only** (not mounted in `NODE_ENV=production`):

| Method | Path | Description |
|---|---|---|
| `PUT` | `/api/admin/matches/:id/result` | Set a match result manually |
| `DELETE` | `/api/admin/matches/:id/result` | Clear a match result |

## Scoring rules

Each group can customize point values for:

| Criteria | Default |
|---|---|
| Correct result (win/draw/loss) | 1 pt |
| Exact home goals | 1 pt |
| Exact away goals | 1 pt |
| Exact total goals | 1 pt |

Maximum per match: 4 pts (with defaults). Rules can be changed by the group owner or a manager at any time — they apply to all future leaderboard calculations.

**Penalty shootouts:** the penalty winner determines the "result" outcome. Goals are always regulation + extra time only (penalty kicks are not counted toward goal totals).

## Results sync

An ESPN public API (no key required) is polled every 5 minutes during match days. Matches are updated once their kickoff time is at least 90 minutes in the past and they have no recorded result yet.

To use football-data.org instead:
```
RESULTS_PROVIDER=football-data
FOOTBALL_DATA_API_KEY=your_key_here
```

## Contributing

1. Fork the repo and create a branch from `main`
2. Write tests first (TDD) — `npm run test:watch --workspace=packages/server`
3. Keep server-side Drizzle queries synchronous: use `.get()`, `.all()`, `.run()` — never `await db.query.*`
4. Run `npx tsc --noEmit` in `packages/client` before opening a PR
5. All UI text must be in Spanish
6. Open a pull request — describe what changed and why

## Deployment (Fly.io)

The repo ships with a `Dockerfile`, `fly.toml`, and `.github/workflows/deploy.yml` for continuous deployment to [Fly.io](https://fly.io).

### First-time setup

```bash
# Install flyctl
brew install flyctl

# Create the app (accepts fly.toml as-is)
fly auth login
fly launch --no-deploy

# Persistent volume for SQLite (1 GB, free tier)
fly volumes create rbd_data --region dfw --size 1

# Set required secret
fly secrets set JWT_SECRET="$(openssl rand -base64 48)"

# Deploy and seed
fly deploy
fly ssh console -C "node packages/server/dist/db/seed.js"
```

### CI/CD

Every push to `main` triggers an automatic deploy via GitHub Actions.  
Add `FLY_API_TOKEN` (output of `fly tokens create deploy`) to your repo's GitHub Secrets.

### Scale to zero

The app is configured with `min_machines_running = 0` — it sleeps when idle and wakes on the first request (~2 s cold start). No charges while idle within the free tier.

### Environment variables in production

Set `DATABASE_PATH` and `NODE_ENV` are pre-configured in `fly.toml`. `JWT_SECRET` must be set via `fly secrets set`.

## Cloud migration (alternative)

The app uses `better-sqlite3` locally. To deploy to a different runtime, swap the DB client in `packages/server/src/db/client.ts` to `@libsql/client` (Turso). Drizzle supports both via the same schema and query API — no other files need to change.
