import { gameService, GameData } from "./services/gameService";
//import { userService } from "./services/userService";

export type playerData = {
	scoreTB: HTMLTextAreaElement;
	nameTB: HTMLTextAreaElement;
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
	paddleWidth: number;
	paddleHeight: number;
	ctx: CanvasRenderingContext2D;
	p1: playerData;
	p2: playerData;
	
	bg: CanvasGradient;
	uiCol: string;
	ballCol: string;
	ballR: string;
	ballG: string;
	ballB: string;
	
	paddleSpeed: number;
	ballSpeed: number;
	ballSize: number;
	showAiPath: boolean;
	maxScore: number;
	trailLength: number;
	
	serve: number;
	keys: Record<string, boolean>;
	showingText: boolean;
	gameID: string;
};

export let data: gameData;

function loadPlayer(scoreTB: HTMLTextAreaElement, nameTB: HTMLTextAreaElement, name: string, id: string, isAi: boolean, up: string, down: string, innerCol: string, outercol: string, cornerCol: string):playerData {
	var p: playerData =  {
		scoreTB: scoreTB,
		nameTB: nameTB,
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
	p.nameTB.value = p.name;
	p.scoreTB.value = "0";
	return p;
}

function loadTA(id: string): HTMLTextAreaElement {
	return document.getElementById(id) as HTMLTextAreaElement;
}

function loadIn(id: string): string {
	const el = document.getElementById(id) as HTMLInputElement;
	return el.value;
}

function loadInB(id: string): boolean {
	const el = document.getElementById(id) as HTMLInputElement;
	return el.checked;
}

export async function loadConfig(): Promise<void> {
	await new Promise<void>(resolve => {
		if (document.readyState === 'complete') resolve();
		else document.addEventListener('DOMContentLoaded', () => resolve());
	});
	//load player data from user DB
	//const ud = await userService.getUsersById("test", "test2");
	
	var canvas = document.getElementById("board") as HTMLCanvasElement;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight - loadTA("p1score").clientHeight;
	const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

	const loadData = {
		canvas: canvas,
		paddleWidth: canvas.width / 60,
		paddleHeight: canvas.height / 5,
		ctx: ctx,
		p1: loadPlayer(
			loadTA("p1score"),
			loadTA("p1name"),
			loadIn("name_p1"),
			"",//player ID
			loadInB("p1Ai"),
			loadIn("p1Up"),
			loadIn("p1Down"),
			loadIn("p1InnerCol"),
			loadIn("p1OuterCol"),
			loadIn("p1CornerCol")
		),
		p2: loadPlayer(
			loadTA("p2score"),
			loadTA("p2name"),
			loadIn("name_p2"),
			"",//player ID
			loadInB("p2Ai"),
			loadIn("p2Up"),
			loadIn("p2Down"),
			loadIn("p2InnerCol"),
			loadIn("p2OuterCol"),
			loadIn("p2CornerCol")
		),
		
		paddleSpeed: 40,
		ballSpeed: 10,
		ballSize: 80,
		showAiPath: loadInB("showAiPath"),
		maxScore: parseInt(loadIn("maxScore") || "10", 10),
		trailLength: parseInt(loadIn("trailLength") || "20", 10),
		
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
	//const gd: GameData = {data.p1.name, data.p2.name, data.p1.id, data.p2.id, data.maxScore};
	//const res = await gameService.createGame(gd);
}