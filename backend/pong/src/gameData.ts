/*
gameData.ts contains the important data type that stores most of the game's variables
and handles loading and initialization.
*/

import { controlKeys, enterFullscreen, showFullscreenPrompt, setupFullscreenToggle } from "./controls";
import { countdown } from "./pong";
import { t } from "./i18n";
import { wizard, allPlayerData } from "./wizard";

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
  status: "IN_PROGRESS" | "FINISHED" | "CANCELLED";

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
export function setPendingTournamentId(id: string) { pendingTournamentId = id;}

export function getSecondPlayerData(): any {
  return (window as any).gamePlayer2 || null;
}

export function clearSecondPlayerData(): void {
  (window as any).gamePlayer2 = null;
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
  playerIndex?: number,
  mode?: string,
): playerData {
  let finalIsAi = isAi;

  let finalName = name;
  if (!finalName || finalName.trim() === "") {
    if (playerIndex === 1) {
      const urlParams = new URLSearchParams(window.location.search);
      finalName = urlParams.get("username") || "Player 1";
    } else if (finalIsAi) {
      const defaultNames = ["Player 1", "Roger Federror", "Boolena Williams", "Boris Backend"];
      finalName = defaultNames[(playerIndex || 1) - 1] || `Player ${playerIndex || 1}`;
    } else {
      finalName = `Player ${playerIndex || 1}`;
    }
  }
  
  

  let finalUp = up;
  let finalDown = down;
  if (!finalUp || !finalDown) {
    if (playerIndex === 1) {
      finalUp = "w";
      finalDown = "s";
    } else {
      finalUp = "ArrowUp";
      finalDown = "ArrowDown";
    }
  }
  
  

  let finalId = id;
  let isLocalPlayer = false;
  
  if (!finalIsAi && !finalId) {
    if (playerIndex === 1) {
      const urlParams = new URLSearchParams(window.location.search);
      finalId = urlParams.get("userId") || finalName;
    } else {
      isLocalPlayer = true;
      finalId = finalName || `Player-${playerIndex}`;
    }
  }
  
  const finalFormattedId = finalIsAi 
    ? `AI-${finalName.replace(/\s+/g, '-')}` 
    : (isLocalPlayer ? `Local-${finalId.replace(/\s+/g, '-')}` : finalId);

  var p: playerData = {
    name: finalName,
    id: finalFormattedId,
    score: 0,
    isAi: finalIsAi,
    up: finalUp,
    down: finalDown,
    innerCol: innerCol || '#ffffff',
    outerCol: outercol || '#808080',
    cornerCol: cornerCol || '#ff0000',
  };
  return p;
}

function loadIn(id: string): string {
  const el = document.getElementById(id) as HTMLInputElement;
  return el ? el.value : "";
}

function getPlayerDataFromWizard(playerIndex: number): any {
  if (allPlayerData && allPlayerData.length >= playerIndex) {
    return allPlayerData[playerIndex - 1];
  }
  return null;
}

function loadInB(id: string): boolean {
  const el = document.getElementById(id) as HTMLInputElement;
  return el ? el.checked : false;
}

