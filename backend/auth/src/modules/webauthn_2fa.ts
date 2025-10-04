import prisma from '../utils/prisma';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';

interface Passkey {
	id: string;
	transports?: string[];
}

export async function initWebAuthnRegistration(
	userId: string,
	username: string,
	userPasskeys: Passkey[] = []
)
{	const options = generateRegistrationOptions({
		rpName: 'MyApp',
		rpID: 'localhost',
		userID: Buffer.from(userId, 'utf8'),
		userName: username,
		excludeCredentials: userPasskeys.map(passkey => ({
			id: passkey.id,
			transports: passkey.transports as any,
  })),
	});
	console.log('Created registration options for WebAuthn: ', options)
	return options;
}
