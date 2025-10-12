import { data } from "./gameData";
import { pad, balls } from "./pong";

var lastX: number;

export function controlKeys(): void {
	document.addEventListener("keydown", (ev) => {
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
	
	// Add mobile touch controls for full screen
	let touchStartY = 0;
	let touchStartX = 0;
	data.canvas.addEventListener("touchstart", (e) => {
			e.preventDefault();
			const touch = e.touches[0];
			touchStartY = touch.clientY;
			touchStartX = touch.clientX;
		},
		{ passive: false },
	);

	data.canvas.addEventListener("touchmove", (e) => {
			e.preventDefault();
			if (!data || !data.p) return;

			const touch = e.touches[0];
			const deltaY = touch.clientY - touchStartY;
			const deltaX = touch.clientX - touchStartX;

			// Simple touch controls - left side controls player 1, right side controls player 2
			const canvasRect = data.canvas.getBoundingClientRect();
			const touchX = touch.clientX - canvasRect.left;
			const isLeftSide = touchX < data.canvas.width / 2;

			if (isLeftSide && data.p[0]) {
				// Player 1 controls
				if (deltaY < -10) {
					data.keys[data.p[0].up] = true;
					data.keys[data.p[0].down] = false;
				} else if (deltaY > 10) {
					data.keys[data.p[0].down] = true;
					data.keys[data.p[0].up] = false;
				}
			} else if (!isLeftSide && data.p[1]) {
				// Player 2 controls
				if (deltaY < -10) {
					data.keys[data.p[1].up] = true;
					data.keys[data.p[1].down] = false;
				} else if (deltaY > 10) {
					data.keys[data.p[1].down] = true;
					data.keys[data.p[1].up] = false;
				}
			}
		},
		{ passive: false },
	);

	data.canvas.addEventListener(
		"touchend",
		(e) => {
			e.preventDefault();
			if (data && data.p) {
				data.p.forEach((player) => {
					data.keys[player.up] = false;
					data.keys[player.down] = false;
				});
			}
		},
		{ passive: false },
	);

	data.canvas.addEventListener("touchstart", touchDown);
	data.canvas.addEventListener("touchend", touchUp);
}

function touchDown(ev: TouchEvent) {
	lastX  = data.canvas.height / 2;
	if (data.go) {
		ev.preventDefault();
		var x: number = lastX = ev.touches[0].clientX;
		var y: number = ev.touches[0].clientY;
		if (x < data.canvas.width / 4) {
			if (y < data.canvas.height / 4) data.keys[data.p[0].up] = true;
			if (y > data.canvas.height * 3 / 4) data.keys[data.p[0].down] = true;
		}
		if (data.mode != "multi" ) {
			if (x > data.canvas.width * 3 / 4) {
				if (y < data.canvas.height / 4) data.keys[data.p[1].up] = true;
				if (y > data.canvas.height * 3 / 4) data.keys[data.p[1].down] = true;
			}
		} else {
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
		if (data.mode != "multi" ) {
			if (lastX > data.canvas.width * 3 / 4) {
				data.keys[data.p[1].up] = false;
				data.keys[data.p[1].down] = false;
				pad[1].setDir(0);
				if (data.mode == "doublePaddle") pad[3].setDir(0);
			}
		} else {
			if (lastX > data.canvas.width / 4 && lastX < data.canvas.width / 2) {
				data.keys[data.p[1].up] = false;
				data.keys[data.p[1].down] = false;
				pad[1].setDir(0);
			}
			if (lastX > data.canvas.width / 2 && lastX < data.canvas.width * 3 / 4) {
				data.keys[data.p[2].up] = false;
				data.keys[data.p[2].down] = false;
				pad[2].setDir(0);
			}
			if (lastX > data.canvas.width * 3 / 4) {
				data.keys[data.p[3].up] = false;
				data.keys[data.p[3].down] = false;
				pad[3].setDir(0);
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
				console.log("Orientation lock failed:", err);
			});
		}
		console.log("Fullscreen entered successfully");
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
	// Create a fullscreen prompt overlay
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

	// Add click handler for fullscreen button
	const fullscreenBtn = prompt.querySelector("#fullscreen-btn");
	fullscreenBtn?.addEventListener("click", async () => {
		try {
			await enterFullscreen();
			prompt.remove();
		} catch (err) {
			console.log("Manual fullscreen failed:", err);
			// Remove prompt anyway to not block the game
			prompt.remove();
		}
	});
}