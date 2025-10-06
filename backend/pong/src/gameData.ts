//import { userService } from "./services/userService";
import { controlKeys } from "./controls";
import { countdown, pad } from "./pong";
import { playerSetupMenu, gameSetupMenu, tournamentSetupMenu } from "./menus";
import { t } from "./i18n";
import { gameService } from "./services/gameService";
import { newTournamentGame } from "./tournamentGame";
import { tournamentService } from "./services/tournamentService";

export type playerData = {
  name: string;
  id: string;
  score: number;
  isAi: boolean;
  up: string;
  down: string;
  innerCol: string;
  outerCol: string;
  cornerCol: string;
};

export type gameData = {
  canvas: HTMLCanvasElement;
  fps: number;
  nameTB1: HTMLTextAreaElement;
  scoreTB1: HTMLTextAreaElement;
  scoreTB2: HTMLTextAreaElement;
  nameTB2: HTMLTextAreaElement;
  timestamp: number;
  lastTime: number;
  paddleWidth: number;
  paddleHeight: number;
  ctx: CanvasRenderingContext2D;
  p: playerData[];

  bg: CanvasGradient;
  uiCol: string;
  ballCol: string;
  ballR: string;
  ballG: string;
  ballB: string;
  outerBg: string;
  innerBg: string;

  paddleSpeed: number;
  ballSpeed: number;
  ballSize: number;
  maxScore: number;
  trailLength: number;

  serve: number;
  keys: Record<string, boolean>;
  showingText: boolean;
  gameID: string;
  tournamentID: string;
  go: boolean;
  touchControl: boolean;
  mode: string;
  //tournament fields
  isTournament: boolean;
  tournamentId?: string;
  tournamentRound?: number;
  tournamentMatch?: number;

  multiball: boolean;
  maxHits: number;
  hits: number;
};

export let data: gameData;

let pendingTournamentId: string | null = null;

export function getSecondPlayerData(): any {
  return (window as any).gamePlayer2 || null;
}

export function clearSecondPlayerData(): void {
  (window as any).gamePlayer2 = null;
}

let isFullscreen = false;

// Mobile detection
function isMobile(): boolean {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    (window.innerWidth <= 768 && window.innerHeight <= 1024)
  );
}

export function toggleFullscreen(): void {
  if (!isFullscreen) {
    enterFullscreen();
  } else {
    exitFullscreen();
  }
}

function enterFullscreen(): Promise<void> {
  const canvas = document.getElementById("board") as HTMLCanvasElement;
  if (!canvas) {
    return Promise.reject(new Error("Canvas not found"));
  }

  return new Promise<void>((resolve, reject) => {
    if (canvas.requestFullscreen) {
      canvas
        .requestFullscreen()
        .then(() => {
          console.log("Fullscreen entered successfully");
          updateCanvasForFullscreen(true);

          if (screen.orientation && (screen.orientation as any).lock) {
            (screen.orientation as any).lock("landscape").catch((err: any) => {
              console.log("Orientation lock failed:", err);
            });
          }
          resolve();
        })
        .catch((err: any) => {
          console.log("Fullscreen failed:", err);
          updateCanvasForFullscreen(true);
          reject(err);
        });
    } else if ((canvas as any).webkitRequestFullscreen) {
      (canvas as any)
        .webkitRequestFullscreen()
        .then(() => {
          console.log("Fullscreen entered successfully");
          updateCanvasForFullscreen(true);

          if (screen.orientation && (screen.orientation as any).lock) {
            (screen.orientation as any).lock("landscape").catch((err: any) => {
              console.log("Orientation lock failed:", err);
            });
          }
          resolve();
        })
        .catch((err: any) => {
          console.log("Fullscreen failed:", err);
          updateCanvasForFullscreen(true);
          reject(err);
        });
    } else if ((canvas as any).mozRequestFullScreen) {
      (canvas as any)
        .mozRequestFullScreen()
        .then(() => {
          console.log("Fullscreen entered successfully");
          updateCanvasForFullscreen(true);

          if (screen.orientation && (screen.orientation as any).lock) {
            (screen.orientation as any).lock("landscape").catch((err: any) => {
              console.log("Orientation lock failed:", err);
            });
          }
          resolve();
        })
        .catch((err: any) => {
          console.log("Fullscreen failed:", err);
          updateCanvasForFullscreen(true);
          reject(err);
        });
    } else if ((canvas as any).msRequestFullscreen) {
      (canvas as any)
        .msRequestFullscreen()
        .then(() => {
          console.log("Fullscreen entered successfully");
          updateCanvasForFullscreen(true);

          if (screen.orientation && (screen.orientation as any).lock) {
            (screen.orientation as any).lock("landscape").catch((err: any) => {
              console.log("Orientation lock failed:", err);
            });
          }
          resolve();
        })
        .catch((err: any) => {
          console.log("Fullscreen failed:", err);
          updateCanvasForFullscreen(true);
          reject(err);
        });
    } else {
      reject(new Error("Fullscreen not supported"));
    }
  });
}

function exitFullscreen(): void {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if ((document as any).webkitExitFullscreen) {
    (document as any).webkitExitFullscreen();
  } else if ((document as any).mozCancelFullScreen) {
    (document as any).mozCancelFullScreen();
  } else if ((document as any).msExitFullscreen) {
    (document as any).msExitFullscreen();
  }

  // Update canvas for normal mode
  updateCanvasForFullscreen(false);
}

