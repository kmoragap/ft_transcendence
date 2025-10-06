import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../utils/prisma";
import {
  notifyGameResult,
  notifyGameHistory,
  isPlayerReal,
  didPlayerWin,
  notifyUser,
  calculateElo,
} from "./pong.service";

export interface gameInfo {
  status: "IN_PROGRESS" | "FINISHED" | "CANCELLED";
  //player1
  player1Id: string;
  player1Name: string;
  score1: number;
  //player2
  player2Id: string;
  player2Name: string;
  score2: number;

  //game settings
  maxScore: number;
  multiBall: boolean;
  mode: string;
  isTournament: boolean;
  tournamentId?: string;
  tournamentRound?: number;
  tournamentMatch?: number;
  //winner
  winnerId: string;
  finishedAt?: Date;
}
export const updateTournamentStatus = async (
  request: FastifyRequest<{
    Params: { id: string };
    Body: { status: "IN_PROGRESS" | "FINISHED" | "CANCELLED" };
  }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const { status } = request.body;

    const tournament = await prisma.tournament.update({
      where: { id },
      data: { status },
    });

    return reply.send(tournament);
  } catch (error) {
    console.error("Error updating tournament status:", error);
    return reply
      .status(500)
      .send({ error: "Failed to update tournament status" });
  }
};

export const createGame = async (
  request: FastifyRequest<{ Body: { data: gameInfo } }>,
  reply: FastifyReply
) => {
  try {
    const { data: game } = request.body;
    const newGame = await prisma.game.create({
      data: {
        status: game.status,
        player1Id: game.player1Id,
        player1Name: game.player1Name,
        score1: game.score1,
        player2Id: game.player2Id,
        player2Name: game.player2Name,
        score2: game.score2,
        maxScore: game.maxScore,
        multiBall: game.multiBall,
        mode: game.mode,
        isTournament: game.isTournament,
        tournamentId: game.tournamentId,
        tournamentRound: game.tournamentRound,
        tournamentMatch: game.tournamentMatch,
        winnerId: game.winnerId,
        finishedAt: game.status === "FINISHED" ? new Date() : undefined,
      },
    });

    if (isPlayerReal(game.player1Id)) {
      const { newElo, eloChange } = await calculateElo(
        newGame.player1Id,
        newGame.player2Id,
        didPlayerWin(game, 1)
      );
      await notifyGameResult(newGame.player1Id, {
        gameId: newGame.id,
        userId: newGame.player1Id,
        isWinner: didPlayerWin(game, 1),
        eloChange: eloChange,
      });
      await notifyGameHistory(newGame.player1Id, {
        gameId: newGame.id,
        userId: newGame.player1Id,
        isWinner: didPlayerWin(game, 1),
        eloChange: eloChange,
      });
    }

    if (isPlayerReal(game.player2Id)) {
      const { newElo, eloChange } = await calculateElo(
        newGame.player2Id,
        newGame.player1Id,
        didPlayerWin(game, 2)
      );
      await notifyGameResult(newGame.player2Id, {
        gameId: newGame.id,
        userId: newGame.player2Id,
        isWinner: didPlayerWin(game, 2),
        eloChange: eloChange,
      });
      await notifyGameHistory(newGame.player2Id, {
        gameId: newGame.id,
        userId: newGame.player2Id,
        isWinner: didPlayerWin(game, 2),
        eloChange: eloChange,
      });
    }

    return reply.status(201).send(newGame);
  } catch (error) {
    console.error("Error creating game:", error);
    return reply.status(500).send({ error: "Failed to create game" });
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

export const getElo = async (
  request: FastifyRequest<{
    Params: { id: string };
    Body: { userId: string; opponentId: string; isWinner: boolean };
  }>,
  reply: FastifyReply
) => {
  try {
    const { userId, opponentId, isWinner } = request.body;
    const elo = await calculateElo(userId, opponentId, isWinner);
    return reply.send({ elo });
  } catch (error) {
    return reply.status(500).send({ error: "Failed to get elo" });
  }
};

// Dashboard endpoints
export const getGames = async (
  request: FastifyRequest<{ Querystring: { take?: string } }>,
  reply: FastifyReply
) => {
  try {
    const take = request.query.take ? parseInt(request.query.take) : 5;

    const games = await prisma.game.findMany({
      where: { status: "FINISHED" },
      orderBy: { finishedAt: "desc" }, // Using finishedAt from the actual schema
      take: Math.min(take, 100), // Limit to 100 games max
    });

    // Transform database fields to dashboard format
    const transformedGames = games.map(game => ({
      id: game.id,
      player1Name: game.player1Name,
      player2Name: game.player2Name,
      score1: game.score1,
      score2: game.score2,
      maxScore: game.maxScore,
      winnerId: game.winnerId,
      isTournament: game.isTournament,
      createdAt: game.finishedAt.toISOString(),
    }));

    return reply.send(transformedGames);
  } catch (error) {
    console.error("Error fetching games:", error);
    return reply.status(500).send({ error: "Failed to fetch games" });
  }
};

export const getLeaderboard = async (
  request: FastifyRequest<{ Querystring: { limit?: string } }>,
  reply: FastifyReply
) => {
  try {
    const limit = request.query.limit ? parseInt(request.query.limit) : 5;

    const games = await prisma.game.findMany({
      where: {
        status: "FINISHED",
        winnerId: { not: "" },
      },
      select: {
        winnerId: true,
        player1Id: true,
        player1Name: true,
        player2Id: true,
        player2Name: true,
      },
    });

    // Count wins per player
    const winCounts = new Map<
      string,
      { playerId: string | null; name: string; wins: number }
    >();

    games.forEach(game => {
      if (game.winnerId) {
        const existing = winCounts.get(game.winnerId);
        if (existing) {
          existing.wins++;
        } else {
          const isPlayer1Winner = game.winnerId === game.player1Id;
          const winnerName = isPlayer1Winner
            ? game.player1Name
            : game.player2Name;

          winCounts.set(game.winnerId, {
            playerId: game.winnerId,
            name: winnerName,
            wins: 1,
          });
        }
      }
    });

    // Convert to array and sort by wins (descending)
    const leaderboard = Array.from(winCounts.values())
      .sort((a, b) => b.wins - a.wins)
      .slice(0, Math.min(limit, 100));

    return reply.send(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return reply.status(500).send({ error: "Failed to fetch leaderboard" });
  }
};
