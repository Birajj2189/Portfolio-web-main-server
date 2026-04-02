import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::gallery.gallery', ({ strapi }) => ({
  async find(ctx) {
    const entity = await strapi.documents('api::gallery.gallery').findFirst({
      populate: {
        header: true,
        tiles: {
          populate: {
            image: true,
          },
        },
      },
    });

    const sanitized = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitized);
  },
}));
