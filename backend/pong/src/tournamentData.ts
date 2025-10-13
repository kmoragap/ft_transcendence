import { loadConfig, setPendingTournamentId } from "./gameData";
import { tournamentService } from "./services/tournamentService";
import { newTournamentGame } from "./tournamentGame";

export async function createAndStartTournament(): Promise<void> {
  try {
    const playersNumber = parseInt(
      (document.getElementById("playersNumber") as HTMLInputElement)?.value ||
        "4",
    );

    const players: string[] = [];

    for (let i = 1; i <= playersNumber; i++) {
      const playerIdInput = document.getElementById(
        `p${i}Id`,
      ) as HTMLInputElement;
      const playerNameInput = document.getElementById(
        `name_p${i}`,
      ) as HTMLInputElement;
      const playerAiInput = document.getElementById(
        `p${i}Ai`,
      ) as HTMLInputElement;

      const isAi = playerAiInput ? playerAiInput.checked : i > 1;

      if (isAi) {
        const playerName = playerNameInput?.value || `Player ${i}`;
        players.push(`AI-${playerName.replace(/\s+/g, '-')}`);
      } else {
        if (playerIdInput && playerIdInput.value) {
          players.push(playerIdInput.value);
        } else if (i === 1) {
          const urlParams = new URLSearchParams(window.location.search);
          const userId = urlParams.get("userId") || playerNameInput?.value;
          if (!userId) {
            alert(
              "No valid user ID or player name found for the first player. Please enter a name or log in.",
            );
            return;
          }
          players.push(userId);
        } else {
          const name = playerNameInput?.value || `player${i}`;
          players.push(name);
        }
      }
    }

    console.log("Creating tournament with players:", players);
    console.log("Player details:");
    for (let i = 1; i <= playersNumber; i++) {
      const playerIdInput = document.getElementById(
        `p${i}Id`,
      ) as HTMLInputElement;
      const playerNameInput = document.getElementById(
        `name_p${i}`,
      ) as HTMLInputElement;
      const playerAiInput = document.getElementById(
        `p${i}Ai`,
      ) as HTMLInputElement;
      console.log(`Player ${i}:`, {
        id: playerIdInput?.value || "none",
        name: playerNameInput?.value || "none",
        isAi: playerAiInput?.checked || false,
        finalId: players[i - 1],
      });
    }

    const urlParams = new URLSearchParams(window.location.search);

    const playerIdToNameMap: Record<string, string> = {};
    for (let i = 1; i <= playersNumber; i++) {
      const playerIdInput = document.getElementById(
        `p${i}Id`,
      ) as HTMLInputElement;
      const playerNameInput = document.getElementById(
        `name_p${i}`,
      ) as HTMLInputElement;
      const playerAiInput = document.getElementById(
        `p${i}Ai`,
      ) as HTMLInputElement;

      const isAi = playerAiInput ? playerAiInput.checked : i > 1;
      const playerId = players[i - 1];
      
      // Get the correct player name - try form input first, then use the name from allPlayerData
      let playerName = playerNameInput?.value;
      if (!playerName || playerName.trim() === "") {
        // Fallback: use the same logic as wizard.ts createPlayerBoxes
        const urlParams = new URLSearchParams(window.location.search);
        const username = urlParams.get("username") || "Player 1";
        const defaultNames = ["Player 1", "Roger Federror", "Boolena Williams", "Boris Backend"];
        
        if (i === 1) {
          playerName = username;
        } else {
          playerName = defaultNames[i - 1] || `Player ${i}`;
        }
      }

      playerIdToNameMap[playerId] = playerName;
    }

    // Store the mapping in a global variable for tournament use
    (window as any).playerIdToNameMap = playerIdToNameMap;
    console.log("Player ID to Name mapping:", playerIdToNameMap);
    const defaultName = `Tournament - ${new Date().toISOString()} (${
      players.length
    } players)`;
    const tournamentNameInput = document.getElementById(
      "tournamentName",
    ) as HTMLInputElement;
    const userProvidedName = tournamentNameInput?.value?.trim();
    const tournamentData = {
      name: userProvidedName ? userProvidedName : defaultName,
      playersIds: players,
    };

    const tournament = await tournamentService.createTournament(tournamentData);

    if (!tournament || !tournament.id) {
      console.error("Failed to create tournament");
      alert("Failed to create tournament. Please try again.");
      return;
    }

    console.log("Tournament created successfully:", tournament.id);

    setPendingTournamentId(tournament.id);

    await loadConfig("tournament");

    const success = await newTournamentGame(tournament.id);
    if (!success) {
      console.error("Failed to start tournament game");
      alert("Failed to start tournament game. Please try again.");
      return;
    }
  } catch (error) {
    console.error("Error creating tournament:", error);
    alert("Error creating tournament. Please try again.");
  }
}
