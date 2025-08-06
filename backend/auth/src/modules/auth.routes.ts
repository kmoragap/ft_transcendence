import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  registerHandler,
  loginHandler,
  logoutHandler,
  verifyTokenHandler,
  getUserByEmail
} from './auth.controller';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', registerHandler);
  fastify.post('/login',    loginHandler);
  fastify.post(
    '/logout',
    { preHandler: [fastify.authenticate] },
    logoutHandler
  );
  fastify.get(
    '/verify',
    { preHandler: [fastify.authenticate] },
    verifyTokenHandler
  );

  // ─── who-am-I endpoint ────────────────────────────────────────────────────────
  fastify.get(
    '/me',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { email } = (request as any).user as { email: string };

      const user = await getUserByEmail(email);
      if (!user) {
        reply.code(404).send({ message: 'User not found' });
        return;
      }

      return {
        username:  user.username,
        avatarUrl: user.avatarUrl,
        language:  user.language,
      };
    }
  );
}