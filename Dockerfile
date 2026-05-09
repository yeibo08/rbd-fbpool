# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/server/package.json ./packages/server/
COPY packages/client/package.json ./packages/client/

RUN npm ci

COPY packages/server/src ./packages/server/src
COPY packages/server/tsconfig.json ./packages/server/

COPY packages/client/src ./packages/client/src
COPY packages/client/index.html ./packages/client/
COPY packages/client/tsconfig.json ./packages/client/
COPY packages/client/vite.config.ts ./packages/client/

RUN npm run build --workspace=packages/server
RUN npm run build --workspace=packages/client

# ── Stage 2: Run ─────────────────────────────────────────────────────────────
FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/server/package.json ./packages/server/

RUN npm ci --workspace=packages/server --omit=dev

COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/client/dist ./packages/client/dist

# Migration SQL files are not emitted by tsc — copy them alongside the compiled output
COPY packages/server/src/db/migrations ./packages/server/dist/db/migrations

EXPOSE 3000
CMD ["node", "packages/server/dist/index.js"]
