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
import {initWebAuthnRegistration, saveNewPasskeyInDB} from './webauthn_2fa';
import type { PublicKeyCredentialCreationOptionsJSON, RegistrationResponseJSON } from '@simplewebauthn/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';

const registrationChallenges: Record<string, PublicKeyCredentialCreationOptionsJSON> = {};

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
	async (request, response) => {
		const user = (request as any).user;
		if (!user) return response.code(401).send({error: 'no user authenticated'});
		
		const userPasskeys = (await prisma.passkey.findMany({
			where: { userId: user.userId },
		})).map(pk => ({
			id: pk.id,
			transports: pk.transports ? pk.transports.split(',') : undefined,
		}));
		
		const options = await initWebAuthnRegistration(
			user.userId,
			user.username,
			userPasskeys
		);
		registrationChallenges[user.userId] = options;
		response.send(options);
	}
  );
  fastify.post(
	'/webauthn/test-register',
	async (request, response) => {
		const user = (request as any).user;
		if (!user) return response.code(401).send({error: 'no user authenticated'});
		
		const body = request.body as RegistrationResponseJSON;
		
		const currentOptions = registrationChallenges[user.userId];
		if (!currentOptions) return response.code(400).send({error: 'no registration options found'})
		
		const origin = 'http://localhost:8080';
		const rpID = 'localhost';
		
		let verification;
		try {
		  verification = await verifyRegistrationResponse({
			response: body,
			expectedChallenge: currentOptions.challenge,
			expectedOrigin: origin,
			expectedRPID: rpID,
		  });
		} catch (error) {
		  console.error(error);
		  return response.code(400).send({ error: (error as Error).message });
		}

		const { verified, registrationInfo } = verification;
		if (verified && registrationInfo) {
		
			await saveNewPasskeyInDB(user.userId, registrationInfo);
		}
		
		return response.send({ verified });
	});
}
