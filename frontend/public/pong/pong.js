// ../workspace/backend/pong/src/gameData.ts
var data;
async function loadConfig() {
  await new Promise((resolve) => {
    if (document.readyState === "complete") resolve();
    else document.addEventListener("DOMContentLoaded", () => resolve());
  });
  const config = document.getElementById("config");
  if (!config) throw new Error("Config element not found");
  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const loadData = {
    canvas,
    ctx,
    scoreP1TB: document.getElementById("p1score"),
    scoreP2TB: document.getElementById("p2score"),
    nameP1TB: document.getElementById("p1name"),
    nameP2TB: document.getElementById("p2name"),
    p1Name: config.getAttribute("name_p1") || "",
    p2Name: config.getAttribute("name_p2") || "",
    singlePlayer: false,
    maxScore: parseInt(config.getAttribute("maxScore") || "10", 10),
    serve: 1,
    keys: {},
    bg: ctx.createLinearGradient(0, 0, canvas.width, 0),
    uiCol: config.getAttribute("uiCol") || "",
    ballR: config.getAttribute("ballR") || "",
    ballG: config.getAttribute("ballG") || "",
    ballB: config.getAttribute("ballB") || "",
    ballCol: "",
    trailLength: parseInt(config.getAttribute("trailLength") || "20", 10),
    p1InnerCol: config.getAttribute("p1InnerCol") || "",
    p1OuterCol: config.getAttribute("p1OuterCol") || "",
    p1CornerCol: config.getAttribute("p1CornerCol") || "",
    p2InnerCol: config.getAttribute("p2InnerCol") || "",
    p2OuterCol: config.getAttribute("p2OuterCol") || "",
    p2CornerCol: config.getAttribute("p2CornerCol") || "",
    p1Up: config.getAttribute("p1Up") || "",
    p1Down: config.getAttribute("p1Down") || "",
    p2Up: config.getAttribute("p2Up") || "",
    p2Down: config.getAttribute("p2Down") || "",
    paddleWidth: 0,
    paddleHeight: 0,
    paddleSpeed: 2,
    ballSpeed: 2,
    ballSize: 80,
    score1: 0,
    score2: 0
  };
  loadData.nameP1TB.value = loadData.p1Name;
  if (config.getAttribute("singlePlayer") == "true") {
    loadData.singlePlayer = true;
    loadData.p2Name = "Marvin";
  }
  loadData.nameP2TB.value = loadData.p2Name;
  loadData.canvas.width = window.innerWidth;
  loadData.canvas.height = window.innerHeight - loadData.scoreP1TB.offsetHeight * 2;
  loadData.paddleWidth = canvas.width / 60;
  loadData.paddleHeight = canvas.height / 5;
  loadData.bg = ctx.createLinearGradient(0, 0, canvas.width, 0);
  const innerBg = config.getAttribute("innerBg") || "";
  const outerBg = config.getAttribute("outerBg") || "";
  loadData.bg.addColorStop(0, outerBg);
  loadData.bg.addColorStop(0.5, innerBg);
  loadData.bg.addColorStop(1, outerBg);
  loadData.ballCol = `rgba(${loadData.ballR}, ${loadData.ballG}, ${loadData.ballB}, 255)`;
  if (Math.floor(Math.random() * 2)) loadData.serve = -1;
  switch (config.getAttribute("ballSpeed")) {
    case "glacial":
      loadData.ballSpeed = 10;
      break;
    case "slow":
      loadData.ballSpeed = 5;
      break;
    case "standard":
      loadData.ballSpeed = 2;
      break;
    case "fast":
      loadData.ballSpeed = 1.5;
      break;
    case "insane":
      loadData.ballSpeed = 1;
      break;
    default:
      loadData.ballSpeed = 2;
      break;
  }
  switch (config.getAttribute("ballSize")) {
    case "tiny":
      loadData.ballSize = 160;
      break;
    case "small":
      loadData.ballSize = 120;
      break;
    case "normal":
      loadData.ballSize = 80;
      break;
    case "big":
      loadData.ballSize = 60;
      break;
    case "huge":
      loadData.ballSize = 40;
      break;
    default:
      loadData.ballSize = 80;
      break;
  }
  switch (config.getAttribute("paddleSpeed")) {
    case "glacial":
      loadData.paddleSpeed = 5e3;
      break;
    case "slow":
      loadData.paddleSpeed = 2500;
      break;
    case "standard":
      loadData.paddleSpeed = 400;
      break;
    case "fast":
      loadData.paddleSpeed = 300;
      break;
    case "insane":
      loadData.paddleSpeed = 200;
      break;
    default:
      loadData.paddleSpeed = 400;
      break;
  }
  data = loadData;
}

