import { data } from "./gameData";
import { loadConfig } from "./gameData";
import { controlKeys } from "./controls";
import Paddle from "./Paddle";
import Ball from "./Ball";
import { initI18n } from "./i18n";
import { gameService } from "./services/gameService";
export let p1: Paddle;
export let p2: Paddle;
export let ball: Ball;

document.getElementById('gameMenu')!.addEventListener('submit', function(e) {
	e.preventDefault();
	startGame();
});

export async function startGame() {
	try {
		await loadConfig();
		
		// Get language from URL parameters or default to 'en'
		const urlParams = new URLSearchParams(window.location.search);
		const lang = urlParams.get('lang') || 'en';
		
		await initI18n(lang);
		controlKeys();
		document.getElementById("board")?.focus();
		setTimeout(() => countdown(3, 500), 500);
	} catch (error) {
		console.error('Failed to load configuration:', error);
	}
}

function countdown(nr: number, ms: number) {
	data.showingText = true;
	data.ctx.fillStyle = data.bg;
	data.ctx.rect(0, 0, data.canvas.width, data.canvas.height);
	data.ctx.fill();
	data.ctx.font = `bold ${data.canvas.height * 0.75}px system-ui`;
	data.ctx.fillStyle = "yellow";
	data.ctx.strokeStyle = "red";
	data.ctx.lineWidth = data.canvas.height / 60;
	data.ctx.textAlign = "center";
	data.ctx.textBaseline = "middle";
	data.ctx.strokeText(String(nr), data.canvas.width / 2, data.canvas.height / 2);
	data.ctx.fillText(String(nr), data.canvas.width / 2, data.canvas.height / 2);
	if (nr - 1) setTimeout(() => countdown(nr - 1, ms), ms);
	else setTimeout(() => startRound(), ms);
}

function initBoard():void {
	data.showingText = false;
	data.ctx.fillStyle = data.bg;
	data.ctx.rect(0, 0, data.canvas.width, data.canvas.height);
	data.ctx.fill();
	ball = new Ball();
	p1 = new Paddle(0, data.p1);
	p2 = new Paddle(data.canvas.width - data.paddleWidth, data.p2);
}
export function startRound(): void {
	initBoard();
	p1.go();
	p2.go();
	setTimeout(() => ball.go(), 250);
}

export function endGame(): void {
	if (data.p1.score > data.p2.score)
		console.log("Player 1 wins!");
	else console.log("Player 2 wins!");
	data.showingText = false;
	//submit score to DB and exit
}


//testcase for the game
async function testCreateGame() {
  const gameData = {
    player1Id: 'player1-id',
    player2Id: 'player2-id',
    player1Name: 'Player One',
    player2Name: 'Player Two',
    maxScore: 5,
    gameType: 'VS_HUMAN' as const
  };
  const result = await gameService.createGame(gameData);
  console.log('Result test:', result);
}
//testCreateGame();
startGame();