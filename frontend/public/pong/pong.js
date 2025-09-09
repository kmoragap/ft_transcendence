// src/gameData.ts
var data;
function loadPlayer(name, id, isAi, up, down, innerCol, outercol, cornerCol) {
  var p = {
    name,
    id,
    score: 0,
    isAi,
    up,
    down,
    innerCol,
    outerCol: outercol,
    cornerCol
  };
  if (isAi) p.name = "Marvin";
  return p;
}
function loadTA(id) {
  return document.getElementById(id);
}
function loadIn(id) {
  const el = document.getElementById(id);
  return el.value;
}
function loadInB(id) {
  const el = document.getElementById(id);
  return el.checked;
}
async function loadConfig() {
  await new Promise((resolve) => {
    if (document.readyState === "complete") resolve();
    else document.addEventListener("DOMContentLoaded", () => resolve());
  });
  var canvas = document.getElementById("board");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - loadTA("p1score").clientHeight;
  const ctx = canvas.getContext("2d");
  var p1 = loadPlayer(
    loadIn("name_p1"),
    "",
    //player ID
    loadInB("p1Ai"),
    loadIn("p1Up"),
    loadIn("p1Down"),
    loadIn("p1InnerCol"),
    loadIn("p1OuterCol"),
    loadIn("p1CornerCol")
  );
  var p2 = loadPlayer(
    loadIn("name_p2"),
    "",
    //player ID
    loadInB("p2Ai"),
    loadIn("p2Up"),
    loadIn("p2Down"),
    loadIn("p2InnerCol"),
    loadIn("p2OuterCol"),
    loadIn("p2CornerCol")
  );
  var p3 = loadPlayer(
    loadIn("name_p3"),
    "",
    //player ID
    loadInB("p3Ai"),
    loadIn("p3Up"),
    loadIn("p3Down"),
    loadIn("p3InnerCol"),
    loadIn("p3OuterCol"),
    loadIn("p3CornerCol")
  );
  var p4 = loadPlayer(
    loadIn("name_p4"),
    "",
    //player ID
    loadInB("p4Ai"),
    loadIn("p4Up"),
    loadIn("p4Down"),
    loadIn("p4InnerCol"),
    loadIn("p4OuterCol"),
    loadIn("p4CornerCol")
  );
  const loadData = {
    canvas,
    fps: 50,
    nameTB1: loadTA("p1name"),
    scoreTB1: loadTA("p1score"),
    scoreTB2: loadTA("p2score"),
    nameTB2: loadTA("p2name"),
    timestamp: 0,
    lastTime: 0,
    paddleWidth: canvas.width / 60,
    paddleHeight: canvas.height / 5,
    ctx,
    p1,
    p2,
    p3,
    p4,
    paddleSpeed: 40,
    ballSpeed: 10,
    ballSize: 80,
    maxScore: parseInt(loadIn("maxScore") || "10", 10),
    trailLength: parseInt(loadIn("trailLength") || "20", 10),
    bg: ctx.createLinearGradient(0, 0, canvas.width, 0),
    uiCol: loadIn("uiCol"),
    ballCol: loadIn("ballCol"),
    ballR: String(parseInt(loadIn("ballCol").slice(1, 3), 16)),
    ballG: String(parseInt(loadIn("ballCol").slice(3, 5), 16)),
    ballB: String(parseInt(loadIn("ballCol").slice(5, 7), 16)),
    serve: Math.floor(Math.random() * 2) ? -1 : 1,
    keys: {},
    showingText: false,
    gameID: "",
    go: false,
    touchControl: "ontouchstart" in window || navigator.maxTouchPoints > 0,
    mode: document.getElementById("gameMenu2").elements["mode"].value,
    multiball: loadInB("multiball"),
    maxHits: Math.floor(Math.random() * 5 + 5),
    hits: 0
  };
  loadData.scoreTB1.value = "0";
  loadData.scoreTB2.value = "0";
  if (loadData.mode == "fourPlayers") {
    loadData.nameTB1.value = p1.name + " / " + p2.name;
    loadData.nameTB2.value = p3.name + " / " + p4.name;
  } else {
    loadData.nameTB1.value = p1.name;
    loadData.nameTB2.value = p2.name;
  }
  loadData.bg = ctx.createLinearGradient(0, 0, loadData.canvas.width, 0);
  loadData.bg.addColorStop(0, loadIn("outerBg"));
  loadData.bg.addColorStop(0.5, loadIn("innerBg"));
  loadData.bg.addColorStop(1, loadIn("outerBg"));
  switch (loadIn("paddleSpeed")) {
    case "glacial":
      loadData.paddleSpeed = 80;
      break;
    case "slow":
      loadData.paddleSpeed = 60;
      break;
    case "standard":
      loadData.paddleSpeed = 40;
      break;
    case "fast":
      loadData.paddleSpeed = 35;
      break;
    case "insane":
      loadData.paddleSpeed = 30;
      break;
    default:
      loadData.paddleSpeed = 40;
      break;
  }
  switch (loadIn("ballSpeed")) {
    case "glacial":
      loadData.ballSpeed = 15;
      break;
    case "slow":
      loadData.ballSpeed = 12;
      break;
    case "standard":
      loadData.ballSpeed = 10;
      break;
    case "fast":
      loadData.ballSpeed = 8;
      break;
    case "insane":
      loadData.ballSpeed = 6;
      break;
    default:
      loadData.ballSpeed = 10;
      break;
  }
  switch (loadIn("ballSize")) {
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
  data = loadData;
}

// src/controls.ts
document.getElementById("gameMenu").addEventListener("submit", function(e) {
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
    setTimeout(() => startGame(), 1e3);
  }
});
var lastX;
function controlKeys() {
  document.addEventListener("keydown", (ev) => {
    console.log(ev.key);
    if (ev.key == "ArrowUp" || ev.key == "ArrowDown")
      ev.preventDefault();
    if (ev.key == "Shift" || ev.key == "Control") {
      if (ev.location == 1) data.keys[ev.key] = true;
    } else data.keys[ev.key] = true;
  });
  document.addEventListener("keyup", (ev) => {
    if (pad.length) {
      if (ev.key == "Shift" || ev.key == "Control") {
        if (ev.location == 1) {
          if (ev.key == data.p1.up || ev.key == data.p1.down) {
            pad[0].setDir(0);
            if (data.mode == "doublePaddle") pad[2].setDir(0);
          } else if (ev.key == data.p2.up || ev.key == data.p2.down) {
            pad[1].setDir(0);
            if (data.mode == "doublePaddle") pad[3].setDir(0);
          }
        }
        data.keys[ev.key] = false;
      } else {
        for (let i = 0; i < pad.length; i++) {
          pad[i].setDir(0);
          data.keys[ev.key] = false;
        }
      }
      if (ev.key == "Escape") {
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
function touchDown(ev) {
  lastX = data.canvas.height / 2;
  if (data.go) {
    var x = lastX = ev.touches[0].clientX;
    var y = ev.touches[0].clientY;
    if (x < data.canvas.width / 4) {
      if (y < data.canvas.height / 4) data.keys[data.p1.up] = true;
      if (y > data.canvas.height * 3 / 4) data.keys[data.p1.down] = true;
    }
    if (x > data.canvas.width * 3 / 4) {
      if (y < data.canvas.height / 4) data.keys[data.p2.up] = true;
      if (y > data.canvas.height * 3 / 4) data.keys[data.p2.down] = true;
    }
  }
}
function touchUp() {
  if (data.go) {
    if (lastX < data.canvas.width / 4) {
      data.keys[data.p1.up] = false;
      data.keys[data.p1.down] = false;
      pad[0].setDir(0);
      if (data.mode == "doublePaddle") pad[2].setDir(0);
    }
    if (lastX > data.canvas.width * 3 / 4) {
      data.keys[data.p2.up] = false;
      data.keys[data.p2.down] = false;
      pad[1].setDir(0);
      if (data.mode == "doublePaddle") pad[3].setDir(0);
    }
  }
}

// ../../frontend/src/i18n.ts
var translations = {};
var currentLang = "en";
async function loadLanguage(lang) {
  currentLang = lang;
  document.documentElement.setAttribute("lang", lang);
  try {
    const res = await fetch(`/locales/${lang}.json`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Missing locale: ${lang}`);
    translations = await res.json();
    localStorage.setItem("lang", lang);
  } catch (err) {
    if (lang !== "en") {
      const res = await fetch(`/locales/en.json`, { cache: "no-store" });
      translations = await res.json();
      currentLang = "en";
      document.documentElement.setAttribute("lang", "en");
      document.documentElement.dir = "ltr";
      localStorage.setItem("lang", "en");
    }
  }
  updateText();
}
function t(key) {
  return translations[key] ?? key;
}
function updateText() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
      el.placeholder = t(key);
    }
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    if (key) el.setAttribute("title", t(key));
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria-label");
    if (key) el.setAttribute("aria-label", t(key));
  });
}
async function initI18n() {
  const saved = localStorage.getItem("lang") || "en";
  await loadLanguage(saved);
}

// src/Paddle.draw.ts
function quarterCorner(pad2) {
  if (pad2.getX() < data.canvas.width / 2) {
    data.ctx.beginPath();
    data.ctx.fillStyle = pad2.getTCG();
    data.ctx.moveTo(pad2.getX(), pad2.getY() + data.paddleWidth);
    data.ctx.arc(pad2.getX(), pad2.getY() + data.paddleWidth, data.paddleWidth, -Math.PI / 2, 0);
    data.ctx.closePath();
    data.ctx.fill();
    data.ctx.beginPath();
    data.ctx.fillStyle = pad2.getBCG();
    data.ctx.moveTo(pad2.getX(), pad2.getY2() - data.paddleWidth);
    data.ctx.arc(pad2.getX(), pad2.getY2() - data.paddleWidth, data.paddleWidth, 0, Math.PI / 2);
    data.ctx.closePath();
    data.ctx.fill();
  } else {
    data.ctx.beginPath();
    data.ctx.fillStyle = pad2.getTCG();
    data.ctx.moveTo(pad2.getX2(), pad2.getY() + data.paddleWidth);
    data.ctx.arc(pad2.getX2(), pad2.getY() + data.paddleWidth, data.paddleWidth, Math.PI, Math.PI * 3 / 2);
    data.ctx.closePath();
    data.ctx.fill();
    data.ctx.beginPath();
    data.ctx.fillStyle = pad2.getBCG();
    data.ctx.moveTo(pad2.getX2(), pad2.getY2() - data.paddleWidth);
    data.ctx.arc(pad2.getX2(), pad2.getY2() - data.paddleWidth, data.paddleWidth, Math.PI / 2, Math.PI);
    data.ctx.closePath();
    data.ctx.fill();
  }
}
function halfCorner(pad2) {
  data.ctx.beginPath();
  data.ctx.fillStyle = pad2.getTCG();
  data.ctx.moveTo(pad2.getX() + data.paddleWidth / 2, pad2.getY() + data.paddleWidth / 2);
  data.ctx.arc(pad2.getX() + data.paddleWidth / 2, pad2.getY() + data.paddleWidth / 2, data.paddleWidth / 2, 0, Math.PI, true);
  data.ctx.closePath();
  data.ctx.fill();
  data.ctx.fillRect(pad2.getX(), pad2.getY() - 1 + data.paddleWidth / 2, data.paddleWidth, data.paddleWidth / 2 + 2);
  data.ctx.beginPath();
  data.ctx.fillStyle = pad2.getBCG();
  data.ctx.moveTo(pad2.getX() + data.paddleWidth / 2, pad2.getY2() - data.paddleWidth / 2);
  data.ctx.arc(pad2.getX() + data.paddleWidth / 2, pad2.getY2() - data.paddleWidth / 2, data.paddleWidth / 2, 0, Math.PI);
  data.ctx.closePath();
  data.ctx.fill();
  data.ctx.fillRect(pad2.getX(), pad2.getY2() - 1 - data.paddleWidth, data.paddleWidth, data.paddleWidth / 2 + 2);
}
function midline() {
  data.ctx.beginPath();
  data.ctx.lineWidth = 1;
  data.ctx.moveTo(data.canvas.width / 2, 0);
  data.ctx.lineTo(data.canvas.width / 2, data.canvas.height);
  data.ctx.strokeStyle = data.uiCol;
  data.ctx.stroke();
  data.ctx.closePath();
}
function scoreText(p, wins) {
  data.showingText = true;
  data.ctx.font = `bold ${data.canvas.height / 6}px system-ui`;
  data.ctx.fillStyle = p.getTCG();
  data.ctx.strokeStyle = p.getPG();
  data.ctx.lineWidth = data.canvas.height / 60;
  data.ctx.textAlign = "center";
  data.ctx.textBaseline = "bottom";
  data.ctx.strokeText(p.getPlr().name, data.canvas.width / 2, data.canvas.height / 2);
  data.ctx.fillText(p.getPlr().name, data.canvas.width / 2, data.canvas.height / 2);
  data.ctx.textBaseline = "top";
  var line2;
  if (wins) line2 = t("wins") + "!";
  else line2 = t("scores") + "!";
  data.ctx.strokeText(line2, data.canvas.width / 2, data.canvas.height / 2);
  data.ctx.fillText(line2, data.canvas.width / 2, data.canvas.height / 2);
  endRound();
}

// src/Paddle.ts
var Paddle = class {
  constructor(x, p) {
    this._dir = 0;
    this._goTime = 0;
    this._moveSpeed = data.canvas.height / data.paddleSpeed;
    this._aiTarget = data.canvas.height / 2;
    this._aiRecalcTime = 0;
    this._x = x;
    this._y = data.canvas.height / 2 - data.paddleHeight / 2;
    this._p = p;
    this._paddleGrad = data.ctx.createLinearGradient(this._x, this._y, this.getX2(), this._y);
    this._paddleGrad.addColorStop(0, this._p.outerCol);
    this._paddleGrad.addColorStop(0.5, this._p.innerCol);
    this._paddleGrad.addColorStop(1, this._p.outerCol);
    this.draw();
  }
  go() {
    if (this._p.isAi) {
      this._aiRecalcTime = window.setInterval(() => this.calcTarget(), 1e3);
    }
    this._goTime = 1;
  }
  stop() {
    window.clearTimeout(this._aiRecalcTime);
    this._aiRecalcTime = 0;
    this._goTime = 0;
  }
  getX() {
    return this._x;
  }
  getY() {
    return this._y;
  }
  getX2() {
    return this._x + data.paddleWidth;
  }
  getY2() {
    return this._y + data.paddleHeight;
  }
  getPG() {
    return this._paddleGrad;
  }
  getTCG() {
    return this._topCornerGrad;
  }
  getBCG() {
    return this._bottomCornerGrad;
  }
  getPlr() {
    return this._p;
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
  isAi() {
    return this._p.isAi;
  }
  isGo() {
    return this._goTime;
  }
  draw() {
    data.ctx.beginPath();
    data.ctx.fillStyle = this._paddleGrad;
    data.ctx.fillRect(this._x, this._y + data.paddleWidth, data.paddleWidth, data.paddleHeight - data.paddleWidth * 2);
    this._topCornerGrad = data.ctx.createRadialGradient(this._x + 10, this._y, data.paddleWidth / 7, this._x, this._y, data.paddleWidth);
    this._topCornerGrad.addColorStop(0, "white");
    this._topCornerGrad.addColorStop(0.75, this._p.cornerCol);
    this._bottomCornerGrad = data.ctx.createRadialGradient(this._x + 10, this.getY2(), data.paddleWidth / 7, this._x, this.getY2(), data.paddleWidth);
    this._bottomCornerGrad.addColorStop(0, "white");
    this._bottomCornerGrad.addColorStop(0.75, this._p.cornerCol);
    if (!this._p.isAi) quarterCorner(this);
    else halfCorner(this);
  }
  hitY(ball) {
    const ballCenterY = ball.getY() + ball.getSize() / 2;
    return ballCenterY > this._y && ballCenterY < this.getY2() + ball.getSize();
  }
  hitX(ball) {
    return ball.getX() + ball.getSize() > this._x && ball.getX() < this._x + data.paddleWidth + ball.getSize();
  }
  moveAI() {
    if (this._aiTarget >= this._y && this._aiTarget < this.getY2()) {
      this._dir = 0;
      data.keys[this._p.up] = false;
      data.keys[this._p.down] = false;
    } else {
      if (this._aiTarget < this._y + this._dir) {
        data.keys[this._p.up] = true;
        data.keys[this._p.down] = false;
      } else if (this._aiTarget >= this.getY2() + this._dir) {
        data.keys[this._p.down] = true;
        data.keys[this._p.up] = false;
      }
    }
    this.movePaddle();
  }
  movePaddle() {
    if (data.keys[this._p.up])
      if (this._y > 0) this._dir = -1;
      else this._dir = 0;
    if (data.keys[this._p.down])
      if (this._y <= data.canvas.height - data.paddleHeight) this._dir = 1;
      else this._dir = 0;
    this.move();
  }
  move() {
    this._y += this._dir * this._moveSpeed;
    if (this._dir) {
      for (let i = 0; i < balls.length; i++)
        if (this.hitX(balls[i]) && this.hitY(balls[i])) {
          if (balls[i].getY() < this._y + data.paddleHeight / 2)
            balls[i].setY(this._y - balls[i].getSize() * 2);
          else balls[i].setY(this.getY2() + balls[i].getSize() * 2);
          balls[i].collision(this);
          if (balls[i].getY() < balls[i].getSize()) {
            balls[i].setY(balls[i].getSize() + 1);
          }
        }
    }
    if (this._y < 0) this._y = 0;
    if (this._y > data.canvas.height - data.paddleHeight) this._y = data.canvas.height - data.paddleHeight;
  }
  isApproaching(ball) {
    const dX = ball.getX() + ball.getDirX();
    if (dX < ball.getX()) return true;
    return false;
  }
  getClosestBall() {
    let closest = 0;
    let closestSteps = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < balls.length; i++) {
      if (this.isApproaching(balls[i])) {
        let steps = 0;
        let x = balls[i].getX();
        while (x < data.canvas.width && x > 0) {
          x += balls[i].getDirX();
          steps++;
        }
        if (steps < closestSteps) {
          closest = i;
          closestSteps = steps;
        }
      }
    }
    return closest;
  }
  calcTarget() {
    if (pad.length && balls.length) {
      const t2 = this.getClosestBall();
      var x = balls[t2].getX();
      var y = balls[t2].getY();
      var dx = balls[t2].getDirX();
      var dy = balls[t2].getDirY();
      while (balls[t2].getDirX() <= 0 && this._x < data.canvas.width / 2 && x > data.paddleWidth + balls[t2].getSize() || balls[t2].getDirX() > 0 && this._x > data.canvas.width / 2 && x < data.canvas.width - balls[t2].getSize() - data.paddleWidth) {
        if (y <= balls[t2].getSize() || y > data.canvas.height - balls[t2].getSize()) dy *= -1;
        x += dx * 10;
        y += dy * 10;
      }
      if (y != balls[t2].getY()) {
        var dir = 1;
        if (Math.floor(Math.random() * 2)) dir = -1;
        var deviation = Math.random() * data.paddleHeight * 0.75 * dir;
        this._aiTarget = y + deviation;
      }
    }
  }
};

// src/Ball.ts
var Ball = class {
  constructor(...args) {
    this._go = false;
    this._ballSpeed = data.canvas.width / data.ballSpeed;
    this._x = data.canvas.width / 2;
    this._y = data.canvas.height / 2;
    this._dirY = (Math.random() * 30 - 15) / 1e3;
    this._dirX = (0.1 - this._dirY) * data.serve;
    this._size = data.canvas.width / data.ballSize;
    this._trailPoints = [];
    this._trailFade = 30 / data.trailLength;
    if (!args.length) {
      this._x = data.canvas.width / 2;
      this._y = data.canvas.height / 2;
    } else {
      this._x = args[0];
      this._y = args[1];
      this._dirX = args[2];
      this._dirY = args[3];
    }
  }
  go() {
    this._go = true;
  }
  isGo() {
    return this._go;
  }
  getX() {
    return this._x;
  }
  getY() {
    return this._y;
  }
  setX(x) {
    this._x = x;
  }
  setY(y) {
    this._y = y;
  }
  getSize() {
    return this._size;
  }
  getDirX() {
    return this._dirX;
  }
  getDirY() {
    return this._dirY;
  }
  setDirX(dir) {
    this._dirX = dir;
  }
  setDirY(dir) {
    this._dirY = dir;
  }
  stop() {
    this._go = false;
    this._dirX = 0;
    this._dirY = 0;
  }
  draw() {
    var grad = data.ctx.createRadialGradient(
      this.getX() - this.getSize() / 2,
      this.getY() - this.getSize() / 2,
      this.getSize() / 10,
      this.getX(),
      this.getY(),
      this.getSize()
    );
    grad.addColorStop(0, "white");
    grad.addColorStop(0.3, data.ballCol);
    grad.addColorStop(0.6, data.ballCol);
    grad.addColorStop(1, "black");
    data.ctx.beginPath();
    data.ctx.ellipse(this._x, this._y, this._size, this._size, 0, 0, Math.PI * 2);
    data.ctx.fillStyle = grad;
    data.ctx.fill();
    data.ctx.closePath();
  }
  drawTrail() {
    const currentPoint = {
      x: this._x,
      y: this._y
    };
    this._trailPoints.unshift(currentPoint);
    let opacity = 0;
    for (let i = this._trailPoints.length - 1; i > 0; i--) {
      data.ctx.beginPath();
      data.ctx.ellipse(
        this._trailPoints[i].x,
        this._trailPoints[i].y,
        this._size * (this._trailPoints.length - 1 - i) / (this._trailPoints.length - 1),
        this._size * (this._trailPoints.length - 1 - i) / (this._trailPoints.length - 1),
        0,
        0,
        Math.PI * 2
      );
      data.ctx.fillStyle = `rgb(${data.ballR} ${data.ballG} ${data.ballB} / ${opacity}%`;
      data.ctx.fill();
      data.ctx.closePath();
      opacity += this._trailFade;
    }
    this._trailPoints = this._trailPoints.slice(0, data.trailLength);
  }
  collision(paddle) {
    const hitPositionX = (this._y - (paddle.getY() + data.paddleHeight / 2)) / (data.paddleHeight / 2);
    const hitPositionY = (this._x - (paddle.getX() + data.paddleWidth / 2)) / (data.paddleWidth / 2);
    const clampedHitX = Math.max(-0.7, Math.min(0.7, hitPositionX));
    const clampedHitY = Math.max(-0.7, Math.min(0.7, hitPositionY));
    const xSide = paddle.getX() + data.paddleWidth / 2 > this.getX() + this._size / 2;
    const ySide = paddle.getY() + data.paddleHeight / 2 > this.getY() + this._size / 2;
    var variationAngle = 0;
    var angle = 0;
    if (paddle.hitY(this)) {
      variationAngle = clampedHitX * (xSide ? -(Math.PI / 4) : Math.PI / 4);
      angle = Math.atan2(this._dirY / 2, -this._dirX);
    } else {
      variationAngle = clampedHitY * (ySide ? Math.PI / 4 : -(Math.PI / 4));
      angle = Math.atan2(-this._dirY, this._dirX / 2);
    }
    angle += variationAngle;
    this._dirX = Math.cos(angle) / 10;
    this._dirY = Math.sin(angle) / 10;
  }
  checkWalls() {
    if (this._x <= this._size || this._x >= data.canvas.width - this._size) {
      this.stop();
      if (balls.length == 1) {
        data.go = false;
        if (this._x <= this._size) {
          data.p2.score++;
          data.scoreTB2.value = String(data.p2.score);
          if (pad.length) setTimeout(() => scoreText(pad[1], data.p2.score == data.maxScore), 100);
          data.serve = -1;
        }
        if (this._x >= data.canvas.width - this._size) {
          data.p1.score++;
          data.scoreTB1.value = String(data.p1.score);
          if (pad.length) setTimeout(() => scoreText(pad[0], data.p1.score == data.maxScore), 100);
          data.serve = 1;
        }
      }
      removeBall2(this);
    }
    if (this._y < this._size || this._y >= data.canvas.height - this._size) this._dirY *= -1;
  }
  advanceBall() {
    var stop = false;
    for (let i = 0; i < this._ballSpeed && !stop && this.isGo(); i++) {
      this._x += this._dirX;
      this._y += this._dirY;
      if (this._x < this.getSize()) stop = true;
      if (this._x >= data.canvas.width - this.getSize()) stop = true;
      for (let i2 = 0; i2 < pad.length && pad.length; i2++)
        if (pad[i2].hitX(this) && pad[i2].hitY(this)) {
          stop = true;
          this._x -= this._dirX * 2;
          this._y -= this._dirY * 2;
          this.collision(pad[i2]);
          if (data.multiball) {
            data.hits++;
            if (data.hits == data.maxHits) {
              data.hits = 0;
              data.maxHits = Math.floor(Math.random() * 5 + 5);
              spawnMultiball(this);
            }
          }
        }
    }
  }
  move() {
    if (this._go) {
      this.checkWalls();
      this.advanceBall();
    }
  }
};
function spawnMultiball(ball) {
  if (balls.length < 25) {
    let angle = Math.atan2(ball.getDirY(), ball.getDirX());
    let variation = (Math.random() * 40 - 30) / 100;
    if (Math.floor(Math.random() * 2)) variation *= -1;
    angle += variation;
    let newBall = new Ball(ball.getX(), ball.getY(), Math.cos(angle) / 10, Math.sin(angle) / 10);
    newBall.go();
    balls.push(newBall);
  }
}

// src/services/gameService.ts
var GameService = class {
  constructor() {
    this.baseUrl = "/api/pong";
  }
  async createGame(gameData) {
    console.log("Fetching to:", `${this.baseUrl}/games`);
    try {
      const response = await fetch(`${this.baseUrl}/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameData)
      });
      console.log("Response status:", response.status);
      if (!response.ok) throw new Error("Failed to create game");
      return await response.json();
    } catch (error) {
      console.error("Error creating game:", error);
      return null;
    }
  }
  async createAIGame(playerData) {
    try {
      const gameData = {
        player1Id: playerData.playerId,
        player2Id: "ai_opponent",
        player1Name: playerData.playerName,
        player2Name: "IA_OPPONENT",
        maxScore: playerData.maxScore || 5,
        gameType: "VS_AI"
      };
      return await this.createGame(gameData);
    } catch (error) {
      console.error("Error creating AI game:", error);
      return null;
    }
  }
  async updateScore(gameId, score1, score2) {
    try {
      const response = await fetch(`${this.baseUrl}/games/${gameId}/score`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score1, score2 })
      });
      return response.ok;
    } catch (error) {
      console.error("Error updating score:", error);
      return false;
    }
  }
  async finishGame(gameId, score1, score2, winnerId) {
    try {
      const response = await fetch(`${this.baseUrl}/games/${gameId}/finish`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score1, score2, winnerId })
      });
      return response.ok;
    } catch (error) {
      console.error("Error finishing game:", error);
      return false;
    }
  }
};
var gameService = new GameService();

