import fastify from 'fastify';
import jwt from '@fastify/jwt';
import authRoutes from './modules/auth.routes';
import prisma from './utils/prisma';

const server = fastify({ logger: true });

// register jwt
server.register(jwt, {
  secret: process.env.JWT_SECRET || 'change-this-in-prod'
});

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: any, reply: any) => Promise<void>;
  }
}

// decorate fastify with the auth
server.decorate('authenticate', async function (request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// register routes
server.register(authRoutes, { prefix: '/api/auth' });

server.get('/', async (request, reply) => {
  return { message: 'Auth service is up!' } as const;
});

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Auth service running on port 3000');
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