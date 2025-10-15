/*
tournamentData.ts handles the setup of a new tournament and retrieves 
its data from the site. 
*/

import { loadConfig, setPendingTournamentId } from "./gameData";
import { tournamentService } from "./services/tournamentService";
import { newTournamentGame } from "./tournamentGame";
import { allPlayerData } from "./wizard";

export async function createAndStartTournament(): Promise<void> {
  try {
    const playersNumber = parseInt(
      (document.getElementById("playersNumber") as HTMLInputElement)?.value ||
        "4",
    );

    const players: string[] = [];
    const urlParams = new URLSearchParams(window.location.search);

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

      const isAi = playerAiInput
        ? playerAiInput.checked
        : (allPlayerData && allPlayerData[i - 1]
            ? !!allPlayerData[i - 1].isAi
            : i > 1);

      if (isAi) {
        const playerName =
          playerNameInput?.value ||
          (allPlayerData && allPlayerData[i - 1]?.name) ||
          `Player ${i}`;
        players.push(`AI-${playerName.replace(/\s+/g, '-')}`);
      } else {
        let playerId = playerIdInput?.value || "";
        
        if (!playerId && allPlayerData && allPlayerData[i - 1]) {
          playerId = allPlayerData[i - 1].id || "";
        }
        
        if (playerId) {
          players.push(playerId);
        } else if (i === 1) {
          const userId =
            urlParams.get("userId") ||
            playerNameInput?.value ||
            (allPlayerData && allPlayerData[i - 1]?.name) ||
            "";
          if (!userId) {
            alert(
              "No valid user ID or player name found for the first player. Please enter a name or log in.",
            );
            return;
          }
          players.push(userId);
        } else {
          const name =
            playerNameInput?.value ||
            (allPlayerData && allPlayerData[i - 1]?.name) ||
            `player${i}`;
          players.push(`Local-${name.replace(/\s+/g, '-')}`);
        }
      }
    }

    const playerIdToNameMap: Record<string, string> = {};
    for (let i = 1; i <= playersNumber; i++) {
      const playerNameInput = document.getElementById(
        `name_p${i}`,
      ) as HTMLInputElement;
      const playerAiInput = document.getElementById(
        `p${i}Ai`,
      ) as HTMLInputElement;

      const isAi = playerAiInput ? playerAiInput.checked : i > 1;
      const playerId = players[i - 1];
      
      let playerName = playerNameInput?.value || (allPlayerData && allPlayerData[i - 1]?.name);
      if (!playerName || playerName.trim() === "") {
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

    (window as any).playerIdToNameMap = playerIdToNameMap;
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
