import { FastifyInstance } from "fastify";
import { createGame, getGame } from "./pong.controller";

export default async function pongRoutes(fastify: FastifyInstance) {
  // create a new game
  fastify.post("/games", createGame);
  // obtain game by id
  fastify.get("/games/:id", getGame);
}
