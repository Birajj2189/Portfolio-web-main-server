import path from 'path';

export default ({ env }) => {
  const client = env('DATABASE_CLIENT', 'postgres');

  const databaseUrl = env('DATABASE_URL', null);

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
            port: env.int('DATABASE_PORT', 5432),
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
