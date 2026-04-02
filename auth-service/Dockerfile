# ─── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:20-slim AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

# ─── Stage 2: Builder ─────────────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# ─── Stage 3: Runner ──────────────────────────────────────────────────────────
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN groupadd --system --gid 1001 authservice && \
    useradd --system --uid 1001 --gid authservice authservice

COPY --from=builder --chown=authservice:authservice /app/dist ./dist
COPY --from=builder --chown=authservice:authservice /app/node_modules ./node_modules
COPY --from=builder --chown=authservice:authservice /app/package.json ./package.json
COPY --from=builder --chown=authservice:authservice /app/prisma ./prisma

USER authservice

EXPOSE 3001

CMD ["node", "dist/server.js"]
