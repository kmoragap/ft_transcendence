import { data } from "./gameData";
import { p1 } from "./pong";
import { p2 } from "./pong";
import { ball } from "./pong";
import { startGame } from "./pong";

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
		if (ev.key == "Shift" || ev.key == "Control") {
			if (ev.location == 1) {
				if (ev.key == data.p1.up || ev.key == data.p1.down) p1.setDir(0);
				else if (ev.key == data.p2.up || ev.key == data.p2.down) p2.setDir(0);
			}
			data.keys[ev.key] = false;
		} else {
			if (ev.key == data.p1.up || ev.key == data.p1.down) {
				p1.setDir(0);
				data.keys[ev.key] = false;
			}
			if (ev.key == data.p2.up || ev.key == data.p2.down) {
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