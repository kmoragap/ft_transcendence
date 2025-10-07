export interface tournamentInfo {
  //tournament name?
  name: string;
  //array of players participating
  playersIds: string[];
}

export interface TournamentGameInfo {
  tournamentId: string;
  round: number;
  matchNumber: number;
  player1Id: string;
  player1Name: string;
  player2Id: string;
  player2Name: string;
  status: "IN_PROGRESS" | "FINISHED" | "CANCELLED";
}

class TournamentService {
  private baseUrl = "/api/pong";
  async updateTournamentStatus(
    tournamentId: string,
    status: "IN_PROGRESS" | "FINISHED" | "CANCELLED"
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/tournaments/${tournamentId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      return response.ok;
    } catch (error) {
      console.error("Error updating tournament status:", error);
      return false;
    }
  }
  async createTournament(data: tournamentInfo): Promise<{ id: string } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/tournaments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Error creating tournament:", error);
      return null;
    }
  }

  async addGameToTournament(
    tournamentId: string,
    gameId: string
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/tournaments/${tournamentId}/games`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error("Error adding game to tournament:", error);
      return false;
    }
  }

  async getTournament(tournamentId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/tournaments/${tournamentId}`
      );
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Error fetching tournament:", error);
      return null;
    }
  }
}

export const tournamentService = new TournamentService();
