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
