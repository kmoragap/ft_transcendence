import { FastifyReply, FastifyRequest } from "fastify";
import * as bcrypt from "bcrypt";
import prisma from "../utils/prisma";
import { User, JWTPayload } from "../types/auth.types";
import {
  UnauthorizedError,
  ConflictError,
  handleAuthError,
} from "../utils/errorHandler";
import { send2faCode, verify2faCode } from "./email_2fa.controller";
import { validateBody } from "./auth.middleware";
import {
  Verify2faRequest,
  Resend2faRequest,
  RegisterRequest,
  LoginRequest,
  authSchemas,
} from "./auth.schema";

async function authenticateUser(
  identifier: string,
  password: string,
): Promise<User> {
  const user = identifier.includes("@")
    ? await getUserByEmail(identifier)
    : await getUserByUsername(identifier);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new UnauthorizedError("Invalid credentials");
  }

  return user;
}

async function completeLogin(request: FastifyRequest, user: User) {
  const token = request.server.jwt.sign(
    { userId: user.id, email: user.email },
    { expiresIn: "24h" },
  );

  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  await updateUserOnlineStatus(user.id, true);

  return {
    message: "Login successful",
    token,
    id: user.id,
    username: user.username,
    firstname: user.firstname,
    email: user.email,
    avatarUrl: user.avatarUrl || "/assets/img/avatar.jpg",
    is2faEnabled: !!user.is2faEnabled,
    isOAuthUser: !!user.isOAuthUser,
  };
}

export async function getMeHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const user = (request as any).user;

    if (!user) {
      return reply.code(401).send({ error: "No user found in request" });
    }

    // get user details from users service
    const userDetails = await getUserByEmail(user.email);
    if (!userDetails) {
      return reply.code(404).send({ error: "User not found" });
    }

    return {
      id: userDetails.id,
      username: userDetails.username,
      firstname: userDetails.firstname,
      email: userDetails.email,
      avatarUrl: userDetails.avatarUrl || "/assets/img/avatar.jpg",
      is2faEnabled: userDetails.is2faEnabled,
      isOAuthUser: userDetails.isOAuthUser,
    };
  } catch (error) {
    console.error("Error in getMeHandler:", error);
    return reply.code(500).send({ error: "Internal server error" });
  }
}

//TODO: everthing should be rewrite with zod to make some check before creating or saving the data
// Helpers to fetch from users service
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const res = await fetch(
      `http://users:3000/api/users/by-email/${encodeURIComponent(email)}`,
    );
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Error fetching user by email:", err);
    return null;
  }
}

export async function getUserByUsername(username: string) {
  try {
    const res = await fetch(
      `http://users:3000/api/users/by-username/${encodeURIComponent(username)}`,
    );
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Error fetching user by username:", err);
    return null;
  }
}

