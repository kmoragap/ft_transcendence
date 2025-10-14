/*
The ball class handles the movement and drawing of the pong ball and its trail.
The size and speed of the ball all are derived from the canvas dimensions.

Important functions:
checkWalls() reflects the ball from the top and bottom wall, if a left or
right wall is hit and there is only one ball in play, it ends the round and
awards a point to the player on the other end.

if Multiball mode is enabled, spawnMultiball() spawns another ball at the paddle
that was hit last. It only triggers every 5-10 paddle hits.
*/

import Paddle from "./Paddle";
import { scoreText } from "./Paddle.draw";
import { data } from "./gameData";
import { pad, balls, removeBall } from "./pong";

interface TrailPoint {
	x: number;
	y: number;
}

export default class Ball {
	private _go: boolean = false;
	private _ballSpeed: number = data.canvas.width / data.ballSpeed;
	private _x: number = data.canvas.width / 2;
	private _y: number = data.canvas.height / 2;
	private _dirY: number = ((Math.random() * 30) - 15) / 1000;
	private _dirX: number = (0.1 - this._dirY) * data.serve;
	private _size: number = data.canvas.width / data.ballSize;
	private _trailPoints: TrailPoint[] = [];
	private _trailFade: number = 30 / data.trailLength;

	constructor(...args: number[]) {
		if (!args.length) {
			this._x = data.canvas.width / 2;
			this._y = data.canvas.height / 2;
		} else {
			this._x = args[0];
			this._y = args[1];
			this._dirX = args[2];
			this._dirY = args[3];
		}
	}

	public go(): void {this._go = true;}
	public isGo(): boolean {return this._go;}
	public getX(): number {return this._x;}
	public getY(): number {return this._y;}
	public setX(x: number): void {this._x = x;}
	public setY(y: number): void {this._y = y;}
	public getSize(): number {return this._size;}
	public getDirX(): number {return this._dirX;}
	public getDirY(): number {return this._dirY;}
	public setDirX(dir: number): void {this._dirX = dir;}
	public setDirY(dir: number): void {this._dirY = dir;}

	public stop(): void {
		this._go = false;
		this._dirX = 0;
		this._dirY = 0;
	}

	public draw(): void {
		//define grad
		var grad:CanvasGradient = data.ctx.createRadialGradient(this.getX() - this.getSize() / 2, this.getY() - this.getSize() / 2,
			this.getSize() / 10, this.getX(), this.getY(), this.getSize());
		grad.addColorStop(0, "white");
		grad.addColorStop(0.3, data.ballCol);
		grad.addColorStop(0.6, data.ballCol);
		grad.addColorStop(1, "black");
		//draw ball
		data.ctx.beginPath();
		data.ctx.ellipse(this._x, this._y, this._size, this._size, 0, 0, Math.PI * 2);
		data.ctx.fillStyle = grad;
		data.ctx.fill();
		data.ctx.closePath();
	}

	public drawTrail(): void {
		const currentPoint: TrailPoint = {
			x: this._x,
			y: this._y,
		};
		this._trailPoints.unshift(currentPoint);
		let opacity: number = 0;
		for (let i = this._trailPoints.length - 1; i > 0; i--) {
			data.ctx.beginPath();
			data.ctx.ellipse(this._trailPoints[i].x, this._trailPoints[i].y,
				this._size * (this._trailPoints.length - 1 - i) / (this._trailPoints.length - 1),
				this._size * (this._trailPoints.length - 1 - i) / (this._trailPoints.length - 1),
				0, 0, Math.PI * 2);
			data.ctx.fillStyle = `rgb(${data.ballR} ${data.ballG} ${data.ballB} / ${opacity}%`;
			data.ctx.fill();
			data.ctx.closePath();
			opacity += this._trailFade;
		}
		this._trailPoints = this._trailPoints.slice(0, data.trailLength);
	}