// ../workspace/backend/pong/src/controls.ts
function controlKeys() {
  document.addEventListener("keydown", (ev) => {
    if (ev.key == "Shift" || ev.key == "Control") {
      if (ev.location == 1) data.keys[ev.key] = true;
    } else data.keys[ev.key] = true;
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
    if (ev.key == "Escape") {
      data.keys[ev.key] = false;
      ball.stop();
      p1.stop();
      p2.stop();
    }
  });
}
function movePlayer(player, up, down) {
  if (data.keys[up])
    if (player.getPosY() > 0) player.setDir(player.getDir() - player.getMoveSpeed());
    else player.setDir(0);
  if (data.keys[down])
    if (player.getPosY() <= data.canvas.height - data.paddleHeight) player.setDir(player.getDir() + player.getMoveSpeed());
    else player.setDir(0);
  player.move();
}
function moveAI(ball2) {
  if (!p2.hitY() && ball2.getDirX() > 0) {
    if (p2.getPosY() <= ball2.getY() && p2.getPosY() > 0) p2.setDir(p2.getDir() + p2.getMoveSpeed());
    else if (p2.getPosY() + data.paddleHeight > ball2.getY() && p2.getPosY() <= data.canvas.height - data.paddleHeight) p2.setDir(p2.getDir() - p2.getMoveSpeed());
  } else p2.setDir(0);
  p2.move();
}

