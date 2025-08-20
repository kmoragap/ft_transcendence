import { data } from "./gameData";
import { p1 } from "./pong";
import { p2 } from "./pong";
import { ball } from "./pong";
import Ball from "./Ball";
import Paddle from "./Paddle";

export function controlKeys(): void {
	document.addEventListener("keydown", (ev) => {
		if (ev.key == "Shift" || ev.key == "Control") {
			if (ev.location == 1) data.keys[ev.key] = true;
		}
		else data.keys[ev.key] = true;
	});
	
	document.addEventListener("keyup", (ev) => {
		if (ev.key == "Shift" || ev.key == "Control") {
			if (ev.location == 1) {
				if (ev.key == data.p1Up || ev.key == data.p1Down) p1.setDir(0);
				else if (ev.key == data.p2Up || ev.key == data.p2Down) p2.setDir(0);
			}
			data.keys[ev.key] = false;
		} else {
			if (ev.key == data.p1Up || ev.key == data.p1Down) {
				p1.setDir(0);
				data.keys[ev.key] = false;
			}
			if (ev.key == data.p2Up || ev.key == data.p2Down) {
				p2.setDir(0);
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
}

export function movePlayer(player: Paddle, up: string, down: string): void {
	if (data.keys[up])
		if (player.getPosY() > 0) player.setDir(player.getDir() - player.getMoveSpeed()); else player.setDir(0);
	if (data.keys[down]) 
		if (player.getPosY() <= data.canvas.height - data.paddleHeight) player.setDir(player.getDir() + player.getMoveSpeed()); else player.setDir(0);
	player.move();
}

export function moveAI(ball: Ball): void {
	if (!p2.hit() && ball.getDirX() > 0) {
		if (p2.getPosY() <= data.ballY && p2.getPosY() > 0) p2.setDir(p2.getDir() + p2.getMoveSpeed());
		else if (p2.getPosY() + data.paddleHeight > data.ballY && p2.getPosY() <= data.canvas.height - data.paddleHeight) p2.setDir(p2.getDir() - p2.getMoveSpeed());
	}
	else p2.setDir(0);
	p2.move();
}