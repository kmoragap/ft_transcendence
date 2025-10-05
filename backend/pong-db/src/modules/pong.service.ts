import { gameInfo } from "./pong.controller";

export const USERS_SERVICE_URL =
  process.env.USERS_SERVICE_URL || "http://users:3000/api";

// this interface of the type of data that we are sending and need to match with the one that is in the users
export interface notifyUser {
  gameId: string;
  userId: string;
  isWinner: boolean;
  eloChange: number;
}

export function isPlayerReal(playerId: string): Boolean {
  if (playerId === "AI-Roger-Federror") {
    return false;
  }

  //TODO: this should check guess_
  if (playerId === "guess_") {
    return false;
  }
  return true;
}

export async function calculateElo(
  userId: string,
  opponentId: string,
  isWinner: boolean
) {
  const user = await fetchUser(userId);
  let newElo = user.elo;

  if (!isPlayerReal(opponentId)) {
    const smallEloChange = isWinner ? 5 : -3;
    newElo = user.elo + smallEloChange;
    const eloChange = newElo - user.elo;
    return { newElo, eloChange };
  }

  const opponent = await fetchUser(opponentId);
  const ELO_K_FACTOR = 32;
  const expectedScore = 1 / (1 + Math.pow(10, (opponent.elo - user.elo) / 400));
  const actualScore = isWinner ? 1 : 0;
  newElo = Math.round(user.elo + ELO_K_FACTOR * (actualScore - expectedScore));
  const eloChange = newElo - user.elo;
  return { newElo, eloChange };
}

export function didPlayerWin(game: gameInfo, playerNumber: 1 | 2): boolean {
  if (playerNumber === 1) {
    return game.score1 > game.score2;
  } else {
    return game.score2 > game.score1;
  }
}

export async function fetchUser(userId: string) {
  const url = `${USERS_SERVICE_URL}/users/${userId}/stats`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Error fetching user stats: ${res.status}`);
  }

  const userData = await res.json();
  return userData;
}
//notify to user service the result of a match, it doesnt wait for a response (fire-and-forget)
export function notifyGameResult(userId: string, payload: notifyUser) {
  const url = `${USERS_SERVICE_URL}/users/${userId}/stats`;

  const res = fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then(response => {
      if (!response.ok) {
        console.error(
          `Error from users service for user ${userId}: Status ${response.status}`
        );
      }
    })
    .catch(error => {
      console.error(`Failed to send game result for user ${userId}:`, error);
    });
  return res;
}

//notify gameHistory
export function notifyGameHistory(userId: string, payload: notifyUser) {
  const url = `${USERS_SERVICE_URL}/users/${userId}/match_history`;

  const res = fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then(response => {
      if (!response.ok) {
        console.error(
          `Error from users service for user ${userId}: Status ${response.status}`
        );
      }
    })
    .catch(error => {
      console.error(`Failed to send game result for user ${userId}:`, error);
    });
  return res;
}
