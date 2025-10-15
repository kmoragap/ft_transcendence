import fastify from "fastify";
import pongRoutes from "./modules/pong.routes";
import prisma from "./utils/prisma";
import cors from "@fastify/cors";

const server = fastify({ logger: true });

server.register(cors, {
  origin: ["https://10.12.200.27"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
// register the route with the prefix
server.register(pongRoutes, { prefix: "/api/pong" });

server.get("/", async (req, reply) => {
  return { message: "Pong DB service is up!" };
});

const start = async () => {
  try {
    await server.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Pong DB service running on port 3000");
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
