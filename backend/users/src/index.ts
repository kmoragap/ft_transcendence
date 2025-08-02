import fastify from 'fastify';
import userRoutes from './modules/users.routes';
import prisma from './utils/prisma';

const server = fastify({ logger: true });

server.register(userRoutes, { prefix: '/api/users' });

server.get('/', async (req, reply) => {
  return { message: 'Users service is up!' };
});

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Users service running on port 3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
