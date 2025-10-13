import { data, playerData } from "./gameData";
import { pad, balls } from "./pong";
import Ball from "./Ball";
import { quarterCorner, halfCorner, debugOutline } from "./Paddle.draw";

export default class Paddle {
	private _x: number;
	private _y: number;
	private _p: playerData;
	private _dir: number = 0;
	
	private _paddleGrad!: CanvasGradient;
	private _topCornerGrad!: CanvasGradient;
	private _bottomCornerGrad!: CanvasGradient;
	private _goTime: number = 0;
	private _moveSpeed: number = data.canvas.height / data.paddleSpeed;
	
	private _aiTarget: number = data.canvas.height / 2;
	private _aiRecalcTime: number = 0;

	public constructor(x: number, p: playerData) {
		this._x = x;
		this._y = data.canvas.height / 2 - data.paddleHeight / 2;
		this._p = p;
		this.draw();
	}

	public go(): void {
		if (this._p.isAi) {
			this._aiRecalcTime = window.setInterval(() => this.calcTarget(), 1000);
		}
		this._goTime = 1;
	}
	
	public stop(): void {
		window.clearTimeout(this._aiRecalcTime);
		this._aiRecalcTime = 0;
		this._goTime = 0;
	}
	
	public getX(): number {return this._x;}
	public getY(): number {return this._y;}
	public getX2(): number {return this._x + data.paddleWidth;}
	public getY2(): number {return this._y + data.paddleHeight;}
	public setX(x: number): void {this._x = x;}
	public setY(y: number): void {this._y = y;}
	public getPl(): playerData {return this._p;}
	public getPG(): CanvasGradient {return this._paddleGrad;}
	public getTCG(): CanvasGradient {return this._topCornerGrad;}
	public getBCG(): CanvasGradient {return this._bottomCornerGrad;}
	public getPlr(): playerData {return this._p;}
	public getDir(): number {return this._dir;}
	public setDir(dir: number) {this._dir = dir;}
	public getMoveSpeed(): number {return this._moveSpeed;}
	public isAi(): boolean {return this._p.isAi;}
	public isGo(): number {return this._goTime;}

	public draw(): void {
		this._paddleGrad = data.ctx.createLinearGradient(this._x, this._y, this.getX2(), this._y);
		const outerCol = this._p.outerCol || '#808080';
		const innerCol = this._p.innerCol || '#ffffff';
		this._paddleGrad.addColorStop(0, outerCol);
		this._paddleGrad.addColorStop(0.5, innerCol);
		this._paddleGrad.addColorStop(1, outerCol);
		
		data.ctx.beginPath();
		data.ctx.fillStyle = this._paddleGrad;
		data.ctx.fillRect(this._x, this._y + data.paddleWidth, data.paddleWidth, data.paddleHeight - data.paddleWidth * 2);

		this._topCornerGrad = data.ctx.createRadialGradient(this._x + data.paddleWidth / 2, this._y + data.paddleWidth / 2, data.paddleWidth / 7, this._x + data.paddleWidth / 2, this._y + data.paddleWidth / 2, data.paddleWidth);
		this._topCornerGrad.addColorStop(0, "white");
		this._topCornerGrad.addColorStop(0.75, this._p.cornerCol || '#ff0000');
		this._bottomCornerGrad = data.ctx.createRadialGradient(this._x + data.paddleWidth / 2, this.getY2() - data.paddleWidth / 2, data.paddleWidth / 7, this._x + data.paddleWidth / 2, this.getY2() - data.paddleWidth / 2, data.paddleWidth);
		this._bottomCornerGrad.addColorStop(0, "white");
		this._bottomCornerGrad.addColorStop(0.75, this._p.cornerCol || '#ff0000');
		
		if (!this._p.isAi) quarterCorner(this);
		 else halfCorner(this);
	}

