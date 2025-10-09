import { randomInt } from "crypto";
import nodemailer from "nodemailer";
import { TwoFaCode } from "../types/auth.types";

const codes: Map<string, TwoFaCode> = new Map();

const makeRandomCode = (): string => {
  const code = randomInt(0, 1000000);
  return code.toString().padStart(6, "0");
};

export const send2faCode = async (email: string): Promise<string> => {
  const code = makeRandomCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  codes.set(email, { code, expiresAt });

  // === MOCK EMAIL SENDING ===
  // This section uses nodemailer with a temporary test account (Ethereal email).
  // It does NOT send real emails to actual inboxes.
  // Instead, it generates a test URL you can open in your browser to see the email content.
  // This allows you to test 2FA flows locally without a real SMTP server.
  //
  // Example console output after sending:
  //   Message sent: <unique message id>
  //   Preview URL: https://ethereal.email/message/xxxxx
  //
  // To use 2FA codes in testing:
  // 1. Check the console for the 'Preview URL'.
  // 2. Open the URL to see the 6-digit code.
  // 3. Use this code to call POST /verify-2fa.

  /*
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
*/
  // === PRODUCTION EMAILS ===
  // To enable real emails, uncomment the SMTP transporter block below and set:
  // - SMTP_HOST
  // - SMTP_PORT
  // - SMTP_USER
  // - SMTP_PASSWORD
  // in your .env file.
  // This will send real emails to your users' inboxes.

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Your code",
    text: `Your code is ${code}. It is valid for the next five minutes`,
  });
  console.log("Message sent: %s", info.messageId);
  return code;
};

export const verify2faCode = (email: string, code: string): boolean => {
  const item = codes.get(email);
  if (!item) return false;
  if (item.code !== code) return false;
  if (item.expiresAt < new Date()) {
    codes.delete(email);
    return false;
  }
  codes.delete(email);
  return true;
};
