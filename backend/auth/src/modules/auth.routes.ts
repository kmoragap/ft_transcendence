import { FastifyInstance } from 'fastify';
import { registerHandler, loginHandler, logoutHandler, verifyTokenHandler } from './auth.controller';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', registerHandler);
  fastify.post('/login', loginHandler);
  fastify.post('/logout', { preHandler: [fastify.authenticate] }, logoutHandler);
  fastify.get('/verify', { preHandler: [fastify.authenticate] }, verifyTokenHandler);
}