function showFullscreenPrompt(): void {
  // Create a fullscreen prompt overlay
  const prompt = document.createElement("div");
  prompt.className =
    "fixed inset-0 bg-black/80 flex items-center justify-center z-50";
  prompt.id = "fullscreen-prompt";

  prompt.innerHTML = `
		<div class="bg-[rgba(3,27,27,0.95)] rounded-xl p-6 max-w-sm mx-4 border border-[rgba(102,252,241,0.25)] shadow-2xl text-center">
			<div class="text-4xl mb-4">📱</div>
			<h2 class="text-xl font-bold text-[#66fcf1] mb-3 font-[jura]">
				Enter Fullscreen
			</h2>
			<p class="text-[#66fcf1] mb-4 text-sm font-[jura]">
				For the best gaming experience, tap the button below to enter fullscreen mode.
			</p>
			<button
				id="fullscreen-btn"
				class="btn py-2.5 px-6 text-lg font-bold w-full"
			>
				Enter Fullscreen
			</button>
		</div>
	`;

  document.body.appendChild(prompt);

  // Add click handler for fullscreen button
  const fullscreenBtn = prompt.querySelector("#fullscreen-btn");
  fullscreenBtn?.addEventListener("click", async () => {
    try {
      await enterFullscreen();
      prompt.remove();
    } catch (err) {
      console.log("Manual fullscreen failed:", err);
      // Remove prompt anyway to not block the game
      prompt.remove();
    }
  });
}

function updatePaddlePositions(): void {
  if (!pad || pad.length === 0) return;

  // Update paddle positions based on current canvas dimensions
  if (data.mode === "twoPlayers") {
    // Left paddle (index 0) - stays at x = 0
    pad[0].setX(0);
    // Right paddle (index 1) - moves to right edge
    pad[1].setX(data.canvas.width - data.paddleWidth);
  } else if (data.mode === "doublePaddle") {
    pad[0].setX(0);
    pad[1].setX(data.canvas.width - data.paddleWidth);
    pad[2].setX(data.canvas.width * 0.25 - data.paddleWidth);
    pad[3].setX(data.canvas.width * 0.75 - data.paddleWidth);
  } else if (data.mode === "multi") {
    pad[0].setX(0);
    pad[1].setX(data.canvas.width * 0.25 - data.paddleWidth);
    pad[2].setX(data.canvas.width * 0.75 - data.paddleWidth);
    pad[3].setX(data.canvas.width - data.paddleWidth);
  }
}

function updateCanvasForFullscreen(fullscreen: boolean): void {
  const canvas = document.getElementById("board") as HTMLCanvasElement;
  if (!canvas) return;

  isFullscreen = fullscreen;

  if (fullscreen) {
    // Full screen mode
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "9999";
    canvas.style.backgroundColor = "#000";
  } else {
    // Normal mode
    const margin = 47;
    const availableHeight = window.innerHeight - margin;

    canvas.width = window.innerWidth;
    canvas.height = availableHeight;
    canvas.style.width = "100%";
    canvas.style.height = `${availableHeight}px`;
    canvas.style.position = "static";
    canvas.style.top = "auto";
    canvas.style.left = "auto";
    canvas.style.zIndex = "auto";
    canvas.style.backgroundColor = "transparent";
  }

  if (data && data.canvas) {
    data.canvas = canvas;
    data.ctx = canvas.getContext("2d")!;
    data.paddleWidth = canvas.width / 60;
    data.paddleHeight = canvas.height / 5;

    data.bg = data.ctx.createLinearGradient(0, 0, canvas.width, 0);
    data.bg.addColorStop(0, data.outerBg);
    data.bg.addColorStop(0.5, data.innerBg);
    data.bg.addColorStop(1, data.outerBg);

    updatePaddlePositions();
  }
}

document.addEventListener("fullscreenchange", handleFullscreenChange);
document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
document.addEventListener("mozfullscreenchange", handleFullscreenChange);
document.addEventListener("MSFullscreenChange", handleFullscreenChange);

function handleFullscreenChange(): void {
  const isCurrentlyFullscreen = !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );

  if (isCurrentlyFullscreen !== isFullscreen) {
    updateCanvasForFullscreen(isCurrentlyFullscreen);
  }
}

function loadPlayer(
  name: string,
  id: string,
  isAi: boolean,
  up: string,
  down: string,
  innerCol: string,
  outercol: string,
  cornerCol: string,
  playerIndex?: number
): playerData {
  const isAiByName = name.includes("Player") && name !== "Player 1";
  const finalIsAi = isAi || isAiByName;
  
  let finalId = id;
  if (!finalIsAi && !finalId) {
    const urlParams = new URLSearchParams(window.location.search);
    finalId = urlParams.get('userId') || name; // Use name as last resort
  }
  
  var p: playerData = {
    name: name,
    id: finalIsAi ? `AI-Player-${playerIndex || 1}` : finalId,
    score: 0,
    isAi: finalIsAi,
    up: up,
    down: down,
    innerCol: innerCol,
    outerCol: outercol,
    cornerCol: cornerCol,
  };
  if (finalIsAi) p.name = "Roger Federror";
  return p;
}

function loadIn(id: string): string {
  const el = document.getElementById(id) as HTMLInputElement;
  return el ? el.value : "";
}

function loadInB(id: string): boolean {
  const el = document.getElementById(id) as HTMLInputElement;
  return el ? el.checked : false;
}

