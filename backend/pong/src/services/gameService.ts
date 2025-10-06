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
  isTournament: boolean;
  tournamentId?: string;
  tournamentRound?: number;
  tournamentMatch?: number;
  //winner
  winnerId: string;
}

export interface GameResponse {
  status: string;
  winnerId: string;
  player1Score: number; //not sure of this
  player2Score: number; //not sure of this
  gameId?: string;
}

class GameService {
  private baseUrl = "/api/pong";

  async createGame(data: gameInfo): Promise<boolean> {
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
  async finishGame(data: gameInfo): Promise<GameResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        console.error("Error finishing game: Response not OK");
        return null;
      }

      const gameResponse: GameResponse = await response.json();
      return gameResponse;
    } catch (error) {
      console.error("Error finishing game:", error);
      return null;
    }
  }
}

export const gameService = new GameService();
