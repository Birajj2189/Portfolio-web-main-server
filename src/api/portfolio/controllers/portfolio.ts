import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::portfolio.portfolio', ({ strapi }) => ({
  async find(ctx) {
    const entity = await strapi.documents('api::portfolio.portfolio').findFirst({
      populate: {
        hero: true,
        about: {
          populate: {
            skills: true,
          },
        },
        projects: true,
        journey: {
          populate: {
            timeline: true,
            exploring: true,
            achievements: true,
          },
        },
        resume: {
          populate: {
            experience: true,
            education: true,
            stats: true,
          },
        },
        contact: true,
        footer: true,
      },
    });

    const sanitized = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitized);
  },
}));
