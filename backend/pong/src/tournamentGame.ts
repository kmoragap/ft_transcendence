import { data } from "./gameData";
import { gameService } from "./services/gameService";
import { tournamentService } from "./services/tournamentService";
import { t } from "./i18n";

export interface TournamentBracket {
  id: string;
  name: string;
  players: string[];
  rounds: TournamentRound[];
  currentRound: number;
  status: "IN_PROGRESS" | "FINISHED" | "CANCELLED";
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

  async initializeTournament(tournamentId: string): Promise<boolean> {
    try {
      const tournamentData = await tournamentService.getTournament(
        tournamentId
      );
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
        status: "IN_PROGRESS",
      };

      console.log("Tournament initialized:", this.tournament);
      return true;
    } catch (error) {
      console.error("Error initializing tournament:", error);
      return false;
    }
  }

  private generateBracket(players: string[]): TournamentRound[] {
    const rounds: TournamentRound[] = [];
    const playerIdToNameMap = (window as any).playerIdToNameMap || {};

    // Calculate how many rounds we need
    let numPlayers = players.length;
    let roundNumber = 1;

    // Generate all rounds upfront
    while (numPlayers > 1) {
      const numMatches = Math.floor(numPlayers / 2);
      const matches: TournamentMatch[] = [];

      // Create placeholder matches for this round
      for (let i = 0; i < numMatches; i++) {
        matches.push({
          matchNumber: i + 1,
          player1Id: `TBD_Round${roundNumber}_Match${i + 1}_Player1`,
          player1Name: `TBD Round ${roundNumber} Match ${i + 1} Player 1`,
          player2Id: `TBD_Round${roundNumber}_Match${i + 1}_Player2`,
          player2Name: `TBD Round ${roundNumber} Match ${i + 1} Player 2`,
          isComplete: false,
        });
      }

      rounds.push({
        roundNumber,
        matches,
        isComplete: false,
      });

      // Next round will have half the players (winners)
      numPlayers = numMatches;
      roundNumber++;
    }

    // Now populate the first round with actual players
    if (rounds.length > 0) {
      const firstRound = rounds[0];
      for (let i = 0; i < firstRound.matches.length; i++) {
        const player1Index = i * 2;
        const player2Index = player1Index + 1;

        if (player1Index < players.length && player2Index < players.length) {
          const player1Id = players[player1Index];
          const player2Id = players[player2Index];

          const player1Name =
            playerIdToNameMap[player1Id] ||
            (player1Id.startsWith("AI-")
              ? `AI Player ${player1Id.split("-")[2]}`
              : `Player ${player1Id}`);
          const player2Name =
            playerIdToNameMap[player2Id] ||
            (player2Id.startsWith("AI-")
              ? `AI Player ${player2Id.split("-")[2]}`
              : `Player ${player2Id}`);

          firstRound.matches[i] = {
            matchNumber: i + 1,
            player1Id: player1Id,
            player1Name: player1Name,
            player2Id: player2Id,
            player2Name: player2Name,
            isComplete: false,
          };
        }
      }
    }

    return rounds;
  }

  getNextMatch(): TournamentMatch | null {
    if (!this.tournament) return null;

    const currentRound = this.tournament.rounds[this.tournament.currentRound];
    if (!currentRound) return null;

    const nextMatch = currentRound.matches.find(match => !match.isComplete);
    return nextMatch || null;
  }

  private async resetGameState(): Promise<void> {
    // Import the game arrays directly
    const { balls, pad } = await import("./pong");

    // Properly clean up balls (like endRound does)
    while (balls.length) {
      balls[0].stop();
      balls.shift();
    }

    // Properly clean up paddles (like endRound does)
    while (pad.length) {
      pad[0].stop();
      pad.shift();
    }

    // Clear any existing game text/overlays
    const existingOverlay = document.getElementById("matchTransitionOverlay");
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // Reset serve direction
    data.serve = Math.floor(Math.random() * 2) ? -1 : 1;
  }

  async startTournamentMatch(match: TournamentMatch): Promise<boolean> {
    if (!this.tournament) return false;

    await this.resetGameState();

    data.isTournament = true;
    data.tournamentId = this.tournament.id;
    data.tournamentRound = this.tournament.currentRound + 1;
    data.tournamentMatch = match.matchNumber;

    // Update player data
    data.p[0].id = match.player1Id;
    data.p[0].name = match.player1Name;
    data.p[0].score = 0;
    data.p[0].isAi = match.player1Id.startsWith("AI-");

    data.p[1].id = match.player2Id;
    data.p[1].name = match.player2Name;
    data.p[1].score = 0;
    data.p[1].isAi = match.player2Id.startsWith("AI-");

    // Update UI elements
    data.nameTB1.value = match.player1Name;
    data.nameTB2.value = match.player2Name;
    data.scoreTB1.value = "0";
    data.scoreTB2.value = "0";

    // Reset game flags
    data.showingText = false;
    data.go = false;

    // Start the new match with countdown
    const { countdown } = await import("./pong");
    setTimeout(() => countdown(3, 500), 500);

    return true;
  }

  async completeMatch(winnerId: string, gameId: string): Promise<boolean> {
    if (!this.tournament) return false;

    const currentRound = this.tournament.rounds[this.tournament.currentRound];
    if (!currentRound) return false;

    const match = currentRound.matches.find(
      m =>
        (m.player1Id === data.p[0].id && m.player2Id === data.p[1].id) ||
        (m.player1Id === data.p[1].id && m.player2Id === data.p[0].id)
    );

    if (!match) {
      console.error("Match not found in tournament bracket");
      return false;
    }

    match.winnerId = winnerId;
    match.gameId = gameId;
    match.isComplete = true;

    const roundComplete = currentRound.matches.every(m => m.isComplete);

    if (roundComplete) {
      currentRound.isComplete = true;
      await this.advanceToNextRound();
    }

    return true;
  }

  private async advanceToNextRound(): Promise<void> {
    if (!this.tournament) return;

    const currentRound = this.tournament.rounds[this.tournament.currentRound];
    const nextRound = this.tournament.rounds[this.tournament.currentRound + 1];

    if (!nextRound) {
      await this.completeTournament();
      return;
    }

    const winners = currentRound.matches
      .filter(match => match.winnerId)
      .map(match => match.winnerId!);

    const playerIdToNameMap = (window as any).playerIdToNameMap || {};

    // Populate the next round matches with the winners
    let winnerIndex = 0;
    for (let i = 0; i < nextRound.matches.length; i++) {
      const match = nextRound.matches[i];

      if (winnerIndex < winners.length) {
        const player1Id = winners[winnerIndex];
        match.player1Id = player1Id;
        match.player1Name =
          playerIdToNameMap[player1Id] ||
          (player1Id.startsWith("AI-")
            ? `AI Player ${player1Id.split("-")[2]}`
            : `Player ${player1Id}`);
        winnerIndex++;
      }

      if (winnerIndex < winners.length) {
        const player2Id = winners[winnerIndex];
        match.player2Id = player2Id;
        match.player2Name =
          playerIdToNameMap[player2Id] ||
          (player2Id.startsWith("AI-")
            ? `AI Player ${player2Id.split("-")[2]}`
            : `Player ${player2Id}`);
        winnerIndex++;
      }
    }

    this.tournament.currentRound++;
  }

  private async completeTournament(): Promise<void> {
    if (!this.tournament) return;

    const finalRound = this.tournament.rounds[this.tournament.currentRound];
    const winner = finalRound.matches[0]?.winnerId;
    const winnerName =
      finalRound.matches[0]?.player1Id === winner
        ? finalRound.matches[0]?.player1Name
        : finalRound.matches[0]?.player2Name;

    this.tournament.status = "FINISHED";

    this.showTournamentWinner(winnerName || "Unknown");
    await tournamentService.updateTournamentStatus(
      this.tournament.id,
      "FINISHED"
    );
  }

  public showMatchTransition(nextMatch: TournamentMatch): void {
    const overlay = document.createElement("div");
    overlay.className =
      "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50";
    overlay.id = "matchTransitionOverlay";

    const modal = document.createElement("div");
    modal.className =
      "bg-[rgba(3,27,27,0.8)] z-50 rounded-lg p-8 max-w-md w-full mx-4 text-center";
    modal.innerHTML = `
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-[#66fcf1] mb-4">${t(
          "next_match"
        )}</h2>
        <div class="text-lg text-gray-600 mb-2">
          <span class="font-semibold text-[#66fcf1]">${
            nextMatch.player1Name
          }</span>
          <span class="mx-4 text-[#66fcf1]">${t("vs")}</span>
          <span class="font-semibold text-red-600">${
            nextMatch.player2Name
          }</span>
        </div>
        <p class="text-sm text-[#66fcf1] mt-4">${t("get_ready_next_round")}</p>
      </div>
      <button id="startNextMatchBtn" class="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200">
        ${t("start_match")}
      </button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const startBtn = document.getElementById("startNextMatchBtn");
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        this.startTournamentMatch(nextMatch);
        this.hideMatchTransition();
      });
    }
  }

  private hideMatchTransition(): void {
    const overlay = document.getElementById("matchTransitionOverlay");
    if (overlay) {
      overlay.remove();
    }
  }

  private showTournamentWinner(winnerName: string): void {
    const overlay = document.createElement("div");
    overlay.className =
      "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50";

    const modal = document.createElement("div");
    modal.className =
      "bg-[rgba(3,27,27,0.8)] z-50 rounded-lg p-8 max-w-md w-full mx-4 text-center";
    modal.innerHTML = `
      <div class="mb-6">
        <h2 class="text-3xl font-bold text-[#66fcf1] mb-4">🏆 ${t(
          "tournament_complete"
        )}</h2>
        <div class="text-xl mb-4">
          <span class="text-[#66fcf1]">${t("winner")}:</span>
          <span class="font-bold text-yellow-400 ml-2">${winnerName}</span>
        </div>
        <p class="text-sm text-[#66fcf1] mt-4">${t(
          "congratulations_victory"
        )}</p>
      </div>
      <button id="tournamentExitBtn" class="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200">
        ${t("exit_tournament")}
      </button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const exitBtn = overlay.querySelector(
      "#tournamentExitBtn"
    ) as HTMLButtonElement;
    exitBtn.addEventListener("click", () => {
      document.body.removeChild(overlay);
      window.parent.postMessage(
        {
          type: "EXIT_GAME",
          winner: winnerName,
          isTournament: true,
        },
        window.location.origin
      );
    });
  }

  isTournamentComplete(): boolean {
    return this.tournament?.status === "FINISHED";
  }

  getTournamentStatus(): {
    name: string;
    currentRound: number;
    totalRounds: number;
    status: string;
  } | null {
    if (!this.tournament) return null;

    return {
      name: this.tournament.name,
      currentRound: this.tournament.currentRound + 1,
      totalRounds: this.tournament.rounds.length,
      status: this.tournament.status,
    };
  }

  getTournamentBracket(): TournamentBracket | null {
    return this.tournament;
  }
}

export const tournamentManager = new TournamentManager();

export async function newTournamentGame(
  tournamentId: string
): Promise<boolean> {
  const initialized = await tournamentManager.initializeTournament(
    tournamentId
  );
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
export async function handleTournamentGameCompletion(
  winnerId: string,
  gameId: string
): Promise<boolean> {
  const success = await tournamentManager.completeMatch(winnerId, gameId);
  const isComplete = tournamentManager.isTournamentComplete();

  if (success && !isComplete) {
    // Show match transition window instead of starting automatically
    const nextMatch = tournamentManager.getNextMatch();
    if (nextMatch) {
      tournamentManager.showMatchTransition(nextMatch);
      return true; // Return success but don't start the match yet
    }
  }

  return success;
}