// src/pong.ts
var pad = [];
var balls = [];
function removeBall2(ball) {
  let shrunk = [];
  for (let i = 0; i < balls.length; i++)
    if (balls[i] != ball) shrunk.push(balls[i]);
  balls = shrunk;
}
async function startGame() {
  try {
    await loadConfig();
    await initI18n();
    controlKeys();
    document.getElementById("board")?.focus();
    setTimeout(() => countdown(3, 500), 500);
  } catch (error) {
    console.error("Failed to load configuration:", error);
  }
}
function countdown(nr, ms) {
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
  data.ctx.strokeText(String(nr), data.canvas.width / 2, data.canvas.height / 2);
  data.ctx.fillText(String(nr), data.canvas.width / 2, data.canvas.height / 2);
  if (nr - 1) setTimeout(() => countdown(nr - 1, ms), ms);
  else setTimeout(() => startRound(), ms);
}
function startRound() {
  initBoard();
  pad[0].go();
  pad[1].go();
  if (data.mode == "fourPlayers" || data.mode == "doublePaddle") pad[2].go();
  if (data.mode == "fourPlayers" || data.mode == "doublePaddle") pad[3].go();
  balls[0].go();
  data.go = true;
  window.requestAnimationFrame(loop);
}
function initBoard() {
  data.showingText = false;
  data.keys = {};
  balls.push(new Ball());
  pad = new Array(new Paddle(0, data.p1));
  if (data.mode == "twoPlayers") pad.push(new Paddle(data.canvas.width - data.paddleWidth, data.p2));
  if (data.mode == "doublePaddle") {
    pad.push(new Paddle(data.canvas.width - data.paddleWidth, data.p2));
    pad.push(new Paddle(data.canvas.width * 0.25 - data.paddleWidth, data.p1));
    pad.push(new Paddle(data.canvas.width * 0.75 - data.paddleWidth, data.p2));
  }
  if (data.mode == "fourPlayers") {
    pad.push(new Paddle(data.canvas.width * 0.25 - data.paddleWidth, data.p2));
    pad.push(new Paddle(data.canvas.width * 0.75 - data.paddleWidth, data.p3));
    pad.push(new Paddle(data.canvas.width - data.paddleWidth, data.p4));
  }
}
function loop() {
  if (data.go) {
    update();
    render();
    window.requestAnimationFrame(loop);
  }
}
function update() {
  const now = performance.now();
  if (now - data.lastTime > 1e3 / data.fps) {
    data.lastTime = now;
    for (let i = 0; i < balls.length; i++) balls[i].move();
    for (let i = 0; i < pad.length; i++) {
      if (pad[i].isAi()) pad[i].moveAI();
      else pad[i].movePaddle();
    }
  }
}
function render() {
  data.ctx.fillStyle = data.bg;
  data.ctx.rect(0, 0, data.canvas.width, data.canvas.height);
  data.ctx.fill();
  midline();
  for (let i = 0; i < pad.length; i++) pad[i].draw();
  if (data.trailLength) for (let i = 0; i < balls.length; i++) balls[i].drawTrail();
  for (let i = 0; i < balls.length; i++) balls[i].draw();
  if (
    /*data.mouseControl || */
    data.touchControl
  ) {
    data.ctx.fillStyle = `rgb(80 80 80 / 25%)`;
    data.ctx.font = `bold ${data.canvas.height / 4}px system-ui`;
    for (let i = 0; i < pad.length; i++) {
      if (i == 0 && !pad[i].isAi()) {
        data.ctx.textBaseline = "top";
        data.ctx.textAlign = "left";
        data.ctx.fillText("\u2B06", data.canvas.width / 16, 0);
        data.ctx.textBaseline = "bottom";
        data.ctx.textAlign = "left";
        data.ctx.fillText("\u2B07", data.canvas.width / 16, data.canvas.height);
      }
      if (i == 1 && !pad[i].isAi()) {
        data.ctx.textBaseline = "top";
        data.ctx.textAlign = "right";
        data.ctx.fillText("\u2B06", data.canvas.width * 15 / 16, 0);
        data.ctx.textBaseline = "bottom";
        data.ctx.textAlign = "right";
        data.ctx.fillText("\u2B07", data.canvas.width * 15 / 16, data.canvas.height);
      }
    }
  }
}
function endRound() {
  while (balls.length) {
    balls[0].stop();
    balls.shift();
  }
  while (pad.length) {
    pad[0].stop();
    pad.shift();
  }
  if (data.p1.score < data.maxScore && data.p2.score < data.maxScore) setTimeout(startRound, 1500);
  else endGame();
}
async function endGame() {
  var winner;
  if (data.p1.score > data.p2.score)
    winner = data.p1.name;
  else winner = data.p2.name;
  data.showingText = false;
}
startGame();
export {
  balls,
  endGame,
  endRound,
  pad,
  removeBall2 as removeBall,
  startGame,
  startRound
};
