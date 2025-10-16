/*
controls.ts handles the eventListeners for keyboard and touchscreen input.
Also contains functions to handle fullscreen mode.
*/

import { data } from "./gameData";
import { pad } from "./pong";

export function controlKeys(): void {
	document.addEventListener("keydown", (ev) => {
		ev.preventDefault();
		
		let keyName = ev.key;
		if (ev.key === " ") {
			keyName = "Space";
		} else if (ev.key === "Meta") {
			keyName = "Cmd";
		}
		
		if (keyName == "Shift" || keyName == "Control") {
			if (ev.location == 1) data.keys[keyName] = true;
		}
		else data.keys[keyName] = true;
	});
	
	document.addEventListener("keyup", (ev) => {
		let keyName = ev.key;
		if (ev.key === " ") {
			keyName = "Space";
		} else if (ev.key === "Meta") {
			keyName = "Cmd";
		}
		
		if (keyName == "Shift" || keyName == "Control") {
			if (ev.location == 1) data.keys[keyName] = false;
		}
		else data.keys[keyName] = false;
		
		if (pad.length) {
			for (let i: number = 0; i < data.p.length; i++) {
				if (keyName == data.p[i].up || keyName == data.p[i].down) {
					if (data.mode == "multi") {
						if (i < pad.length) {
							pad[i].setDir(0);
						}
					} else if (data.mode == "doublePaddle") {
						if (i == 0) {
							pad[0].setDir(0);
							pad[2].setDir(0);
						} else if (i == 1) {
							pad[1].setDir(0);
							pad[3].setDir(0);
						}
					} else {
						if (i < pad.length) {
							pad[i].setDir(0);
						}
					}
					break;
				}
			}
		}
	});
	data.canvas.addEventListener("touchstart", touchDown);
	data.canvas.addEventListener("touchend", touchUp);
}

function touchDown(ev: TouchEvent) {
    if (!data.go) return;
    
    ev.preventDefault();
    for (const touch of ev.touches) {
        const x = touch.clientX;
        const y = touch.clientY;
        if (x < data.canvas.width / 4) {
            if (y < data.canvas.height / 4) data.keys[data.p[0].up] = true;
            if (y > data.canvas.height * 3 / 4) data.keys[data.p[0].down] = true;
        }
        if (data.mode == "multi") {
            if (x > data.canvas.width / 4 && x < data.canvas.width / 2) {
                if (y < data.canvas.height / 4) data.keys[data.p[1].up] = true;
                if (y > data.canvas.height * 3 / 4) data.keys[data.p[1].down] = true;
            }
            if (x > data.canvas.width / 2 && x < data.canvas.width * 3 / 4) {
                if (y < data.canvas.height / 4) data.keys[data.p[2].up] = true;
                if (y > data.canvas.height * 3 / 4) data.keys[data.p[2].down] = true;
            }
            if (x > data.canvas.width * 3 / 4) {
                if (y < data.canvas.height / 4) data.keys[data.p[3].up] = true;
                if (y > data.canvas.height * 3 / 4) data.keys[data.p[3].down] = true;
            }
        } else {
            if (x > data.canvas.width * 3 / 4) {
                if (y < data.canvas.height / 4) data.keys[data.p[1].up] = true;
                if (y > data.canvas.height * 3 / 4) data.keys[data.p[1].down] = true;
            }
        }
    }
}