// ../workspace/backend/pong/src/Paddle.ts
var Paddle = class {
  constructor(posX, innerColor, outerColor, cornerColor, name) {
    this._dir = 0;
    this._goTime = 0;
    this._moveSpeed = data.canvas.height / data.paddleSpeed;
    this._posX = posX;
    this._posY = data.canvas.height / 2 - data.paddleHeight / 2;
    this._innerColor = innerColor;
    this._outerColor = outerColor;
    this._cornerColor = cornerColor;
    this._name = name;
  }
  go(go) {
    this._goTime = go;
  }
  stop() {
    clearTimeout(this._goTime);
  }
  getPosY() {
    return this._posY;
  }
  getPosX() {
    return this._posX;
  }
  getDir() {
    return this._dir;
  }
  setDir(dir) {
    this._dir = dir;
  }
  getMoveSpeed() {
    return this._moveSpeed;
  }
  draw() {
    data.ctx.beginPath();
    data.ctx.fillStyle = this._paddleGrad;
    data.ctx.fillRect(this._posX, this._posY + data.paddleWidth, data.paddleWidth, data.paddleHeight - data.paddleWidth * 2);
    this._paddleGrad = data.ctx.createLinearGradient(this._posX, this._posY, this._posX + data.paddleWidth, this._posY);
    this._paddleGrad.addColorStop(0, this._outerColor);
    this._paddleGrad.addColorStop(0.5, this._innerColor);
    this._paddleGrad.addColorStop(1, this._outerColor);
    this._topCornerGrad = data.ctx.createRadialGradient(this._posX + 10, this._posY, data.paddleWidth / 7, this._posX, this._posY, data.paddleWidth);
    this._topCornerGrad.addColorStop(0, "white");
    this._topCornerGrad.addColorStop(0.75, this._cornerColor);
    this._bottomCornerGrad = data.ctx.createRadialGradient(this._posX + 10, this._posY + data.paddleHeight, data.paddleWidth / 7, this._posX, this._posY + data.paddleHeight, data.paddleWidth);
    this._bottomCornerGrad.addColorStop(0, "white");
    this._bottomCornerGrad.addColorStop(0.75, this._cornerColor);
    if (this._posX == 0) {
      data.ctx.beginPath();
      data.ctx.fillStyle = this._topCornerGrad;
      data.ctx.moveTo(this._posX, this._posY + data.paddleWidth);
      data.ctx.arc(this._posX, this._posY + data.paddleWidth, data.paddleWidth, -Math.PI / 2, 0);
      data.ctx.closePath();
      data.ctx.fill();
      data.ctx.beginPath();
      data.ctx.fillStyle = this._bottomCornerGrad;
      data.ctx.moveTo(this._posX, this._posY + data.paddleHeight - data.paddleWidth);
      data.ctx.arc(this._posX, this._posY + data.paddleHeight - data.paddleWidth, data.paddleWidth, 0, Math.PI / 2);
      data.ctx.closePath();
      data.ctx.fill();
    }
    if (this._posX != 0) {
      data.ctx.beginPath();
      data.ctx.fillStyle = this._topCornerGrad;
      data.ctx.moveTo(this._posX + data.paddleWidth, this._posY + data.paddleWidth);
      data.ctx.arc(this._posX + data.paddleWidth, this._posY + data.paddleWidth, data.paddleWidth, Math.PI, Math.PI * 3 / 2);
      data.ctx.closePath();
      data.ctx.fill();
      data.ctx.beginPath();
      data.ctx.fillStyle = this._bottomCornerGrad;
      data.ctx.moveTo(this._posX + data.paddleWidth, this._posY + data.paddleHeight - data.paddleWidth);
      data.ctx.arc(this._posX + data.paddleWidth, this._posY + data.paddleHeight - data.paddleWidth, data.paddleWidth, Math.PI / 2, Math.PI);
      data.ctx.closePath();
      data.ctx.fill();
    }
  }
  erase() {
    data.ctx.beginPath();
    data.ctx.fillStyle = data.bg;
    data.ctx.rect(this._posX - 1, this._posY - 1, data.paddleWidth + 2, data.paddleHeight + 2);
    data.ctx.fill();
  }
  move() {
    this.erase();
    this._posY += this._dir;
    if (this._posY < 0) this._posY = 0;
    if (this._posY > data.canvas.height - data.paddleHeight) this._posY = data.canvas.height - data.paddleHeight;
    this.draw();
  }
  hitY() {
    if (ball.getY() >= this._posY - data.canvas.width / data.ballSize && ball.getY() <= this._posY + data.paddleHeight + data.canvas.width / data.ballSize) return true;
    else return false;
  }
  hitX() {
    if (!this._posX) {
      if (ball.getX() < data.paddleWidth + ball.getSize()) return true;
    } else if (ball.getX() >= data.canvas.width - data.paddleWidth - ball.getSize() && ball.getX() < data.canvas.width - ball.getSize()) return true;
    return false;
  }
  scoreText(score) {
    data.ctx.font = `bold ${data.canvas.height / 6}px system-ui`;
    data.ctx.fillStyle = this._topCornerGrad;
    data.ctx.strokeStyle = this._paddleGrad;
    data.ctx.lineWidth = data.canvas.height / 60;
    data.ctx.textAlign = "center";
    data.ctx.textBaseline = "bottom";
    data.ctx.strokeText(`${this._name}`, data.canvas.width / 2, data.canvas.height / 2);
    data.ctx.fillText(`${this._name}`, data.canvas.width / 2, data.canvas.height / 2);
    data.ctx.textBaseline = "top";
    if (score != data.maxScore) {
      data.ctx.strokeText(`scores!`, data.canvas.width / 2, data.canvas.height / 2);
      data.ctx.fillText(`scores!`, data.canvas.width / 2, data.canvas.height / 2);
    } else {
      data.ctx.strokeText(`wins!`, data.canvas.width / 2, data.canvas.height / 2);
      data.ctx.fillText(`wins!`, data.canvas.width / 2, data.canvas.height / 2);
    }
  }
};

