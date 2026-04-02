import { env } from './config/env';
import { prisma } from './config/prisma';
import app from './app';

async function startServer() {
  try {
    // Verify database connection before accepting traffic
    await prisma.$connect();
    console.log('✅ Database connected');

    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Auth service running on http://localhost:${env.PORT}`);
      console.log(`   Environment: ${env.NODE_ENV}`);
    });

    // ─── Graceful shutdown ──────────────────────────────────────────────────
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('💤 Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
