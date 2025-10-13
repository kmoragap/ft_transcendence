import { controlKeys, enterFullscreen, showFullscreenPrompt } from "./controls";
import { countdown } from "./pong";
import { playerSetupMenu } from "./menus";
import { t } from "./i18n";
import { wizard } from "./wizard";

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
): playerData {
  const isAiByName = name.includes("Player") && name !== "Player 1";
  const finalIsAi = isAi || isAiByName;

  let finalId = id;
  if (!finalIsAi && !finalId) {
    const urlParams = new URLSearchParams(window.location.search);
    finalId = urlParams.get("userId") || name; // Use name as last resort
  }

  var p: playerData = {
    name: name,
    id: finalIsAi ? `AI-${name.replace(/\s+/g, '-')}` : finalId,
    score: 0,
    isAi: finalIsAi,
    up: up,
    down: down,
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
    "fixed inset-0 flex flex-col items-center justify-center",
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

    const leftUpKey = loadIn("tournamentLeftUp") || "Shift";
    const leftDownKey = loadIn("tournamentLeftDown") || "Control";
    const rightUpKey = loadIn("tournamentRightUp") || "ArrowUp";
    const rightDownKey = loadIn("tournamentRightDown") || "ArrowDown";

    for (let i = 1; i <= numPlayers; i++) {
      let playerId = loadIn(`p${i}Id`);

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
        ),
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
        1,
      ),
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
        2,
      ),
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
          3,
        ),
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
          4,
        ),
      );
    }
  }
	const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	
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
	
	setTimeout(async () => {
		try {
			await enterFullscreen();
			setTimeout(resizeCanvas, 100);
		} catch (error) {
			console.log("Auto fullscreen failed, showing manual prompt:", error);
			showFullscreenPrompt();
		}
	}, 100);
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
		trailLength: 20, //parseInt(loadIn("trailLength") || "20", 10),

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
		case "glacial":	loadData.ballSpeed = 15;	break;
		case "slow":	loadData.ballSpeed = 12;	break;
		case "standard":loadData.ballSpeed = 10;	break;
		case "fast":	loadData.ballSpeed = 8;		break;
		case "insane":	loadData.ballSpeed = 6;		break;
		default:		loadData.ballSpeed = 10;	break;
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
    pendingTournamentId = null; // Clear the pending ID
  }

  const gameAppDiv = document.getElementById("app");
  if (gameAppDiv) {
    gameAppDiv.innerHTML = "";
    gameAppDiv.className = [
      "fixed inset-0 flex flex-col",
      "bg-black/60",
      "z-50",
    ].join(" ");

    gameAppDiv.appendChild(scoreboard);
    gameAppDiv.appendChild(canvas);
  }
  controlKeys();
  document.getElementById("board")?.focus();

  if (mode !== "tournament") {
    setTimeout(() => countdown(3, 500), 500);
  }
}