	public collision(paddle: Paddle): void {
		const hitPositionX = (this._y - (paddle.getY() + data.paddleHeight / 2)) / (data.paddleHeight / 2);
		const hitPositionY = (this._x - (paddle.getX() + data.paddleWidth / 2)) / (data.paddleWidth / 2);
		const clampedHitX = Math.max(-0.7, Math.min(0.7, hitPositionX));
		const clampedHitY = Math.max(-0.7, Math.min(0.7, hitPositionY));
		const xSide = paddle.getX() + data.paddleWidth / 2 > this.getX() + this._size / 2;
		const ySide = paddle.getY() + data.paddleHeight / 2 > this.getY() + this._size / 2;
		var variationAngle: number = 0;
		var angle: number = 0;
		if (paddle.hitY(this)) {
			variationAngle = clampedHitX * (xSide ? -(Math.PI / 4) : Math.PI / 4);
			angle = Math.atan2(this._dirY / 2, -this._dirX);
		} else {
			variationAngle = clampedHitY * (ySide ? Math.PI / 4 : -(Math.PI / 4));
			angle = Math.atan2(-this._dirY, this._dirX / 2);
		}
		angle += variationAngle;
		this._dirX = (Math.cos(angle)) / 10;
		this._dirY = (Math.sin(angle)) / 10;
	}

	private checkWalls(): void {
		if (this._x <= this._size || this._x >= data.canvas.width - this._size) {
			this.stop();
			if (balls.length == 1) {
				data.go = false;
				if (this._x <= this._size) {
					var pl: number = 1;
					if (data.mode == "multi") pl = 2;
					data.p[pl].score++;
					data.scoreTB2.value = String(data.p[pl].score);
					if (data.mode == "multi") {
						if (pad.length) setTimeout(() => scoreText(pad[pl], "Team 2", data.p[pl].score == data.maxScore), 100);
					} else if (pad.length) setTimeout(() => scoreText(pad[pl], data.nameTB2.value, data.p[pl].score == data.maxScore), 100);
					data.serve = -1;
				}
				if (this._x >= data.canvas.width - this._size) {
					data.p[0].score++;
					data.scoreTB1.value = String(data.p[0].score);
					if (data.mode == "multi") {
						if (pad.length) setTimeout(() => scoreText(pad[0], "Team 1", data.p[0].score == data.maxScore), 100);
					} else if (pad.length) setTimeout(() => scoreText(pad[0], data.nameTB1.value, data.p[0].score == data.maxScore), 100);
					data.serve = 1;
				}
			}
			removeBall(this);
		}
		if (this._y < this._size || this._y >= data.canvas.height - this._size) this._dirY *= -1;
	}

	private advanceBall(): void {
		var stop: boolean = false;
		for (let i = 0; i < this._ballSpeed && !stop && this.isGo(); i++) {
			this._x += this._dirX;
			this._y += this._dirY;
			if (this._x < this.getSize()) stop = true;
			if (this._x >= data.canvas.width - this.getSize()) stop = true;
			for (let i: number = 0; i < pad.length && pad.length; i++)
				if (pad[i].hitX(this) && pad[i].hitY(this)){
					stop = true;
					this._x -= this._dirX * 2;
					this._y -= this._dirY * 2;
					this.collision(pad[i]);
					if (data.multiball) {
						data.hits++;
						if (data.hits == data.maxHits) {
							data.hits = 0;
							data.maxHits =  Math.floor(Math.random()* 5 + 5);
							spawnMultiball(this);
						}
					}
				}
		}
	}

	public move(): void {
		if (this._go) {
			this.checkWalls();
			this.advanceBall();
		}
	}
}

export function spawnMultiball(ball: Ball) {
	if (balls.length < 25) {
		let angle: number = Math.atan2(ball.getDirY(), ball.getDirX());
		let variation: number = ((Math.random() * 40)- 30) / 100;
		if (Math.floor(Math.random() * 2)) variation *= -1;
		angle +=  variation;
		let newBall: Ball = new Ball(ball.getX(), ball.getY(), Math.cos(angle) / 10, Math.sin(angle) / 10);
		newBall.go();
		balls.push(newBall);
	}
}