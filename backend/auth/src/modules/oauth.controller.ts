import { FastifyRequest, FastifyReply } from 'fastify';
import { randomBytes } from 'crypto';
import { createUser, getUserByEmail } from './auth.controller';
import prisma from '../utils/prisma';

/**
 * TODO: login with 42 should register and login automatically
 */

const OAUTH_CONFIG = {
  clientId: process.env.OAUTH_42_CLIENT_ID!,
  clientSecret: process.env.OAUTH_42_CLIENT_SECRET!,
  redirectUri: process.env.OAUTH_42_REDIRECT_URI || 'http://localhost/api/auth/callback/42',
  authUrl: 'https://api.intra.42.fr/oauth/authorize',
  tokenUrl: 'https://api.intra.42.fr/oauth/token',
  userUrl: 'https://api.intra.42.fr/v2/me'
};

export async function oauth42Handler(request: FastifyRequest, reply: FastifyReply) {
  const state = randomBytes(32).toString('hex');
  
  const authUrl = new URL(OAUTH_CONFIG.authUrl);
  authUrl.searchParams.set('client_id', OAUTH_CONFIG.clientId);
  authUrl.searchParams.set('redirect_uri', OAUTH_CONFIG.redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'public');
  authUrl.searchParams.set('state', state);

  return reply.redirect(authUrl.toString());
}

export async function oauth42CallbackHandler(request: FastifyRequest, reply: FastifyReply) {
  const { code, state } = request.query as { code?: string; state?: string };

  if (!code) {
    return reply.code(400).send({ error: 'Authorization code not provided' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(OAUTH_CONFIG.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: OAUTH_CONFIG.clientId,
        client_secret: OAUTH_CONFIG.clientSecret,
        code,
        redirect_uri: OAUTH_CONFIG.redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info from 42 API
    const userResponse = await fetch(OAUTH_CONFIG.userUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const user42 = await userResponse.json();

    // Check if user exists in our system
    let user = await getUserByEmail(user42.email);

    if (!user) {
      // Create new user
      user = await createUser(
        user42.login, // username
        user42.email,
        user42.first_name,
        randomBytes(32).toString('hex') // random password since they'll use 42 auth
      );
    }

    // Generate our JWT token
    const token = request.server.jwt.sign(
      { userId: user.id, email: user.email },
      { expiresIn: '24h' }
    );

    // Save session
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // this redirection to the frontend with the token is not working
    const frontendUrl = `${process.env.FRONTEND_URL}/?token=${token}&username=${user.username}&firstname=${user.firstname || user.username}&email=${user.email}&avatarUrl=${encodeURIComponent(user.avatarUrl || '/assets/img/avatar.jpg')}`;    
    return reply.redirect(frontendUrl);

  } catch (error) {
    console.error('42 OAuth error:', error);
    return reply.code(500).send({ error: 'OAuth authentication failed' });
  }
}
