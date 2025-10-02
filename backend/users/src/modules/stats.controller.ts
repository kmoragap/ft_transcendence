import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../utils/prisma";
import { isValidCuid } from "./users.controller";

export const getUserStats = async (
  request: FastifyRequest<{ Params: { id: string } }>, // Changed from number to string
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    // Validate ID format
    if (!isValidCuid(id)) {
      return reply.status(400).send({ error: "Invalid user ID format" });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        gamesPlayed: true,
        wins: true,
        losses: true,
        elo: true,
      },
    });

    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    const winRate =
      user.gamesPlayed > 0 ? (user.wins / user.gamesPlayed) * 100 : 0;

    return reply.send({
      ...user,
      winRate: Math.round(winRate * 100) / 100,
    });
  } catch (error) {
    return reply.status(500).send({ error: "Failed to get user stats" });
  }
};

export const updateUserStats = async (
  request: FastifyRequest<{
    Params: { id: string }; // Changed from number to string
    Body: {
      isWinner: boolean;
      userScore: number;
      gameId: string;
      opponentId?: string;
      eloChange: number;
    };
  }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const { isWinner, userScore, gameId, opponentId, eloChange } = request.body;

    // Validate IDs
    if (!isValidCuid(id)) {
      return reply.status(400).send({ error: "Invalid user ID format" });
    }
    if (!isValidCuid(gameId)) {
      return reply.status(400).send({ error: "Invalid game ID format" });
    }
    if (opponentId && !isValidCuid(opponentId)) {
      return reply.status(400).send({ error: "Invalid opponent ID format" });
    }

    // update users stats
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        gamesPlayed: { increment: 1 },
        wins: isWinner ? { increment: 1 } : undefined,
        elo: { increment: eloChange },
      },
    });

    // register the history
    await prisma.userGameHistory.create({
      data: {
        userId: id,
        gameId,
        isWinner,
        userScore,
        opponentId,
        eloChange,
      },
    });

    return reply.send({ message: "Stats updated successfully" });
  } catch (error) {
    return reply.status(500).send({ error: "Failed to update user stats" });
  }
};

export async function updateOnlineStatusHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user?.id;
  if (!userId) return reply.code(401).send({ error: "Unauthorized" });

  const { isOnline } = request.body as { isOnline: boolean };

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isOnline },
    });

    return reply.send({
      message: "Online status updated successfully",
      isOnline,
    });
  } catch (error: any) {
    console.error("Error updating online status:", error);
    return reply.code(500).send({ error: "Failed to update online status" });
  }
}

export async function updateOnlineStatusByIdHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { userId } = request.params as { userId: string };
  const { isOnline } = request.body as { isOnline: boolean };

  if (!isValidCuid(userId)) {
    return reply.code(400).send({ error: "Invalid user ID format" });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isOnline },
    });

    return reply.send({
      message: "Online status updated successfully",
      isOnline,
    });
  } catch (error: any) {
    console.error("Error updating online status:", error);
    return reply.code(500).send({ error: "Failed to update online status" });
  }
}
