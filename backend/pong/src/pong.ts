import { data } from "./gameData";
import { loadConfig } from "./gameData";
import { controlKeys } from "./controls";
import Paddle from "./Paddle";
import Ball from "./Ball";
import { initI18n } from "./../../../frontend/src/i18n";
import { userService, UserData } from "./services/userService";
import { gameService, GameData } from "./services/gameService";

export let pad: Paddle[] = [];
export let ball: Ball;

document.getElementById('gameMenu')!.addEventListener('submit', function(e) {
	e.preventDefault();
	if (!data.showingText) {
		if (ball) ball.stop();
		for (let i: number = 0; i < pad.length; i++) {
			pad[0].stop();
			pad.shift();
	}
		setTimeout(() => startGame(), 1000);
	}
});

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

function initBoard():void {
	data.showingText = false;
	data.ctx.fillStyle = data.bg;
	data.ctx.rect(0, 0, data.canvas.width, data.canvas.height);
	data.ctx.fill();
	ball = new Ball();
	pad = new Array(new Paddle(0, data.p1), new Paddle(data.canvas.width - data.paddleWidth, data.p2));
}

export function startRound(): void {
	initBoard();
	pad[0].go();
	pad[1].go();
	setTimeout(() => ball.go(), 250);
}

export function endRound(): void {
	//gameService.updateScore(data.gameID, data.p1.score, data.p2.score);
	ball.stop();
	for (let i: number = 0; i < pad.length; i++) {
		pad[i].stop();
		pad.unshift();
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

startGame();