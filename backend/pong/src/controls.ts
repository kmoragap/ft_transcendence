import { data } from "./gameData";
import { pad, balls } from "./pong";

var lastX: number;

export function controlKeys(): void {
	document.addEventListener("keydown", (ev) => {
		if (ev.key == "ArrowUp" || ev.key == "ArrowDown")
			ev.preventDefault();
		if (ev.key == "Shift" || ev.key == "Control") {
			if (ev.location == 1) data.keys[ev.key] = true;
		}
		else data.keys[ev.key] = true;
	});
	
	document.addEventListener("keyup", (ev) => {
		if (pad.length) {
			if (ev.key == "Shift" || ev.key == "Control") {
				if (ev.location == 1) {
					if (ev.key == data.p[0].up || ev.key == data.p[0].down) {
						pad[0].setDir(0);
						if (data.mode == "doublePaddle") pad[2].setDir(0);
					}
					else if (ev.key == data.p[1].up || ev.key == data.p[1].down) {
						pad[1].setDir(0);
						if (data.mode == "doublePaddle") pad[3].setDir(0);
					}
				}
				data.keys[ev.key] = false;
			} else {
				for (let i: number = 0; i < pad.length; i++) {
					pad[i].setDir(0);
					data.keys[ev.key] = false;
				}
			}
			if (ev.key == "Escape") {//debug
				data.keys[ev.key] = false;
				data.go = false;
				while (pad.length) {
					pad[0].stop();
					pad.shift();
				}
				while (balls.length) {
					balls[0].stop();
					balls.shift();
				}
			}
		}
	});
	data.canvas.addEventListener("touchstart", touchDown);
	data.canvas.addEventListener("touchend", touchUp);
}

function touchDown(ev: TouchEvent) {
	lastX  = data.canvas.height / 2;
	if (data.go) {
		var x: number = lastX = ev.touches[0].clientX;
		var y: number = ev.touches[0].clientY;
		if (x < data.canvas.width / 4) {
			if (y < data.canvas.height / 4) data.keys[data.p[0].up] = true;
			if (y > data.canvas.height * 3 / 4) data.keys[data.p[0].down] = true;
		}
		if (x > data.canvas.width * 3 / 4) {
			if (y < data.canvas.height / 4) data.keys[data.p[1].up] = true;
			if (y > data.canvas.height * 3 / 4) data.keys[data.p[1].down] = true;
		}
	}
}

function touchUp() {
	if (data.go) {
		if (lastX < data.canvas.width / 4) {
			data.keys[data.p[0].up] = false;
			data.keys[data.p[0].down] = false;
			pad[0].setDir(0);
			if (data.mode == "doublePaddle") pad[2].setDir(0);
		}
		if (lastX > data.canvas.width * 3 / 4) {
			data.keys[data.p[1].up] = false;
			data.keys[data.p[1].down] = false;
			pad[1].setDir(0);
			if (data.mode == "doublePaddle") pad[3].setDir(0);
		}
	}
}