// ../workspace/backend/pong/src/Ball.ts
var Ball = class {
  constructor() {
    this._goTime = 0;
    this._ballSpeed = data.canvas.width / data.ballSpeed;
    this._x = data.canvas.width / 2;
    this._y = data.canvas.height / 2;
    this._dirX = 0.01 * data.serve;
    this._dirY = 0;
    this._size = data.canvas.width / data.ballSize;
    this._trailPoints = [];
    this.trailFade = 30 / data.trailLength;
    this._x = data.canvas.width / 2;
    this._y = data.canvas.height / 2;
  }
  go(go) {
    this._goTime = go;
  }
  stop() {
    clearTimeout(this._goTime);
  }
  getX() {
    return this._x;
  }
  getY() {
    return this._y;
  }
  getSize() {
    return this._size;
  }
  getDirX() {
    return this._dirX;
  }
  setDirX(dir) {
    this._dirX = dir;
  }
  setDirY(dir) {
    this._dirY = dir;
  }
  erase(x, y) {
    data.ctx.beginPath();
    data.ctx.ellipse(x, y, this._size + 1, this._size + 1, 0, 0, Math.PI * 2);
    data.ctx.fillStyle = data.bg;
    data.ctx.fill();
  }
  draw() {
    this.drawTrail();
    this._grad = data.ctx.createRadialGradient(this._x - this._size / 2, this._y - this._size / 2, this._size / 10, this._x, this._y, this._size);
    this._grad.addColorStop(0, "white");
    this._grad.addColorStop(0.3, data.ballCol);
    this._grad.addColorStop(0.6, data.ballCol);
    this._grad.addColorStop(1, "black");
    data.ctx.beginPath();
    data.ctx.ellipse(this._x, this._y, this._size, this._size, 0, 0, Math.PI * 2);
    data.ctx.fillStyle = this._grad;
    data.ctx.fill();
    data.ctx.closePath();
  }
  drawTrail() {
    const currentPoint = {
      x: this._x,
      y: this._y
    };
    this._trailPoints.unshift(currentPoint);
    for (let i = this._trailPoints.length - 1; i > 0; i--)
      this.erase(this._trailPoints[i].x, this._trailPoints[i].y);
    this.midline(this._trailPoints[this._trailPoints.length - 1].x);
    let opacity = 0;
    for (let i = this._trailPoints.length - 1; i > 0; i--) {
      data.ctx.beginPath();
      data.ctx.ellipse(this._trailPoints[i].x, this._trailPoints[i].y, this._size, this._size, 0, 0, Math.PI * 2);
      data.ctx.fillStyle = `rgb(${data.ballR} ${data.ballG} ${data.ballB} / ${opacity}%`;
      data.ctx.fill();
      data.ctx.closePath();
      opacity += this.trailFade;
    }
    this._trailPoints = this._trailPoints.slice(0, data.trailLength);
  }
  midline(x) {
    if (x > data.canvas.width / 2 - this._size * 2 && x < data.canvas.width / 2 + this._size * 2) {
      data.ctx.beginPath();
      data.ctx.lineWidth = 1;
      data.ctx.moveTo(data.canvas.width / 2, 0);
      data.ctx.lineTo(data.canvas.width / 2, data.canvas.height);
      data.ctx.strokeStyle = data.uiCol;
      data.ctx.stroke();
      data.ctx.closePath();
    }
  }
  collision(paddle) {
    var angle = Math.abs(Math.atan2(this._dirY, this._dirX) - Math.PI);
    const hitPosition = (this._y - (paddle.getPosY() + data.paddleHeight / 2)) / (data.paddleHeight / 2);
    const clampedHit = Math.max(-0.7, Math.min(0.7, hitPosition));
    const isRightPaddle = paddle.getPosX() > data.canvas.width / 2;
    const baseAngle = isRightPaddle ? Math.PI : 0;
    const variationAngle = clampedHit * (isRightPaddle ? -(Math.PI / 4) : Math.PI / 4) + baseAngle;
    if (isRightPaddle) {
      this._x = data.canvas.width - this._size - data.paddleWidth - 1;
      angle += variationAngle - Math.PI;
    } else {
      this._x = this._size + data.paddleWidth + 1;
      angle += variationAngle;
    }
    this._dirX = Math.cos(angle) / 100;
    this._dirY = Math.sin(angle) / 100;
  }
  checkPaddle() {
    if (p1.hitX() && p1.hitY()) this.collision(p1);
    if (p2.hitX() && p2.hitY()) this.collision(p2);
  }
  checkWalls() {
    if (this._x <= this._size || this._x >= data.canvas.width - this._size) {
      ball.stop();
      p1.stop();
      p2.stop();
      if (this._x <= this._size) {
        data.score2++;
        data.scoreP2TB.value = String(data.score2);
        setTimeout(() => p2.scoreText(data.score2), 100);
        data.serve = -1;
      }
      if (this._x >= data.canvas.width - this._size) {
        data.score1++;
        data.scoreP1TB.value = String(data.score1);
        setTimeout(() => p1.scoreText(data.score1), 100);
        data.serve = 1;
      }
      if (data.score1 < data.maxScore && data.score2 < data.maxScore) setTimeout(startRound, 2e3);
      else endGame();
    }
    if (this._y <= this._size || this._y >= data.canvas.height - this._size) this._dirY *= -1;
  }
  advanceBall() {
    var stop = false;
    for (let i = 0; i < this._ballSpeed && !stop; i++) {
      this._x += this._dirX;
      this._y += this._dirY;
      if (this._x < ball.getSize()) stop = true;
      if (this._x >= data.canvas.width - ball.getSize()) stop = true;
      if (this._dirX < 0 && p1.hitX() && p1.hitY()) stop = true;
      if (this._dirX >= 0 && p2.hitX() && p2.hitY()) stop = true;
    }
  }
  move() {
    this.checkPaddle();
    this.checkWalls();
    this.advanceBall();
    this.draw();
  }
};

