/*
Paddle.draw has some functions that draw on the canvas to display the
paddles, the scoring texts and the mobile control arrows.
*/

import { data } from "./gameData";
import Paddle from "./Paddle";
import { t } from "./i18n";
import { endRound, pad } from "./pong";

const upImg = new Image();
upImg.src = "img/up_arrow.svg";
const downImg = new Image();
downImg.src = "img/down_arrow.svg";

export function debugOutline(pad: Paddle) {
	data.ctx.beginPath();
	data.ctx.strokeStyle = data.uiCol;
	data.ctx.moveTo(pad.getX(), pad.getY());
	data.ctx.lineTo(pad.getX(), pad.getY2());
	data.ctx.lineTo(pad.getX2(), pad.getY2());
	data.ctx.lineTo(pad.getX2(), pad.getY());
	data.ctx.lineTo(pad.getX(), pad.getY());
	data.ctx.stroke();
}

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
	data.ctx.moveTo(pad.getX() + data.paddleWidth / 2, pad.getY() + data.paddleWidth / 2);
	data.ctx.arc(pad.getX() + data.paddleWidth / 2, pad.getY() + data.paddleWidth / 2, data.paddleWidth / 2, 0, Math.PI, true);
	data.ctx.closePath();
	data.ctx.fill();
	data.ctx.fillRect(pad.getX(), pad.getY() - 1 + data.paddleWidth / 2, data.paddleWidth, data.paddleWidth / 2 + 2)
	data.ctx.beginPath();
	data.ctx.fillStyle = pad.getBCG();
	data.ctx.moveTo(pad.getX() + data.paddleWidth / 2, pad.getY2() - data.paddleWidth / 2);
	data.ctx.arc(pad.getX() + data.paddleWidth / 2, pad.getY2() - data.paddleWidth / 2, data.paddleWidth / 2, 0, Math.PI);
	data.ctx.closePath();
	data.ctx.fill();
	data.ctx.fillRect(pad.getX(), pad.getY2() - 1 - data.paddleWidth, data.paddleWidth, data.paddleWidth / 2 + 2)
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

export function scoreText(p: Paddle, playerName: string, wins: boolean): void {
	data.showingText = true;
	data.ctx.font = `bold ${data.canvas.height/6}px jura, sans-serif`;
	data.ctx.fillStyle = "#66fcf1";
	data.ctx.strokeStyle = "#0b4f47";
	data.ctx.lineWidth = data.canvas.height/60;
	data.ctx.textAlign = "center";
	data.ctx.textBaseline = "bottom";
	data.ctx.strokeText(playerName, data.canvas.width / 2, data.canvas.height / 2);
	data.ctx.fillText(playerName, data.canvas.width / 2, data.canvas.height / 2);
	data.ctx.textBaseline = "top";
	var line2: string;
	if (wins) line2 = t('wins') + "!";
	else line2 = t('scores') + "!";
	data.ctx.strokeText(line2, data.canvas.width / 2, data.canvas.height / 2);
	data.ctx.fillText(line2, data.canvas.width / 2, data.canvas.height / 2);
	endRound();
}

export function touchControlArrows(): void {
	const arrowSize = data.canvas.height / 6;
	data.ctx.globalAlpha = 0.5;
	data.ctx.fillStyle = "rgb(50 50 50 / 50%)";
	data.ctx.font = `bold ${data.canvas.height / 4}px jura, sans-serif`;
	for (let i: number = 0; i < pad.length; i++) {
		if (i == 0 && !pad[i].isAi()) {
			data.ctx.textBaseline = "top";
			data.ctx.textAlign = "left";
			data.ctx.drawImage(upImg, data.canvas.width / 16 - arrowSize/2, 0, arrowSize, arrowSize);
			data.ctx.textBaseline = "bottom";
			data.ctx.drawImage(downImg, data.canvas.width / 16 - arrowSize/2, data.canvas.height - arrowSize, arrowSize, arrowSize);
		}
		if (data.mode === "single") {
			if (i == 1 && !pad[i].isAi()) {
				data.ctx.textBaseline = "top";
				data.ctx.textAlign = "right";
				data.ctx.drawImage(upImg, data.canvas.width * 15 / 16 - arrowSize/2, 0, arrowSize, arrowSize);
				data.ctx.textBaseline = "bottom";
				data.ctx.drawImage(downImg, data.canvas.width * 15 / 16 - arrowSize/2, data.canvas.height - arrowSize, arrowSize, arrowSize);
			}
		} else {
			if (i == 1 && !pad[i].isAi()) {
				data.ctx.textBaseline = "top";
				data.ctx.textAlign = "right";
				data.ctx.drawImage(upImg, data.canvas.width * 2 / 5 - arrowSize/2, 0, arrowSize, arrowSize);
				data.ctx.textBaseline = "bottom";
				data.ctx.drawImage(downImg, data.canvas.width * 2 / 5 - arrowSize/2, data.canvas.height - arrowSize, arrowSize, arrowSize);
			}
			if (i == 2 && !pad[i].isAi()) {
				data.ctx.textBaseline = "top";
				data.ctx.textAlign = "left";
				data.ctx.drawImage(upImg, data.canvas.width * 3 / 5 - arrowSize/2, 0, arrowSize, arrowSize);
				data.ctx.textBaseline = "bottom";
				data.ctx.drawImage(downImg, data.canvas.width * 3 / 5 - arrowSize/2, data.canvas.height - arrowSize, arrowSize, arrowSize);
			}
			if (i == 3 && !pad[i].isAi()) {
				data.ctx.textBaseline = "top";
				data.ctx.textAlign = "right";
				data.ctx.drawImage(upImg, data.canvas.width * 15 / 16 - arrowSize/2, 0, arrowSize, arrowSize);
				data.ctx.textBaseline = "bottom";
				data.ctx.drawImage(downImg, data.canvas.width * 15 / 16 - arrowSize/2, data.canvas.height - arrowSize, arrowSize, arrowSize);
			}
		}
	}
}

