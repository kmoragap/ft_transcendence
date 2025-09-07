import { data } from "./gameData";
import { pad, balls, startGame, removeBall } from "./pong";


document.getElementById('gameMenu')!.addEventListener('submit', function(e) {//debug menu restart button
	e.preventDefault();
	if (!data.showingText) {
		while (pad.length) {
			pad[0].stop();
			pad.shift();
		}
		while (balls.length) {
			balls[0].stop();
			balls.shift();
		}
		setTimeout(() => startGame(), 1000);
	}
});

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
					if (ev.key == data.p1.up || ev.key == data.p1.down) {
						pad[0].setDir(0);
//						pad[1].setDir(0);//2pad
					}
					else if (ev.key == data.p2.up || ev.key == data.p2.down) {
						pad[1].setDir(0);//1pad
//						pad[2].setDir(0);//2pad
//						pad[3].setDir(0);//2pad
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
}