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
    if (!user) {
      throw new Error("User not found");
    }

    // check if opponent is AI or guest
    const isAIOpponent = data.opponentId === "";

    let newElo = user.elo;
    let eloChange = 0;
    //a lot to say here so if u want to learn: https://www.geeksforgeeks.org/dsa/elo-rating-algorithm/
    // we only calculate elo if playing against a real user
    if (!isAIOpponent) {
      const opponent = await tx.user.findUnique({
        where: { id: data.opponentId },
      });

      if (opponent) {
        const expectedScore =
          1 / (1 + Math.pow(10, (opponent.elo - user.elo) / 400));
        const actualScore = data.isWinner ? 1 : 0;
        newElo = Math.round(
          user.elo + ELO_K_FACTOR * (actualScore - expectedScore)
        );
        eloChange = newElo - user.elo;
      }
    } else {
      // against ai/guest: smaller ELO changes
      const smallEloChange = data.isWinner ? 5 : -3;
      newElo = user.elo + smallEloChange;
      eloChange = smallEloChange;
    }

    // 1. update user stats
    await tx.user.update({
      where: { id: userId },
      data: {
        gamesPlayed: { increment: 1 },
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
        opponentId: isAIOpponent ? null : data.opponentId,
        isWinner: data.isWinner,
        userScore: data.userScore,
        opponentScore: data.opponentScore ?? 0,
        eloChange: eloChange,
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
