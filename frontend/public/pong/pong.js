// ../workspace/backend/pong/src/pong.ts
var canvas = document.getElementById("board");
var ctx = canvas.getContext("2d");
var win = document.getElementsByName("window");
var scoreP1TB = document.getElementById("p1score");
var scoreP2TB = document.getElementById("p2score");
var keys = {};
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - scoreP1TB.offsetHeight;
var bg = "black";
var p1InnerCol = "white";
var p1OuterCol = "grey";
var p1CornerCol = "red";
var p2InnerCol = "white";
var p2OuterCol = "grey";
var p2CornerCol = "red";
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
  constructor(posX, posY, innerColor, outerColor, cornerColor) {
    this._goTime = 0;
    this._moveSpeed = canvas.height / 400;
    this._posX = posX;
    this._posY = posY;
    this._innerColor = innerColor;
    this._outerColor = outerColor;
    this._cornerColor = cornerColor;
    if (ctx) {
    }
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
  draw() {
    if (ctx) {
      ctx.beginPath();
      if (this._paddleGrad != null)
        ctx.fillStyle = this._paddleGrad;
      ctx.fillRect(this._posX, this._posY + paddleWidth, paddleWidth, paddleHeight - paddleWidth * 2);
      this._paddleGrad = ctx.createLinearGradient(this._posX, this._posY, this._posX + paddleWidth, this._posY);
      this._paddleGrad.addColorStop(0, this._outerColor);
      this._paddleGrad.addColorStop(0.5, this._innerColor);
      this._paddleGrad.addColorStop(1, this._outerColor);
      this._topCornerGrad = ctx.createRadialGradient(this._posX + 10, this._posY, paddleWidth / 7, this._posX, this._posY, paddleWidth);
      this._topCornerGrad.addColorStop(0, "white");
      this._topCornerGrad.addColorStop(0.75, this._cornerColor);
      this._bottomCornerGrad = ctx.createRadialGradient(this._posX + 10, this._posY + paddleHeight, paddleWidth / 7, this._posX, this._posY + paddleHeight, paddleWidth);
      this._bottomCornerGrad.addColorStop(0, "white");
      this._bottomCornerGrad.addColorStop(0.75, this._cornerColor);
      if (this._posX == 0) {
        ctx.beginPath();
        ctx.fillStyle = this._topCornerGrad;
        ctx.moveTo(this._posX, this._posY + paddleWidth);
        ctx.arc(this._posX, this._posY + paddleWidth, paddleWidth, -Math.PI / 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = this._bottomCornerGrad;
        ctx.moveTo(this._posX, this._posY + paddleHeight - paddleWidth);
        ctx.arc(this._posX, this._posY + paddleHeight - paddleWidth, paddleWidth, 0, Math.PI / 2);
        ctx.closePath();
        ctx.fill();
      }
      if (this._posX != 0) {
        ctx.beginPath();
        ctx.fillStyle = this._topCornerGrad;
        ctx.moveTo(this._posX + paddleWidth, this._posY + paddleWidth);
        ctx.arc(this._posX + paddleWidth, this._posY + paddleWidth, paddleWidth, Math.PI, Math.PI * 3 / 2);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = this._bottomCornerGrad;
        ctx.moveTo(this._posX + paddleWidth, this._posY + paddleHeight - paddleWidth);
        ctx.arc(this._posX + paddleWidth, this._posY + paddleHeight - paddleWidth, paddleWidth, Math.PI / 2, Math.PI);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
  erase() {
    if (ctx) {
      ctx.beginPath();
      ctx.fillStyle = bg;
      ctx.rect(this._posX - 1, this._posY - 1, paddleWidth + 2, paddleHeight + 2);
      ctx.fill();
    }
  }
  move(dir) {
    this.erase();
    this._posY += dir;
    this.draw();
  }
  hit() {
    if (ballY >= this._posY && ballY <= this._posY + paddleHeight) return true;
    else return false;
  }
};
var Ball = class {
  constructor(color) {
    this._goTime = 0;
    this._ballSpeed = canvas.width / 2;
    this._x = canvas.width / 2;
    this._dirX = 0;
    this._dirY = 0;
    this._size = canvas.width / 80;
    this._color = color;
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
  erase() {
    if (ctx) {
      ctx.beginPath();
      ctx.ellipse(this._x, ballY, this._size + 1, this._size + 1, 0, 0, Math.PI * 2);
      ctx.fillStyle = bg;
      ctx.fill();
    }
  }
  draw() {
    if (ctx) {
      ctx.beginPath();
      this._grad = ctx.createRadialGradient(this._x - this._size / 3, ballY - this._size / 3, this._size / 10, this._x, ballY, this._size);
      this._grad.addColorStop(0, "white");
      this._grad.addColorStop(0.3, this._color);
      this._grad.addColorStop(0.5, this._color);
      this._grad.addColorStop(0.95, "black");
      ctx.ellipse(this._x, ballY, this._size, this._size, 0, 0, Math.PI * 2);
      ctx.fillStyle = this._grad;
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
    this.erase();
    this.midline();
    this.checkPaddle();
    this.checkWalls();
    this.advanceBall();
    this.draw();
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
  if (ev.key == "Escape") {
    keys[ev.key] = false;
    ball.stop();
    p1.stop();
    p2.stop();
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
  p1 = new Paddle(0, canvas.height / 2 - paddleHeight / 2, p1InnerCol, p1OuterCol, p1CornerCol);
  p2 = new Paddle(canvas.width - paddleWidth, canvas.height / 2 - paddleHeight / 2, p2InnerCol, p2OuterCol, p2CornerCol);
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
  document.getElementById("board")?.focus();
  p1Dir = 0;
  p2Dir = 0;
  score1 = 0;
  score2 = 0;
  maxScore = 3;
  paddleWidth = canvas.width / 60;
  paddleHeight = canvas.height / 5;
  startRound();
}
function endGame() {
  if (score1 > score2)
    console.log("Player 1 wins!");
  else console.log("Player 2 wins!");
}
startGame();
