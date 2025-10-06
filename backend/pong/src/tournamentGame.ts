import { data } from "./gameData";
import { gameService } from "./services/gameService";
import { tournamentService } from "./services/tournamentService";

export interface TournamentBracket {
  id: string;
  name: string;
  players: string[];
  rounds: TournamentRound[];
  currentRound: number;
  status: 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
}

export interface TournamentRound {
  roundNumber: number;
  matches: TournamentMatch[];
  isComplete: boolean;
}

export interface TournamentMatch {
  matchNumber: number;
  player1Id: string;
  player1Name: string;
  player2Id: string;
  player2Name: string;
  winnerId?: string;
  gameId?: string;
  isComplete: boolean;
}

export class TournamentManager {
  private tournament: TournamentBracket | null = null;

  /**
   * Initialize a new tournament with bracket generation
   */
  async initializeTournament(tournamentId: string): Promise<boolean> {
    try {
      const tournamentData = await tournamentService.getTournament(tournamentId);
      if (!tournamentData) {
        console.error("Tournament not found:", tournamentId);
        return false;
      }

      this.tournament = {
        id: tournamentData.id,
        name: tournamentData.name,
        players: tournamentData.playersIds,
        rounds: this.generateBracket(tournamentData.playersIds),
        currentRound: 0,
        status: 'IN_PROGRESS'
      };

      console.log("Tournament initialized:", this.tournament);
      return true;
    } catch (error) {
      console.error("Error initializing tournament:", error);
      return false;
    }
  }

  /**
   * Generate tournament bracket (single elimination)
   */
  private generateBracket(players: string[]): TournamentRound[] {
    const rounds: TournamentRound[] = [];
    let currentPlayers = [...players];
    let roundNumber = 1;

    while (currentPlayers.length > 1) {
      const matches: TournamentMatch[] = [];
      const nextRoundPlayers: string[] = [];

      // Create matches for current round
      for (let i = 0; i < currentPlayers.length; i += 2) {
        if (i + 1 < currentPlayers.length) {
          matches.push({
            matchNumber: Math.floor(i / 2) + 1,
            player1Id: currentPlayers[i],
            player1Name: `Player ${currentPlayers[i]}`, // TODO: Get actual names
            player2Id: currentPlayers[i + 1],
            player2Name: `Player ${currentPlayers[i + 1]}`, // TODO: Get actual names
            isComplete: false
          });
        } else {
          // Odd number of players - bye to next round
          nextRoundPlayers.push(currentPlayers[i]);
        }
      }

      rounds.push({
        roundNumber,
        matches,
        isComplete: false
      });

      // Prepare for next round (winners will be added when matches complete)
      currentPlayers = nextRoundPlayers;
      roundNumber++;
    }

    return rounds;
  }

  /**
   * Get the next match to play
   */
  getNextMatch(): TournamentMatch | null {
    if (!this.tournament) return null;

    const currentRound = this.tournament.rounds[this.tournament.currentRound];
    if (!currentRound) return null;

    // Find first incomplete match in current round
    const nextMatch = currentRound.matches.find(match => !match.isComplete);
    return nextMatch || null;
  }

  /**
   * Start a tournament match
   */
  async startTournamentMatch(match: TournamentMatch): Promise<boolean> {
    if (!this.tournament) return false;

    // Set up game data for tournament match
    data.isTournament = true;
    data.tournamentId = this.tournament.id;
    data.tournamentRound = match.matchNumber; // Using match number as round identifier
    data.tournamentMatch = match.matchNumber;

    // Set up players
    data.p[0].id = match.player1Id;
    data.p[0].name = match.player1Name;
    data.p[1].id = match.player2Id;
    data.p[1].name = match.player2Name;

    console.log(`Starting tournament match: ${match.player1Name} vs ${match.player2Name}`);
    return true;
  }

  /**
   * Handle tournament match completion
   */
  async completeMatch(winnerId: string, gameId: string): Promise<boolean> {
    if (!this.tournament) return false;

    const currentRound = this.tournament.rounds[this.tournament.currentRound];
    if (!currentRound) return false;

    // Find and update the completed match
    const match = currentRound.matches.find(m => 
      (m.player1Id === data.p[0].id && m.player2Id === data.p[1].id) ||
      (m.player1Id === data.p[1].id && m.player2Id === data.p[0].id)
    );

    if (!match) {
      console.error("Match not found in tournament bracket");
      return false;
    }

    // Update match with winner and game ID
    match.winnerId = winnerId;
    match.gameId = gameId;
    match.isComplete = true;

    // Check if current round is complete
    const roundComplete = currentRound.matches.every(m => m.isComplete);
    if (roundComplete) {
      currentRound.isComplete = true;
      await this.advanceToNextRound();
    }

    return true;
  }

