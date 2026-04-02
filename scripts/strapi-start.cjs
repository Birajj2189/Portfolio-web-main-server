'use strict';

/**
 * Render-friendly Strapi start: ensure upload dir exists and fail fast with
 * readable errors when required env vars are missing (Strapi often exits 1
 * before binding a port, which makes Render logs look empty).
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = process.cwd();

fs.mkdirSync(path.join(root, 'public', 'uploads'), { recursive: true });

function fail(message) {
  console.error('');
  console.error('[strapi-start] ' + message);
  console.error(
    '[strapi-start] In Render: Web Service → Environment → add every variable from .env.example (secrets as Encrypted).',
  );
  console.error('');
  process.exit(1);
}

const trim = (v) => (v == null ? '' : String(v).trim());

const hasDbUrl = trim(process.env.DATABASE_URL).length > 0;
const hasDbParts =
  trim(process.env.DATABASE_HOST).length > 0 &&
  trim(process.env.DATABASE_NAME).length > 0 &&
  trim(process.env.DATABASE_USERNAME).length > 0;

if (!hasDbUrl && !hasDbParts) {
  fail(
    'Database not configured: set DATABASE_URL (Internal URL from Render Postgres) or DATABASE_HOST + DATABASE_NAME + DATABASE_USERNAME (+ DATABASE_PASSWORD).',
  );
}

if (process.env.RENDER === 'true' && hasDbParts && !hasDbUrl) {
  const host = trim(process.env.DATABASE_HOST);
  if (host && !host.includes('.')) {
    fail(
      `DATABASE_HOST looks incomplete (${JSON.stringify(host)}). On Render, use the full internal hostname from your Postgres instance (e.g. *.oregon-postgres.render.com), or set DATABASE_URL to the Internal Database URL.`,
    );
  }
  if (trim(process.env.DATABASE_PORT) === '5434') {
    console.warn(
      '[strapi-start] DATABASE_PORT=5434 is for local Docker only. On Render use 5432 or omit DATABASE_PORT; prefer DATABASE_URL.',
    );
  }
}

if (process.env.RENDER === 'true' && trim(process.env.PORT) === '1330') {
  console.warn(
    '[strapi-start] PORT=1330 is for local dev. On Render, remove PORT and let Render set it, or match the port in your Web Service docs (often 10000).',
  );
}

if (!trim(process.env.APP_KEYS)) {
  fail(
    'APP_KEYS is missing or empty. Set a comma-separated list (e.g. four random base64 strings from `openssl rand -base64 16`).',
  );
}

for (const key of ['ADMIN_JWT_SECRET', 'API_TOKEN_SALT', 'TRANSFER_TOKEN_SALT']) {
  if (!trim(process.env[key])) {
    fail(`${key} is missing or empty.`);
  }
}

if (!trim(process.env.PORT)) {
  console.warn('[strapi-start] PORT is unset; Render usually injects it. Binding may fail the health check.');
}

const strapiBin = path.join(root, 'node_modules', '.bin', 'strapi');
if (!fs.existsSync(strapiBin)) {
  fail(`Strapi CLI not found at ${strapiBin}. Run npm install before start.`);
}

const result = spawnSync(strapiBin, ['start'], {
  stdio: 'inherit',
  env: process.env,
  cwd: root,
});

process.exit(result.status === null ? 1 : result.status);
