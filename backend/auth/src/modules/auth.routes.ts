import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  registerHandler,
  loginHandler,
  logoutHandler,
  verifyTokenHandler,
  getMe,
} from './auth.controller';

export default async function authRoutes(fastify: FastifyInstance)
{
  fastify.post('/register', registerHandler);
  fastify.post('/login',    loginHandler);
  fastify.post('/logout', { preHandler: [fastify.authenticate] }, logoutHandler);
  fastify.get('/verify', { preHandler: [fastify.authenticate] }, verifyTokenHandler);
  fastify.get('/me', { preHandler: [fastify.authenticate] }, getMe);
}