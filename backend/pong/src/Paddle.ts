import { data } from "./gameData";
import { balls } from "./pong";
import Ball from "./Ball";
import { playerData } from "./gameData";
import { erase, quarterCorner, halfCorner, pxl } from "./Paddle.draw";

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
	private _aiGoTime: number = 0;
	private _aiRecalcTime: number = 0;

	public constructor(x: number, p: playerData) {
		this._x = x;
		this._y = data.canvas.height / 2 - data.paddleHeight / 2;
		this._p = p;
		this._paddleGrad = data.ctx.createLinearGradient(this._x, this._y, this.getX2(), this._y);
		this._paddleGrad.addColorStop(0, this._p.outerCol);
		this._paddleGrad.addColorStop(0.5, this._p.innerCol);
		this._paddleGrad.addColorStop(1, this._p.outerCol);
		this.draw();
	}

	public go(): void {
		if (this._p.isAi) {
			this._aiRecalcTime = window.setInterval(() => this.calcTarget(), 1000);
			this._aiGoTime = window.setInterval(() => this.moveAI(), 20);
		}
		this._goTime = window.setInterval(() => this.movePaddle(), 20);
	}
	
	public stop(): void {
		window.clearTimeout(this._aiRecalcTime);
		window.clearTimeout(this._aiGoTime);
		window.clearTimeout(this._goTime);
		this._aiRecalcTime = 0;
		this._aiGoTime = 0;
		this._goTime = 0;
	}
	
	public getX(): number {return this._x;}
	public getY(): number {return this._y;}
	public getX2(): number {return this._x + data.paddleWidth;}
	public getY2(): number {return this._y + data.paddleHeight;}
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
		//draw paddle center
		data.ctx.beginPath();
		data.ctx.fillStyle = this._paddleGrad;
		data.ctx.fillRect(this._x, this._y + data.paddleWidth, data.paddleWidth, data.paddleHeight - data.paddleWidth * 2);

		//define corner grads
		this._topCornerGrad = data.ctx.createRadialGradient(this._x + 10, this._y, data.paddleWidth / 7, this._x, this._y, data.paddleWidth);
		this._topCornerGrad.addColorStop(0, "white");
		this._topCornerGrad.addColorStop(0.75, this._p.cornerCol);
		this._bottomCornerGrad = data.ctx.createRadialGradient(this._x + 10, this.getY2(), data.paddleWidth / 7, this._x, this.getY2(), data.paddleWidth);
		this._bottomCornerGrad.addColorStop(0, "white");
		this._bottomCornerGrad.addColorStop(0.75, this._p.cornerCol);
		
		if (!this._p.isAi) quarterCorner(this);
		 else halfCorner(this);
	}

	public move(): void {
		erase(this);
		this._y += this._dir * this._moveSpeed;
		if (this._y < 0) this._y = 0;
		if (this._y > data.canvas.height - data.paddleHeight) this._y = data.canvas.height - data.paddleHeight;
		this.draw();
	}

	public hitY(ball: Ball): boolean {
		if (ball.getY() >= this._y - data.canvas.width / data.ballSize && ball.getY() <= this.getY2() + data.canvas.width / data.ballSize) return true;
		else return false;
	}

	public hitX(ball: Ball): boolean {
		if (!this._x) {
			if (ball.getX() < data.paddleWidth + ball.getSize()) return true;
		} else if (ball.getX() >= data.canvas.width - data.paddleWidth - ball.getSize() && ball.getX() < data.canvas.width - ball.getSize()) return true;
		return false;
	}

	private movePaddle(): void {
		if (data.keys[this._p.up])
			if (this._y > 0) this._dir = -1; else this._dir = 0;
		if (data.keys[this._p.down]) 
			if (this._y <= data.canvas.height - data.paddleHeight) this._dir = 1; else this._dir = 0;
		this.move();
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
	}

	private getClosestBall(): number {
		let closest: number = 0;
		let closestSteps: number = 0;
		for (let i: number = 1; i < balls.length; i++) {
			let steps = 0;
			let x: number = balls[i].getX();
			while (x < data.canvas.width || x > 0) {
				x += balls[i].getX();
				steps++;
			}
			if (steps < closestSteps) {
				closest = i;
				closestSteps = steps;
			}
		}
		return closest;
	}

	public calcTarget(): void {
		if (this.isGo()) {
			const t = 0;//this.getClosestBall();
			var x: number = balls[t].getX();
			var y: number = balls[t].getY();
			var dx: number = balls[t].getDirX();
			var dy: number = balls[t].getDirY();
			var draw = 0;
			while ((balls[t].getDirX() <= 0 && this._x < data.canvas.width / 2) && x > data.paddleWidth + balls[t].getSize()
			|| (balls[t].getDirX() > 0 && this._x > data.canvas.width / 2) && x < data.canvas.width - balls[t].getSize() - data.paddleWidth) {
				if (y < balls[t].getSize() || y > data.canvas.height - balls[t].getSize()) dy *= -1;
				x += dx * 10;
				y += dy * 10;
				draw++;
				if (data.showAiPath) {
					if (draw == 5) {draw = 0; pxl(x, y);}
				}
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