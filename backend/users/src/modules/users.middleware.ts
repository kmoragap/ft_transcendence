import { FastifyRequest, FastifyReply } from "fastify";
import { ZodType, ZodError } from "zod";
import prisma from "../utils/prisma";

export async function authenticateToken(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    let token = request.headers.authorization?.replace("Bearer ", "");

    // If no Bearer token, try to get token from cookies (for OAuth users)
    if (!token) {
      token = request.cookies?.authToken;
    }

    if (!token) {
      return reply.code(401).send({ error: "No token provided" });
    }

    // step 1:check token with the auth service
    const response = await fetch("http://auth:3000/api/auth/verify", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return reply.code(401).send({ error: "Invalid token" });
    }

    const authData = await response.json();
    // step 2: use the ID to fetch the full user from this services db
    const user = await prisma.user.findUnique({
      where: {
        id: authData.userId,
      },
    });

    if (!user) {
      // This case is important: the user exists in auth but not here.
      return reply.code(404).send({ error: "User not found" });
    }
    request.user = user;
  } catch (error) {
    console.error("Token verification failed:", error);
    return reply.code(401).send({ error: "Token verification failed" });
  }
}
export function validateBody<T>(schema: ZodType<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validatedData = schema.parse(request.body);
      request.body = validatedData;
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return reply.code(400).send({
          error: "Validation failed",
          details: errorMessages,
        });
      }

      return reply.code(500).send({
        error: "Internal validation error",
      });
    }
  };
}

export function validateParams<T>(schema: ZodType<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validatedData = schema.parse(request.params);
      request.params = validatedData;
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return reply.code(400).send({
          error: "Validation failed",
          details: errorMessages,
        });
      }

      return reply.code(500).send({
        error: "Internal validation error",
      });
    }
  };
}

export function validateQuery<T>(schema: ZodType<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validatedData = schema.parse(request.query);
      request.query = validatedData;
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return reply.code(400).send({
          error: "Validation failed",
          details: errorMessages,
        });
      }

      return reply.code(500).send({
        error: "Internal validation error",
      });
    }
  };
}
