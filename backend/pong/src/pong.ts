import { data } from "./gameData";
import { newGame } from "./gameData";
import Paddle from "./Paddle";
import { midline } from "./Paddle.draw";
import Ball from "./Ball";
import { initI18n } from "./../../../frontend/src/i18n";
//import { userService, UserData } from "./services/userService";
import { gameService } from "./services/gameService";

export let pad: Paddle[] = [];
export let balls: Ball[] = [];

export function removeBall(ball: Ball): void {
	let shrunk: Ball[] = [];
	for (let i: number = 0; i < balls.length; i++)
		if (balls[i] != ball) shrunk.push(balls[i]);
	balls = shrunk;
}

export async function startGame(fourPlayers: boolean) {
	try {
		await initI18n();
		await newGame(fourPlayers);
//		collisionTest()
	} catch (error) {
		console.error('Failed to load configuration:', error);
	}
}

export function countdown(nr: number, ms: number) {
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
	if (data.mode == "fourPlayers" || data.mode == "doublePaddle") pad[2].go();
	if (data.mode == "fourPlayers" || data.mode == "doublePaddle") pad[3].go();
	balls[0].go();
	data.go = true;
	window.requestAnimationFrame(loop);
}

function initBoard():void {
	data.showingText = false;
	data.keys = {};
	balls.push(new Ball());
	pad = new Array(new Paddle(0, data.p[0]));console.log(data.mode);
	if (data.mode == "twoPlayers") pad.push(new Paddle(data.canvas.width - data.paddleWidth, data.p[1]));
	if (data.mode == "doublePaddle") {
		pad.push(new Paddle(data.canvas.width - data.paddleWidth, data.p[1]));
		pad.push(new Paddle(data.canvas.width * 0.25 - data.paddleWidth, data.p[0]));
		pad.push(new Paddle(data.canvas.width * 0.75 - data.paddleWidth, data.p[1]));
	}
	if (data.mode == "fourPlayers")	{
		pad.push(new Paddle(data.canvas.width * 0.25 - data.paddleWidth, data.p[1]));
		pad.push(new Paddle(data.canvas.width * 0.75 - data.paddleWidth, data.p[2]));
		pad.push(new Paddle(data.canvas.width - data.paddleWidth, data.p[3]));
	}
}

function loop():void {
	if (data.go){
		update();
		render();
		window.requestAnimationFrame(loop);
	}
}

function update(): void {
	const now = performance.now();
	if (now - data.lastTime > 1000 / data.fps) {
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
	if (data.trailLength) for (let i: number = 0; i < balls.length; i++) balls[i].drawTrail();
	for (let i: number = 0; i < balls.length; i++) balls[i].draw();
	if ((/*data.mouseControl || */data.touchControl)) {
		data.ctx.fillStyle = `rgb(80 80 80 / 25%)`;
		data.ctx.font = `bold ${data.canvas.height / 4}px system-ui`;
		for (let i: number = 0; i < pad.length; i++) {
			if (i == 0 && !pad[i].isAi()) {
//				data.ctx.fillRect(0, 0, data.canvas.width / 4, data.canvas.height / 4);
				data.ctx.textBaseline = "top";
				data.ctx.textAlign = "left";
				data.ctx.fillText("\u{2B06}", data.canvas.width / 16, 0);
//				data.ctx.fillRect(0, data.canvas.height * 3 / 4, data.canvas.width / 4, data.canvas.height);
				data.ctx.textBaseline = "bottom";
				data.ctx.textAlign = "left";
				data.ctx.fillText("\u{2B07}", data.canvas.width / 16, data.canvas.height);
			}
			if (i == 1 && !pad[i].isAi()) {
//				data.ctx.fillRect(data.canvas.width * 3 / 4, 0, data.canvas.width, data.canvas.height / 4);
				data.ctx.textBaseline = "top";
				data.ctx.textAlign = "right";
				data.ctx.fillText("\u{2B06}", data.canvas.width * 15 / 16, 0);
//				data.ctx.fillRect(data.canvas.width * 3 / 4, data.canvas.height * 3 / 4, data.canvas.height, data.canvas.width);
				data.ctx.textBaseline = "bottom";
				data.ctx.textAlign = "right";
				data.ctx.fillText("\u{2B07}", data.canvas.width * 15 / 16, data.canvas.height);
			}
		}
	}
}

export function endRound(): void {
	//gameService.updateScore(data.gameID, data.p[0].score, data.p[1].score);
	while (balls.length) {
		balls[0].stop();
		balls.shift();
	}
	while(pad.length) {
		pad[0].stop();
		pad.shift();
	}
	if (data.p[0].score < data.maxScore && data.p[1].score < data.maxScore) setTimeout(startRound, 1500);
	else endGame();
}

export async function endGame() {
	var winner: string;
	if (data.p[0].score > data.p[1].score)
		winner = data.p[0].name;
	else winner = data.p[1].name;
	data.showingText = false;
	//const res = await gameService.finishGame(data.gameID, data.p[0].score, data.p[1].score, winner);
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

function collisionTest(): void {
	data.showingText = false;
	data.p[0].isAi = false;
//	data.p[1].isAi = false;
	data.multiball = false;
	data.trailLength = 0;
	data.maxScore = 1;
	data.ballSpeed = 70;
	//x axis
	balls.push(new Ball(data.canvas.width / 2, data.canvas.height / 2,                                           -0.1, 0));
	balls.push(new Ball(data.canvas.width / 2, data.canvas.height / 2 - (data.canvas.width / data.ballSize) * 4, -0.1, 0));
	balls.push(new Ball(data.canvas.width / 2, data.canvas.height / 2 - (data.canvas.width / data.ballSize) * 2, -0.1, 0));
	balls.push(new Ball(data.canvas.width / 2, data.canvas.height / 2 + (data.canvas.width / data.ballSize) * 2, -0.1, 0));
	balls.push(new Ball(data.canvas.width / 2, data.canvas.height / 2 + (data.canvas.width / data.ballSize) * 4, -0.1, 0));
	//y axis
	balls.push(new Ball(data.canvas.width / 2 - data.paddleWidth * 2 - (data.canvas.width / data.ballSize) / 2, data.canvas.height / 2 - (data.canvas.width / data.ballSize) * 6, 0, +0.1));
	balls.push(new Ball(data.canvas.width / 2 - data.paddleWidth * 3 + (data.canvas.width / data.ballSize) / 2, data.canvas.height / 2 + (data.canvas.width / data.ballSize) * 6, 0, -0.1));
	balls.push(new Ball(data.canvas.width / 2 + data.paddleWidth * 2, data.canvas.height / 2 - (data.canvas.width / data.ballSize) * 6, 0, +0.1));
	balls.push(new Ball(data.canvas.width / 2 + data.paddleWidth * 2, data.canvas.height / 2 + (data.canvas.width / data.ballSize) * 6, 0, -0.1));
	
	
	pad = new Array(new Paddle(data.canvas.width / 2 - data.paddleWidth * 2, data.p[0]), new Paddle(data.canvas.width / 2 + data.paddleWidth, data.p[1]));
	pad[0].go();
	pad[1].go();
	balls[0].go();
	balls[1].go();
	balls[2].go();
	balls[3].go();
	balls[4].go();
	balls[5].go();
	balls[6].go();
	balls[7].go();
	balls[8].go();
	data.go = true;
	window.requestAnimationFrame(loop);
}

//testCreateGame();
startGame(false);