// ../workspace/backend/pong/src/pong.ts
var canvas = document.getElementById("board");
var ctx = canvas.getContext("2d");
var scoreP1TB = document.getElementById("p1score");
var scoreP2TB = document.getElementById("p2score");
var keys = {};
var bg = "green";
var p1Col = "red";
var p2Col = "yellow";
var uiCol = "white";
var ballCol = "blue";
var singlePlayer = true;
var p1;
var p2;
var paddleWidth;
var paddleHeight;
var p1Dir;
var p2Dir;
var score1;
var score2;
var maxScore;
var ball;
var ballY;
var Paddle = class {
  constructor(posX, posY, color) {
    this._del = 0;
    this._goTime = 0;
    this._moveSpeed = canvas.height / 400;
    this._posX = posX;
    this._posY = posY;
    this._color = color;
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
  getMoveSpeed() {
    return this._moveSpeed;
  }
  draw(color) {
    if (ctx) {
      ctx.beginPath();
      if (color == bg) this._del = this._moveSpeed;
      else this._del = 0;
      ctx.fillStyle = color;
      ctx.rect(this._posX, this._posY - this._del, paddleWidth, paddleHeight + 2 * this._del);
      ctx.fill();
    }
  }
  move(dir) {
    this.draw(bg);
    this._posY += dir;
    this.draw(this._color);
  }
  hit() {
    if (ballY >= this._posY && ballY <= this._posY + paddleHeight) return true;
    else return false;
  }
};
var Ball = class {
  constructor(color) {
    this._del = 0;
    this._goTime = 0;
    this._ballSpeed = canvas.width / 2;
    this._x = canvas.width / 2;
    this._size = canvas.width / 80;
    this._color = color;
    this._del = 0;
  }
  go(go) {
    this._goTime = go;
  }
  stop() {
    clearTimeout(this._goTime);
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
  draw(color) {
    if (ctx) {
      ctx.beginPath();
      if (color === bg) this._del = 1;
      else this._del = 0;
      ctx.ellipse(this._x, ballY, this._size + this._del, this._size + this._del, 0, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }
  midline() {
    if (ctx && this._x > canvas.width / 2 - this._size * 2 && this._x < canvas.width / 2 + this._size * 2) {
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.strokeStyle = uiCol;
      ctx.stroke();
      ctx.beginPath();
    }
  }
  collision(paddle) {
    const hitPosition = (ballY - (paddle.getPosY() + paddleHeight / 2)) / (paddleHeight / 2);
    const clampedHit = hitPosition;
    const isRightPaddle = paddle.getPosX() > canvas.width / 2;
    const baseAngle = isRightPaddle ? Math.PI : 0;
    const variationAngle = clampedHit * (isRightPaddle ? -(Math.PI / 4) : Math.PI / 4);
    this._dirX = Math.cos(baseAngle + variationAngle) / 100;
    this._dirY = Math.sin(baseAngle + variationAngle) / 100;
    if (isRightPaddle) this._x = canvas.width - this._size - paddleWidth - 1;
    else this._x = this._size + paddleWidth + 1;
  }
  checkPaddle() {
    if (this._x > 0 && this._x < paddleWidth + this._size && p1.hit()) this.collision(p1);
    if (this._x >= canvas.width - this._size - paddleWidth && this._x < canvas.width - this._size && p2.hit()) this.collision(p2);
  }
  checkWalls() {
    if (this._x <= this._size || this._x >= canvas.width - this._size) {
      ball.stop();
      p1.stop();
      p2.stop();
      if (this._x <= this._size) {
        score2++;
        scoreP2TB.value = String(score2);
        console.log("Player 2 scores!");
        this._dirX = 0.01;
      }
      if (this._x >= canvas.width - this._size) {
        score1++;
        scoreP1TB.value = String(score1);
        console.log("Player 1 scores!");
        this._dirX = -0.01;
      }
      if (score1 < maxScore && score2 < maxScore) setTimeout(startRound, 1e3);
      else endGame();
    }
    if (ballY <= this._size || ballY >= canvas.height - this._size) this._dirY *= -1;
  }
  advanceBall() {
    for (let i = 0; i < this._ballSpeed; i++) {
      this._x += this._dirX;
      ballY += this._dirY;
    }
  }
  move() {
    this.draw(bg);
    this.midline();
    this.checkPaddle();
    this.checkWalls();
    this.advanceBall();
    this.draw(this._color);
  }
};
function moveP1() {
  if (keys.Shift)
    if (p1.getPosY() > 0) p1Dir -= p1.getMoveSpeed();
    else p1Dir = 0;
  if (keys.Control)
    if (p1.getPosY() <= canvas.height - paddleHeight) p1Dir += p1.getMoveSpeed();
    else p1Dir = 0;
  p1.move(p1Dir);
}
function moveP2() {
  if (keys.ArrowUp)
    if (p2.getPosY() > 0) p2Dir -= p2.getMoveSpeed();
    else p2Dir = 0;
  if (keys.ArrowDown)
    if (p2.getPosY() <= canvas.height - paddleHeight) p2Dir += p2.getMoveSpeed();
    else p2Dir = 0;
  p2.move(p2Dir);
}
function moveAI(ball2) {
  if (!p2.hit() && ball2.getDirX() > 0) {
    if (p2.getPosY() <= ballY && p2.getPosY() > 0) p2Dir += p2.getMoveSpeed();
    else if (p2.getPosY() + paddleHeight > ballY && p2.getPosY() <= canvas.height - paddleHeight) p2Dir -= p2.getMoveSpeed();
  } else p2Dir = 0;
  p2.move(p2Dir);
}
document.addEventListener("keydown", (ev) => {
  if (ev.key == "Shift" || ev.key == "Control") {
    if (ev.location == 1) keys[ev.key] = true;
  } else keys[ev.key] = true;
});
document.addEventListener("keyup", (ev) => {
  if (ev.key == "Shift" || ev.key == "Control") {
    if (ev.location == 1) p1Dir = 0;
    keys[ev.key] = false;
  }
  if (ev.key == "ArrowUp" || ev.key == "ArrowDown") {
    p2Dir = 0;
    keys[ev.key] = false;
  }
});
function startRound() {
  if (ctx) {
    ctx.fillStyle = bg;
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
  }
  scoreP1TB.value = String(score1);
  scoreP2TB.value = String(score2);
  ball = new Ball(ballCol);
  p1 = new Paddle(0, canvas.height / 2 - paddleHeight / 2, p1Col);
  p2 = new Paddle(canvas.width - paddleWidth, canvas.height / 2 - paddleHeight / 2, p2Col);
  p1.move(0);
  p2.move(0);
  ballY = canvas.height / 2;
  ball.setDirX(0.01);
  ball.setDirY(0);
  p1.go(setInterval(() => moveP1(), 20));
  if (singlePlayer) p2.go(setInterval(() => moveAI(ball), 20));
  else p2.go(setInterval(() => moveP2(), 20));
  ball.go(setInterval(() => ball.move(), 5));
}
function startGame() {
  p1Dir = 0;
  p2Dir = 0;
  score1 = 0;
  score2 = 0;
  maxScore = 3;
  paddleWidth = canvas.width / 40;
  paddleHeight = canvas.height / 5;
  startRound();
}
function endGame() {
  if (score1 > score2)
    console.log("Player 1 wins!");
  else console.log("Player 2 wins!");
}
startGame();
