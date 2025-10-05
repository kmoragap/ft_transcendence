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

class GameService {
  private baseUrl = "/api/pong";

  async finishGame(data: gameInfo): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });

      return response.ok;
    } catch (error) {
      console.error("Error finishing game:", error);
      return false;
    }
  }
}

export const gameService = new GameService();
