import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import cookie from '@fastify/cookie';
import path from 'node:path';
import userRoutes from '../modules/users.routes';

export async function buildServer(): Promise<FastifyInstance> {
  const server = fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Cookie support
  server.register(cookie, {
    secret: process.env.COOKIE_SECRET || 'change-this-in-prod',
    parseOptions: {}
  });

  // CORS
  server.register(cors, {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost',
        /^http:\/\/192\.168\.\d+\.\d+$/,
        /^http:\/\/10\.\d+\.\d+\.\d+$/,
      ];
      const isAllowed = allowedOrigins.some((pattern) => {
        if (typeof pattern === 'string') return origin === pattern;
        return pattern.test(origin);
      });
      callback(null, isAllowed);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Multipart for file uploads
  server.register(multipart, {
    limits: { fileSize: 2 * 1024 * 1024, files: 1 }, // 2MB limit, 1 file
  });

  // Static file serving for uploads
  const uploadsRoot = path.resolve(process.cwd(), 'uploads');
  server.register(fastifyStatic, {
    root: uploadsRoot,
    prefix: '/uploads/',
    decorateReply: false,
  });

  // --- Route Registration ---
  server.register(userRoutes, { prefix: '/api/users' });

  // Health check route
  server.get('/', async () => ({ message: 'Users service is up!' }));

  return server;
}