interface StatsPayload {
  userId: string;
  gameId: string;
  isWinner: boolean;
  userScore: number;
  opponentName: string;
  opponentScore?: number;
  opponentId?: string;
}

class GameService {
  private baseUrl = "/api/pong-db";

  async updateScore(
    userId: string,
    gameId: string,
    isWinner: boolean,
    userScore: number,
    opponentName: string,
    opponentScore?: number,
    opponentId?: string
  ): Promise<boolean> {
    try {
      //TODO: cambiar esto a users pq es redundante
      const response = await fetch(`${this.baseUrl}/games/${gameId}/score`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          gameId,
          isWinner,
          userScore,
          opponentName,
          opponentScore,
          opponentId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Error updating score:", error);
      return false;
    }
  }

  async finishGame(
    userId: string,
    gameId: string,
    isWinner: boolean,
    userScore: number,
    opponentName: string,
    opponentScore?: number,
    opponentId?: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/games/${gameId}/finish`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          gameId,
          isWinner,
          userScore,
          opponentName,
          opponentScore,
          opponentId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Error finishing game:", error);
      return false;
    }
  }
}

export const gameService = new GameService();
