import fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import fastifyStatic from "@fastify/static";
import cookie from "@fastify/cookie";
import path from "node:path";
import userRoutes from "../modules/users.routes";

const COOKIE_SECRET = process.env.COOKIE_SECRET;
if (!COOKIE_SECRET) {
  throw new Error("Missing required environment variable: COOKIE_SECRET");
}

export async function buildServer(): Promise<FastifyInstance> {
  const server = fastify({
    logger: {
      transport: {
        target: "pino-pretty",
        options: {
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      },
    },
    ajv: {
      customOptions: {
        formats: {
          cuid: /^c[a-z0-9]{24}$/,
        },
      },
    },
  }).withTypeProvider<TypeBoxTypeProvider>();
  // Cookie support
  server.register(cookie, {
    secret: COOKIE_SECRET,
    parseOptions: {},
  });

  // CORS
  server.register(cors, {
    origin: process.env.ALLOWED_ORIGINS,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  // Multipart for file uploads
  server.register(multipart, {
    limits: { fileSize: 2 * 1024 * 1024, files: 1 }, // 2MB limit, 1 file
  });

  // Static file serving for uploads
  const uploadsRoot = path.resolve(process.cwd(), "uploads");
  server.register(fastifyStatic, {
    root: uploadsRoot,
    prefix: "/uploads/",
    decorateReply: false,
  });

  // --- Route Registration ---
  server.register(userRoutes, { prefix: "/api/users" });

  // Health check route
  server.get("/", async () => ({ message: "Users service is up!" }));

  return server;
}
