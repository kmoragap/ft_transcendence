import prisma from '../utils/prisma';
import {
  generateRegistrationOptions,
  VerifyRegistrationResponseOpts,
  VerifiedRegistrationResponse,
  type AuthenticatorTransportFuture
} from '@simplewebauthn/server';

interface Passkey {
	id: string;
	transports?: string[];
}

export function bufferToString(buffer: Uint8Array){
	return Buffer.from(buffer).toString('base64');
}

export function stringToBuffer(base64: string){
	return Uint8Array.from(Buffer.from(base64, 'base64'))
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
			transports: passkey.transports as AuthenticatorTransportFuture[] | undefined,
  })),
	});
	console.log('Created registration options for WebAuthn: ', options)
	return options;
}

export async function saveNewPasskeyInDB(
	userId: string,
	registrationInfo?: VerifiedRegistrationResponse['registrationInfo']
){
	if (!registrationInfo) return;
	
	const credential = registrationInfo.credential;
	
	await prisma.passkey.create({
		data: {
				  userId,
				  id: credential.id,
				  credentialId: credential.id,
				  publicKey: bufferToString(credential.publicKey),
				  counter: credential.counter,	
				  transports: credential.transports?.join(',') ?? null,
				  //deviceType: registrationInfo.credentialDeviceType,
				  //backedUp: registrationInfo.credentialBackedUp,
			}
		});
}
