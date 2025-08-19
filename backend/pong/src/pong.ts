type gameData = {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	scoreP1TB: HTMLTextAreaElement;
	scoreP2TB: HTMLTextAreaElement;
	
	singlePlayer: boolean;
	maxScore: number;
	serve: number;
	keys: Record<string, boolean>;
	
	bg: CanvasGradient;
	uiCol: string;
	ballCol: string;
	p1InnerCol: string;
	p1OuterCol: string;
	p1CornerCol: string;
	p2InnerCol: string;
	p2OuterCol: string;
	p2CornerCol: string;
	
	p1Up: string;
	p1Down: string;
	p2Up: string;
	p2Down: string;
	
	paddleWidth: number;
	paddleHeight: number;
	paddleSpeed: number;
	
	ballSpeed: number;
	ballSize: number;
	ballY: number;

	p1Dir: number;
	p2Dir: number;
	score1: number;
	score2: number;
}

let p1: Paddle;
let p2: Paddle;
let ball: Ball;
let data: gameData;

async function loadConfig(): Promise<void> {
	await new Promise<void>(resolve => {
		if (document.readyState === 'complete') resolve();
		else document.addEventListener('DOMContentLoaded', () => resolve());
	});
	const config = document.getElementById("config");
	if (!config) throw new Error("Config element not found");

	const canvas = document.getElementById("board") as HTMLCanvasElement;
	const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
	const loadData = {
		canvas: canvas,
		ctx: ctx,
		scoreP1TB: document.getElementById("p1score") as HTMLTextAreaElement,
		scoreP2TB: document.getElementById("p2score") as HTMLTextAreaElement,
		
		singlePlayer: false,
		maxScore: parseInt(config.getAttribute("maxScore") || "10", 10),
		serve: 1,
		keys: {},
		
		bg: ctx.createLinearGradient(0, 0, canvas.width, 0),
		uiCol: config.getAttribute("uiCol") || "",
		ballCol: config.getAttribute("ballCol") || "",
		p1InnerCol: config.getAttribute("p1InnerCol") || "",
		p1OuterCol: config.getAttribute("p1OuterCol") || "",
		p1CornerCol: config.getAttribute("p1CornerCol") || "",
		p2InnerCol: config.getAttribute("p2InnerCol") || "",
		p2OuterCol: config.getAttribute("p2OuterCol") || "",
		p2CornerCol: config.getAttribute("p2CornerCol") || "",
		
		p1Up: config.getAttribute("p1Up") || "",
		p1Down: config.getAttribute("p1Down") || "",
		p2Up: config.getAttribute("p2Up") || "",
		p2Down: config.getAttribute("p2Down") || "",
		
		paddleWidth: 0,
		paddleHeight: 0,
		paddleSpeed: 2,
		
		ballSpeed: 2,
		ballSize: 80,
		ballY: 0,
	
		p1Dir: 0,
		p2Dir: 0,
		score1: 0,
		score2: 0,
	}

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight - loadData.scoreP1TB.offsetHeight * 2;
	loadData.paddleWidth = canvas.width / 60;
	loadData.paddleHeight = canvas.height / 5;
	loadData.bg = ctx.createLinearGradient(0, 0, canvas.width, 0);
	var innerBg: string = config.getAttribute("innerBg") || "";
	var outerBg: string = config.getAttribute("outerBg") || "";
	loadData.bg.addColorStop(0, outerBg);
	loadData.bg.addColorStop(0.5, innerBg);
	loadData.bg.addColorStop(1, outerBg);
	
	if (config.getAttribute("singlePlayer") == "true") loadData.singlePlayer = true;
	if (Math.floor(Math.random() * 2)) loadData.serve = -1;

	switch (config.getAttribute("ballSpeed")) {
		case "glacial":		loadData.ballSpeed = 10;	break;
		case "slow":		loadData.ballSpeed = 5;		break;
		case "standard":	loadData.ballSpeed = 2;		break;
		case "fast":		loadData.ballSpeed = 1.5;	break;
		case "insane":		loadData.ballSpeed = 1;		break;
		default:			loadData.ballSpeed = 2;		break;
	}
	switch (config.getAttribute("ballSize")) {
		case "tiny":		loadData.ballSize = 160;	break;
		case "small":		loadData.ballSize = 120;	break;
		case "normal":		loadData.ballSize = 80;		break;
		case "big":			loadData.ballSize = 60;		break;
		case "huge":		loadData.ballSize = 40;		break;
		default:			loadData.ballSize = 80;		break;
	}
	switch (config.getAttribute("paddleSpeed")) {
		case "glacial":		loadData.paddleSpeed = 5000;break;
		case "slow":		loadData.paddleSpeed = 2500;break;
		case "standard":	loadData.paddleSpeed = 400;	break;
		case "fast":		loadData.paddleSpeed = 300;	break;
		case "insane":		loadData.paddleSpeed = 200;	break;
		default:			loadData.paddleSpeed = 400;	break;
	}
	data = loadData;
}

async function startGame() {
	try {
		await loadConfig();
		document.getElementById("board")?.focus();
		startRound();
	} catch (error) {
		console.error('Failed to load configuration:', error);
	}
}