export async function newGame(mode: string): Promise<void> {
  await new Promise<void>((resolve) => {
    if (document.readyState === "complete" || document.readyState === "interactive") {
      setTimeout(resolve, 0);
    } else {
      document.addEventListener("DOMContentLoaded", () => resolve(), { once: true });
    }
  });
  
  const existingAppDiv = document.getElementById("app");
  if (existingAppDiv) {
    existingAppDiv.remove();
  }
  
  const appDiv = Object.assign(document.createElement("div"), {
    id: "app",
  }) as HTMLDivElement;

  appDiv.className = [
    "fixed game-hc inset-0 flex flex-col items-center justify-center",
    "bg-black/60",
    "z-50 pb-2 md:pb-0",
  ].join(" ");

  document.body.appendChild(appDiv);
  const title = document.createElement("h2");
  if (mode === "tournament") {
    title.textContent = t("tournamentSetup");
  } else {
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
  card.id = "card";
  appDiv.appendChild(card);

  wizard(mode);
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
    className: "scoreboard w-full justify-between items-center",
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

  rightSide.append(p2score, p2name);
  scoreboard.append(leftSide, center, rightSide);
  const canvas = Object.assign(document.createElement("canvas"), {
    id: "board",
    tabIndex: 1,
  }) as HTMLCanvasElement;
//  const margin = 47;
//  const availableHeight = window.innerHeight - margin;
//
//  canvas.width = window.innerWidth;
//  canvas.height = availableHeight;
//  canvas.style.width = "100%";
//  canvas.style.height = "100%";//`${availableHeight}px`;
//  canvas.style.maxWidth = "100%";
//  canvas.style.maxHeight = "100%";//`${availableHeight}px`;
  canvas.style.borderRadius = "0";
  canvas.style.display = "block";
  canvas.style.touchAction = "none";
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  var p: playerData[] = [];


  if (mode === "tournament") {
    const playersNumberInput = document.getElementById(
      "playersNumber",
    ) as HTMLInputElement;
    const numPlayers = playersNumberInput
      ? parseInt(playersNumberInput.value) || 4
      : 4;

    const leftUpKey = loadIn("tournamentLeftUp") || "w";
    const leftDownKey = loadIn("tournamentLeftDown") || "s";
    const rightUpKey = loadIn("tournamentRightUp") || "ArrowUp";
    const rightDownKey = loadIn("tournamentRightDown") || "ArrowDown";

    for (let i = 1; i <= numPlayers; i++) {
      const wizardData = getPlayerDataFromWizard(i);
      
      let playerId = loadIn(`p${i}Id`);
      
      if (!playerId && wizardData?.id) {
        playerId = wizardData.id;
      }

      if (i === 1 && !playerId) {
        const urlParams = new URLSearchParams(window.location.search);
        playerId = urlParams.get("userId") || "";
      }

      const upKey = (i % 2 === 1) ? leftUpKey : rightUpKey;
      const downKey = (i % 2 === 1) ? leftDownKey : rightDownKey;

      p.push(
        loadPlayer(
          loadIn(`name_p${i}`),
          playerId,
          loadInB(`p${i}Ai`),
          upKey,
          downKey,
          loadIn(`p${i}InnerCol`),
          loadIn(`p${i}OuterCol`),
          loadIn(`p${i}CornerCol`),
          i,
          mode,
        ),
      );
    }
  } else {
    for (let i = 1; i <= (mode === "multi" ? 4 : 2); i++) {
      const wizardData = getPlayerDataFromWizard(i);
      
      const name = loadIn(`name_p${i}`) || wizardData?.name || `Player ${i}`;
      
      let id = loadIn(`p${i}Id`);
      
      if (!id && wizardData?.id) {
        id = wizardData.id;
      }
      
      if (!id && i === 1) {
        const urlParams = new URLSearchParams(window.location.search);
        id = urlParams.get("userId") || "";
      }
      
      const isAi = loadInB(`p${i}Ai`) || wizardData?.isAi || false;
      
      const up = loadIn(`p${i}Up`) || wizardData?.keys?.up || "ArrowUp";
      const down = loadIn(`p${i}Down`) || wizardData?.keys?.down || "ArrowDown";
      
      p.push(
        loadPlayer(
          name,
          id,
          isAi,
          up,
          down,
          loadIn(`p${i}InnerCol`),
          loadIn(`p${i}OuterCol`),
          loadIn(`p${i}CornerCol`),
          i,
          mode,
        ),
      );
    }
  	}	const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	
	const resizeCanvas = () => {
		canvas.width = isMobile ? window.innerWidth : screen.width;
		canvas.height = isMobile ? window.innerHeight : screen.height;
		
		if (data && data.ctx) {
			data.paddleWidth = canvas.width / (isMobile ? 80 : 60);
			data.paddleHeight = canvas.height / 5;
			data.bg = ctx.createLinearGradient(0, 0, canvas.width, 0);
			data.bg.addColorStop(0, data.outerBg);
			data.bg.addColorStop(0.5, data.innerBg);
			data.bg.addColorStop(1, data.outerBg);
		}
	};
	
	resizeCanvas();
	
	document.addEventListener("fullscreenchange", resizeCanvas);
	window.addEventListener("resize", resizeCanvas);
	
	const loadData: gameData = {
		canvas: canvas,
		fps: 50,
		nameTB1: p1name,
		scoreTB1: p1score,
		scoreTB2: p2score,
		nameTB2: p2name,
		timestamp: 0,
		lastTime: 0,
		paddleWidth: canvas.width / (isMobile ? 80 : 60),
		paddleHeight: canvas.height / 5,
		ctx: ctx,
		p: p,

		paddleSpeed: 40,
		ballSpeed: 10,
		ballSize: 80,
		maxScore:
			mode === "tournament" ? parseInt(loadIn("matchLength") || "5", 10) : 3,
		trailLength: 20,

		bg: ctx.createLinearGradient(0, 0, canvas.width, 0),
		uiCol: loadIn("uiCol"),
		ballCol: loadIn("ballCol"),
		ballR: String(parseInt(loadIn("ballCol").slice(1, 3), 16)),
		ballG: String(parseInt(loadIn("ballCol").slice(3, 5), 16)),
		ballB: String(parseInt(loadIn("ballCol").slice(5, 7), 16)),
		outerBg: loadIn("outerBg") || "#001a1a",
		innerBg: loadIn("innerBg") || "#1a4d4d",

		serve: Math.floor(Math.random() * 2) ? -1 : 1,
		keys: {},
		showingText: false,
		gameID: "",
		tournamentID: "",
		go: false,
		touchControl: "ontouchstart" in window || navigator.maxTouchPoints > 0,
		mode: "twoPlayers",
		status: "IN_PROGRESS",
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
		case "glacial":	loadData.paddleSpeed = 80;	break;
		case "slow":	loadData.paddleSpeed = 60;	break;
		case "standard":loadData.paddleSpeed = 40;	break;
		case "fast":	loadData.paddleSpeed = 35;	break;
		case "insane":	loadData.paddleSpeed = 30;	break;
		default:		loadData.paddleSpeed = 40;	break;
	}
	switch (loadIn("ballSpeed")) {
		case "glacial":	loadData.ballSpeed = 12;	break;
		case "slow":	loadData.ballSpeed = 10;	break;
		case "standard":loadData.ballSpeed = 8;	break;
		case "fast":	loadData.ballSpeed = 6;		break;
		case "insane":	loadData.ballSpeed = 4;		break;
		default:		loadData.ballSpeed = 8;	break;
	}
	switch (loadIn("ballSize")) {
		case "tiny":	loadData.ballSize = 160;	break;
		case "small":	loadData.ballSize = 120;	break;
		case "normal":	loadData.ballSize = 80;		break;
		case "big":		loadData.ballSize = 60;		break;
		case "huge":	loadData.ballSize = 40;		break;
		default:		loadData.ballSize = 80;		break;
	}
	data = loadData;

  if (pendingTournamentId) {
    data.tournamentId = pendingTournamentId;
    pendingTournamentId = null;
  }

  const gameAppDiv = document.getElementById("app");
  if (gameAppDiv) {
    gameAppDiv.innerHTML = "";
    gameAppDiv.className = [
      "fixed inset-0 flex flex-col",
      "bg-black/60",
      "z-50",
    ].join(" ");

    const fullscreenToggle = Object.assign(document.createElement("button"), {
      id: "fullscreen-toggle",
      className: "fixed top-4 right-4 z-50 bg-[rgba(3,27,27,0.9)] border-2 border-[#66fcf1] rounded-lg p-2 hover:bg-[rgba(102,252,241,0.2)] transition-colors hidden",
    }) as HTMLButtonElement;
    fullscreenToggle.setAttribute("aria-label", "Enter fullscreen");
    fullscreenToggle.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#66fcf1" stroke-width="2">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
      </svg>
    `;

    gameAppDiv.appendChild(scoreboard);
    gameAppDiv.appendChild(canvas);
    gameAppDiv.appendChild(fullscreenToggle);
  }
  controlKeys();
  setupFullscreenToggle();
  document.getElementById("board")?.focus();

  setTimeout(async () => {
    try {
      await enterFullscreen();
    } catch (error) {
      showFullscreenPrompt();
    }
  }, 100);

  if (mode !== "tournament") {
    setTimeout(() => countdown(3, 500), 500);
  }
}
