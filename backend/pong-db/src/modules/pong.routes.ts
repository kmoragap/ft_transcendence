import { FastifyInstance } from "fastify";
import { createGame, getGame, getGames, getLeaderboard } from "./pong.controller";

export default async function pongRoutes(fastify: FastifyInstance) {
  // create a new game
  fastify.post("/games", createGame);
  // obtain game by id
  fastify.get("/games/:id", getGame);
  // get games list (for dashboard)
  fastify.get("/games", getGames);
  // get leaderboard (for dashboard)
  fastify.get("/leaderboard", getLeaderboard);
}
