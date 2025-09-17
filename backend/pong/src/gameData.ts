//import { userService } from "./services/userService";
import { controlKeys } from "./controls";
import { countdown } from "./pong";
import { playerSetupMenu, gameSetupMenu } from "./menus";

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
}

export type gameData = {
	canvas: HTMLCanvasElement;
	fps: number;
	nameTB1: HTMLTextAreaElement,
	scoreTB1: HTMLTextAreaElement,
	scoreTB2: HTMLTextAreaElement,
	nameTB2: HTMLTextAreaElement,
	timestamp: number;
	lastTime: number;
	paddleWidth: number;
	paddleHeight: number;
	ctx: CanvasRenderingContext2D;
	p:  playerData[];
	
	bg: CanvasGradient;
	uiCol: string;
	ballCol: string;
	ballR: string;
	ballG: string;
	ballB: string;
	
	paddleSpeed: number;
	ballSpeed: number;
	ballSize: number;
	maxScore: number;
	trailLength: number;
	
	serve: number;
	keys: Record<string, boolean>;
	showingText: boolean;
	gameID: string;
	go: boolean;
	touchControl: boolean;
	mode: string;
	
	multiball: boolean;
	maxHits: number;
	hits: number;
};

export let data: gameData;

function loadPlayer(name: string, id: string, isAi: boolean, up: string, down: string, innerCol: string, outercol: string, cornerCol: string):playerData {
	var p: playerData =  {
		name: name,
		id: id,
		score: 0,
		isAi: isAi,
		up: up,
		down: down,
		innerCol: innerCol,
		outerCol: outercol,
		cornerCol: cornerCol
	}
	if (isAi) p.name = "Marvin";
	return p;
}

function loadIn(id: string): string {
	const el = document.getElementById(id) as HTMLInputElement;
	return el.value;
}

function loadInB(id: string): boolean {
	const el = document.getElementById(id) as HTMLInputElement;
	return el.checked;
}

export async function newGame(fourPlayers: boolean): Promise<void> {
  await new Promise<void>(resolve => {
    if (document.readyState === 'complete') resolve();
    else document.addEventListener('DOMContentLoaded', () => resolve());
  });
  //load player data from user DB 
  //const users: string[] = ["test", "test2"];
  //const ud = await userService.getUsersByIds(users);

  const appDiv = Object.assign(document.createElement("div"), { id: "app" }) as HTMLDivElement;

  appDiv.className = [
    "fixed inset-0 flex items-center justify-center",
    "bg-black/60",
    "z-50"
  ].join(" ");

  document.body.appendChild(appDiv);

  // Card wrapper
  const card = document.createElement("div");
  card.className = [
    "w-[min(900px,92vw)]",
    "rounded-2xl",
    "bg-[rgba(3,27,27,0.9)]",
    "shadow-[0_10px_30px_rgba(0,0,0,0.5)]",
    "p-6 md:p-8 space-y-6"
  ].join(" ");
  appDiv.appendChild(card);

  const title = document.createElement("h2");
  title.textContent = "Game Setup";
  title.className = "text-2xl md:text-3xl font-bold text-[#66fcf1] text-center";
  card.appendChild(title);

  const players = Object.assign(document.createElement("ul"), {
    id: "playerSetup",
    className: [
      "flex flex-row justify-between",
      "list-none"
    ].join(" ")
  }) as HTMLUListElement;

  playerSetupMenu(players, "1", "Ford Prefect", true, "Shift", "Control", "#ffffff", "#808080", "#ff0000");
  playerSetupMenu(players, "2", "Arthur Dent",  true, "ArrowUp", "ArrowDown", "#ffffff", "#808080", "#ff0000");
  if (fourPlayers) {
    playerSetupMenu(players, "3", "Trillian Astra",     true, "i", "k", "#ffffff", "#808080", "#ff0000");
    playerSetupMenu(players, "4", "Zaphod Beeblebrox",  true, "PageUp", "PageDown", "#ffffff", "#808080", "#ff0000");
  }
  card.appendChild(players);

  // Game options + start button (make gameSetupMenu return a <form id="gameSetup">)
  const setupForm = gameSetupMenu(fourPlayers);
  // Give the form a nice layout + button style
  setupForm.classList.add(
    "space-y-4",
    "pt-2",
    "border-t",
    "border-[#66fcf1]/15"
  );
  // You can also add classes to inner controls in gameSetupMenu, see below.
  card.appendChild(setupForm);

  document.getElementById('gameSetup')!.addEventListener('submit', (e) => {
    e.preventDefault();
    loadConfig(fourPlayers);
  });
}

