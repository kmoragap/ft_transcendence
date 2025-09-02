export interface GameData {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  score1: number;
  score2: number;
  maxScore: number;
  status: string;
}

class GameService {
  private baseUrl = 'http://localhost:3002/api/pong';

  async createGame(gameData: {
    player1Id: string;
    player2Id: string;
    player1Name: string;
    player2Name: string;
    maxScore?: number;
  }): Promise<GameData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData)
      });
      
      if (!response.ok) throw new Error('Failed to create game');
      return await response.json();
    } catch (error) {
      console.error('Error creating game:', error);
      return null;
    }
  }

  async updateScore(gameId: string, score1: number, score2: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/games/${gameId}/score`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score1, score2 })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error updating score:', error);
      return false;
    }
  }

  async finishGame(gameId: string, score1: number, score2: number, winnerId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/games/${gameId}/finish`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score1, score2, winnerId })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error finishing game:', error);
      return false;
    }
  }
}

export const gameService = new GameService();