export async function newGame(mode: string): Promise<void> {
  await new Promise<void>(resolve => {
    if (document.readyState === "complete") resolve();
    else document.addEventListener("DOMContentLoaded", () => resolve());
  });
  const appDiv = Object.assign(document.createElement("div"), {
    id: "app",
  }) as HTMLDivElement;

  appDiv.className = [
    "fixed inset-0 flex flex-col items-center justify-center",
    "bg-black/60",
    "z-50 pb-2 md:pb-0",
  ].join(" ");

  document.body.appendChild(appDiv);
  const title = document.createElement("h2");
  if (mode === "tournament") {
    title.textContent = t("tournamentSetup");
  }
  else {
    title.textContent = t("gameSetup");
  }
  title.className = "text-2xl md:text-3xl font-bold text-[#66fcf1] text-center";
  appDiv.appendChild(title);
  const card = document.createElement("div");
  card.className = [
    "w-[min(900px,92vw)] overflow-y-auto",
    "rounded-2xl flex flex-row flex-wrap",
    "bg-[rgba(3,27,27,0.9)]",
    "shadow-[0_10px_30px_rgba(0,0,0,0.5)]",
    "p-6 md:p-8 space-y-6 gap-4",
  ].join(" ");
  appDiv.appendChild(card);

  const allBoxesContainer = Object.assign(document.createElement("div"), {
    className: "flex flex-col md:flex-row gap-4 justify-start items-stretch flex-wrap",
  }) as HTMLDivElement;
  const tournamentContainer = Object.assign(document.createElement("div"), {
    className: "flex-1 min-w-[300px]",
  }) as HTMLDivElement;
  const player1Container = Object.assign(document.createElement("div"), {
    className: "flex-1 min-w-[300px]",
  }) as HTMLDivElement;
  const player2Container = Object.assign(document.createElement("div"), {
    className: "flex-1 min-w-[300px]",
  }) as HTMLDivElement;

  const player1List = Object.assign(document.createElement("ul"), {
    className: "list-none",
  }) as HTMLUListElement;
  const player2List = Object.assign(document.createElement("ul"), {
    className: "list-none",
  }) as HTMLUListElement;

  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get("username") || "Player 1";
  const userId = urlParams.get("userId") || "";

  playerSetupMenu(
    player1List,
    "1",
    username,
    false,
    "Shift",
    "Control",
    "#ffffff",
    "#808080",
    "#ff0000"
  );
  // Set the user ID in the hidden input for Player 1 (for both 2-player and 4-player modes)
  // This needs to happen AFTER playerSetupMenu creates the hidden input
  setTimeout(() => {
    const p1IdInput = document.getElementById("p1Id") as HTMLInputElement;
    if (p1IdInput && userId) {
      p1IdInput.value = userId;
    }
  }, 0);
  playerSetupMenu(
    player2List,
    "2",
    "Arthur Dent",
    true,
    "ArrowUp",
    "ArrowDown",
    "#ffffff",
    "#808080",
    "#ff0000"
  );

  player1Container.appendChild(player1List);
  player2Container.appendChild(player2List);

  // 4-player setup is now handled in the wizard logic below

  const { form: setupForm, startButton } = gameSetupMenu(mode);

  const settingsForm = setupForm.querySelector("#settings") as HTMLFormElement;
  const bgColorsForm = setupForm.querySelector("#bgColors") as HTMLFormElement;

  if (mode === "tournament") {
    // Tournament wizard setup
    const tournamentWizard = Object.assign(document.createElement("div"), {
      className: "tournament-wizard",
    }) as HTMLDivElement;

    // Step containers for tournament
    const step1Container = Object.assign(document.createElement("div"), {
      className: "wizard-step",
      id: "step1",
    }) as HTMLDivElement;
    
    const step2Container = Object.assign(document.createElement("div"), {
      className: "wizard-step hidden",
      id: "step2",
    }) as HTMLDivElement;
    
    const step3Container = Object.assign(document.createElement("div"), {
      className: "wizard-step hidden",
      id: "step3",
    }) as HTMLDivElement;

    // Navigation buttons for tournament
    const navigationContainer = Object.assign(document.createElement("div"), {
      className: "flex justify-between items-center mt-6",
    }) as HTMLDivElement;

    const backButton = Object.assign(document.createElement("button"), {
      className: "btn py-2 px-6 text-lg font-bold hidden",
      textContent: t("back") || "Back",
      id: "backBtn",
    }) as HTMLButtonElement;

    const nextButton = Object.assign(document.createElement("button"), {
      className: "btn py-2 px-6 text-lg font-bold",
      textContent: t("next") || "Next",
      id: "nextBtn",
    }) as HTMLButtonElement;

    const finishButton = Object.assign(document.createElement("button"), {
      className: "btn py-2 px-6 text-lg font-bold hidden",
      textContent: t("start") || "Start",
      id: "finishBtn",
    }) as HTMLButtonElement;

    // Step 1: Tournament Settings
    const { form: tournamentForm } = tournamentSetupMenu();
    step1Container.appendChild(tournamentForm);
    
    // Add event listener to update player boxes when number of players changes
    const playersNumberInput = document.getElementById('playersNumber') as HTMLInputElement;
    if (playersNumberInput) {
      playersNumberInput.addEventListener('input', () => {
        // Only update if we're currently on step 2
        if (currentStep === 2) {
          const numPlayers = parseInt(playersNumberInput.value) || 4;
          createPlayerBoxes(numPlayers);
        }
      });
    }

    // Step 2: Player Setup (will be populated dynamically)
    const step2FlexContainer = Object.assign(document.createElement("div"), {
      className: "flex flex-col md:flex-row gap-4 justify-start items-stretch flex-wrap",
      id: "playerSetupContainer",
    }) as HTMLDivElement;
    step2Container.appendChild(step2FlexContainer);

    // Step 3: Game Settings
    const step3FlexContainer = Object.assign(document.createElement("div"), {
      className: "flex flex-col md:flex-row gap-4 justify-start items-stretch flex-wrap",
    }) as HTMLDivElement;
    step3FlexContainer.appendChild(settingsForm);
    step3FlexContainer.appendChild(bgColorsForm);
    step3Container.appendChild(step3FlexContainer);

    // Add steps to wizard
    tournamentWizard.appendChild(step1Container);
    tournamentWizard.appendChild(step2Container);
    tournamentWizard.appendChild(step3Container);

    // Navigation setup
    navigationContainer.appendChild(backButton);
    navigationContainer.appendChild(nextButton);
    navigationContainer.appendChild(finishButton);

    tournamentWizard.appendChild(navigationContainer);
    card.appendChild(tournamentWizard);

    // Function to create dynamic player boxes
    function createPlayerBoxes(numPlayers: number) {
      const container = document.getElementById('playerSetupContainer');
      if (!container) return;
      
      // Clear existing player boxes
      container.innerHTML = '';
      
      // Create player boxes based on number of players
      for (let i = 1; i <= numPlayers; i++) {
        const playerContainer = Object.assign(document.createElement("div"), {
          className: "flex-1"
        }) as HTMLDivElement;
        
        const playerList = Object.assign(document.createElement("ul"), {
          className: "list-none"
        }) as HTMLUListElement;
        
        // Default names for players
        const defaultNames = [
          "Player 1", "Player 2", "Player 3", "Player 4", 
          "Player 5", "Player 6", "Player 7", "Player 8"
        ];
        
        // Default control keys for players
        const defaultKeys = [
          { up: "Shift", down: "Control" },
          { up: "ArrowUp", down: "ArrowDown" },
          { up: "w", down: "s" },
          { up: "i", down: "k" },
          { up: "t", down: "g" },
          { up: "u", down: "j" },
          { up: "o", down: "l" },
          { up: "p", down: ";" }
        ];
        
        let playerName = defaultNames[i - 1] || `Player ${i}`;
        const playerKeys = defaultKeys[i - 1] || { up: "q", down: "a" };
        
        // Set first player to logged-in user
        if (i === 1) {
          const urlParams = new URLSearchParams(window.location.search);
          const username = urlParams.get('username') || 'Player 1';
          playerName = username;
        }
        
        // For other players, we'll let the login modal set the proper names
        // The default names will be used until they're replaced by login
        
        playerSetupMenu(
          playerList, 
          i.toString(), 
          playerName, 
          i > 1, // First player is human (logged-in user), rest are AI by default
          playerKeys.up, 
          playerKeys.down, 
          "#ffffff", 
          "#808080", 
          "#ff0000"
        );
        
        playerContainer.appendChild(playerList);
        container.appendChild(playerContainer);
      }
    }
    
    // Tournament wizard navigation logic
    let currentStep = 1;
    
    function showStep(step: number) {
      // Hide all steps
      document.querySelectorAll('.wizard-step').forEach(el => {
        el.classList.add('hidden');
      });
      
      // Show current step
      const stepElement = document.getElementById(`step${step}`);
      if (stepElement) {
        stepElement.classList.remove('hidden');
      }
      
      // Update button visibility
      backButton.classList.toggle('hidden', step === 1);
      nextButton.classList.toggle('hidden', step === 3);
      finishButton.classList.toggle('hidden', step !== 3);
      
      // Special handling for step 2 - create player boxes
      if (step === 2) {
        const playersNumberInput = document.getElementById('playersNumber') as HTMLInputElement;
        if (playersNumberInput) {
          const numPlayers = parseInt(playersNumberInput.value) || 4;
          createPlayerBoxes(numPlayers);
        }
      }
      
      currentStep = step;
    }
    
    nextButton.addEventListener("click", e => {
      e.preventDefault();
      if (currentStep < 3) {
        showStep(currentStep + 1);
      }
    });
    
    backButton.addEventListener("click", e => {
      e.preventDefault();
      if (currentStep > 1) {
        showStep(currentStep - 1);
      }
    });
    
    finishButton.addEventListener("click", async e => {
      e.preventDefault();
      
      if (mode === "tournament") {
        // Create tournament first, then start the game
        await createAndStartTournament();
      } else {
        await loadConfig(mode);
      }
    });
  } else {
    // Single Player / Multi Player wizard setup
    const singlePlayerWizard = Object.assign(document.createElement("div"), {
      className: "single-player-wizard",
    }) as HTMLDivElement;

    // Step containers for single player
    const singleStep1Container = Object.assign(document.createElement("div"), {
      className: "wizard-step",
      id: "singleStep1",
    }) as HTMLDivElement;
    
    const singleStep2Container = Object.assign(document.createElement("div"), {
      className: "wizard-step hidden",
      id: "singleStep2",
    }) as HTMLDivElement;

    // Navigation buttons for single player
    const singleNavigationContainer = Object.assign(document.createElement("div"), {
      className: "flex justify-between items-center mt-6",
    }) as HTMLDivElement;

    const singleBackButton = Object.assign(document.createElement("button"), {
      className: "btn py-2 px-6 text-lg font-bold hidden",
      textContent: t("back") || "Back",
      id: "singleBackBtn",
    }) as HTMLButtonElement;

    const singleNextButton = Object.assign(document.createElement("button"), {
      className: "btn py-2 px-6 text-lg font-bold",
      textContent: t("next") || "Next",
      id: "singleNextBtn",
    }) as HTMLButtonElement;

    const singleFinishButton = Object.assign(document.createElement("button"), {
      className: "btn py-2 px-6 text-lg font-bold hidden",
      textContent: t("start") || "Start",
      id: "singleFinishBtn",
    }) as HTMLButtonElement;

    // Step 1: Player Setup
    const singleStep1FlexContainer = Object.assign(document.createElement("div"), {
      className: "flex flex-col md:flex-row gap-4 justify-start items-stretch flex-wrap",
    }) as HTMLDivElement;
    
    if (mode === "multi") {
      // For 4-player mode, show all 4 players
      const player3Container = Object.assign(document.createElement("div"), {
        className: "flex-1 min-w-[300px]",
      }) as HTMLDivElement;
      const player4Container = Object.assign(document.createElement("div"), {
        className: "flex-1 min-w-[300px]",
      }) as HTMLDivElement;

      const player3List = Object.assign(document.createElement("ul"), {
        className: "list-none",
      }) as HTMLUListElement;
      const player4List = Object.assign(document.createElement("ul"), {
        className: "list-none",
      }) as HTMLUListElement;

      playerSetupMenu(
        player3List,
        "3",
        "Trillian Astra",
        true,
        "i",
        "k",
        "#ffffff",
        "#808080",
        "#ff0000"
      );
      playerSetupMenu(
        player4List,
        "4",
        "Zaphod Beeblebrox",
        true,
        "PageUp",
        "PageDown",
        "#ffffff",
        "#808080",
        "#ff0000"
      );

      player3Container.appendChild(player3List);
      player4Container.appendChild(player4List);

      singleStep1FlexContainer.appendChild(player1Container);
      singleStep1FlexContainer.appendChild(player2Container);
      singleStep1FlexContainer.appendChild(player3Container);
      singleStep1FlexContainer.appendChild(player4Container);
    } else {
      // For 2-player mode, show only 2 players
      singleStep1FlexContainer.appendChild(player1Container);
      singleStep1FlexContainer.appendChild(player2Container);
    }
    
    singleStep1Container.appendChild(singleStep1FlexContainer);

    // Step 2: Game Settings & Colors
    const singleStep2FlexContainer = Object.assign(document.createElement("div"), {
      className: "flex flex-col md:flex-row gap-4 justify-start items-stretch flex-wrap",
    }) as HTMLDivElement;
    singleStep2FlexContainer.appendChild(settingsForm);
    singleStep2FlexContainer.appendChild(bgColorsForm);
    singleStep2Container.appendChild(singleStep2FlexContainer);

    // Add steps to wizard
    singlePlayerWizard.appendChild(singleStep1Container);
    singlePlayerWizard.appendChild(singleStep2Container);

    // Navigation setup
    singleNavigationContainer.appendChild(singleBackButton);
    singleNavigationContainer.appendChild(singleNextButton);
    singleNavigationContainer.appendChild(singleFinishButton);

    singlePlayerWizard.appendChild(singleNavigationContainer);
    card.appendChild(singlePlayerWizard);

    // Single player wizard navigation logic
    let singleCurrentStep = 1;
    
    function showSingleStep(step: number) {
      // Hide all single player steps
      document.querySelectorAll('.single-player-wizard .wizard-step').forEach(el => {
        el.classList.add('hidden');
      });
      
      // Show current step
      const stepElement = document.getElementById(`singleStep${step}`);
      if (stepElement) {
        stepElement.classList.remove('hidden');
      }
      
      // Update button visibility
      singleBackButton.classList.toggle('hidden', step === 1);
      singleNextButton.classList.toggle('hidden', step === 2);
      singleFinishButton.classList.toggle('hidden', step !== 2);
      
      singleCurrentStep = step;
    }
    
    singleNextButton.addEventListener("click", e => {
      e.preventDefault();
      if (singleCurrentStep < 2) {
        showSingleStep(singleCurrentStep + 1);
      }
    });
    
    singleBackButton.addEventListener("click", e => {
      e.preventDefault();
      if (singleCurrentStep > 1) {
        showSingleStep(singleCurrentStep - 1);
      }
    });
    
    singleFinishButton.addEventListener("click", e => {
      e.preventDefault();
      loadConfig(mode);
    });
  }

  window.addEventListener("resize", () => {
    const canvas = document.getElementById("board") as HTMLCanvasElement;
    if (canvas) {
      if (isFullscreen) {
        // Full screen mode - use actual viewport dimensions
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
      } else {
        // Normal mode - use your existing logic
        const margin = 50; // Same minimal margin as initial sizing
        const availableHeight = window.innerHeight - margin;

        canvas.width = window.innerWidth;
        canvas.height = availableHeight;
        canvas.style.width = "100%";
        canvas.style.height = `${availableHeight}px`;
        canvas.style.maxWidth = "100%";
        canvas.style.maxHeight = `${availableHeight}px`;
        canvas.style.borderRadius = "0"; // Remove any border radius for full square
        canvas.style.display = "block"; // Ensure no extra spacing
      }

      if (data && data.canvas) {
        data.canvas = canvas;
        data.ctx = canvas.getContext("2d")!;
        data.paddleWidth = canvas.width / 60;
        data.paddleHeight = canvas.height / 5;

        // Recreate background gradient for new canvas dimensions
        data.bg = data.ctx.createLinearGradient(0, 0, canvas.width, 0);
        data.bg.addColorStop(0, data.outerBg);
        data.bg.addColorStop(0.5, data.innerBg);
        data.bg.addColorStop(1, data.outerBg);

        // Update paddle positions for new canvas dimensions
        updatePaddlePositions();
      }
    }
  });
}

