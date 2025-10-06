import { data, newGame, getSecondPlayerData } from "./gameData";
import Paddle from "./Paddle";
import Ball from "./Ball";
import { midline, touchControlArrows } from "./Paddle.draw";
//import { userService, UserData } from "./services/userService";
import { initI18n } from "./i18n";
import { gameService, gameInfo } from "./services/gameService";
import { handleTournamentGameCompletion } from "./tournamentGame";

export let pad: Paddle[] = [];
export let balls: Ball[] = [];

export function removeBall(ball: Ball): void {
  let shrunk: Ball[] = [];
  for (let i: number = 0; i < balls.length; i++)
    if (balls[i] != ball) shrunk.push(balls[i]);
  balls = shrunk;
}

export async function startGame() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get("lang") || "en";
    const mode = urlParams.get("mode") || "twoPlayers";

    await initI18n(lang);
    await newGame(mode);
    document.getElementById("board")?.focus();
  } catch (error) {
    console.error("Failed to load configuration:", error);
  }
}

export function countdown(nr: number, ms: number) {
  data.showingText = true;
  data.ctx.fillStyle = data.bg;
  data.ctx.rect(0, 0, data.canvas.width, data.canvas.height);
  data.ctx.fill();
  data.ctx.font = `bold ${data.canvas.height * 0.75}px system-ui`;
  data.ctx.fillStyle = "yellow";
  data.ctx.strokeStyle = "red";
  data.ctx.lineWidth = data.canvas.height / 60;
  data.ctx.textAlign = "center";
  data.ctx.textBaseline = "middle";
  data.ctx.strokeText(
    String(nr),
    data.canvas.width / 2,
    data.canvas.height / 2
  );
  data.ctx.fillText(String(nr), data.canvas.width / 2, data.canvas.height / 2);
  if (nr - 1) setTimeout(() => countdown(nr - 1, ms), ms);
  else setTimeout(() => startRound(), ms);
}

export function startRound(): void {
  initBoard();
  pad[0].go();
  pad[1].go();
  if (data.mode == "multi" || data.mode == "doublePaddle") pad[2].go();
  if (data.mode == "multi" || data.mode == "doublePaddle") pad[3].go();
  balls[0].go();
  data.go = true;
  window.requestAnimationFrame(loop);
}

function initBoard(): void {
  data.showingText = false;
  data.keys = {};
  balls.push(new Ball());
  pad = new Array(new Paddle(0, data.p[0]));
  if (data.mode == "twoPlayers")
    pad.push(new Paddle(data.canvas.width - data.paddleWidth, data.p[1]));
  if (data.mode == "doublePaddle") {
    pad.push(new Paddle(data.canvas.width - data.paddleWidth, data.p[1]));
    pad.push(
      new Paddle(data.canvas.width * 0.25 - data.paddleWidth, data.p[0])
    );
    pad.push(
      new Paddle(data.canvas.width * 0.75 - data.paddleWidth, data.p[1])
    );
  }
  if (data.mode == "multi") {
    pad.push(
      new Paddle(data.canvas.width * 0.25 - data.paddleWidth, data.p[1])
    );
    pad.push(
      new Paddle(data.canvas.width * 0.75 - data.paddleWidth, data.p[2])
    );
    pad.push(new Paddle(data.canvas.width - data.paddleWidth, data.p[3]));
  }
  if (data.mode == "tournament") {
    pad.push(new Paddle(data.canvas.width - data.paddleWidth, data.p[1]));
  }
}

function loop(): void {
  if (data.go) {
    update();
    render();
    window.requestAnimationFrame(loop);
  }
}

function update(): void {
  const now = performance.now();
  if (now - data.lastTime > 1000 / data.fps) {
    data.lastTime = now;
    for (let i: number = 0; i < balls.length; i++) balls[i].move();
    for (let i: number = 0; i < pad.length; i++) {
      if (pad[i].isAi()) pad[i].moveAI();
      else pad[i].movePaddle();
    }
  }
}

function render(): void {
  data.ctx.fillStyle = data.bg;
  data.ctx.rect(0, 0, data.canvas.width, data.canvas.height);
  data.ctx.fill();
  midline();
  for (let i: number = 0; i < pad.length; i++) pad[i].draw();
  if (data.trailLength)
    for (let i: number = 0; i < balls.length; i++) balls[i].drawTrail();
  for (let i: number = 0; i < balls.length; i++) balls[i].draw();
  if (data.touchControl) touchControlArrows();
}

export function endRound(): void {
  //gameService.updateScore(data.[0].id, data.gameID, data.p[0].score, data.p[1].score);
  while (balls.length) {
    balls[0].stop();
    balls.shift();
  }
  while (pad.length) {
    pad[0].stop();
    pad.shift();
  }
  
  if (data.p[0].score >= data.maxScore || data.p[1].score >= data.maxScore) {
    if (data.isTournament) {
      finito();
    } else {
      endGame();
    }
    return;
  }
  
  // Match continues - restart the next round
  if (data.p[0].score < data.maxScore && data.p[1].score < data.maxScore) {
    setTimeout(startRound, 1500);
  }
}

