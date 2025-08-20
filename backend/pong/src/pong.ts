import { data } from "./gameData";
import { loadConfig } from "./gameData";
import { controlKeys } from "./controls";
import { movePlayer } from "./controls";
import { moveAI } from "./controls";
import Paddle from "./Paddle";
import Ball from "./Ball";

export let p1: Paddle;
export let p2: Paddle;
export let ball: Ball;

async function startGame() {
	try {
		await loadConfig();
		controlKeys();
		document.getElementById("board")?.focus();
		startRound();
	} catch (error) {
		console.error('Failed to load configuration:', error);
	}
}

export function startRound(): void {
	data.ctx.fillStyle = data.bg;
	data.ctx.rect(0, 0, data.canvas.width, data.canvas.height);
	data.ctx.fill();
	data.scoreP1TB.value = String(data.score1);
	data.scoreP2TB.value = String(data.score2);
	ball = new Ball();
	p1 = new Paddle(0, data.p1InnerCol, data.p1OuterCol, data.p1CornerCol);
	p2 = new Paddle(data.canvas.width - data.paddleWidth, data.p2InnerCol, data.p2OuterCol, data.p2CornerCol);
	p1.move();
	p2.move();
	data.ballY = data.canvas.height / 2;
	ball.setDirX(0.01 * data.serve);
	p1.go(window.setInterval(() => movePlayer(p1, data.p1Up, data.p1Down), 20));
	if (data.singlePlayer) p2.go(window.setInterval(() => moveAI(ball), 20));
	else p2.go(window.setInterval(() => movePlayer(p2, data.p2Up, data.p2Down), 20));
	ball.go(window.setInterval(() => ball.move(), 5));
}

export function endGame(): void {
	if (data.score1 > data.score2)
		console.log("Player 1 wins!");
	else console.log("Player 2 wins!");
}

startGame();