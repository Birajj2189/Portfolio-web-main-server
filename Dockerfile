# ─── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:20-slim AS deps

RUN apt-get update && apt-get install -y \
    libvips-dev \
    python3 \
    make \
    g++ \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --include=optional

# ─── Stage 2: Builder ─────────────────────────────────────────────────────────
FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y \
    libvips-dev \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production

# Ensure public/ exists before build (it may not be committed to git)
RUN mkdir -p public/uploads

RUN npm run build

# ─── Stage 3: Runner ──────────────────────────────────────────────────────────
FROM node:20-slim AS runner

RUN apt-get update && apt-get install -y \
    libvips \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

RUN groupadd --system --gid 1001 strapi && \
    useradd --system --uid 1001 --gid strapi --create-home strapi

# dist/ contains compiled config/, src/, and extensions/ — the only thing
# Strapi production needs. Raw .ts source files must NOT be copied here
# because Strapi will find .ts configs and refuse to load them.
COPY --from=builder --chown=strapi:strapi /app/dist ./dist

# Dependencies
COPY --from=builder --chown=strapi:strapi /app/node_modules ./node_modules
COPY --from=builder --chown=strapi:strapi /app/package.json ./package.json

# Static assets (public/ is guaranteed to exist because builder ran mkdir -p)
COPY --from=builder --chown=strapi:strapi /app/public ./public

# Seed data for bootstrap hook in src/index.ts
COPY --from=builder --chown=strapi:strapi /app/data ./data

USER strapi

EXPOSE 1330

# strapi start reads schemas, syncs DB tables, then serves the API
CMD ["npm", "run", "start"]
