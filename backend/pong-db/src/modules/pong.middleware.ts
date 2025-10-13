import { FastifyRequest, FastifyReply } from "fastify";
import { ZodType, ZodError } from "zod";

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

export async function requireApiKey(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const apiKey = request.headers['x-api-key'];

  if (!apiKey) {
    return reply.status(400).send({ error: 'x-API-key header is required' });
  }

  // Optionally, check if the API key matches a valid key
  const VALID_API_KEY = process.env.API_KEY || 'my-secret-key';
  if (apiKey !== VALID_API_KEY) {
    return reply.status(401).send({ error: 'Invalid API key' });
  }
}


