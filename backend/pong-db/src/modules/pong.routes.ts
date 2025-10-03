import { FastifyInstance } from "fastify";
import {
  updateScore,
  finishGame,
  getGame,
  leaderboard,
  listLatestGames,
} from "./pong.controller";

export default async function pongRoutes(fastify: FastifyInstance) {
  // create a new game
  // obtain game by id
  fastify.get("/games/:id", getGame);

  // update the score
  fastify.put("/games/:id/score", updateScore);

  // finish game
  fastify.put("/games/:id/finish", finishGame);

  // leaderboard route
  fastify.get("/leaderboard", leaderboard);

  // list latest games
  fastify.get("/games", listLatestGames);
}
