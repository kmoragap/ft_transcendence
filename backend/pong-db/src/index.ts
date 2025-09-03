import fastify from 'fastify';
import pongRoutes from './modules/pong.routes';
import prisma from './utils/prisma';
import cors from '@fastify/cors';

const server = fastify({ logger: true });

server.register(cors, {
    origin: (origin, callback) => {
    // allow rquests without origin, for internt  nginx
    if (!origin) return callback(null, true);
    
    // origins allowed
    const allowedOrigins = [
      'http://localhost:5173',           // dev
      'http://localhost',                // nginx local
      'http://localhost:80',             // nginx local with port
      /^http:\/\/192\.168\.\d+\.\d+$/,  // local net
      /^http:\/\/10\.\d+\.\d+\.\d+$/,   // alternative local net
      /^http:\/\/172.18.\d+.\d+$/,
    ];
    // check if the origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      }
      return allowed.test(origin);
    });
    
    callback(null, isAllowed);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
// register the route with the prefix
server.register(pongRoutes, { prefix: '/api/pong' });

server.get('/', async (req, reply) => {
  return { message: 'Pong DB service is up!' };
});

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Pong DB service running on port 3000');
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