// ../workspace/backend/pong/src/services/userService.ts
var UserService = class {
  constructor() {
    this.baseUrl = "http://localhost:3003/api";
  }
  async getUserById(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`);
      if (!response.ok) throw new Error("User not found");
      return await response.json();
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }
  async getUsersByIds(userIds) {
    try {
      const response = await fetch(`${this.baseUrl}/users/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds })
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      return await response.json();
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }
  async getUserStats(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/stats`);
      if (!response.ok) throw new Error("Stats not found");
      return await response.json();
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return null;
    }
  }
  async updateUserStats(userId, gameData) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/stats`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameData)
      });
      return response.ok;
    } catch (error) {
      console.error("Error updating user stats:", error);
      return false;
    }
  }
};
var userService = new UserService();

// ../workspace/backend/pong/src/gameData.ts
var data;
function loadPlayer(scoreTB, nameTB, name, id, isAi, up, down, innerCol, outercol, cornerCol) {
  var p = {
    scoreTB,
    nameTB,
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
  p.nameTB.value = p.name;
  p.scoreTB.value = "0";
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
  const users = ["test", "test2"];
  const ud = await userService.getUsersByIds(users);
  var canvas = document.getElementById("board");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - loadTA("p1score").clientHeight;
  const ctx = canvas.getContext("2d");
  const loadData = {
    canvas,
    paddleWidth: canvas.width / 60,
    paddleHeight: canvas.height / 5,
    ctx,
    p1: loadPlayer(
      loadTA("p1score"),
      loadTA("p1name"),
      loadIn("name_p1"),
      "",
      //player ID
      loadInB("p1Ai"),
      loadIn("p1Up"),
      loadIn("p1Down"),
      loadIn("p1InnerCol"),
      loadIn("p1OuterCol"),
      loadIn("p1CornerCol")
    ),
    p2: loadPlayer(
      loadTA("p2score"),
      loadTA("p2name"),
      loadIn("name_p2"),
      "",
      //player ID
      loadInB("p2Ai"),
      loadIn("p2Up"),
      loadIn("p2Down"),
      loadIn("p2InnerCol"),
      loadIn("p2OuterCol"),
      loadIn("p2CornerCol")
    ),
    paddleSpeed: 40,
    ballSpeed: 10,
    ballSize: 80,
    showAiPath: loadInB("showAiPath"),
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
    gameID: ""
  };
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

// ../workspace/backend/pong/src/controls.ts
function controlKeys() {
  document.addEventListener("keydown", (ev) => {
    if (ev.key == "ArrowUp" || ev.key == "ArrowDown")
      ev.preventDefault();
    if (ev.key == "Shift" || ev.key == "Control") {
      if (ev.location == 1) data.keys[ev.key] = true;
    } else data.keys[ev.key] = true;
  });
  document.addEventListener("keyup", (ev) => {
    if (ev.key == "Shift" || ev.key == "Control") {
      if (ev.location == 1) {
        if (ev.key == data.p1.up || ev.key == data.p1.down) pad[0].setDir(0);
        else if (ev.key == data.p2.up || ev.key == data.p2.down) pad[1].setDir(0);
      }
      data.keys[ev.key] = false;
    } else {
      if (ev.key == data.p1.up || ev.key == data.p1.down) {
        pad[0].setDir(0);
        data.keys[ev.key] = false;
      }
      if (ev.key == data.p2.up || ev.key == data.p2.down) {
        pad[1].setDir(0);
        data.keys[ev.key] = false;
      }
    }
    if (ev.key == "Escape") {
      data.keys[ev.key] = false;
      ball.stop();
      for (let i = 0; i < pad.length; i++) {
        pad[0].stop();
        pad.shift();
      }
    }
  });
}

// ../workspace/frontend/src/i18n.ts
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

// ../workspace/backend/pong/src/Paddle.draw.ts
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
  data.ctx.moveTo(pad2.getX() + data.paddleWidth / 2, pad2.getY() + data.paddleWidth);
  data.ctx.arc(pad2.getX() + data.paddleWidth / 2, pad2.getY() + data.paddleWidth, data.paddleWidth / 2, 0, Math.PI, true);
  data.ctx.closePath();
  data.ctx.fill();
  data.ctx.beginPath();
  data.ctx.fillStyle = pad2.getBCG();
  data.ctx.moveTo(pad2.getX() + data.paddleWidth / 2, pad2.getY2() - data.paddleWidth);
  data.ctx.arc(pad2.getX() + data.paddleWidth / 2, pad2.getY2() - data.paddleWidth, data.paddleWidth / 2, 0, Math.PI);
  data.ctx.closePath();
  data.ctx.fill();
}
function erase(pad2) {
  data.ctx.beginPath();
  data.ctx.fillStyle = data.bg;
  data.ctx.rect(pad2.getX() - 1, pad2.getY() - 1, data.paddleWidth + 2, data.paddleHeight + 2);
  data.ctx.fill();
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
function pxl(x, y) {
  data.ctx.beginPath();
  data.ctx.rect(x, y, 1, 1);
  data.ctx.stroke();
}

// ../workspace/backend/pong/src/Paddle.ts
var Paddle = class {
  constructor(x, p) {
    this._dir = 0;
    this._goTime = 0;
    this._moveSpeed = data.canvas.height / data.paddleSpeed;
    this._aiTarget = data.canvas.height / 2;
    this._aiGoTime = 0;
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
      this._aiGoTime = window.setInterval(() => this.moveAI(), 20);
    }
    this._goTime = window.setInterval(() => this.movePaddle(), 20);
  }
  stop() {
    window.clearTimeout(this._aiRecalcTime);
    window.clearTimeout(this._aiGoTime);
    window.clearTimeout(this._goTime);
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
  move() {
    erase(this);
    this._y += this._dir * this._moveSpeed;
    if (this._y < 0) this._y = 0;
    if (this._y > data.canvas.height - data.paddleHeight) this._y = data.canvas.height - data.paddleHeight;
    this.draw();
  }
  hitY(ball2) {
    if (ball2.getY() >= this._y - data.canvas.width / data.ballSize && ball2.getY() <= this.getY2() + data.canvas.width / data.ballSize) return true;
    else return false;
  }
  hitX(ball2) {
    if (!this._x) {
      if (ball2.getX() < data.paddleWidth + ball2.getSize()) return true;
    } else if (ball2.getX() >= data.canvas.width - data.paddleWidth - ball2.getSize() && ball2.getX() < data.canvas.width - ball2.getSize()) return true;
    return false;
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
  }
  calcTarget() {
    var x = ball.getX();
    var y = ball.getY();
    var dx = ball.getDirX();
    var dy = ball.getDirY();
    var draw = 0;
    while (ball.getDirX() <= 0 && this._x < data.canvas.width / 2 && x > data.paddleWidth + ball.getSize() || ball.getDirX() > 0 && this._x > data.canvas.width / 2 && x < data.canvas.width - ball.getSize() - data.paddleWidth) {
      if (y < ball.getSize() || y > data.canvas.height - ball.getSize()) dy *= -1;
      x += dx * 10;
      y += dy * 10;
      draw++;
      if (data.showAiPath) {
        if (draw == 5) {
          draw = 0;
          pxl(x, y);
        }
      }
    }
    if (y != ball.getY()) {
      var dir = 1;
      if (Math.floor(Math.random() * 2)) dir = -1;
      var deviation = Math.random() * data.paddleHeight * 0.75 * dir;
      this._aiTarget = y + deviation;
    }
  }
};

// ../workspace/backend/pong/src/Ball.ts
var Ball = class {
  constructor() {
    this._go = false;
    this._goTime = 0;
    this._ballSpeed = data.canvas.width / data.ballSpeed;
    this._x = data.canvas.width / 2;
    this._y = data.canvas.height / 2;
    this._dirY = (Math.random() * 30 - 15) / 1e3;
    this._dirX = (0.1 - this._dirY) * data.serve;
    this._size = data.canvas.width / data.ballSize;
    this._trailPoints = [];
    this._trailFade = 30 / data.trailLength;
    this._x = data.canvas.width / 2;
    this._y = data.canvas.height / 2;
  }
  go() {
    this._goTime = window.setInterval(() => this.move(), 20);
    this._go = true;
  }
  stop() {
    window.clearTimeout(this._goTime);
    this._go = false;
    this._dirX = 0;
    this._dirY = 0;
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
  erase(x, y) {
    data.ctx.beginPath();
    data.ctx.ellipse(x, y, this._size + 1, this._size + 1, 0, 0, Math.PI * 2);
    data.ctx.fillStyle = data.bg;
    data.ctx.fill();
  }
  draw(ball2) {
    this.drawTrail();
    var grad = data.ctx.createRadialGradient(ball2.getX() - ball2.getSize() / 2, ball2.getY() - ball2.getSize() / 2, ball2.getSize() / 10, ball2.getX(), ball2.getY(), ball2.getSize());
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
      opacity += this._trailFade;
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
    const hitPosition = (this._y - (paddle.getY() + data.paddleHeight / 2)) / (data.paddleHeight / 2);
    const clampedHit = Math.max(-0.7, Math.min(0.7, hitPosition));
    const isRightPaddle = paddle.getX() > data.canvas.width / 2;
    var variationAngle = clampedHit * (isRightPaddle ? -(Math.PI / 4) : Math.PI / 4);
    var angle = Math.atan2(this._dirY / 2, -this._dirX);
    angle += variationAngle;
    this._dirX = Math.cos(angle) / 10;
    this._dirY = Math.sin(angle) / 10;
  }
  checkPaddle() {
    for (let i = 0; i < pad.length; i++)
      if (ball.isGo() && pad[i].hitX(ball) && pad[i].hitY(ball))
        this.collision(pad[i]);
  }
  checkWalls() {
    if (this._x <= this._size || this._x >= data.canvas.width - this._size) {
      ball.stop();
      if (this._x <= this._size) {
        data.p2.score++;
        data.p2.scoreTB.value = String(data.p2.score);
        if (pad.length) setTimeout(() => scoreText(pad[1], data.p2.score == data.maxScore), 100);
        data.serve = -1;
      }
      if (this._x >= data.canvas.width - this._size) {
        data.p1.score++;
        data.p1.scoreTB.value = String(data.p1.score);
        if (pad.length) setTimeout(() => scoreText(pad[0], data.p1.score == data.maxScore), 100);
        data.serve = 1;
      }
    }
    if (this._y < this._size || this._y >= data.canvas.height - this._size) this._dirY *= -1;
  }
  advanceBall() {
    var stop = false;
    for (let i = 0; i < this._ballSpeed && !stop; i++) {
      this._x += this._dirX;
      this._y += this._dirY;
      if (this._x < ball.getSize()) stop = true;
      if (this._x >= data.canvas.width - ball.getSize()) stop = true;
      if (this._dirX < 0 && pad[0].hitX(ball) && pad[0].hitY(ball)) stop = true;
      if (this._dirX >= 0 && pad[1].hitX(ball) && pad[1].hitY(ball)) stop = true;
    }
  }
  move() {
    if (this._go) {
      this.checkPaddle();
      this.checkWalls();
      this.advanceBall();
      this.draw(ball);
    }
  }
};

// ../workspace/backend/pong/src/services/gameService.ts
var GameService = class {
  constructor() {
    this.baseUrl = "http://localhost:3002/api/pong";
  }
  async createGame(gameData) {
    try {
      const response = await fetch(`${this.baseUrl}/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameData)
      });
      if (!response.ok) throw new Error("Failed to create game");
      return await response.json();
    } catch (error) {
      console.error("Error creating game:", error);
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

// ../workspace/backend/pong/src/pong.ts
var pad = [];
var ball;
document.getElementById("gameMenu").addEventListener("submit", function(e) {
  e.preventDefault();
  if (!data.showingText) {
    if (ball) ball.stop();
    for (let i = 0; i < pad.length; i++) {
      pad[0].stop();
      pad.shift();
    }
    setTimeout(() => startGame(), 1e3);
  }
});
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
function initBoard() {
  data.showingText = false;
  data.ctx.fillStyle = data.bg;
  data.ctx.rect(0, 0, data.canvas.width, data.canvas.height);
  data.ctx.fill();
  ball = new Ball();
  pad = new Array(new Paddle(0, data.p1), new Paddle(data.canvas.width - data.paddleWidth, data.p2));
}
function startRound() {
  initBoard();
  pad[0].go();
  pad[1].go();
  setTimeout(() => ball.go(), 250);
}
function endRound() {
  ball.stop();
  for (let i = 0; i < pad.length; i++) {
    pad[i].stop();
    pad.unshift();
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
async function testCreateGame() {
  const gameData = {
    player1Id: "player1-id",
    player2Id: "player2-id",
    player1Name: "Player One",
    player2Name: "Player Two",
    maxScore: 5,
    gameType: "VS_HUMAN"
  };
  const result = await gameService.createGame(gameData);
  console.log("Result test:", result);
}
testCreateGame();
startGame();
export {
  ball,
  endGame,
  endRound,
  pad,
  startGame,
  startRound
};