// Create a new user in users service
export async function createUser(
  username: string,
  email: string,
  firstname: string,
  password: string,
  avatarUrl?: string,
  isOAuthUser?: boolean,
) {
  try {
    const res = await fetch(`http://users:3000/api/users/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        email,
        firstname,
        password,
        avatarUrl,
        isOAuthUser,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create user");
    }
    return await res.json();
  } catch (err) {
    console.error("Error creating user:", err);
    throw err;
  }
}

// Update user's online status by calling users service directly
export async function updateUserOnlineStatus(
  userId: string,
  isOnline: boolean,
) {
  try {
    const res = await fetch(
      `http://users:3000/api/users/${userId}/online-status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isOnline }),
      },
    );
    if (!res.ok) {
      console.error("Failed to update online status:", await res.text());
    }
  } catch (err) {
    console.error("Error updating online status:", err);
  }
}
//register handler
export async function registerHandler(
  request: FastifyRequest<{ Body: RegisterRequest }>,
  reply: FastifyReply,
) {
  try {
    const parsed = authSchemas.register.parse(request.body);
    const { username, email, firstname, password } = parsed;
    // Check if email exists.
    const existingUser = await getUserByEmail(email);
    if (existingUser)
      throw new ConflictError("User with this email already exists");

    // Check if username exists
    const existingUsername = await getUserByUsername(username);
    if (existingUsername)
      throw new ConflictError("User with this username already exists");

    // 1.create the users in the users services
    const user = await createUser(username, email, firstname, password);

    // 2.generate the jwt
    const token = request.server.jwt.sign(
      {
        userId: user.id, // now string instead of number
        email: email,
      },
      { expiresIn: "24h" },
    );

    // 3.save the session
    await prisma.session.create({
      data: {
        userId: user.id, // now string
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // 4.Set user as online
    await updateUserOnlineStatus(user.id, true);

    return {
      message: "Registration successful",
      token,
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      email: user.email,
      avatarUrl: user.avatarUrl || "/assets/img/avatar.jpg",
    };
  } catch (error) {
    return handleAuthError(error, reply);
  }
}

export async function loginHandler(
  request: FastifyRequest<{ Body: LoginRequest }>,
  reply: FastifyReply,
) {
  try {
    const parsed = authSchemas.login.parse(request.body);
    const { username, email, identifier, password } = parsed;
    const loginIdentifier = username || email;
    if (!loginIdentifier) {
      return reply
        .code(400)
        .send({ message: "Must provide email or username" });
    }

    const user = await authenticateUser(loginIdentifier, password);

    // 2FA flow:
    if (user?.is2faEnabled) {
      await send2faCode(user.email);
      return reply.code(200).send({
        message: "Two-factor authentication code sent to your email",
        email: user.email,
        is2faEnabled: true,
      });
    }

    // if no 2FA required - just login:
    return await completeLogin(request, user);
  } catch (error) {
    console.error("Error during login:", error);
    return reply.code(401).send({ message: "Login failed" });
  }
}

export async function verify2faHandler(
  request: FastifyRequest<{ Body: { email: string; code: string } }>,
  reply: FastifyReply,
) {
  try {
    const { email, code } = request.body;

    const user = await getUserByEmail(email);
    if (!user) {
      return reply.code(404).send({ message: "User not found" });
    }

    const valid = verify2faCode(email, code);
    if (!valid) {
      return reply
        .code(401)
        .send({ message: "Invalid two-factor authentication code" });
    }
    return await completeLogin(request, user);
  } catch (error) {
    return handleAuthError(error, reply);
  }
}

export async function resend2faHandler(
  request: FastifyRequest<{ Body: { email: string } }>,
  reply: FastifyReply,
) {
  try {
    const { email } = request.body;

    if (!email?.trim()) {
      return reply.code(400).send({ message: "Email is required" });
    }

    // Always respond with a generic message to prevent user enumeration
    const user = await getUserByEmail(email);
    if (user && user.is2faEnabled) {
      await send2faCode(user.email);
    }
    return reply.code(200).send({
      message:
        "If your account supports two-factor authentication, a code has been sent to your email.",
    });
  } catch (error) {
    console.error("Error resending 2FA code:", error);
    return reply.code(500).send({ message: "Failed to resend code" });
  }
}

export async function logoutHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    let decoded: { userId: string } | null = null;
    let token: string | undefined;

    // try to get token from auth header first
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "");
      try {
        decoded = (await request.jwtVerify()) as { userId: string };
      } catch (err) {
        // toke from header is invalid, continue to try cookie
      }
    }

    // if no valid token from header, try cookie
    if (!decoded) {
      const cookieToken = request.cookies.authToken;
      if (cookieToken) {
        try {
          decoded = request.server.jwt.verify(cookieToken) as {
            userId: string;
          };
          token = cookieToken;
        } catch (err) {
          // cookie token is also invalid
        }
      }
    }

    if (decoded && token) {
      // delete session from database
      await prisma.session.deleteMany({
        where: { token, userId: decoded.userId },
      });

      // Set user as offline
      await updateUserOnlineStatus(decoded.userId, false);
    }

    // clear the auth cookie
    reply.clearCookie("authToken", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return { message: "Logout successful" };
  } catch (err) {
    // clear cookie even if there is an error
    reply.clearCookie("authToken", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return reply.code(200).send({ message: "Logout completed" });
  }
}

export async function verifyTokenHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const decoded = (await request.jwtVerify()) as JWTPayload;
    const token = request.headers.authorization?.replace("Bearer ", "");

    if (token) {
      const session = await prisma.session.findFirst({
        where: { token, userId: decoded.userId },
      });

      if (!session || session.expiresAt < new Date()) {
        return reply.code(401).send({ error: "Invalid or expired token" });
      }

      // obtain updated info from user
      const user = await getUserByEmail(decoded.email);
      if (!user) {
        return reply.code(401).send({ error: "User not found" });
      }

      return {
        valid: true,
        userId: user.id,
        username: user.username,
        firstname: user.firstname,
        email: user.email,
        avatarUrl: user.avatarUrl || "/assets/img/avatar.jpg",
        is2faEnabled: user.is2faEnabled,
        isOAuthUser: user.isOAuthUser,
      };
    }

    return reply.code(401).send({ error: "No token provided" });
  } catch (error) {
    return handleAuthError(error, reply);
  }
}
