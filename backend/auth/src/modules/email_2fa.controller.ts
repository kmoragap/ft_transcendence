import {randomInt} from 'crypto';
import nodemailer from 'nodemailer';
import { TwoFaCode } from "../types/auth.types";

const codes: Map<string, TwoFaCode> = new Map();

const makeRandomCode = (): string => {
	const code = randomInt(0, 1000000);
	return code.toString().padStart(6, '0');
}

export const sendTwoFaCode = async (email: string): Promise<string> => {
	const code = makeRandomCode();
	const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
	codes.set(email, { code, expiresAt });
	
	const testAccount = await nodemailer.createTestAccount();
	
	const transporter = nodemailer.createTransport({
	  host: "smtp.ethereal.email",
	  port: 587,
	  secure: false,
	  auth: {
		user: testAccount.user,
		pass: testAccount.pass,
	  },
	});
	
	const info = await transporter.sendMail({
		from: '"2FA Demo" <no-reply@example.com>',
		to: email,
		subject: "Your code",
		text: `Your code is ${code}. It is valid for the next five minutes.`,
	});
	
	console.log("Message sent: %s", info.messageId);
	console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
	return code; // return for testing
	
	// code for real emails (needs info from .env file):
	
	/*const transporter = nodemailer.createTransport({
	  host: process.env.SMTP_HOST,
	  port: Number(process.env.SMTP_PORT) || 587,
	  secure: false, // true for 465, false for other ports
	  auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASSWORD,
	  },
	});

	await transporter.sendMail({
		from: process.env.SMTP_USER,
		to: email,
		subject: "Your code",
		text: `Your code is ${code}. It is valid for the next five minutes`,
	  });*/
};

export const verifyTwoFaCode = (email: string, code: string): boolean => {
	const item = codes.get(email);
	if (!item) return false;
	if (item.code !== code) return false;
	if (item.expiresAt < new Date()){
		codes.delete(email);
		return false;
	}
	codes.delete(email);
	return true;
};
