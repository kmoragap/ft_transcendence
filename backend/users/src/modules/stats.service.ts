import prisma from "../utils/prisma";
import { UpdateStatsBody } from "./stats.schema";

const ELO_K_FACTOR = 32;

/**
 * here we update the user stats and history as a whole with the prisma transaction
 * the idea is simple: if one of the read/write operations fails or succeed, it fails
 * or succeed as a whole. with that we can prevent the case of just one been updated, etc ,etc.
 */
export async function updateUserStatsAndHistory(
  userId: string,
  data: UpdateStatsBody
): Promise<void> {
  await prisma.$transaction(async tx => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    const opponent = await tx.user.findUnique({
      where: { id: data.opponentId },
    });

    if (!user || !opponent) {
      throw new Error("User or opponent not found");
    }

    //a lot to say here so if u want to learn: https://www.geeksforgeeks.org/dsa/elo-rating-algorithm/
    const expectedScore =
      1 / (1 + Math.pow(10, (opponent.elo - user.elo) / 400));
    const actualScore = data.isWinner ? 1 : 0;
    const newElo = Math.round(
      user.elo + ELO_K_FACTOR * (actualScore - expectedScore)
    );

    // 1. update user
    await tx.user.update({
      where: { id: userId },
      data: {
        wins: { increment: data.isWinner ? 1 : 0 },
        losses: { increment: data.isWinner ? 0 : 1 },
        elo: newElo,
      },
    });

    // 2. create the entry in the game history
    await tx.userGameHistory.create({
      data: {
        userId: userId,
        gameId: data.gameId,
        opponentId: data.opponentId,
        isWinner: data.isWinner,
        userScore: data.score,
        eloChange: newElo,
      },
    });
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
