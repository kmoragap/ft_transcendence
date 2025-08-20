import Paddle from "./Paddle";
import { data } from "./gameData";
import { p1 } from "./pong";
import { p2 } from "./pong";
import { ball } from "./pong";
import { startRound } from "./pong";
import { endGame } from "./pong";

export default class Ball {
	private _goTime: number = 0;
	private _ballSpeed: number = data.canvas.width / data.ballSpeed;
	private _x: number = data.canvas.width / 2;
	private _dirX: number = 0;
	private _dirY: number = 0;
	private _size: number = data.canvas.width / data.ballSize;
	private _grad!: CanvasGradient;
	
	constructor() {
		this._x = data.canvas.width / 2;
		data.ballY = data.canvas.height / 2;
	}
	
	public go(go: number): void {this._goTime = go;}
	public stop(): void {clearTimeout(this._goTime);}
	public getDirX(): number {return this._dirX;}
	public setDirX(dir: number): void {this._dirX = dir;}
	public setDirY(dir: number): void {this._dirY = dir;}
	
	private erase(): void {
		data.ctx.beginPath();
		data.ctx.ellipse(this._x, data.ballY, this._size + 1, this._size + 1, 0, 0, Math.PI * 2);
		data.ctx.fillStyle = data.bg;
		data.ctx.fill();
	}
	
	private draw(): void {
		data.ctx.beginPath();
		this._grad = data.ctx.createRadialGradient(this._x - this._size / 2, data.ballY - this._size / 2, this._size / 10, this._x, data.ballY, this._size);
		this._grad.addColorStop(0, "white");
		this._grad.addColorStop(0.3, data.ballCol);
		this._grad.addColorStop(0.6, data.ballCol);
		this._grad.addColorStop(1, "black");
		data.ctx.ellipse(this._x, data.ballY, this._size, this._size, 0, 0, Math.PI * 2);
		data.ctx.fillStyle = this._grad;
		data.ctx.fill();
	}
	
	private midline(): void {
		if (this._x > (data.canvas.width / 2 - this._size * 2) && this._x < (data.canvas.width / 2 + this._size * 2)) {
			data.ctx.beginPath();
			data.ctx.moveTo(data.canvas.width / 2, 0);
			data.ctx.lineTo(data.canvas.width / 2, data.canvas.height);
			data.ctx.strokeStyle = data.uiCol;
			data.ctx.stroke();
			data.ctx.beginPath();
		}
	}
	
	private collision(paddle: Paddle): void {
		var angle: number = Math.abs(Math.atan2(this._dirY, this._dirX) - Math.PI);
		const hitPosition = (data.ballY - (paddle.getPosY() + data.paddleHeight / 2)) / (data.paddleHeight / 2);
		const clampedHit = Math.max(-0.7, Math.min(0.7, hitPosition));
		const isRightPaddle = paddle.getPosX() > (data.canvas.width / 2);
		const baseAngle = isRightPaddle ? Math.PI : 0;
		const variationAngle = clampedHit * (isRightPaddle ? -(Math.PI / 4) : Math.PI / 4) + baseAngle;
		if (isRightPaddle) {
			this._x = data.canvas.width - this._size - data.paddleWidth - 1;
			angle += variationAngle - Math.PI;
		} else {
			this._x = this._size + data.paddleWidth + 1;
			angle += variationAngle;
		}
		this._dirX = (Math.cos(angle)) / 100;
		this._dirY = (Math.sin(angle)) / 100;
	}
	
	private checkPaddle(): void {
		if (this._x > 0 && this._x < data.paddleWidth + this._size && p1.hit()) this.collision(p1);
		if (this._x >= data.canvas.width - this._size - data.paddleWidth && this._x < data.canvas.width - this._size && p2.hit()) this.collision(p2);
	}
	
	private checkWalls(): void {
		if (this._x <= this._size || this._x >= data.canvas.width - this._size) {
			ball.stop();
			p1.stop();
			p2.stop();
			if (this._x <= this._size) {
				data.score2++;
				data.scoreP2TB.value = String(data.score2);
				console.log("Player 2 scores!");
				data.serve = -1;
			}
			if (this._x >= data.canvas.width - this._size) {
				data.score1++;
				data.scoreP1TB.value = String(data.score1);
				console.log("Player 1 scores!");
				data.serve = 1;
			}
			if (data.score1 < data.maxScore && data.score2 < data.maxScore) setTimeout(startRound, 1000);
			else endGame();
		}
		if (data.ballY <= this._size || data.ballY >= data.canvas.height - this._size) this._dirY *= -1;
	}
	
	private advanceBall(): void {
		for (let i = 0; i < this._ballSpeed; i++) {
			this._x += this._dirX;
			data.ballY += this._dirY;
		}
	}
	
	public move(): void {
		this.erase();
		this.midline();
		this.checkPaddle();
		this.checkWalls();
		this.advanceBall();
		this.draw();
	}
}