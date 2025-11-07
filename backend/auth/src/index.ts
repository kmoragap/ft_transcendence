import fastify from "fastify";
import jwt from "@fastify/jwt";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import authRoutes from "./modules/auth.routes";
import prisma from "./utils/prisma";

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_SECRET = process.env.COOKIE_SECRET;
if (!JWT_SECRET || !COOKIE_SECRET) {
  throw new Error(
    "Missing required environment variables: JWT_SECRET or COOKIE_SECRET",
  );
}
const server = fastify({ logger: true });
server.register(cookie, {
  secret: COOKIE_SECRET,
  parseOptions: {},
});
server.register(cors, {
  origin: process.env.ALLOWED_ORIGINS,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

server.register(jwt, {
  secret: JWT_SECRET,
});

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: any, reply: any) => Promise<void>;
  }
}

server.decorate("authenticate", async function (request, reply) {
  try {
    // first we try to get token from auth header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const decoded = await request.jwtVerify();
      request.user = decoded;
      return;
    }

    // if no auth header, we try to get token from cookie
    const cookieToken = request.cookies.authToken;
    if (cookieToken) {
      try {
        const decoded = server.jwt.verify(cookieToken);
        request.user = decoded;
        return;
      } catch (cookieErr) {
        console.error("Cookie token verification failed:", cookieErr);
      }
    }

    // no valid token found
    return reply.code(401).send({ error: "No authentication token provided" });
  } catch (err) {
    console.error("Authentication failed:", err);
    return reply.code(401).send({ error: "Authentication failed" });
  }
});

server.register(authRoutes, { prefix: "/api/auth" });

server.get("/", async (request, reply) => {
  return { message: "Auth service is up!" } as const;
});

const start = async () => {
  try {
    await server.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