export function loadConfig(fourPlayers: boolean) {
	const appDiv = document.getElementById('app') as HTMLDivElement;
//create scoreboard
	const scoreboard = Object.assign(document.createElement("div"),   {className: "scoreboard"}) as HTMLDivElement;
	const p1name  = Object.assign(document.createElement("textarea"), {className: "p1name game-text",  rows: "1", cols: "30", disabled: "true"}) as HTMLTextAreaElement;
	const p1score = Object.assign(document.createElement("textarea"), {className: "p1score game-text", rows: "1", cols: "2",  disabled: "true"}) as HTMLTextAreaElement;
	const p2score = Object.assign(document.createElement("textarea"), {className: "p2score game-text", rows: "1", cols: "2",  disabled: "true"}) as HTMLTextAreaElement;
	const p2name  = Object.assign(document.createElement("textarea"), {className: "p2name game-text",  rows: "1", cols: "30", disabled: "true"}) as HTMLTextAreaElement;
	scoreboard.append(p1name, p1score, ' : ', p2score, p2name);
//create canvas
	const canvas = Object.assign(document.createElement('canvas'), { id: 'board', tabIndex: 1 }) as HTMLCanvasElement;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight - p1score.clientHeight;
	const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
	var p: playerData[] = [];
	p.push(loadPlayer(
		loadIn("name_p1"),
		"",//player ID
		loadInB("p1Ai"),
		loadIn("p1Up"),
		loadIn("p1Down"),
		loadIn("p1InnerCol"),
		loadIn("p1OuterCol"),
		loadIn("p1CornerCol")));
	p.push(loadPlayer(
		loadIn("name_p2"),
		"",//player ID
		loadInB("p2Ai"),
		loadIn("p2Up"),
		loadIn("p2Down"),
		loadIn("p2InnerCol"),
		loadIn("p2OuterCol"),
		loadIn("p2CornerCol")));
	if (fourPlayers) p.push(loadPlayer(
		loadIn("name_p3"),
		"",//player ID
		loadInB("p3Ai"),
		loadIn("p3Up"),
		loadIn("p3Down"),
		loadIn("p3InnerCol"),
		loadIn("p3OuterCol"),
		loadIn("p3CornerCol")));
	if (fourPlayers) p.push(loadPlayer(
		loadIn("name_p4"),
		"",//player ID
		loadInB("p4Ai"),
		loadIn("p4Up"),
		loadIn("p4Down"),
		loadIn("p4InnerCol"),
		loadIn("p4OuterCol"),
		loadIn("p4CornerCol")));

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
		maxScore: 3,//parseInt(loadIn("maxScore") || "10", 10),
		trailLength: 20,//parseInt(loadIn("trailLength") || "20", 10),
		
		bg: ctx.createLinearGradient(0, 0, canvas.width, 0),
		uiCol: loadIn("uiCol"),
		ballCol: loadIn("ballCol"),
		ballR: String(parseInt(loadIn("ballCol").slice(1, 3), 16)),
		ballG: String(parseInt(loadIn("ballCol").slice(3, 5), 16)),
		ballB: String(parseInt(loadIn("ballCol").slice(5, 7), 16)),
		
		serve: Math.floor(Math.random() * 2) ? -1 : 1,
		keys: {},
		showingText: false,
		gameID: "",
		go: false,
		touchControl: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
		mode: "twoPlayers",
		
		multiball: loadInB("multiball"),
		maxHits: Math.floor(Math.random()* 5 + 5),
		hits: 0,
	}
	loadData.scoreTB1.value = "0";
	loadData.scoreTB2.value = "0";
	if (fourPlayers) {
		loadData.mode = "fourPlayers";
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
		case "glacial":		loadData.paddleSpeed = 80;	break;
		case "slow":		loadData.paddleSpeed = 60;	break;
		case "standard":	loadData.paddleSpeed = 40;	break;
		case "fast":		loadData.paddleSpeed = 35;	break;
		case "insane":		loadData.paddleSpeed = 30;	break;
		default:			loadData.paddleSpeed = 40;	break;
	}
	switch (loadIn("ballSpeed")) {
		case "glacial":		loadData.ballSpeed = 15;	break;
		case "slow":		loadData.ballSpeed = 12;	break;
		case "standard":	loadData.ballSpeed = 10;	break;
		case "fast":		loadData.ballSpeed = 8;		break;
		case "insane":		loadData.ballSpeed = 6;		break;
		default:			loadData.ballSpeed = 10;	break;
	}
	switch (loadIn("ballSize")) {
		case "tiny":		loadData.ballSize = 160;	break;
		case "small":		loadData.ballSize = 120;	break;
		case "normal":		loadData.ballSize = 80;		break;
		case "big":			loadData.ballSize = 60;		break;
		case "huge":		loadData.ballSize = 40;		break;
		default:			loadData.ballSize = 80;		break;
	}
	data = loadData;
	(document.getElementById("playerSetup") as HTMLUListElement).remove();
	(document.getElementById("gameSetup") as HTMLUListElement).remove();
	appDiv.appendChild(scoreboard);
	appDiv.appendChild(canvas);
	controlKeys();
	document.getElementById("board")?.focus();
	setTimeout(() => countdown(3, 500), 500);
	//const gd: GameData = {data.p1.name, data.p2.name, data.p1.id, data.p2.id, data.maxScore};
	//const res = await gameService.createGame(gd);
}