import { FastifyInstance } from "fastify";
import {
  createGame,
  getGame,
  getGames,
  getLeaderboard,
  getUserGames,
  updateTournamentStatus,
  updateUsernameInGames,
} from "./pong.controller";
import { validateBody, validateParams, validateQuery } from "./pong.middleware";
import { gameSchemas } from "./pong.schemas";
import { getTournament, createTournament } from "./tournament.controller";

export default async function pongRoutes(fastify: FastifyInstance) {
  // create a new game
  fastify.post(
    "/games",
    { preHandler: validateBody(gameSchemas.create) },
    createGame,
  );
  // obtain game by id
  fastify.get(
    "/games/:id",
    { preHandler: validateParams(gameSchemas.gameIdParam) },
    getGame,
  );
  // get games list (for dashboard)
  fastify.get(
    "/games",
    { preHandler: validateQuery(gameSchemas.getGames) },
    getGames,
  );
  // get user's games (for dashboard)
  fastify.get(
    "/user-games",
    { preHandler: validateQuery(gameSchemas.getUserGames) },
    getUserGames,
  );
  // get leaderboard (for dashboard)
  fastify.patch("/update-username", updateUsernameInGames);
  fastify.get(
    "/leaderboard",
    { preHandler: validateQuery(gameSchemas.getLeaderboard) },
    getLeaderboard,
  );

  //tournament routes
  fastify.post("/tournaments", createTournament);
  fastify.get("/tournaments/:id", getTournament);
  fastify.patch(
    "/tournaments/:id/status",
    {
      preHandler: [
        validateParams(gameSchemas.tournamentIdParam),
        validateBody(gameSchemas.updateTournamentStatus),
      ],
    },
    updateTournamentStatus,
  );
}
