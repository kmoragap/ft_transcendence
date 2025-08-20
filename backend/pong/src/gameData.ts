export type gameData = {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	scoreP1TB: HTMLTextAreaElement;
	scoreP2TB: HTMLTextAreaElement;
	
	singlePlayer: boolean;
	maxScore: number;
	serve: number;
	keys: Record<string, boolean>;
	
	bg: CanvasGradient;
	uiCol: string;
	ballCol: string;
	p1InnerCol: string;
	p1OuterCol: string;
	p1CornerCol: string;
	p2InnerCol: string;
	p2OuterCol: string;
	p2CornerCol: string;
	
	p1Up: string;
	p1Down: string;
	p2Up: string;
	p2Down: string;
	
	paddleWidth: number;
	paddleHeight: number;
	paddleSpeed: number;
	
	ballSpeed: number;
	ballSize: number;
	ballY: number;
	
	score1: number;
	score2: number;
};

export let data: gameData;

export async function loadConfig(): Promise<void> {
	await new Promise<void>(resolve => {
		if (document.readyState === 'complete') resolve();
		else document.addEventListener('DOMContentLoaded', () => resolve());
	});
	const config = document.getElementById("config");
	if (!config) throw new Error("Config element not found");

	const canvas = document.getElementById("board") as HTMLCanvasElement;
	const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
	const loadData = {
		canvas: canvas,
		ctx: ctx,
		scoreP1TB: document.getElementById("p1score") as HTMLTextAreaElement,
		scoreP2TB: document.getElementById("p2score") as HTMLTextAreaElement,
		
		singlePlayer: false,
		maxScore: parseInt(config.getAttribute("maxScore") || "10", 10),
		serve: 1,
		keys: {},
		
		bg: ctx.createLinearGradient(0, 0, canvas.width, 0),
		uiCol: config.getAttribute("uiCol") || "",
		ballCol: config.getAttribute("ballCol") || "",
		p1InnerCol: config.getAttribute("p1InnerCol") || "",
		p1OuterCol: config.getAttribute("p1OuterCol") || "",
		p1CornerCol: config.getAttribute("p1CornerCol") || "",
		p2InnerCol: config.getAttribute("p2InnerCol") || "",
		p2OuterCol: config.getAttribute("p2OuterCol") || "",
		p2CornerCol: config.getAttribute("p2CornerCol") || "",
		
		p1Up: config.getAttribute("p1Up") || "",
		p1Down: config.getAttribute("p1Down") || "",
		p2Up: config.getAttribute("p2Up") || "",
		p2Down: config.getAttribute("p2Down") || "",
		
		paddleWidth: 0,
		paddleHeight: 0,
		paddleSpeed: 2,
		
		ballSpeed: 2,
		ballSize: 80,
		ballY: 0,
	
		score1: 0,
		score2: 0,
	}

	loadData.canvas.width = window.innerWidth;
	loadData.canvas.height = window.innerHeight - loadData.scoreP1TB.offsetHeight * 2;
	loadData.paddleWidth = canvas.width / 60;
	loadData.paddleHeight = canvas.height / 5;
	loadData.bg = ctx.createLinearGradient(0, 0, canvas.width, 0);
	var innerBg: string = config.getAttribute("innerBg") || "";
	var outerBg: string = config.getAttribute("outerBg") || "";
	loadData.bg.addColorStop(0, outerBg);
	loadData.bg.addColorStop(0.5, innerBg);
	loadData.bg.addColorStop(1, outerBg);

	if (config.getAttribute("singlePlayer") == "true") loadData.singlePlayer = true;
	if (Math.floor(Math.random() * 2)) loadData.serve = -1;

	switch (config.getAttribute("ballSpeed")) {
		case "glacial":		loadData.ballSpeed = 10;	break;
		case "slow":		loadData.ballSpeed = 5;		break;
		case "standard":	loadData.ballSpeed = 2;		break;
		case "fast":		loadData.ballSpeed = 1.5;	break;
		case "insane":		loadData.ballSpeed = 1;		break;
		default:			loadData.ballSpeed = 2;		break;
	}
	switch (config.getAttribute("ballSize")) {
		case "tiny":		loadData.ballSize = 160;	break;
		case "small":		loadData.ballSize = 120;	break;
		case "normal":		loadData.ballSize = 80;		break;
		case "big":			loadData.ballSize = 60;		break;
		case "huge":		loadData.ballSize = 40;		break;
		default:			loadData.ballSize = 80;		break;
	}
	switch (config.getAttribute("paddleSpeed")) {
		case "glacial":		loadData.paddleSpeed = 5000;break;
		case "slow":		loadData.paddleSpeed = 2500;break;
		case "standard":	loadData.paddleSpeed = 400;	break;
		case "fast":		loadData.paddleSpeed = 300;	break;
		case "insane":		loadData.paddleSpeed = 200;	break;
		default:			loadData.paddleSpeed = 400;	break;
	}
	
	data = loadData;
}