function touchUp(ev: TouchEvent) {
    if (!data.go) return;
    ev.preventDefault();
    for (const touch of ev.changedTouches) {
        const x = touch.clientX;
        if (x < data.canvas.width / 4) {
            data.keys[data.p[0].up] = false;
            data.keys[data.p[0].down] = false;
            pad[0].setDir(0);
            if (data.mode == "doublePaddle") pad[2].setDir(0);
        }
        if (data.mode === "multi") {
            if (x > data.canvas.width / 4 && x < data.canvas.width / 2) {
                data.keys[data.p[1].up] = false;
                data.keys[data.p[1].down] = false;
                pad[1].setDir(0);
            }
            if (x > data.canvas.width / 2 && x < data.canvas.width * 3 / 4) {
                data.keys[data.p[2].up] = false;
                data.keys[data.p[2].down] = false;
                pad[2].setDir(0);
            }
            if (x > data.canvas.width * 3 / 4) {
                data.keys[data.p[3].up] = false;
                data.keys[data.p[3].down] = false;
                pad[3].setDir(0);
            }
        } else {
            if (x > data.canvas.width * 3 / 4) {
                data.keys[data.p[1].up] = false;
                data.keys[data.p[1].down] = false;
                pad[1].setDir(0);
                if (data.mode == "doublePaddle") pad[3].setDir(0);
            }
        }
    }
}

export function enterFullscreen(): Promise<void> {
	const canvas = document.getElementById("board") as HTMLCanvasElement;
	if (!canvas) {
		return Promise.reject(new Error("Canvas not found"));
	}
	return new Promise<void>((resolve, reject) => {
		if (canvas.requestFullscreen) canvas.requestFullscreen();
		else if ((canvas as any).webkitRequestFullscreen)
			(canvas as any).webkitRequestFullscreen();
		else if ((canvas as any).mozRequestFullScreen)
			(canvas as any).mozRequestFullScreen();
		else if ((canvas as any).msRequestFullscreen)
			(canvas as any).msRequestFullscreen();
		else reject(new Error("Fullscreen not supported"));
		if (screen.orientation && (screen.orientation as any).lock) {
			(screen.orientation as any).lock("landscape").catch((err: any) => {
			});
		}
		resolve();
	});
}

export function exitFullscreen(): void {
	if (document.exitFullscreen) document.exitFullscreen();
	else if ((document as any).webkitExitFullscreen)
		(document as any).webkitExitFullscreen();
	else if ((document as any).mozCancelFullScreen)
		(document as any).mozCancelFullScreen();
	else if ((document as any).msExitFullscreen)
		(document as any).msExitFullscreen();
}

export function showFullscreenPrompt(): void {
	const prompt = document.createElement("div");
	prompt.className =
		"fixed inset-0 bg-black/80 flex items-center justify-center z-50";
	prompt.id = "fullscreen-prompt";

	prompt.innerHTML = `
		<div class="bg-[rgba(3,27,27,0.95)] rounded-xl p-6 max-w-sm mx-4 border border-[rgba(102,252,241,0.25)] shadow-2xl text-center">
			<div class="text-4xl mb-4">📱</div>
			<h2 class="text-xl font-bold text-[#66fcf1] mb-3 font-[jura]">
				Enter Fullscreen
			</h2>
			<p class="text-[#66fcf1] mb-4 text-sm font-[jura]">
				For the best gaming experience, tap the button below to enter fullscreen mode.
			</p>
			<button
				id="fullscreen-btn"
				class="btn py-2.5 px-6 text-lg font-bold w-full"
			>
				Enter Fullscreen
			</button>
		</div>
	`;

	document.body.appendChild(prompt);

	const fullscreenBtn = prompt.querySelector("#fullscreen-btn");
	fullscreenBtn?.addEventListener("click", async () => {
		try {
			await enterFullscreen();
			prompt.remove();
		} catch (err) {
			prompt.remove();
		}
	});
}

export function setupFullscreenToggle(): void {
	const toggleBtn = document.getElementById("fullscreen-toggle");
	if (!toggleBtn) return;

	toggleBtn.addEventListener("click", async () => {
		try {
			await enterFullscreen();
		} catch (err) {
			console.error("Failed to enter fullscreen:", err);
		}
	});

	document.addEventListener("fullscreenchange", () => {
		if (!document.fullscreenElement) {
			toggleBtn.classList.remove("hidden");
		} else {
			toggleBtn.classList.add("hidden");
		}
	});
}
