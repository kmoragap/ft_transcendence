import { data } from "./gameData";
import { ball } from "./pong";
import { t } from "./../../../frontend/src/i18n";
import { playerData } from "./gameData";

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
	}
	
	public getX(): number {return this._x;}
	public getY(): number {return this._y;}
	public getX2(): number {return this._x + data.paddleWidth;}
	public getY2(): number {return this._y + data.paddleHeight;}
	public getDir(): number {return this._dir;}
	public setDir(dir: number) {this._dir = dir;}
	public getMoveSpeed(): number {return this._moveSpeed;}
	public isAi(): boolean {return this._p.isAi;}

	public draw(): void {
		//draw paddle center
		data.ctx.beginPath();
		data.ctx.fillStyle = this._paddleGrad;
		data.ctx.fillRect(this._x, this._y + data.paddleWidth, data.paddleWidth, data.paddleHeight - data.paddleWidth * 2);

		//define corner grad
		this._topCornerGrad = data.ctx.createRadialGradient(this._x + 10, this._y, data.paddleWidth / 7, this._x, this._y, data.paddleWidth);
		this._topCornerGrad.addColorStop(0, "white");
		this._topCornerGrad.addColorStop(0.75, this._p.cornerCol);
		this._bottomCornerGrad = data.ctx.createRadialGradient(this._x + 10, this.getY2(), data.paddleWidth / 7, this._x, this.getY2(), data.paddleWidth);
		this._bottomCornerGrad.addColorStop(0, "white");
		this._bottomCornerGrad.addColorStop(0.75, this._p.cornerCol);
		if (!this._p.isAi) {
			//left paddle corner
			if (this._x < data.canvas.width / 2) {
				data.ctx.beginPath();
				data.ctx.fillStyle = this._topCornerGrad;
				data.ctx.moveTo(this._x, this._y + data.paddleWidth);
				data.ctx.arc(this._x, this._y + data.paddleWidth, data.paddleWidth, -Math.PI / 2, 0);
				data.ctx.closePath();
				data.ctx.fill();
				data.ctx.beginPath();
				data.ctx.fillStyle = this._bottomCornerGrad;
				data.ctx.moveTo(this._x, this.getY2() - data.paddleWidth);
				data.ctx.arc(this._x, this.getY2() - data.paddleWidth, data.paddleWidth, 0, Math.PI / 2);
				data.ctx.closePath();
				data.ctx.fill();
			} else {
			//right paddle corner
				data.ctx.beginPath();
				data.ctx.fillStyle = this._topCornerGrad;
				data.ctx.moveTo(this.getX2(), this._y + data.paddleWidth);
				data.ctx.arc(this.getX2(), this._y + data.paddleWidth, data.paddleWidth, Math.PI, Math.PI * 3 / 2);
				data.ctx.closePath();
				data.ctx.fill();
				data.ctx.beginPath();
				data.ctx.fillStyle = this._bottomCornerGrad;
				data.ctx.moveTo(this.getX2(), this.getY2() - data.paddleWidth);
				data.ctx.arc(this.getX2(), this.getY2() - data.paddleWidth, data.paddleWidth, Math.PI / 2, Math.PI);
				data.ctx.closePath();
				data.ctx.fill();
			}
		} else {
		//rounded paddle corner
			data.ctx.beginPath();
			data.ctx.fillStyle = this._topCornerGrad;
			data.ctx.moveTo(this._x + data.paddleWidth / 2, this._y + data.paddleWidth);
			data.ctx.arc(this._x + data.paddleWidth / 2, this._y + data.paddleWidth, data.paddleWidth / 2, 0, Math.PI, true);
			data.ctx.closePath();
			data.ctx.fill();
			data.ctx.beginPath();
			data.ctx.fillStyle = this._bottomCornerGrad;
			data.ctx.moveTo(this._x + data.paddleWidth / 2, this.getY2() - data.paddleWidth);
			data.ctx.arc(this._x + data.paddleWidth / 2, this.getY2() - data.paddleWidth, data.paddleWidth / 2, 0, Math.PI);
			data.ctx.closePath();
			data.ctx.fill();
		}
	}

	public erase(): void {
		data.ctx.beginPath();
		data.ctx.fillStyle = data.bg;
		data.ctx.rect(this._x - 1, this._y - 1, data.paddleWidth + 2, data.paddleHeight + 2);
		data.ctx.fill();
	}

	public move(): void {
		this.erase();
		this._y += this._dir * this._moveSpeed;
		if (this._y < 0) this._y = 0;
		if (this._y > data.canvas.height - data.paddleHeight) this._y = data.canvas.height - data.paddleHeight;
		this.draw();
	}

	public hitY(): boolean {
		if (ball.getY() >= this._y - data.canvas.width / data.ballSize && ball.getY() <= this.getY2() + data.canvas.width / data.ballSize) return true;
		else return false;
	}

	public hitX(): boolean {
		if (!this._x) {
			if (ball.getX() < data.paddleWidth + ball.getSize()) return true;
		} else if (ball.getX() >= data.canvas.width - data.paddleWidth - ball.getSize() && ball.getX() < data.canvas.width - ball.getSize()) return true;
		return false;
	}

	public scoreText(): void {
		data.showingText = true;
		data.ctx.font = `bold ${data.canvas.height/6}px system-ui`;
		data.ctx.fillStyle = this._topCornerGrad;
		data.ctx.strokeStyle = this._paddleGrad;
		data.ctx.lineWidth = data.canvas.height/60;
		data.ctx.textAlign = "center";
		data.ctx.textBaseline = "bottom";
		data.ctx.strokeText(`${this._p.name}`, data.canvas.width/2, data.canvas.height/2);
		data.ctx.fillText(`${this._p.name}`, data.canvas.width/2, data.canvas.height/2);
		data.ctx.textBaseline = "top";
		const scores: string = t('scores') + "!";
		const wins: string = t('wins') + "!";
		if (this._p.score != data.maxScore) {
			data.ctx.strokeText(scores, data.canvas.width/2, data.canvas.height/2);
			data.ctx.fillText(scores, data.canvas.width/2, data.canvas.height/2);
		} else {
			data.ctx.strokeText(wins, data.canvas.width/2, data.canvas.height/2);
			data.ctx.fillText(wins, data.canvas.width/2, data.canvas.height/2);
		}
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

	private pxl(x: number, y: number): void {
		data.ctx.beginPath();
		data.ctx.moveTo(x, y);
		data.ctx.lineTo(x + 1, y + 1);
		data.ctx.stroke();
	}

	public calcTarget(): void {
		var x: number = ball.getX();
		var y: number = ball.getY();
		var dx: number = ball.getDirX();
		var dy: number = ball.getDirY();
		var draw = 0;
		while ((ball.getDirX() <= 0 && this._x < data.canvas.width / 2) && x > data.paddleWidth + ball.getSize()
		|| (ball.getDirX() > 0 && this._x > data.canvas.width / 2) && x < data.canvas.width - ball.getSize() - data.paddleWidth) {
			if (y < ball.getSize() || y > data.canvas.height - ball.getSize()) dy *= -1;
			x += dx * 100;
			y += dy * 100;
			if (data.showAiPath) {
				draw++;
				if (draw == 20) {draw = 0; this.pxl(x, y);}
			}
		}
		if (y != ball.getY()) {
			var dir = 1;
			if (Math.floor(Math.random() * 2)) dir = -1;
			var deviation = (Math.random() * data.paddleHeight * 0.75) * dir;
			this._aiTarget = y + deviation;
		}
	}
}