// ../workspace/backend/pong/src/pong.ts
var p1;
var p2;
var ball;
async function startGame() {
  try {
    await loadConfig();
    controlKeys();
    document.getElementById("board")?.focus();
    startRound();
  } catch (error) {
    console.error("Failed to load configuration:", error);
  }
}
function startRound() {
  data.ctx.fillStyle = data.bg;
  data.ctx.rect(0, 0, data.canvas.width, data.canvas.height);
  data.ctx.fill();
  data.scoreP1TB.value = String(data.score1);
  data.scoreP2TB.value = String(data.score2);
  ball = new Ball();
  p1 = new Paddle(0, data.p1InnerCol, data.p1OuterCol, data.p1CornerCol, data.p1Name);
  p2 = new Paddle(data.canvas.width - data.paddleWidth, data.p2InnerCol, data.p2OuterCol, data.p2CornerCol, data.p2Name);
  p1.draw();
  p2.draw();
  p1.go(window.setInterval(() => movePlayer(p1, data.p1Up, data.p1Down), 20));
  if (data.singlePlayer)
    p2.go(window.setInterval(() => moveAI(ball), 20));
  else p2.go(window.setInterval(() => movePlayer(p2, data.p2Up, data.p2Down), 20));
  ball.go(window.setInterval(() => ball.move(), 5));
}
function endGame() {
  if (data.score1 > data.score2)
    console.log("Player 1 wins!");
  else console.log("Player 2 wins!");
}
startGame();
export {
  ball,
  endGame,
  p1,
  p2,
  startRound
};
