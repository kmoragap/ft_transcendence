import { FastifyInstance } from 'fastify';
import prisma from '../utils/prisma';
import { oauth42Handler, oauth42CallbackHandler } from './oauth.controller';
import {
  registerHandler,
  loginHandler,
  logoutHandler,
  verifyTokenHandler,
  getMeHandler
} from './auth.controller';
import {initWebAuthnRegistration} from './webauthn_2fa';

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
  
  // webauthn routes
  console.log("Registering WebAuthn route /webauthn/test-register");
  fastify.get(
	'/webauthn/test-register',
	{ preHandler: [fastify.authenticate] },
	async (request, reply) => {
		const user = (request as any).user;
		if (!user) return reply.code(401).send({error: 'no user authenticated'});
		
		const userPasskeys = await prisma.passkey.findMany({
			where: { userId: user.userId },
		})
		
		const options = await initWebAuthnRegistration(
			user.userId,
			user.username,
			userPasskeys
		);
		reply.send(options);
	}
  );
}