class Paddle {
	private _posX: number;
	private _posY: number;
	private _innerColor: string;
	private _outerColor: string;
	private _paddleGrad!: CanvasGradient;
	private _cornerColor: string;
	private _topCornerGrad!: CanvasGradient;
	private _bottomCornerGrad!: CanvasGradient;
	private _goTime: number = 0;
	private _moveSpeed: number = data.canvas.height / data.paddleSpeed;
	
	public constructor(posX: number, posY: number, innerColor: string, outerColor: string, cornerColor: string) {
		this._posX = posX;
		this._posY = posY;
		this._innerColor = innerColor;
		this._outerColor = outerColor;
		this._cornerColor = cornerColor;
	}
	public go(go: number): void {this._goTime = go;}
	public stop(): void {clearTimeout(this._goTime);}
	public getPosY(): number {return this._posY;}
	public getPosX(): number {return this._posX;}
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
	public move(dir:number): void {
		this.erase();
		this._posY += dir;
		if (this._posY < 0) this._posY = 0;
		if (this._posY > data.canvas.height - data.paddleHeight) this._posY = data.canvas.height - data.paddleHeight;
		this.draw();
	}
	public hit(): boolean {
		if (data.ballY >= this._posY - data.canvas.width / data.ballSize && data.ballY <= this._posY + data.paddleHeight + data.canvas.width / data.ballSize) return true;
		else return false;
	}
}

class Ball {
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

function moveP1(): void {
	if (data.keys[data.p1Up])
		if (p1.getPosY() > 0) data.p1Dir -= p1.getMoveSpeed(); else data.p1Dir = 0;
	if (data.keys[data.p1Down]) 
		if (p1.getPosY() <= data.canvas.height - data.paddleHeight) data.p1Dir += p1.getMoveSpeed(); else data.p1Dir = 0;
	p1.move(data.p1Dir);
}

function moveP2(): void {
	if (data.keys[data.p2Up])
		if (p2.getPosY() > 0) data.p2Dir -= p2.getMoveSpeed(); else data.p2Dir = 0;
	if (data.keys[data.p2Down])
		if (p2.getPosY() <= data.canvas.height - data.paddleHeight) data.p2Dir += p2.getMoveSpeed(); else data.p2Dir = 0;
	p2.move(data.p2Dir);
}

function moveAI(ball: Ball): void {
	if (!p2.hit() && ball.getDirX() > 0) {
		if (p2.getPosY() <= data.ballY && p2.getPosY() > 0) data.p2Dir += p2.getMoveSpeed();
		else if (p2.getPosY() + data.paddleHeight > data.ballY && p2.getPosY() <= data.canvas.height - data.paddleHeight) data.p2Dir -= p2.getMoveSpeed();
	}
	else data.p2Dir = 0;
	p2.move(data.p2Dir);
}

document.addEventListener("keydown", (ev) => {
	if (ev.key == "Shift" || ev.key == "Control") {
		if (ev.location == 1) data.keys[ev.key] = true;
	}
	else data.keys[ev.key] = true;
});

document.addEventListener("keyup", (ev) => {
	if (ev.key == "Shift" || ev.key == "Control") {
		if (ev.location == 1) {
			if (ev.key == data.p1Up || ev.key == data.p1Down) data.p1Dir = 0;
			else if (ev.key == data.p2Up || ev.key == data.p2Down) data.p2Dir = 0;
		}
		data.keys[ev.key] = false;
	} else {
		if (ev.key == data.p1Up || ev.key == data.p1Down) {
			data.p1Dir = 0;
			data.keys[ev.key] = false;
		}
		if (ev.key == data.p2Up || ev.key == data.p2Down) {
			data.p2Dir = 0;
			data.keys[ev.key] = false;
		}
	}
	if (ev.key == "Escape") {//debug
		data.keys[ev.key] = false;
		ball.stop();
		p1.stop();
		p2.stop();
	}
});

function startRound(): void {
	data.ctx.fillStyle = data.bg;
	data.ctx.rect(0, 0, data.canvas.width, data.canvas.height);
	data.ctx.fill();
	data.scoreP1TB.value = String(data.score1);
	data.scoreP2TB.value = String(data.score2);
	ball = new Ball();
	p1 = new Paddle(0, data.canvas.height / 2 - data.paddleHeight / 2, data.p1InnerCol, data.p1OuterCol, data.p1CornerCol);
	p2 = new Paddle(data.canvas.width - data.paddleWidth, data.canvas.height / 2 - data.paddleHeight / 2, data.p2InnerCol, data.p2OuterCol, data.p2CornerCol);
	p1.move(0);
	p2.move(0);
	data.ballY = data.canvas.height / 2;
	ball.setDirX(0.01 * data.serve);
	p1.go(window.setInterval(() => moveP1(), 20));
	if (data.singlePlayer) p2.go(window.setInterval(() => moveAI(ball), 20));
	else p2.go(window.setInterval(() => moveP2(), 20));
	ball.go(window.setInterval(() => ball.move(), 5));
}

function endGame(): void {
	if (data.score1 > data.score2)
		console.log("Player 1 wins!");
	else console.log("Player 2 wins!");
}
startGame();