export async function finito(): Promise<void> {
  let winnerId: string;
  if (data.p[0].score > data.p[1].score) {
    winnerId = data.p[0].id;
  } else {
    winnerId = data.p[1].id;
  }

  const gameData: gameInfo = {
    player1Id: data.p[0].id,
    player1Name: data.p[0].name,
    score1: data.p[0].score,
    player2Id: data.p[1].id,
    player2Name: data.p[1].name,
    score2: data.p[1].score,
    maxScore: data.maxScore,
    multiBall: data.multiball,
    mode: data.mode,
    isTournament: data.isTournament, //false in single mode
    tournamentId: data.tournamentId, // null in case of single game
    tournamentRound: data.tournamentRound, //null in case of single game
    tournamentMatch: data.tournamentMatch, //null in case of single game
    winnerId: winnerId,
  };
  
  const result = await gameService.finishGame(gameData);
  if (!result) {
    console.error("Failed to finish game on server");
    return;
  }
  
  console.log("Game data successfully sent to server");
  
  // Handle tournament progression if this is a tournament game
  if (data.isTournament && data.tournamentId) {
    try {
      const tournamentResult = await handleTournamentGameCompletion(winnerId, result.gameId || "");
      if (tournamentResult) {
        console.log("Tournament game completed, showing match transition window");
        return;
      } else {
        console.log("Tournament completed or failed, will auto-exit");
      }
    } catch (error) {
      console.error("Error handling tournament game completion:", error);
    }
  }
  
  return;
}

export async function endGame() {
  var winner: string;

  if (data.p[0].score > data.p[1].score) {
    winner = data.p[0].name;
  } else {
    winner = data.p[1].name;
  }

  data.showingText = false;

  try {
    console.log("Sending game data:", data);
    console.log("player1ID: ", data.p[0].id);
    console.log("player2ID: ", data.p[1].id);
    finito();
  } catch (error) {
    console.error("Failed to finish game:", error);
  }

  // Add exit button for mobile users
  if (isMobile()) {
    showExitButton(winner);
  } else {
    // For tournament mode, don't auto-exit if there are more matches
    if (data.isTournament && data.tournamentId) {
      // Tournament mode - let the transition window handle the flow
      console.log("Tournament mode: not auto-exiting, waiting for transition window");
    } else {
      // Single player mode - auto-exit after 3 seconds
      setTimeout(() => {
        exitGameMessage(winner);
      }, 3000);
    }
  }
}

function exitGameMessage(winner: string): void {
  window.parent.postMessage(
    {
      type: "EXIT_GAME",
      winner: winner,
    },
    window.location.origin
  );
}

// Mobile exit functionality
function isMobile(): boolean {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    (window.innerWidth <= 768 && window.innerHeight <= 1024)
  );
}

function showExitButton(winner: string): void {
  const exitOverlay = document.createElement("div");
  exitOverlay.className =
    "fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-[10000]";
  exitOverlay.innerHTML = `
		<div class="text-center text-white mb-8">
			<h2 class="text-4xl font-bold mb-4">Game Over!</h2>
			<p class="text-2xl">Winner: ${winner}</p>
		</div>
		<button id="exit-game-btn" class="bg-[#66fcf1] text-black px-8 py-4 rounded-lg text-xl font-bold hover:bg-[#5ae6d9] transition-colors">
			Exit Game
		</button>
	`;

  document.body.appendChild(exitOverlay);

  // Add exit functionality
  const exitBtn = document.getElementById("exit-game-btn");
  if (exitBtn) {
    exitBtn.addEventListener("click", () => {
      // Exit fullscreen first
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
      exitGameMessage(winner);
      document.body.removeChild(exitOverlay);
    });
  }
}

function collisionTest(): void {
  data.showingText = false;
  data.p[0].isAi = false;
  //	data.p[1].isAi = false;
  data.multiball = false;
  data.trailLength = 0;
  data.maxScore = 1;
  data.ballSpeed = 70;
  //x axis
  balls.push(new Ball(data.canvas.width / 2, data.canvas.height / 2, -0.1, 0));
  balls.push(
    new Ball(
      data.canvas.width / 2,
      data.canvas.height / 2 - (data.canvas.width / data.ballSize) * 4,
      -0.1,
      0
    )
  );
  balls.push(
    new Ball(
      data.canvas.width / 2,
      data.canvas.height / 2 - (data.canvas.width / data.ballSize) * 2,
      -0.1,
      0
    )
  );
  balls.push(
    new Ball(
      data.canvas.width / 2,
      data.canvas.height / 2 + (data.canvas.width / data.ballSize) * 2,
      -0.1,
      0
    )
  );
  balls.push(
    new Ball(
      data.canvas.width / 2,
      data.canvas.height / 2 + (data.canvas.width / data.ballSize) * 4,
      -0.1,
      0
    )
  );
  //y axis
  balls.push(
    new Ball(
      data.canvas.width / 2 -
        data.paddleWidth * 2 -
        data.canvas.width / data.ballSize / 2,
      data.canvas.height / 2 - (data.canvas.width / data.ballSize) * 6,
      0,
      +0.1
    )
  );
  balls.push(
    new Ball(
      data.canvas.width / 2 -
        data.paddleWidth * 3 +
        data.canvas.width / data.ballSize / 2,
      data.canvas.height / 2 + (data.canvas.width / data.ballSize) * 6,
      0,
      -0.1
    )
  );
  balls.push(
    new Ball(
      data.canvas.width / 2 + data.paddleWidth * 2,
      data.canvas.height / 2 - (data.canvas.width / data.ballSize) * 6,
      0,
      +0.1
    )
  );
  balls.push(
    new Ball(
      data.canvas.width / 2 + data.paddleWidth * 2,
      data.canvas.height / 2 + (data.canvas.width / data.ballSize) * 6,
      0,
      -0.1
    )
  );

  pad = new Array(
    new Paddle(data.canvas.width / 2 - data.paddleWidth * 2, data.p[0]),
    new Paddle(data.canvas.width / 2 + data.paddleWidth, data.p[1])
  );
  pad[0].go();
  pad[1].go();
  balls[0].go();
  balls[1].go();
  balls[2].go();
  balls[3].go();
  balls[4].go();
  balls[5].go();
  balls[6].go();
  balls[7].go();
  balls[8].go();
  data.go = true;
  window.requestAnimationFrame(loop);
}

startGame();
