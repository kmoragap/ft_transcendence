import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../utils/prisma";
import { Oponent } from "@prisma/client"; // Agregar import si no está
import { notifyGameResult } from "../services/usersApi";
interface CreateGameBody {
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  maxScore?: number;
  gameType: Oponent;
}

interface UpdateScoreBody {
  score1: number;
  score2: number;
}

interface FinishGameBody {
  score1: number;
  score2: number;
  winnerId: string;
}

export const createGame = async (
  request: FastifyRequest<{ Body: CreateGameBody }>,
  reply: FastifyReply
) => {
  try {
    const {
      player1Id,
      player2Id,
      player1Name,
      player2Name,
      maxScore = 3,
      gameType = Oponent.VS_HUMAN,
    } = request.body;
    const finalPlayer2Id =
      gameType === Oponent.VS_AI ? "ai_opponent" : player2Id;
    const finalPlayer2Name =
      gameType === Oponent.VS_AI ? "IA_OPPONENT" : player2Name; //TODO: check this bc could be that an user take the same name

    const game = await prisma.game.create({
      data: {
        player1Id,
        player2Id: finalPlayer2Id,
        player1Name,
        player2Name: finalPlayer2Name,
        maxScore,
        gameType,
      },
    });

    return reply.status(201).send(game);
  } catch (error) {
    return reply.status(500).send({ error: "Failed to create game" });
  }
};

export const updateScore = async (
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateScoreBody }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const { score1, score2 } = request.body;

    const game = await prisma.game.update({
      where: { id },
      data: { score1, score2, updatedAt: new Date() },
    });

    return reply.send(game);
  } catch (error) {
    return reply.status(500).send({ error: "Failed to update score" });
  }
};

export const finishGame = async (
  request: FastifyRequest<{
    Params: { id: string };
    Body: { score1: number; score2: number; winnerId: string };
  }>,
  reply: FastifyReply
) => {
  try {
    const game = await prisma.game.update({
      where: { id: request.params.id },
      data: {
        score1: request.body.score1,
        score2: request.body.score2,
        winnerId: request.body.winnerId,
        status: "FINISHED",
        updatedAt: new Date(),
      },
    });

    if (game.gameType === "VS_HUMAN" && game.player1Id && game.player2Id) {
      const {
        player1Id,
        player2Id,
        id: gameId,
        score1,
        score2,
        winnerId,
      } = game;

      // notify result to player1
      notifyGameResult(player1Id, {
        gameId,
        isWinner: winnerId === player1Id,
        score: score1,
        opponentId: player2Id,
      });

      // notify result to player2
      notifyGameResult(player2Id, {
        gameId,
        isWinner: winnerId === player2Id,
        score: score2,
        opponentId: player1Id,
      });
    }

    return reply.send(game);
  } catch (error) {
    console.error(`Error finishing game ${request.params.id}:`, error);
    return reply.status(500).send({ error: "Failed to finish game" });
  }
};

export const getGame = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const game = await prisma.game.findUnique({ where: { id } });

    if (!game) {
      return reply.status(404).send({ error: "Game not found" });
    }

    return reply.send(game);
  } catch (error) {
    return reply.status(500).send({ error: "Failed to get game" });
  }
};

export const listLatestGames = async (
  request: FastifyRequest<{ Querystring: { take?: string } }>,
  reply: FastifyReply
) => {
  try {
    const takeNum = Math.min(
      Math.max(parseInt(request.query.take ?? "5", 10) || 5, 1),
      50
    );

    const games = await prisma.game.findMany({
      where: { status: "FINISHED" },
      orderBy: { createdAt: "desc" },
      take: takeNum,
      select: {
        id: true,
        player1Id: true,
        player2Id: true,
        player1Name: true,
        player2Name: true,
        score1: true,
        score2: true,
        maxScore: true,
        winnerId: true,
        gameType: true,
        createdAt: true,
      },
    });

    return reply.send(games);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: "Failed to list latest games" });
  }
};

export const leaderboard = async (
  request: FastifyRequest<{ Querystring: { limit?: string } }>,
  reply: FastifyReply
) => {
  try {
    const limit = Math.min(
      Math.max(parseInt(request.query.limit ?? "5", 10) || 5, 1),
      50
    );

    const grouped = await prisma.game.groupBy({
      by: ["winnerId"],
      where: { status: "FINISHED", NOT: { winnerId: null } },
      _count: { winnerId: true },
      orderBy: { _count: { winnerId: "desc" } },
      take: limit,
    });

    const results = [];
    for (const g of grouped) {
      const lastGame = await prisma.game.findFirst({
        where: {
          status: "FINISHED",
          OR: [{ player1Id: g.winnerId! }, { player2Id: g.winnerId! }],
        },
        orderBy: { createdAt: "desc" },
        select: {
          player1Id: true,
          player2Id: true,
          player1Name: true,
          player2Name: true,
        },
      });

      let displayName = g.winnerId; // fallback
      if (lastGame) {
        if (lastGame.player1Id === g.winnerId)
          displayName = lastGame.player1Name;
        if (lastGame.player2Id === g.winnerId)
          displayName = lastGame.player2Name;
      }

      results.push({
        playerId: g.winnerId,
        name: displayName,
        wins: g._count.winnerId,
      });
    }

    return reply.send(results);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: "Failed to build leaderboard" });
  }
};