/**
 * Create tournament and start the first match
 */
async function createAndStartTournament(): Promise<void> {
  try {
    // Get tournament settings from form
    const playersNumber = parseInt((document.getElementById("playersNumber") as HTMLInputElement)?.value || "4");
    
    // Get player data from the form
    const players: string[] = [];
    
    // Collect player IDs from the form (using the correct IDs: p1Id, p2Id, etc.)
    for (let i = 1; i <= playersNumber; i++) {
      const playerIdInput = document.getElementById(`p${i}Id`) as HTMLInputElement;
      const playerNameInput = document.getElementById(`name_p${i}`) as HTMLInputElement;
      const playerAiInput = document.getElementById(`p${i}Ai`) as HTMLInputElement;
      
      // Check if player is AI
      const isAi = playerAiInput ? playerAiInput.checked : (i > 1); // Default: first player human, rest AI
      
      if (isAi) {
        players.push(`AI-Player-${i}`);
      } else {
        if (playerIdInput && playerIdInput.value) {
          players.push(playerIdInput.value);
        } else if (i === 1) {
          const urlParams = new URLSearchParams(window.location.search);
          const userId = urlParams.get('userId') || playerNameInput?.value;
          if (!userId) {
            alert("No valid user ID or player name found for the first player. Please enter a name or log in.");
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
      const playerIdInput = document.getElementById(`p${i}Id`) as HTMLInputElement;
      const playerNameInput = document.getElementById(`name_p${i}`) as HTMLInputElement;
      const playerAiInput = document.getElementById(`p${i}Ai`) as HTMLInputElement;
      console.log(`Player ${i}:`, {
        id: playerIdInput?.value || 'none',
        name: playerNameInput?.value || 'none',
        isAi: playerAiInput?.checked || false,
        finalId: players[i-1]
      });
    }
    

    const urlParams = new URLSearchParams(window.location.search);

    
    const playerIdToNameMap: Record<string, string> = {};
    for (let i = 1; i <= playersNumber; i++) {
      const playerIdInput = document.getElementById(`p${i}Id`) as HTMLInputElement;
      const playerNameInput = document.getElementById(`name_p${i}`) as HTMLInputElement;
      const playerAiInput = document.getElementById(`p${i}Ai`) as HTMLInputElement;
      
      const isAi = playerAiInput ? playerAiInput.checked : (i > 1);
      const playerId = players[i - 1];
      const playerName = playerNameInput?.value || `Player ${i}`;
      
      playerIdToNameMap[playerId] = playerName;
    }
    
    // Store the mapping in a global variable for tournament use
    (window as any).playerIdToNameMap = playerIdToNameMap;
    console.log("Player ID to Name mapping:", playerIdToNameMap);
    const defaultName = `Tournament - ${new Date().toISOString()} (${players.length} players)`;
    const tournamentNameInput = document.getElementById('tournamentName') as HTMLInputElement;
    const userProvidedName = tournamentNameInput?.value?.trim();
    const tournamentData = {
      name: userProvidedName ? userProvidedName : defaultName,
      playersIds: players
    };
    
    const tournament = await tournamentService.createTournament(tournamentData);
    
    if (!tournament || !tournament.id) {
      console.error("Failed to create tournament");
      alert("Failed to create tournament. Please try again.");
      return;
    }
    
    console.log("Tournament created successfully:", tournament.id);
    
    pendingTournamentId = tournament.id;
    
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

export async function loadConfig(mode: string): Promise<void> {
  const appDiv = document.getElementById("app") as HTMLDivElement;
  
  if (mode === "tournament") {

    if (!pendingTournamentId) {
      console.error("No tournament ID available");
      return;
    }
  }
  const scoreboard = Object.assign(document.createElement("div"), {
    className: "scoreboard w-full flex justify-between items-center",
  }) as HTMLDivElement;

  const leftSide = Object.assign(document.createElement("div"), {
    className: "flex items-center",
  }) as HTMLDivElement;
  const p1name = Object.assign(document.createElement("textarea"), {
    className: "p1name game-text",
    rows: "1",
    cols: "30",
    disabled: "true",
  }) as HTMLTextAreaElement;
  const p1score = Object.assign(document.createElement("textarea"), {
    className: "p1score game-text",
    rows: "1",
    cols: "2",
    disabled: "true",
  }) as HTMLTextAreaElement;
  leftSide.append(p1name, p1score);

  const center = Object.assign(document.createElement("span"), {
    className: "game-text",
    textContent: " : ",
  }) as HTMLSpanElement;

  const rightSide = Object.assign(document.createElement("div"), {
    className: "flex items-center",
  }) as HTMLDivElement;
  const p2score = Object.assign(document.createElement("textarea"), {
    className: "p2score game-text",
    rows: "1",
    cols: "2",
    disabled: "true",
  }) as HTMLTextAreaElement;
  const p2name = Object.assign(document.createElement("textarea"), {
    className: "p2name game-text",
    rows: "1",
    cols: "30",
    disabled: "true",
  }) as HTMLTextAreaElement;

  const fullscreenBtn = Object.assign(document.createElement("button"), {
    className: "fullscreen-btn game-text",
    textContent: "⛶",
    title: "Toggle Full Screen",
  }) as HTMLButtonElement;

  fullscreenBtn.addEventListener("click", toggleFullscreen);

  rightSide.append(p2score, p2name, fullscreenBtn);
  scoreboard.append(leftSide, center, rightSide);
  const canvas = Object.assign(document.createElement("canvas"), {
    id: "board",
    tabIndex: 1,
  }) as HTMLCanvasElement;
  const margin = 47;
  const availableHeight = window.innerHeight - margin;

  canvas.width = window.innerWidth;
  canvas.height = availableHeight;
  canvas.style.width = "100%";
  canvas.style.height = `${availableHeight}px`;
  canvas.style.maxWidth = "100%";
  canvas.style.maxHeight = `${availableHeight}px`;
  canvas.style.borderRadius = "0";
  canvas.style.display = "block";
  canvas.style.touchAction = "none";
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  // Add mobile touch controls for full screen
  let touchStartY = 0;
  let touchStartX = 0;

  canvas.addEventListener(
    "touchstart",
    e => {
      e.preventDefault();
      const touch = e.touches[0];
      touchStartY = touch.clientY;
      touchStartX = touch.clientX;
    },
    { passive: false }
  );

  canvas.addEventListener(
    "touchmove",
    e => {
      e.preventDefault();
      if (!data || !data.p) return;

      const touch = e.touches[0];
      const deltaY = touch.clientY - touchStartY;
      const deltaX = touch.clientX - touchStartX;

      // Simple touch controls - left side controls player 1, right side controls player 2
      const canvasRect = canvas.getBoundingClientRect();
      const touchX = touch.clientX - canvasRect.left;
      const isLeftSide = touchX < canvas.width / 2;

      if (isLeftSide && data.p[0]) {
        // Player 1 controls
        if (deltaY < -10) {
          data.keys[data.p[0].up] = true;
          data.keys[data.p[0].down] = false;
        } else if (deltaY > 10) {
          data.keys[data.p[0].down] = true;
          data.keys[data.p[0].up] = false;
        }
      } else if (!isLeftSide && data.p[1]) {
        // Player 2 controls
        if (deltaY < -10) {
          data.keys[data.p[1].up] = true;
          data.keys[data.p[1].down] = false;
        } else if (deltaY > 10) {
          data.keys[data.p[1].down] = true;
          data.keys[data.p[1].up] = false;
        }
      }
    },
    { passive: false }
  );

  canvas.addEventListener(
    "touchend",
    e => {
      e.preventDefault();
      if (data && data.p) {
        data.p.forEach(player => {
          data.keys[player.up] = false;
          data.keys[player.down] = false;
        });
      }
    },
    { passive: false }
  );

  // Auto-enter fullscreen on mobile devices
  if (isMobile()) {
    // Small delay to ensure canvas is ready
    setTimeout(async () => {
      try {
        await enterFullscreen();
      } catch (error) {
        console.log("Auto fullscreen failed, showing manual prompt:", error);
        // If automatic fullscreen fails (Firefox requires user gesture),
        // show a button to enter fullscreen manually
        showFullscreenPrompt();
      }
    }, 100);
  }
  var p: playerData[] = [];
  
  if (mode === "tournament") {
    // For tournaments, dynamically load all players based on the number set
    const playersNumberInput = document.getElementById('playersNumber') as HTMLInputElement;
    const numPlayers = playersNumberInput ? parseInt(playersNumberInput.value) || 4 : 4;
    
    for (let i = 1; i <= numPlayers; i++) {
      let playerId = loadIn(`p${i}Id`);
      
      // Special handling for first player - get user ID from URL if not in form
      if (i === 1 && !playerId) {
        const urlParams = new URLSearchParams(window.location.search);
        playerId = urlParams.get('userId') || '';
      }
      
      p.push(
        loadPlayer(
          loadIn(`name_p${i}`),
          playerId,
          loadInB(`p${i}Ai`),
          loadIn(`p${i}Up`),
          loadIn(`p${i}Down`),
          loadIn(`p${i}InnerCol`),
          loadIn(`p${i}OuterCol`),
          loadIn(`p${i}CornerCol`),
          i
        )
      );
    }
  } else {
    // Standard 2-player setup
    p.push(
      loadPlayer(
        loadIn("name_p1"),
        loadIn("p1Id"), // get user id from hidden input
        loadInB("p1Ai"),
        loadIn("p1Up"),
        loadIn("p1Down"),
        loadIn("p1InnerCol"),
        loadIn("p1OuterCol"),
        loadIn("p1CornerCol"),
        1
      )
    );
    p.push(
      loadPlayer(
        loadIn("name_p2"),
        loadIn("p2Id"), // get user ID from hidden input
        loadInB("p2Ai"),
        loadIn("p2Up"),
        loadIn("p2Down"),
        loadIn("p2InnerCol"),
        loadIn("p2OuterCol"),
        loadIn("p2CornerCol"),
        2
      )
    );
    
    // Add players 3 and 4 for multi mode
    if (mode === "multi") {
      p.push(
        loadPlayer(
          loadIn("name_p3"),
          "", //player ID
          loadInB("p3Ai"),
          loadIn("p3Up"),
          loadIn("p3Down"),
          loadIn("p3InnerCol"),
          loadIn("p3OuterCol"),
          loadIn("p3CornerCol"),
          3
        )
      );
      p.push(
        loadPlayer(
          loadIn("name_p4"),
          "", //player ID
          loadInB("p4Ai"),
          loadIn("p4Up"),
          loadIn("p4Down"),
          loadIn("p4InnerCol"),
          loadIn("p4OuterCol"),
          loadIn("p4CornerCol"),
          4
        )
      );
    }
  }

  const loadData = {
    canvas: canvas,
    fps: 50,
    nameTB1: p1name,
    scoreTB1: p1score,
    scoreTB2: p2score,
    nameTB2: p2name,
    timestamp: 0,
    lastTime: 0,
    paddleWidth: canvas.width / 60,
    paddleHeight: canvas.height / 5,
    ctx: ctx,
    p: p,

    paddleSpeed: 40,
    ballSpeed: 10,
    ballSize: 80,
    maxScore: mode === "tournament" ? parseInt(loadIn("matchLength") || "5", 10) : 3,
    trailLength: 20, //parseInt(loadIn("trailLength") || "20", 10),

    bg: ctx.createLinearGradient(0, 0, canvas.width, 0),
    uiCol: loadIn("uiCol"),
    ballCol: loadIn("ballCol"),
    ballR: String(parseInt(loadIn("ballCol").slice(1, 3), 16)),
    ballG: String(parseInt(loadIn("ballCol").slice(3, 5), 16)),
    ballB: String(parseInt(loadIn("ballCol").slice(5, 7), 16)),
    outerBg: loadIn("outerBg") || "#000000",
    innerBg: loadIn("innerBg") || "#008000",

    serve: Math.floor(Math.random() * 2) ? -1 : 1,
    keys: {},
    showingText: false,
    gameID: "",
    tournamentID: "",
    go: false,
    touchControl: "ontouchstart" in window || navigator.maxTouchPoints > 0,
    mode: "twoPlayers",
    isTournament: false,
    multiball: loadInB("multiball"),
    maxHits: Math.floor(Math.random() * 5 + 5),
    hits: 0,
  };
  loadData.scoreTB1.value = "0";
  loadData.scoreTB2.value = "0";
  
  if (mode === "tournament") {
    loadData.mode = "tournament";
    loadData.isTournament = true;
    // For tournaments, show the first two players in the current match
    loadData.nameTB1.value = p[0]?.name || "Player 1";
    loadData.nameTB2.value = p[1]?.name || "Player 2";
  } else if (mode === "multi") {
    loadData.mode = "multi";
    loadData.nameTB1.value = p[0].name + " / " + p[1].name;
    loadData.nameTB2.value = p[2].name + " / " + p[3].name;
  } else {
    if (loadInB("doublePaddle")) loadData.mode = "doublePaddle";
    loadData.nameTB1.value = p[0].name;
    loadData.nameTB2.value = p[1].name;
  }
  loadData.bg = ctx.createLinearGradient(0, 0, loadData.canvas.width, 0);
  loadData.bg.addColorStop(0, loadIn("outerBg"));
  loadData.bg.addColorStop(0.5, loadIn("innerBg"));
  loadData.bg.addColorStop(1, loadIn("outerBg"));

  switch (loadIn("paddleSpeed")) {
    case "glacial":
      loadData.paddleSpeed = 80;
      break;
    case "slow":
      loadData.paddleSpeed = 60;
      break;
    case "standard":
      loadData.paddleSpeed = 40;
      break;
    case "fast":
      loadData.paddleSpeed = 35;
      break;
    case "insane":
      loadData.paddleSpeed = 30;
      break;
    default:
      loadData.paddleSpeed = 40;
      break;
  }
  switch (loadIn("ballSpeed")) {
    case "glacial":
      loadData.ballSpeed = 15;
      break;
    case "slow":
      loadData.ballSpeed = 12;
      break;
    case "standard":
      loadData.ballSpeed = 10;
      break;
    case "fast":
      loadData.ballSpeed = 8;
      break;
    case "insane":
      loadData.ballSpeed = 6;
      break;
    default:
      loadData.ballSpeed = 10;
      break;
  }
  switch (loadIn("ballSize")) {
    case "tiny":
      loadData.ballSize = 160;
      break;
    case "small":
      loadData.ballSize = 120;
      break;
    case "normal":
      loadData.ballSize = 80;
      break;
    case "big":
      loadData.ballSize = 60;
      break;
    case "huge":
      loadData.ballSize = 40;
      break;
    default:
      loadData.ballSize = 80;
      break;
  }
  data = loadData;
  
  // Set tournament ID if we have a pending one
  if (pendingTournamentId) {
    data.tournamentId = pendingTournamentId;
    pendingTournamentId = null; // Clear the pending ID
  }
  
  // Remove all existing content from app div except what we want to keep
  const gameAppDiv = document.getElementById("app");
  if (gameAppDiv) {
    // Clear all content
    gameAppDiv.innerHTML = "";
    // Change layout for game view
    gameAppDiv.className = [
      "fixed inset-0 flex flex-col",
      "bg-black/60",
      "z-50",
    ].join(" ");

    // Add only the scoreboard and canvas
    gameAppDiv.appendChild(scoreboard);
    gameAppDiv.appendChild(canvas);
  }
  controlKeys();
  document.getElementById("board")?.focus();
  
  if (mode !== "tournament") {
    setTimeout(() => countdown(3, 500), 500);
  }
}
