import fastify from 'fastify';
import userRoutes from './modules/users.routes';
import prisma from './utils/prisma';
import cors from '@fastify/cors';

const server = fastify({ logger: true });

server.register(cors, {
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);

    const allowedOrigins = [      
      'http://localhost:5173',           // dev
      'http://localhost',                // nginx local
      'http://localhost:80',             // nginx local with port
      /^http:\/\/192\.168\.\d+\.\d+$/,  // local net
      /^http:\/\/10\.\d+\.\d+\.\d+$/,   // alternative local net
    ]
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