	public hitY(ball: Ball): boolean {
		const ballCenterY = ball.getY() + ball.getSize() / 2;
		return ballCenterY > this._y && ballCenterY < this.getY2() + ball.getSize();
	}

	public hitX(ball: Ball): boolean {
		return ball.getX() + ball.getSize() > this._x
		&& ball.getX() < this._x + data.paddleWidth + ball.getSize();
	}

	public moveAI(): void {
		if (this._aiTarget >= this._y && this._aiTarget < this.getY2()) {
			this._dir = 0;
			data.keys[this._p.up] = false;
			data.keys[this._p.down] = false;
		} else {
			if (this._aiTarget < this._y + this._dir) {
				data.keys[this._p.up] = true;
				data.keys[this._p.down] = false;
			} else if (this._aiTarget >= this.getY2() + this._dir) {
				data.keys[this._p.down] = true;
				data.keys[this._p.up] = false;
			}
		}
		this.movePaddle();
	}

	public movePaddle(): void {
		if (data.keys[this._p.up])
			if (this._y > 0) this._dir = -1; else this._dir = 0;
		if (data.keys[this._p.down]) 
			if (this._y <= data.canvas.height - data.paddleHeight) this._dir = 1; else this._dir = 0;
		this.move();
	}

	private move(): void {
		this._y += this._dir * this._moveSpeed;
		if (this._dir)
			for (let i: number = 0; i < balls.length; i++)
				if (this.hitX(balls[i]) && this.hitY(balls[i])) {
					if (balls[i].getY() < this._y + data.paddleHeight / 2)
						balls[i].setY(this._y - balls[i].getSize() * 2);
					else balls[i].setY(this.getY2() + balls[i].getSize() * 2);
					balls[i].collision(this);
					if (balls[i].getY() < balls[i].getSize()) {
//						while (this.hitX(balls[i])) {
//							console.log("correcting " + balls[i].getX() + " with " + balls[i].getDirX());
//							balls[i].setX(balls[i].getX() + balls[i].getDirX());//????
//						}
						balls[i].setY(balls[i].getSize() + 1);
					}
				}
		if (this._y < 0) this._y = 0;
		if (this._y > data.canvas.height - data.paddleHeight) this._y = data.canvas.height - data.paddleHeight;
	}

	private isApproaching(ball: Ball): boolean {
		const dX = ball.getX() + ball.getDirX();
		if (dX < ball.getX()) return true;
		return false;
	}

	private getClosestBall(): number {
		let closest: number = 0;
		let closestSteps: number = Number.MAX_SAFE_INTEGER;
		for (let i: number = 0; i < balls.length; i++) {
			if (this.isApproaching(balls[i])) {
				let steps = 0;
				let x: number = balls[i].getX();
				while (x < data.canvas.width && x > 0) {
					x += balls[i].getDirX();
					steps++;
				}
				if (steps < closestSteps) {
					closest = i;
					closestSteps = steps;
				}
			}
		}
		return closest;
	}

	public calcTarget(): void {
		if (pad.length && balls.length) {
			const t = this.getClosestBall();
			var x: number = balls[t].getX();
			var y: number = balls[t].getY();
			var dx: number = balls[t].getDirX();
			var dy: number = balls[t].getDirY();
			while ((balls[t].getDirX() <= 0 && this._x < data.canvas.width / 2) && x > data.paddleWidth + balls[t].getSize()
			|| (balls[t].getDirX() > 0 && this._x > data.canvas.width / 2) && x < data.canvas.width - balls[t].getSize() - data.paddleWidth) {
				if (y <= balls[t].getSize() || y > data.canvas.height - balls[t].getSize()) dy *= -1;
				x += dx * 10;
				y += dy * 10;
			}
			if (y != balls[t].getY()) {
				var dir = 1;
				if (Math.floor(Math.random() * 2)) dir = -1;
				var deviation = (Math.random() * data.paddleHeight * 0.75) * dir;
				this._aiTarget = y + deviation;
			}
		}
	}
}