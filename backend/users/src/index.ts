import { buildServer } from './utils/app';
import prisma from './utils/prisma';

const start = async () => {
  const server = await buildServer();

  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });

    // Optional: Wait for server to be ready before printing routes
    server.ready().then(() => {
      server.log.info('Routes registered:');
      console.log(server.printRoutes());
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// --- Graceful Shutdown ---
const shutdown = async () => {
  console.log('\nGracefully shutting down...');
  await prisma.$disconnect();
  console.log('Prisma client disconnected.');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// --- Start the server ---
start();