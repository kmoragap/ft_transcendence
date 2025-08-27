import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../utils/prisma';

interface CreateGameBody {
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  maxScore?: number;
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
    const { player1Id, player2Id, player1Name, player2Name, maxScore = 3 } = request.body;
    
    const game = await prisma.game.create({
      data: {
        player1Id,
        player2Id,
        player1Name,
        player2Name,
        maxScore,
      }
    });
    
    return reply.status(201).send(game);
  } catch (error) {
    return reply.status(500).send({ error: 'Failed to create game' });
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
      data: { score1, score2, updatedAt: new Date() }
    });
    
    return reply.send(game);
  } catch (error) {
    return reply.status(500).send({ error: 'Failed to update score' });
  }
};

export const finishGame = async (
  request: FastifyRequest<{ Params: { id: string }; Body: FinishGameBody }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const { score1, score2, winnerId } = request.body;
    
    const game = await prisma.game.update({
      where: { id },
      data: {
        score1,
        score2,
        winnerId,
        status: 'FINISHED',
        updatedAt: new Date()
      }
    });
    
    return reply.send(game);
  } catch (error) {
    return reply.status(500).send({ error: 'Failed to finish game' });
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
      return reply.status(404).send({ error: 'Game not found' });
    }
    
    return reply.send(game);
  } catch (error) {
    return reply.status(500).send({ error: 'Failed to get game' });
  }
};