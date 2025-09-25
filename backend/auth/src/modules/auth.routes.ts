import { FastifyInstance } from 'fastify';
import { oauth42Handler, oauth42CallbackHandler } from './oauth.controller';
import {
  registerHandler,
  loginHandler,
  logoutHandler,
  verifyTokenHandler,
  getMeHandler
} from './auth.controller';

export default async function authRoutes(fastify: FastifyInstance) {
  // auth routes
  fastify.post('/register', registerHandler);
  fastify.post('/login', loginHandler);
  
  // protected routes
  fastify.post('/logout', { preHandler: [fastify.authenticate] }, logoutHandler);
  fastify.get('/verify', { preHandler: [fastify.authenticate] }, verifyTokenHandler);
  fastify.get('/me', { preHandler: [fastify.authenticate] }, getMeHandler);
  
  // oauth routes
  fastify.get('/oauth/42', oauth42Handler);
  fastify.get('/callback/42', oauth42CallbackHandler);
}