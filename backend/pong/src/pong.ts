import { data } from "./gameData";
import { loadConfig } from "./gameData";
import { controlKeys } from "./controls";
import Paddle from "./Paddle";
import { midline } from "./Paddle.draw";
import Ball from "./Ball";
import { initI18n } from "./../../../frontend/src/i18n";
//import { userService, UserData } from "./services/userService";
import { gameService } from "./services/gameService";

export let pad: Paddle[] = new Array(2);
export let balls: Ball[] = [];

export function removeBall(ball: Ball): void {
	let shrunk: Ball[] = [];
	for (let i: number = 0; i < balls.length; i++)
		if (balls[i] != ball) shrunk.push(balls[i]);
	balls = shrunk;
}

export async function startGame() {
	try {
		await loadConfig();
		await initI18n();
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

export function startRound(): void {
	initBoard();
	pad[0].go();
	pad[1].go();
	balls[0].go();
	data.go = true;
	window.requestAnimationFrame(loop);
}

function initBoard():void {
	data.showingText = false;
	balls.push(new Ball());
	pad = new Array(new Paddle(0, data.p1), new Paddle(data.canvas.width - data.paddleWidth, data.p2));
}

function update(): void {
	const now = performance.now();
	if (now - data.lastTime > 1000 / 50) {
		data.lastTime = now;
		for (let i: number = 0; i < balls.length; i++) balls[i].move();
		for (let i: number = 0; i < pad.length; i++) {
			if (pad[i].isAi()) pad[i].moveAI();
			else pad[i].movePaddle();
		}
	}
}

function render(): void {
	data.ctx.fillStyle = data.bg;
	data.ctx.rect(0, 0, data.canvas.width, data.canvas.height);
	data.ctx.fill();
	midline();
	for (let i: number = 0; i < pad.length; i++) pad[i].draw();
	for (let i: number = 0; i < balls.length; i++) balls[i].draw();
}

function loop():void {
	if (data.go){
		update();
		render();
		window.requestAnimationFrame(loop);
	}
}

export function endRound(): void {
	//gameService.updateScore(data.gameID, data.p1.score, data.p2.score);
	while (balls.length) {
		balls[0].stop();
		balls.shift();
	}
	while(pad.length) {
		pad[0].stop();
		pad.shift();
	}
	if (data.p1.score < data.maxScore && data.p2.score < data.maxScore) setTimeout(startRound, 1500);
	else endGame();
}

export async function endGame() {
	var winner: string;
	if (data.p1.score > data.p2.score)
		winner = data.p1.name;
	else winner = data.p2.name;
	data.showingText = false;
	//const res = await gameService.finishGame(data.gameID, data.p1.score, data.p2.score, winner);
	//console.log(res);
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