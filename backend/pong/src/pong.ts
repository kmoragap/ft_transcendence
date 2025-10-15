/*
Main function. Here we start the game proper, set up the static canvas elements,
initialize the movable game elements and run the game loop. When the game ends,
the scores are uploaded to pong-db.
*/

import { data, newGame, getSecondPlayerData } from "./gameData";
import Paddle from "./Paddle";
import Ball from "./Ball";
import { midline, touchControlArrows } from "./Paddle.draw";
import { initI18n } from "./i18n";
import { gameService, gameInfo } from "./services/gameService";
import { handleTournamentGameCompletion } from "./tournamentGame";
import { exitFullscreen } from "./controls";

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
    const isHighContrast = urlParams.get("hc") === "true";

    if (isHighContrast) {
      document.documentElement.classList.add('hc');
    }

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
  data.ctx.font = `bold ${data.canvas.height * 0.75}px jura, sans-serif`;
  data.ctx.fillStyle = "#66fcf1";
  data.ctx.strokeStyle = "#0b4f47";
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
  pad = new Array(new Paddle(0, data.p[0], 0, -1));
  if (data.mode == "twoPlayers" || data.mode == "tournament")
    pad.push(new Paddle(data.canvas.width - data.paddleWidth, data.p[1], 0, -1));
  if (data.mode == "doublePaddle") {
    pad.push(new Paddle(data.canvas.width - data.paddleWidth, data.p[1], 0, -1));
    pad.push(new Paddle(data.canvas.width * 0.25 - data.paddleWidth, data.p[0], balls[0].getSize() * 3, 0));
    pad.push(new Paddle(data.canvas.width * 0.75 - data.paddleWidth, data.p[1], balls[0].getSize() * 3, 1));
  }
  if (data.mode == "multi") {
    pad.push(new Paddle(data.canvas.width * 0.25 - data.paddleWidth, data.p[1], balls[0].getSize() * 3, -1));
    pad.push(new Paddle(data.canvas.width * 0.75 - data.paddleWidth, data.p[2], balls[0].getSize() * 3, -1));
    pad.push(new Paddle(data.canvas.width - data.paddleWidth, data.p[3], 0, -1));
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
      if (pad[i].isAi()) {
        pad[i].moveAI();
      } else {
        pad[i].movePaddle();
      }
    }
  }
}

function render(): void {
	data.ctx.fillStyle = data.bg;
	data.ctx.rect(0, 0, data.canvas.width, data.canvas.height);
	data.ctx.fill();
	var p1NameAndScore: string;
	var p2NameAndScore: string;
	var margin: string = "   ";
	if (data.mode != "multi") {
		p1NameAndScore = data.p[0].name + " - " + data.p[0].score + margin;
		p2NameAndScore = margin + data.p[1].score + " - " + data.p[1].name;
	} else {
		p1NameAndScore = "Team 1  - " + data.p[0].score + margin;
		p2NameAndScore = margin + data.p[2].score + " - Team 2";
	}
	data.ctx.font = `bold ${data.canvas.height / 24}px jura, sans-serif`;
	data.ctx.fillStyle = "rgba(102, 252, 241, 0.5)";
	data.ctx.textBaseline = "top";
	data.ctx.textAlign = "right";
	data.ctx.fillText(p1NameAndScore, data.canvas.width / 2, 20);
	data.ctx.textAlign = "left";
	data.ctx.fillText(p2NameAndScore, data.canvas.width / 2, 20);
	midline();
	for (let i: number = 0; i < pad.length; i++) pad[i].draw();
	if (data.trailLength)
		for (let i: number = 0; i < balls.length; i++) balls[i].drawTrail();
	for (let i: number = 0; i < balls.length; i++) balls[i].draw();
	if (data.touchControl) touchControlArrows();
}

export function endRound(): void {
  while (balls.length) {
    balls[0].stop();
    balls.shift();
  }
  while (pad.length) {
    pad[0].stop();
    pad.shift();
  }
  var player2: number = 1;

  if (data.mode == "multi") player2 = 2;
  if (data.p[0].score >= data.maxScore || data.p[player2].score >= data.maxScore) {
    if (data.isTournament) finito();
    else endGame();
    return;
  }
  // Match continues - start the next round
  if (data.p[0].score < data.maxScore && data.p[player2].score < data.maxScore) {
    setTimeout(startRound, 1500);
  }
}

