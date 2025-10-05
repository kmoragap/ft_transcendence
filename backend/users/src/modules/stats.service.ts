import { Void } from "@fastify/type-provider-typebox";
import prisma from "../utils/prisma";
import { UpdateStatsBody } from "./stats.schema";

/**
 * here we update the user stats and history as a whole with the prisma transaction
 * the idea is simple: if one of the read/write operations fails or succeed, it fails
 * or succeed as a whole. with that we can prevent the case of just one been updated, etc ,etc.
 */

export async function updateUserStats(
  userId: string,
  data: UpdateStatsBody
): Promise<void> {
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { elo: true },
  });

  if (!currentUser) {
    throw new Error("User not found");
  }

  const newElo = currentUser.elo + data.eloChange;

  await prisma.user.update({
    where: { id: userId },
    data: {
      gamesPlayed: { increment: 1 },
      wins: { increment: data.isWinner ? 1 : 0 },
      losses: { increment: data.isWinner ? 0 : 1 },
      elo: newElo,
    },
  });
}

export async function updateUserHistory(
  userId: string,
  data: UpdateStatsBody
): Promise<void> {
  await prisma.userGameHistory.upsert({
    where: {
      userId_gameId: {
        userId,
        gameId: data.gameId,
      },
    },
    create: {
      userId,
      gameId: data.gameId,
      isWinner: data.isWinner,
      eloChange: data.eloChange,
    },
    update: {
      isWinner: data.isWinner,
      eloChange: data.eloChange,
    },
  });
}

// obtain the match history of an user
export async function getMatchHistory(userId: string) {
  return prisma.userGameHistory.findMany({
    where: { userId },
    orderBy: { playedAt: "desc" },
    take: 20, // limit to 20
  });
}

//get a users core stats and calculates their win rate
export async function getUserStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      wins: true,
      losses: true,
      elo: true,
    },
  });

  if (!user) {
    return null;
  }

  const gamesPlayed = user.wins + user.losses;
  const winRate = gamesPlayed > 0 ? (user.wins / gamesPlayed) * 100 : 0;

  return {
    ...user,
    winRate: Math.round(winRate),
  };
}
