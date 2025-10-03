export const USERS_SERVICE_URL =
  process.env.USERS_SERVICE_URL || "http://users:3000/api";

// this interface of the type of data that we are sending and need to match with the one that is in the users
interface StatsPayload {
  userId: string;
  gameId: string;
  isWinner: boolean;
  userScore: number;
  opponentName: string;
  opponentScore?: number;
  opponentId?: string;
}

//notify to user service the result of a match, it doesnt wait for a response (fire-and-forget)
export function notifyGameResult(userId: string, payload: StatsPayload): void {
  const url = `${USERS_SERVICE_URL}/users/${userId}/stats`;

  fetch(url, {
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
}
