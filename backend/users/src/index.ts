import fastify, { FastifyInstance } from 'fastify';
import userRoutes from './modules/users.routes';
import prisma from './utils/prisma';
import path from 'node:path';
import multipart from '@fastify/multipart';
import fastifyStatic, { FastifyStaticOptions } from '@fastify/static';

const server = fastify({ logger: true });

async function buildApp(app: FastifyInstance): Promise<void> {
  app.register(multipart, {
    limits: { fileSize: 2 * 1024 * 1024, files: 1 }, // 2MB, 1 file
  });

  const uploadsRoot = path.resolve(process.cwd(), 'uploads');

  const staticOptions: FastifyStaticOptions = {
    root: uploadsRoot,
    prefix: '/uploads/',
    decorateReply: false,
  } as FastifyStaticOptions;

  app.register(fastifyStatic, staticOptions);
}

const start = async () => {
  try {
    await buildApp(server); // <-- important

    server.register(userRoutes, { prefix: '/api/users' });

    server.get('/', async () => ({ message: 'Users service is up!' }));

    await server.listen({ port: 3000, host: '0.0.0.0' });
    server.log.info('Users service running on port 3000');

    server.ready().then(() => server.printRoutes());
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
