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
  //winner
  winnerId: string;
}

export const createGame = async (
  request: FastifyRequest<{ Body: { data: gameInfo } }>,
  reply: FastifyReply
) => {
  try {
    const { data: game } = request.body;
    const newGame = await prisma.game.create({
      data: {
        status: "FINISHED",
        player1Id: game.player1Id,
        player1Name: game.player1Name,
        score1: game.score1,
        player2Id: game.player2Id,
        player2Name: game.player2Name,
        score2: game.score2,
        maxScore: game.maxScore,
        multiBall: game.multiBall,
        mode: game.mode,
        winnerId: game.winnerId,
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
