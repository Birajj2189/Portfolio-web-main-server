export default ({ env }) => ({
  documentation: {
    enabled: true,
    config: {
      openapi: "3.0.0",
      info: {
        version: "1.0.0",
        title: "Portfolio API",
        description: "PersonalPortfolio backend API documentation",
        contact: {
          name: "API Support",
        },
      },
      "x-strapi-config": {
        plugins: ["users-permissions"],
        path: "/documentation",
      },
      security: [{ bearerAuth: [] }],
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  "users-permissions": {
    config: {
      // Production requires jwtSecret; plugin throws if missing when NODE_ENV=production.
      // Prefer JWT_SECRET; fall back to ADMIN_JWT_SECRET so Render setups with one secret still boot.
      jwtSecret: env('JWT_SECRET', env('ADMIN_JWT_SECRET')),
      jwt: {
        expiresIn: env('JWT_EXPIRES_IN', '7d'),
      },
    },
  },
});
