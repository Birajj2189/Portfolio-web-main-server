import type { Core } from '@strapi/strapi';
import fs from 'fs';
import path from 'path';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const existing = await strapi.documents('api::portfolio.portfolio').findFirst({});

    if (existing) {
      strapi.log.info('[seed] Portfolio data already exists — skipping seed.');
      return;
    }

    const seedFilePath = path.join(process.cwd(), 'data', 'portfolio-seed.json');

    if (!fs.existsSync(seedFilePath)) {
      strapi.log.warn(`[seed] Seed file not found at ${seedFilePath} — skipping.`);
      return;
    }

    const seedData = JSON.parse(fs.readFileSync(seedFilePath, 'utf-8'));

    strapi.log.info('[seed] No portfolio data found — seeding from data/portfolio-seed.json...');

    await strapi.documents('api::portfolio.portfolio').create({
      data: seedData,
      status: 'published',
    });

    strapi.log.info('[seed] Portfolio data seeded successfully.');
  },
};