  /**
   * Advance to the next round of the tournament
   */
  private async advanceToNextRound(): Promise<void> {
    if (!this.tournament) return;

    const currentRound = this.tournament.rounds[this.tournament.currentRound];
    const nextRound = this.tournament.rounds[this.tournament.currentRound + 1];

    if (!nextRound) {
      // Tournament is complete
      await this.completeTournament();
      return;
    }

    // Move winners to next round
    const winners = currentRound.matches
      .filter(match => match.winnerId)
      .map(match => match.winnerId!);

    // Update next round matches with winners
    let winnerIndex = 0;
    for (const match of nextRound.matches) {
      if (winnerIndex < winners.length) {
        match.player1Id = winners[winnerIndex];
        match.player1Name = `Player ${winners[winnerIndex]}`; // TODO: Get actual names
        winnerIndex++;
      }
      if (winnerIndex < winners.length) {
        match.player2Id = winners[winnerIndex];
        match.player2Name = `Player ${winners[winnerIndex]}`; // TODO: Get actual names
        winnerIndex++;
      }
    }

    this.tournament.currentRound++;
    console.log(`Advanced to round ${this.tournament.currentRound + 1}`);
  }

  /**
   * Complete the tournament
   */
  private async completeTournament(): Promise<void> {
    if (!this.tournament) return;

    const finalRound = this.tournament.rounds[this.tournament.currentRound];
    const winner = finalRound.matches[0]?.winnerId;
    const winnerName = finalRound.matches[0]?.player1Id === winner 
      ? finalRound.matches[0]?.player1Name 
      : finalRound.matches[0]?.player2Name;

    this.tournament.status = 'FINISHED';
    
    console.log(`Tournament "${this.tournament.name}" completed! Winner: ${winnerName}`);
    
    // Show tournament winner message
    this.showTournamentWinner(winnerName || "Unknown");
    
    // TODO: Update tournament status in database
    // TODO: Notify players of tournament completion
  }

  /**
   * Show tournament winner message
   */
  private showTournamentWinner(winnerName: string): void {
    // Create winner message overlay
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50";
    overlay.innerHTML = `
      <div class="bg-white p-8 rounded-lg text-center max-w-md mx-4">
        <h2 class="text-3xl font-bold text-green-600 mb-4">🏆 Tournament Complete!</h2>
        <p class="text-xl mb-6">Winner: <span class="font-bold">${winnerName}</span></p>
        <button id="tournamentExitBtn" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Exit Tournament
        </button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add exit button functionality
    const exitBtn = overlay.querySelector("#tournamentExitBtn") as HTMLButtonElement;
    exitBtn.addEventListener("click", () => {
      document.body.removeChild(overlay);
      // Exit to parent window
      window.parent.postMessage({
        type: "EXIT_GAME",
        winner: winnerName,
        isTournament: true
      }, window.location.origin);
    });
  }

  /**
   * Check if tournament is complete
   */
  isTournamentComplete(): boolean {
    return this.tournament?.status === 'FINISHED';
  }

  /**
   * Get tournament status
   */
  getTournamentStatus(): { name: string; currentRound: number; totalRounds: number; status: string } | null {
    if (!this.tournament) return null;

    return {
      name: this.tournament.name,
      currentRound: this.tournament.currentRound + 1,
      totalRounds: this.tournament.rounds.length,
      status: this.tournament.status
    };
  }

  /**
   * Get tournament bracket for display
   */
  getTournamentBracket(): TournamentBracket | null {
    return this.tournament;
  }
}

// Global tournament manager instance
export const tournamentManager = new TournamentManager();

/**
 * Initialize a new tournament game
 */
export async function newTournamentGame(tournamentId: string): Promise<boolean> {
  const initialized = await tournamentManager.initializeTournament(tournamentId);
  if (!initialized) return false;

  const nextMatch = tournamentManager.getNextMatch();
  if (!nextMatch) {
    console.log("No more matches in tournament");
    return false;
  }

  return await tournamentManager.startTournamentMatch(nextMatch);
}

/**
 * Handle tournament game completion
 */
export async function handleTournamentGameCompletion(winnerId: string, gameId: string): Promise<boolean> {
  const success = await tournamentManager.completeMatch(winnerId, gameId);
  
  if (success && !tournamentManager.isTournamentComplete()) {
    // Start next match automatically
    const nextMatch = tournamentManager.getNextMatch();
    if (nextMatch) {
      console.log("Starting next tournament match...");
      return await tournamentManager.startTournamentMatch(nextMatch);
    }
  }
  
  return success;
}
