// src/modules/auth.controller.ts

import { FastifyReply, FastifyRequest } from "fastify";
import * as bcrypt from "bcrypt";
import prisma from "../utils/prisma";


//TODO: everthing should be rewrite with zod to make some check before creating or saving the data
// Helpers to fetch from users service
export async function getUserByEmail(email: string) {
  try {
    const res = await fetch(
      `http://users:3000/api/users/by-email/${encodeURIComponent(email)}`
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
      `http://users:3000/api/users/by-username/${encodeURIComponent(username)}`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Error fetching user by username:", err);
    return null;
  }
}

// Create a new user in users service
async function createUser(
  username: string,
  email: string,
  firstname: string,
  password: string
) {
  try {
    const res = await fetch(`http://users:3000/api/users/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, firstname, password }),
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

// Registration handler
export async function registerHandler(request: FastifyRequest, reply: FastifyReply) {
    const { username, email, firstname, password } = request.body as {
        username: string;
        email: string;
        firstname: string;
        password: string;
    };

    try {
        // 1.create the users in the users services
        const user = await createUser(username, email, firstname, password);

        // 2.generate the jwt
        const token = request.server.jwt.sign(
            {
                userId: user.id, // now string instead of number
                email: email
            },
            { expiresIn: '24h' }
        );

        // 3.save the session
        await prisma.session.create({
            data: {
                userId: user.id, // now string
                token,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });

        return {
            message: 'Registration successful',
            token,
            user: { id: user.id, username: user.username, firstname: user.firstname, email: email }
        };
    } catch (error: any) {
        console.error('Error during registration:', error);
        return reply.code(400).send({ message: error.message || 'Registration failed' });
    }
}

export async function loginHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = request.body as Record<string, any>;
  const password = String(body.password || "");
  const identifier: string | undefined =
    typeof body.username === "string"
      ? body.username
      : typeof body.email === "string"
      ? body.email
      : typeof body.identifier === "string"
      ? body.identifier
      : undefined;

  if (!identifier) {
    return reply
      .code(400)
      .send({ message: "Must provide email or username" });
  }

  try {
    const user =
      identifier.includes("@")
        ? await getUserByEmail(identifier)
        : await getUserByUsername(identifier);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }

    const token = request.server.jwt.sign(
      { userId: user.id, email: user.email },
      { expiresIn: "24h" }
    );

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return {
      message: "Login successful",
      token,
      username: user.username,
      firstname: user.firstname,
      email: user.email,
      avatarUrl: user.avatarUrl || '/assets/img/avatar.jpg',
    };
  } catch (err) {
    console.error("Error during login:", err);
    return reply.code(500).send({ message: "Login failed" });
  }
}

export async function logoutHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const decoded = (await request.jwtVerify()) as { userId: string };
    const token = request.headers.authorization?.replace("Bearer ", "");
    if (token) {
      await prisma.session.deleteMany({
        where: { token, userId: decoded.userId },
      });
    }
    return { message: "Logout successful" };
  } catch (err) {
    return reply.code(401).send({ message: "Invalid token" });
  }
}

export async function verifyTokenHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const decoded = await request.jwtVerify() as { userId: string, email: string }; // string instead of number
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const session = await prisma.session.findFirst({
        where: { token, userId: decoded.userId }
      });

      if (!session || session.expiresAt < new Date()) {
        return reply.code(401).send({ error: 'Invalid or expired token' });
      }

      // obtain updated info from user
      const user = await getUserByEmail(decoded.email);
      if (!user) {
        return reply.code(401).send({ error: 'User not found' });
      }

      return {
        valid: true,
        username: user.username,
        firstname: user.firstname,
        email: user.email,
        avatarUrl: user.avatarUrl || '/assets/img/avatar.jpg',
      };
    }

    return reply.code(401).send({ error: 'No token provided' });
  } catch (error) {
    console.error('Error verifying token:', error);
    return reply.code(401).send({ error: 'Invalid token' });
  }
}
