import path from 'path';

/**
 * Local Docker often maps Postgres as host:5434 → container:5432.
 * On Render, managed Postgres always listens on 5432 — copying local
 * DATABASE_PORT=5434 or a URL with :5434 breaks the deploy.
 */
function normalizeRenderPostgresPort(port: number): number {
  if (process.env.RENDER === 'true' && port === 5434) {
    return 5432;
  }
  return port;
}

function normalizeRenderDatabaseUrl(url: string | null): string | null {
  if (!url || process.env.RENDER !== 'true') return url;
  // postgresql://user:pass@host:5434/db → :5432
  try {
    const parsed = new URL(url);
    if (parsed.port === '5434') {
      parsed.port = '5432';
      return parsed.toString();
    }
  } catch {
    /* ignore malformed URLs */
  }
  return url;
}

export default ({ env }) => {
  const client = env('DATABASE_CLIENT', 'postgres');

  const databaseUrl = normalizeRenderDatabaseUrl(env('DATABASE_URL', null));

  const connections = {
    postgres: {
      connection: databaseUrl
        ? {
            connectionString: databaseUrl,
            ssl: { rejectUnauthorized: false },
            schema: env('DATABASE_SCHEMA', 'public'),
          }
        : {
            host: env('DATABASE_HOST', '127.0.0.1'),
            port: normalizeRenderPostgresPort(env.int('DATABASE_PORT', 5432)),
            database: env('DATABASE_NAME', 'strapi'),
            user: env('DATABASE_USERNAME', 'strapi'),
            password: env('DATABASE_PASSWORD', ''),
            ssl: env.bool('DATABASE_SSL', false)
              ? {
                  rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
                }
              : false,
            schema: env('DATABASE_SCHEMA', 'public'),
          },
      pool: {
        min: env.int('DATABASE_POOL_MIN', 2),
        max: env.int('DATABASE_POOL_MAX', 10),
        acquireTimeoutMillis: 60000,
        createTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
      },
    },
    sqlite: {
      connection: {
        filename: path.join(
          __dirname,
          '..',
          env('DATABASE_FILENAME', '.tmp/data.db')
        ),
      },
      useNullAsDefault: true,
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};
