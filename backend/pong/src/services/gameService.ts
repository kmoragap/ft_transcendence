interface GameData {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  score1: number;
  score2: number;
  maxScore: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
}

class GameService {
  private baseUrl = '/api/pong';

  async createGame(gameData: {
    player1Id: string;
    player2Id: string;
    player1Name: string;
    player2Name: string;
    maxScore?: number;
    gameType?: 'VS_HUMAN' | 'VS_AI'
  }): Promise<GameData | null> {
    console.log('Fetching to:', `${this.baseUrl}/games`);  // debug
    try {
      const response = await fetch(`${this.baseUrl}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData)
      });
          console.log('Response status:', response.status);  // debug

      if (!response.ok) throw new Error('Failed to create game');
      return await response.json();
    } catch (error) {
      console.error('Error creating game:', error);
      return null;
    }
  }
  async createAIGame(playerData: {
    playerId: string;
    playerName: string;
    maxScore?: number;
  }): Promise<GameData | null> {
    try {
      const gameData = {
        player1Id: playerData.playerId,
        player2Id: 'ai_opponent',
        player1Name: playerData.playerName,
        player2Name: 'IA_OPPONENT',
        maxScore: playerData.maxScore || 5,
        gameType: 'VS_AI' as const
      };

      return await this.createGame(gameData);
    } catch (error) {
      console.error('Error creating AI game:', error);
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