import { FastifyRequest, FastifyReply } from "fastify";
import { randomBytes } from "crypto";
import {
  createUser,
  getUserByEmail,
  getUserByUsername,
  updateUserOnlineStatus,
} from "./auth.controller";
import prisma from "../utils/prisma";
import { authSchemas } from "./auth.schema";

const OAUTH_CONFIG = {
  clientId: process.env.OAUTH_42_CLIENT_ID!,
  clientSecret: process.env.OAUTH_42_CLIENT_SECRET!,
  redirectUri: process.env.OAUTH_42_REDIRECT_URI!,
  authUrl: process.env.OAUTH_42_AUTH_URL!,
  tokenUrl: process.env.OAUTH_42_TOKEN_URL!,
  userUrl: process.env.OAUTH_42_USER_URL!,
};

export async function oauth42Handler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const state = randomBytes(32).toString("hex");

  const authUrl = new URL(OAUTH_CONFIG.authUrl);
  authUrl.searchParams.set("client_id", OAUTH_CONFIG.clientId);
  authUrl.searchParams.set("redirect_uri", OAUTH_CONFIG.redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "public");
  authUrl.searchParams.set("state", state);

  return reply.redirect(authUrl.toString());
}

async function generateUniqueOAuthUsername(
  baseUsername: string,
): Promise<string> {
  let username = baseUsername;
  let suffix = 1;

  // we keep trying until we find an available username
  while (await getUserByUsername(username)) {
    // we create a suffix that stays within the 20 character limit for zod
    // if baseUsername is long, use shorter suffix
    const maxBaseLength = 20 - (suffix.toString().length + 1); // +1 for the underscore
    const truncatedBase = baseUsername.substring(0, maxBaseLength);
    username = `${truncatedBase}_${suffix}`;
    suffix++;
  }

  return username;
}

function generateValidPassword(): string {
  const hex = randomBytes(32).toString("hex");
  const upper = "A";
  const underscore = "_";
  return hex + upper + underscore;
}

export async function oauth42CallbackHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { code, state } = request.query as { code?: string; state?: string };

  if (!code) {
    return reply.code(400).send({ error: "Authorization code not provided" });
  }

  try {
    // exchange code for access token
    const tokenResponse = await fetch(OAUTH_CONFIG.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: OAUTH_CONFIG.clientId,
        client_secret: OAUTH_CONFIG.clientSecret,
        code,
        redirect_uri: OAUTH_CONFIG.redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // get user info from 42 API
    const userResponse = await fetch(OAUTH_CONFIG.userUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to get user info");
    }

    const user42 = await userResponse.json();
    // check if user exists in our system
    let user = await getUserByEmail(user42.email);
    if (!user) {
      // if no user found by email, check if there's a username conflict
      const existingUsername = await getUserByUsername(user42.login);

      let finalUsername = user42.login;

      if (existingUsername) {
        // we generate a unique username that respects the 20-character limit
        finalUsername = await generateUniqueOAuthUsername(user42.login);
      }
      const oauthUser = {
        username: finalUsername,
        email: user42.email,
        firstname: user42.displayname,
        password: generateValidPassword(),
      };

      console.log("Attempting to create OAuth user:", oauthUser);

      const parsed = authSchemas.register.safeParse(oauthUser);
      if (!parsed.success) {
        console.error("Invalid OAuth user data:", parsed.error.format());
        const errorUrl = `${process.env.FRONTEND_URL}/#/login?error=invalid_user_data`;
        return reply.redirect(errorUrl);
      }

      const { username, email, firstname, password } = parsed.data;

      const avatarUrl =
        user42.image?.versions?.medium || user42.image?.link || undefined;

      user = await createUser(
        username,
        email,
        firstname,
        password,
        avatarUrl,
        true, // isOAuthUser
      );
    } else {
      console.log(
        `Found existing user by email: ${user.email}, username: ${user.username}`,
      );
    }

    if (!user) throw new Error("Failed to create or retrieve user");
    // Generate our JWT token
    const token = request.server.jwt.sign(
      { userId: user.id, email: user.email },
      { expiresIn: "24h" },
    );

    // Save session
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    // Set user as online
    await updateUserOnlineStatus(user.id, true);

    // Set secure HTTP-only cookie with the token
    reply.setCookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
    });

    const frontendUrl = process.env.FRONTEND_URL!;
    return reply.redirect(`${frontendUrl}/#/oauth?success=true`);
  } catch (error) {
    const frontendUrl = process.env.FRONTEND_URL!;
    console.error("42 OAuth error:", error);
    const errorUrl = `${frontendUrl}/#/login?error=oauth_failed`;
    return reply.redirect(errorUrl);
  }
}
