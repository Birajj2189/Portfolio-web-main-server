import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    // Replace "en" with the locale you want to set as the default
    locales: ['en'],
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
  },
};
