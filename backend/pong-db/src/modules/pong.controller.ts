import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../utils/prisma";
import { Oponent } from "@prisma/client"; // Agregar import si no está
import { notifyGameResult, USERS_SERVICE_URL } from "../services/usersApi";

interface CreateGameBody {
  player1Id: string;
  player2Id: string;
  maxScore?: number;
  gameType: Oponent;
}

interface UpdateScoreBody {
  score1: number;
  score2: number;
}

interface FinishGameBody {
  userId: string;
  gameId: string;
  isWinner: boolean;
  userScore: number;
  opponentName: string;
  opponentScore?: number;
  opponentId: string;
}

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
  request: FastifyRequest<{ Params: { id: string }; Body: FinishGameBody }>,
  reply: FastifyReply
) => {
  try {
    // notify user service about game results for both players
    const { id } = request.params;
    const game: FinishGameBody = request.body;
    let isPlayer1Real = true;
    let isPlayer2Real = true;
    let losserId;

    // dont notify ai opponents or guests
    if (game.opponentName === "Roger Fed-error" && game.opponentId === "") {
      isPlayer2Real = false;
      losserId = "AI-Roger-Federror";
    }

    if (isPlayer1Real) {
      await notifyGameResult(game.userId, {
        userId: game.userId,
        gameId: game.gameId,
        isWinner: game.isWinner,
        userScore: game.userScore,
        opponentName: game.opponentName,
        opponentScore: game.opponentScore,
        opponentId: game.opponentId,
      });
    }

    if (isPlayer2Real) {
      await notifyGameResult(game.opponentId, {
        userId: game.opponentId,
        gameId: game.gameId,
        isWinner: game.isWinner ? false : true,
        userScore: game.userScore,
        opponentName: game.opponentName,
        opponentScore: game.opponentScore,
        opponentId: game.opponentId,
      });
    }

    return reply.send(game);
  } catch (error) {
    console.error("Error finishing game:", error);
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
