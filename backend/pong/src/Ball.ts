import Paddle from "./Paddle";
import { data } from "./gameData";
import { p1 } from "./pong";
import { p2 } from "./pong";
import { ball } from "./pong";
import { startRound } from "./pong";
import { endGame } from "./pong";

interface TrailPoint {
	x: number;
	y: number;
}

export default class Ball {
	private _go: boolean = false;
	private _goTime: number = 0;
	private _ballSpeed: number = data.canvas.width / data.ballSpeed;
	private _x: number = data.canvas.width / 2;
	private _y: number = data.canvas.height / 2;
	private _dirY: number = ((Math.random() * 30) - 15) / 10000;
	private _dirX: number = (0.01 - this._dirY) * data.serve;
	private _size: number = data.canvas.width / data.ballSize;
	private _grad!: CanvasGradient;
	private _trailPoints: TrailPoint[] = [];
	private _trailFade = 30 / data.trailLength;

	constructor() {
		this._x = data.canvas.width / 2;
		this._y = data.canvas.height / 2;
	}

	public go(): void {
		this._goTime = window.setInterval(() => this.move(), 5);
		this._go = true;
	}
	public stop(): void {
		window.clearTimeout(this._goTime);
		this._go = false;
		this._dirX = 0;
		this._dirY = 0;
	}
	public isGo(): boolean { return this._go;}
	public getX(): number {return this._x;}
	public getY(): number {return this._y;}
	public getSize(): number {return this._size;}
	public getDirX(): number {return this._dirX;}
	public getDirY(): number {return this._dirY;}
	public setDirX(dir: number): void {this._dirX = dir;}
	public setDirY(dir: number): void {this._dirY = dir;}

	private erase(x: number, y: number): void {
		data.ctx.beginPath();
		data.ctx.ellipse(x, y, this._size + 1, this._size + 1, 0, 0, Math.PI * 2);
		data.ctx.fillStyle = data.bg;
		data.ctx.fill();
	}

	private draw(): void {
		this.drawTrail();
		//define grad
		this._grad = data.ctx.createRadialGradient(this._x - this._size / 2, this._y - this._size / 2, this._size / 10, this._x, this._y, this._size);
		this._grad.addColorStop(0, "white");
		this._grad.addColorStop(0.3, data.ballCol);
		this._grad.addColorStop(0.6, data.ballCol);
		this._grad.addColorStop(1, "black");
		//draw ball
		data.ctx.beginPath();
		data.ctx.ellipse(this._x, this._y, this._size, this._size, 0, 0, Math.PI * 2);
		data.ctx.fillStyle = this._grad;
		data.ctx.fill();
		data.ctx.closePath();
	}

	private drawTrail(): void {
		const currentPoint: TrailPoint = {
			x: this._x,
			y: this._y,
		};
		this._trailPoints.unshift(currentPoint);
		for (let i = this._trailPoints.length - 1; i > 0; i--) 
			this.erase(this._trailPoints[i].x, this._trailPoints[i].y);
		this.midline(this._trailPoints[this._trailPoints.length - 1].x);
		let opacity: number = 0;
		for (let i = this._trailPoints.length - 1; i > 0; i--) {
			data.ctx.beginPath();
			data.ctx.ellipse(this._trailPoints[i].x, this._trailPoints[i].y, this._size, this._size, 0, 0, Math.PI * 2);
			data.ctx.fillStyle = `rgb(${data.ballR} ${data.ballG} ${data.ballB} / ${opacity}%`;
			data.ctx.fill();
			data.ctx.closePath();
			opacity += this._trailFade;
		}
		this._trailPoints = this._trailPoints.slice(0, data.trailLength);
	}

	private midline(x: number): void {
		if (x > (data.canvas.width / 2 - this._size * 2) && x < (data.canvas.width / 2 + this._size * 2)) {
			data.ctx.beginPath();
			data.ctx.lineWidth = 1;
			data.ctx.moveTo(data.canvas.width / 2, 0);
			data.ctx.lineTo(data.canvas.width / 2, data.canvas.height);
			data.ctx.strokeStyle = data.uiCol;
			data.ctx.stroke();
			data.ctx.closePath();
		}
	}

	private collision(paddle: Paddle): void {
		const hitPosition = (this._y - (paddle.getY() + data.paddleHeight / 2)) / (data.paddleHeight / 2);
		const clampedHit = Math.max(-0.7, Math.min(0.7, hitPosition));
		const isRightPaddle = paddle.getX() > (data.canvas.width / 2);
		var variationAngle: number = clampedHit * (isRightPaddle ? -(Math.PI / 4) : Math.PI / 4);
		var angle: number = Math.atan2(this._dirY / 2, -this._dirX);
		angle += variationAngle;
		this._dirX = (Math.cos(angle)) / 100;
		this._dirY = (Math.sin(angle)) / 100;
	}

	private checkPaddle(): void {
		if (p1.hitX() && p1.hitY()) this.collision(p1);
		if (p2.hitX() && p2.hitY()) this.collision(p2);
	}

	private checkWalls(): void {
		if (this._x <= this._size || this._x >= data.canvas.width - this._size) {
			ball.stop();
			p1.stop();
			p2.stop();
			if (this._x <= this._size) {
				data.p2.score++;
				data.p2.scoreTB.value = String(data.p2.score);
				setTimeout(() => p2.scoreText(), 100);
				data.serve = -1;
			}
			if (this._x >= data.canvas.width - this._size) {
				data.p1.score++;
				data.p1.scoreTB.value = String(data.p1.score);
				setTimeout(() => p1.scoreText(), 100);
				data.serve = 1;
			}
			if (data.p1.score < data.maxScore && data.p2.score < data.maxScore) setTimeout(startRound, 2000);
			else endGame();
		}
		if (this._y <= this._size || this._y >= data.canvas.height - this._size) this._dirY *= -1;
	}

	private advanceBall(): void {
		var stop: boolean = false;
		for (let i = 0; i < this._ballSpeed && !stop; i++) {
			this._x += this._dirX;
			this._y += this._dirY;
			if (this._x < ball.getSize()) stop = true;
			if (this._x >= data.canvas.width - ball.getSize()) stop = true;
			if (this._dirX < 0 && p1.hitX() && p1.hitY()) stop = true;
			if (this._dirX >= 0 && p2.hitX() && p2.hitY()) stop = true;
		}
	}

	public move(): void {
		if (this._go) {
			this.checkPaddle();
			this.checkWalls();
			this.advanceBall();
			this.draw();
		}
	}
}