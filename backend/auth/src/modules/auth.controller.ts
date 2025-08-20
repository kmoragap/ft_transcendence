// src/modules/auth.controller.ts

import { FastifyReply, FastifyRequest } from "fastify";
import * as bcrypt from "bcrypt";
import prisma from "../utils/prisma";

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
export async function registerHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { username, email, firstname, password } = request.body as {
    username: string;
    email: string;
    firstname: string;
    password: string;
  };

  try {
    // 1) Create user record in users service
    const user = await createUser(username, email, firstname, password);

    // 2) Sign JWT
    const token = request.server.jwt.sign(
      { userId: user.id, email },
      { expiresIn: "24h" }
    );

    // 3) Record session
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return {
      message: "Registration successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        email,
      },
    };
  } catch (err: any) {
    console.error("Error during registration:", err);
    return reply
      .code(400)
      .send({ message: err.message || "Registration failed" });
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
      user: {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        email: user.email,
      },
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
    const decoded = (await request.jwtVerify()) as { userId: number };
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

export async function verifyTokenHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const decoded = (await request.jwtVerify()) as {
      userId: number;
      email: string;
    };
    const token = request.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return reply.code(401).send({ message: "No token provided" });
    }

    const session = await prisma.session.findFirst({
      where: { token, userId: decoded.userId },
    });
    if (!session || session.expiresAt < new Date()) {
      return reply
        .code(401)
        .send({ message: "Invalid or expired token" });
    }

    // Refresh user data
    const user = await getUserByEmail(decoded.email);
    if (!user) {
      return reply.code(401).send({ message: "User not found" });
    }

    return {
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        email: user.email,
      },
    };
  } catch (err) {
    return reply.code(401).send({ message: "Invalid token" });
  }
}
