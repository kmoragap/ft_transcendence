import { data } from "./gameData";

export default class Paddle {
	private _posX: number;
	private _posY: number;
	private _dir: number = 0;
	private _innerColor: string;
	private _outerColor: string;
	private _paddleGrad!: CanvasGradient;
	private _cornerColor: string;
	private _topCornerGrad!: CanvasGradient;
	private _bottomCornerGrad!: CanvasGradient;
	private _goTime: number = 0;
	private _moveSpeed: number = data.canvas.height / data.paddleSpeed;
	
	public constructor(posX: number, innerColor: string, outerColor: string, cornerColor: string) {
		this._posX = posX;
		this._posY = data.canvas.height / 2 - data.paddleHeight / 2;
		this._innerColor = innerColor;
		this._outerColor = outerColor;
		this._cornerColor = cornerColor;
	}
	public go(go: number): void {this._goTime = go;}
	public stop(): void {clearTimeout(this._goTime);}
	public getPosY(): number {return this._posY;}
	public getPosX(): number {return this._posX;}
	public getDir(): number {return this._dir;}
	public setDir(dir: number) {this._dir = dir;}
	public getMoveSpeed(): number {return this._moveSpeed;}
	
	public draw(): void {
		//draw paddle center
		data.ctx.beginPath();
		data.ctx.fillStyle = this._paddleGrad;
		data.ctx.fillRect(this._posX, this._posY + data.paddleWidth, data.paddleWidth, data.paddleHeight - data.paddleWidth * 2);
		this._paddleGrad = data.ctx.createLinearGradient(this._posX, this._posY, this._posX + data.paddleWidth, this._posY);
		this._paddleGrad.addColorStop(0, this._outerColor);
		this._paddleGrad.addColorStop(0.5, this._innerColor);
		this._paddleGrad.addColorStop(1, this._outerColor);
		//define corner grad
		this._topCornerGrad = data.ctx.createRadialGradient(this._posX + 10, this._posY, data.paddleWidth / 7, this._posX, this._posY, data.paddleWidth);
		this._topCornerGrad.addColorStop(0, "white");
		this._topCornerGrad.addColorStop(0.75, this._cornerColor);
		this._bottomCornerGrad = data.ctx.createRadialGradient(this._posX + 10, this._posY + data.paddleHeight, data.paddleWidth / 7, this._posX, this._posY + data.paddleHeight, data.paddleWidth);
		this._bottomCornerGrad.addColorStop(0, "white");
		this._bottomCornerGrad.addColorStop(0.75, this._cornerColor);
		//left paddle corner
		if (this._posX == 0) {
			data.ctx.beginPath();
			data.ctx.fillStyle = this._topCornerGrad;
			data.ctx.moveTo(this._posX, this._posY + data.paddleWidth);
			data.ctx.arc(this._posX, this._posY + data.paddleWidth, data.paddleWidth, -Math.PI / 2, 0);
			data.ctx.closePath();
			data.ctx.fill();
			data.ctx.beginPath();
			data.ctx.fillStyle = this._bottomCornerGrad;
			data.ctx.moveTo(this._posX, this._posY + data.paddleHeight - data.paddleWidth);
			data.ctx.arc(this._posX, this._posY + data.paddleHeight - data.paddleWidth, data.paddleWidth, 0, Math.PI / 2);
			data.ctx.closePath();
			data.ctx.fill();
		}
		//right paddlecorner
		if (this._posX != 0) {
		data.ctx.beginPath();
			data.ctx.fillStyle = this._topCornerGrad;
			data.ctx.moveTo(this._posX + data.paddleWidth, this._posY + data.paddleWidth);
			data.ctx.arc(this._posX + data.paddleWidth, this._posY + data.paddleWidth, data.paddleWidth, Math.PI, Math.PI * 3 / 2);
			data.ctx.closePath();
			data.ctx.fill();
			data.ctx.beginPath();
			data.ctx.fillStyle = this._bottomCornerGrad;
			data.ctx.moveTo(this._posX + data.paddleWidth, this._posY + data.paddleHeight - data.paddleWidth);
			data.ctx.arc(this._posX + data.paddleWidth, this._posY + data.paddleHeight - data.paddleWidth, data.paddleWidth, Math.PI / 2, Math.PI);
			data.ctx.closePath();
			data.ctx.fill();
		}
	}
	
	public erase(): void {
		data.ctx.beginPath();
		data.ctx.fillStyle = data.bg;
		data.ctx.rect(this._posX - 1, this._posY - 1, data.paddleWidth + 2, data.paddleHeight + 2);
		data.ctx.fill();
	}
	
	public move(): void {
		this.erase();
		this._posY += this._dir;
		if (this._posY < 0) this._posY = 0;
		if (this._posY > data.canvas.height - data.paddleHeight) this._posY = data.canvas.height - data.paddleHeight;
		this.draw();
	}
	
	public hit(): boolean {
		if (data.ballY >= this._posY - data.canvas.width / data.ballSize && data.ballY <= this._posY + data.paddleHeight + data.canvas.width / data.ballSize) return true;
		else return false;
	}
}