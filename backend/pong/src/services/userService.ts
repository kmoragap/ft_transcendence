interface UserData {
  id: string;
  username: string;
  email: string;
}

interface UserStats {
  id: string;
  username: string;
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  winRate: number;
}

class UserService {
  private baseUrl = "/api/users";

  async getUserById(userId: string): Promise<UserData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`);
      if (!response.ok) throw new Error("User not found");
      return await response.json();
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }

  async getUsersByIds(userIds: string[]): Promise<UserData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/users/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds }),
      });

      if (!response.ok) throw new Error("Failed to fetch users");
      return await response.json();
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }

  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/stats`);
      if (!response.ok) throw new Error("Stats not found");
      return await response.json();
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return null;
    }
  }

  async updateUserStats(
    userId: string,
    gameData: {
      isWinner: boolean;
      score: number;
      gameId: string;
      opponentId?: string;
    }
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/stats`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameData),
      });

      return response.ok;
    } catch (error) {
      console.error("Error updating user stats:", error);
      return false;
    }
  }
}

export const userService = new UserService();
