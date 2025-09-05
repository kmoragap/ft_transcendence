import { data } from "./gameData";
import Paddle from "./Paddle";
import { t } from "./../../../frontend/src/i18n";
import { endRound } from "./pong";

export function quarterCorner(pad: Paddle) {
	//left paddle corner
	if (pad.getX() < data.canvas.width / 2) {
		data.ctx.beginPath();
		data.ctx.fillStyle = pad.getTCG();
		data.ctx.moveTo(pad.getX(), pad.getY() + data.paddleWidth);
		data.ctx.arc(pad.getX(), pad.getY() + data.paddleWidth, data.paddleWidth, -Math.PI / 2, 0);
		data.ctx.closePath();
		data.ctx.fill();
		data.ctx.beginPath();
		data.ctx.fillStyle = pad.getBCG();
		data.ctx.moveTo(pad.getX(), pad.getY2() - data.paddleWidth);
		data.ctx.arc(pad.getX(), pad.getY2() - data.paddleWidth, data.paddleWidth, 0, Math.PI / 2);
		data.ctx.closePath();
		data.ctx.fill();
	} else {
	//right paddle corner
		data.ctx.beginPath();
		data.ctx.fillStyle = pad.getTCG();
		data.ctx.moveTo(pad.getX2(), pad.getY() + data.paddleWidth);
		data.ctx.arc(pad.getX2(), pad.getY() + data.paddleWidth, data.paddleWidth, Math.PI, Math.PI * 3 / 2);
		data.ctx.closePath();
		data.ctx.fill();
		data.ctx.beginPath();
		data.ctx.fillStyle = pad.getBCG();
		data.ctx.moveTo(pad.getX2(), pad.getY2() - data.paddleWidth);
		data.ctx.arc(pad.getX2(), pad.getY2() - data.paddleWidth, data.paddleWidth, Math.PI / 2, Math.PI);
		data.ctx.closePath();
		data.ctx.fill();
	}
}

export function halfCorner(pad: Paddle) {
	data.ctx.beginPath();
	data.ctx.fillStyle = pad.getTCG();
	data.ctx.moveTo(pad.getX() + data.paddleWidth / 2, pad.getY() + data.paddleWidth);
	data.ctx.arc(pad.getX() + data.paddleWidth / 2, pad.getY() + data.paddleWidth, data.paddleWidth / 2, 0, Math.PI, true);
	data.ctx.closePath();
	data.ctx.fill();
	data.ctx.beginPath();
	data.ctx.fillStyle = pad.getBCG();
	data.ctx.moveTo(pad.getX() + data.paddleWidth / 2, pad.getY2() - data.paddleWidth);
	data.ctx.arc(pad.getX() + data.paddleWidth / 2, pad.getY2() - data.paddleWidth, data.paddleWidth / 2, 0, Math.PI);
	data.ctx.closePath();
	data.ctx.fill();
}

export function midline(): void {
	data.ctx.beginPath();
	data.ctx.lineWidth = 1;
	data.ctx.moveTo(data.canvas.width / 2, 0);
	data.ctx.lineTo(data.canvas.width / 2, data.canvas.height);
	data.ctx.strokeStyle = data.uiCol;
	data.ctx.stroke();
	data.ctx.closePath();
}

export function scoreText(p: Paddle, wins: boolean): void {
	data.showingText = true;
	data.ctx.font = `bold ${data.canvas.height/6}px system-ui`;
	data.ctx.fillStyle = p.getTCG();
	data.ctx.strokeStyle = p.getPG();
	data.ctx.lineWidth = data.canvas.height/60;
	data.ctx.textAlign = "center";
	data.ctx.textBaseline = "bottom";
	data.ctx.strokeText(p.getPlr().name, data.canvas.width/2, data.canvas.height/2);
	data.ctx.fillText(p.getPlr().name, data.canvas.width/2, data.canvas.height/2);
	data.ctx.textBaseline = "top";
	var line2: string;
	if (wins) line2 = t('wins') + "!";
		else line2 = t('scores') + "!";
	data.ctx.strokeText(line2, data.canvas.width/2, data.canvas.height/2);
	data.ctx.fillText(line2, data.canvas.width/2, data.canvas.height/2);
	endRound();
}