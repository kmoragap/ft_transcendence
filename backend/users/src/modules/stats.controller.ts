import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../utils/prisma";
import { isValidCuid } from "./users.controller";
import {
  updateUserStatsAndHistory,
  getMatchHistory,
  getUserStats,
} from "./stats.service";
import { UpdateStatsBody } from "./stats.schema";

//handls fetching a user'S match history
export async function getMatchHistoryHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as { id: string };
    const history = await getMatchHistory(id);
    return reply.send(history);
  } catch (error) {
    console.error(`Failed to fetch match history:`, error);
    return reply
      .code(500)
      .send({ error: "Internal server error while fetching match history" });
  }
}

//handles updating a user's stats after a game
export async function updateUserStatsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as { id: string };
    await updateUserStatsAndHistory(id, request.body as UpdateStatsBody);
    return reply.code(204).send();
  } catch (error) {
    console.error(`Failed to update stats:`, error);
    return reply
      .code(500)
      .send({ error: "Internal server error while updating stats" });
  }
}

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

//handls fetching a user's game stats
export async function getUserStatsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as { id: string };
    const stats = await getUserStats(id);

    if (!stats) {
      return reply.code(404).send({ error: "User not found" });
    }

    return reply.send(stats);
  } catch (error) {
    console.error(`Failed to get user stats:`, error);
    return reply.code(500).send({ error: "Failed to get user stats" });
  }
}
