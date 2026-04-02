export default ({ env }) => ({
  documentation: {
    enabled: true,
    config: {
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'Portfolio API',
        description: 'Portfolio backend API documentation',
        contact: {
          name: 'API Support',
        },
      },
      'x-strapi-config': {
        plugins: ['users-permissions'],
        path: '/documentation',
      },
      security: [{ bearerAuth: [] }],
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: env('JWT_EXPIRES_IN', '7d'),
      },
    },
  },
});