export async function finito(): Promise<void> {
  let winnerId: string;
  var pl2 = 1;
  if (data.mode == "multi") pl2 = 2;
  
  if (data.p[0].score > data.p[pl2].score) {
    winnerId = data.p[0].id;
  } else {
    winnerId = data.p[pl2].id;
  }
  var result, result2;
  if (data.mode != "multi") {
    const gameData: gameInfo = {
      status: "FINISHED",
      player1Id: data.p[0].id,
      player1Name: data.p[0].name,
      score1: data.p[0].score,
      player2Id: data.p[1].id,
      player2Name: data.p[1].name,
      score2: data.p[1].score,
      maxScore: data.maxScore,
      multiBall: data.multiball,
      mode: data.mode,
      isTournament: data.isTournament,
      tournamentId: data.tournamentId,
      tournamentRound: data.tournamentRound,
      tournamentMatch: data.tournamentMatch,
      winnerId: winnerId,
    };
    result = await gameService.finishGame(gameData);
    if (!result) {
      console.error("Failed to finish game on server");
      return;
    }
  } else {
    const gameData1: gameInfo = {
      status: "FINISHED",
      player1Id: data.p[0].id,
      player1Name: data.p[0].name,
      score1: data.p[0].score,
      player2Id: data.p[2].id,
      player2Name: data.p[2].name,
      score2: data.p[2].score,
      maxScore: data.maxScore,
      multiBall: data.multiball,
      mode: data.mode,
      isTournament: data.isTournament,
      tournamentId: data.tournamentId,
      tournamentRound: data.tournamentRound,
      tournamentMatch: data.tournamentMatch,
      winnerId: winnerId,
    };
    result = await gameService.finishGame(gameData1);
    if (!result) {
      console.error("Failed to finish game on server");
      return;
    }
    
    if (winnerId == data.p[0].id) winnerId = data.p[1].id;
    else winnerId = data.p[3].id;
      
    const gameData2: gameInfo = {
      status: "FINISHED",
      player1Id: data.p[1].id,
      player1Name: data.p[1].name,
      score1: data.p[0].score,
      player2Id: data.p[3].id,
      player2Name: data.p[3].name,
      score2: data.p[2].score,
      maxScore: data.maxScore,
      multiBall: data.multiball,
      mode: data.mode,
      isTournament: data.isTournament,
      tournamentId: data.tournamentId,
      tournamentRound: data.tournamentRound,
      tournamentMatch: data.tournamentMatch,
      winnerId: winnerId,
    };
    result2 = await gameService.finishGame(gameData2);
    if (!result2) {
      console.error("Failed to finish game on server");
      return;
    }
  }
  


  if (data.isTournament && data.tournamentId) {
    try {
      const tournamentResult = await handleTournamentGameCompletion(
        winnerId,
        result.gameId || ""
      );
      if (tournamentResult) {
        return;
      } else {
      }
    } catch (error) {
      console.error("Error handling tournament game completion:", error);
    }
  }

  return;
}

export async function endGame() {
  var winner: string;
  var player2: number = 1;
  if (data.mode == "multi") player2 = 2;
  if (data.p[0].score > data.p[player2].score) winner = data.p[0].name;
  else winner = data.p[player2].name;
  data.showingText = false;

  try {
    finito();
  } catch (error) {
    console.error("Failed to finish game:", error);
  }

  if (isMobile()) {
    setTimeout(() => {
      exitFullscreen();
      exitGameMessage(winner);
    }, 3000);
  } else {
    if (!data.isTournament || !data.tournamentId) {
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
export function isMobile(): boolean {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    (window.innerWidth <= 768 && window.innerHeight <= 1024)
  );
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
    new Paddle(data.canvas.width / 2 - data.paddleWidth * 2, data.p[0], data.ballSize * 2, -1),
    new Paddle(data.canvas.width / 2 + data.paddleWidth, data.p[1], data.ballSize * 2, -1)
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
