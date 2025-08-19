"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var p1;
var p2;
var ball;
var data;
function loadConfig() {
    return __awaiter(this, void 0, void 0, function () {
        var config, canvas, ctx, loadData, innerBg, outerBg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve) {
                        if (document.readyState === 'complete')
                            resolve();
                        else
                            document.addEventListener('DOMContentLoaded', function () { return resolve(); });
                    })];
                case 1:
                    _a.sent();
                    config = document.getElementById("config");
                    if (!config)
                        throw new Error("Config element not found");
                    canvas = document.getElementById("board");
                    ctx = canvas.getContext("2d");
                    loadData = {
                        canvas: canvas,
                        ctx: ctx,
                        scoreP1TB: document.getElementById("p1score"),
                        scoreP2TB: document.getElementById("p2score"),
                        singlePlayer: false,
                        maxScore: parseInt(config.getAttribute("maxScore") || "10", 10),
                        serve: 1,
                        keys: {},
                        bg: ctx.createLinearGradient(0, 0, canvas.width, 0),
                        uiCol: config.getAttribute("uiCol") || "",
                        ballCol: config.getAttribute("ballCol") || "",
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
                        ballY: 0,
                        p1Dir: 0,
                        p2Dir: 0,
                        score1: 0,
                        score2: 0,
                    };
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight - loadData.scoreP1TB.offsetHeight * 2;
                    loadData.paddleWidth = canvas.width / 60;
                    loadData.paddleHeight = canvas.height / 5;
                    loadData.bg = ctx.createLinearGradient(0, 0, canvas.width, 0);
                    innerBg = config.getAttribute("innerBg") || "";
                    outerBg = config.getAttribute("outerBg") || "";
                    loadData.bg.addColorStop(0, outerBg);
                    loadData.bg.addColorStop(0.5, innerBg);
                    loadData.bg.addColorStop(1, outerBg);
                    if (config.getAttribute("singlePlayer") == "true")
                        loadData.singlePlayer = true;
                    if (Math.floor(Math.random() * 2))
                        loadData.serve = -1;
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
                            loadData.paddleSpeed = 5000;
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
                    return [2 /*return*/];
            }
        });
    });
}
function startGame() {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, loadConfig()];
                case 1:
                    _b.sent();
                    (_a = document.getElementById("board")) === null || _a === void 0 ? void 0 : _a.focus();
                    startRound();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _b.sent();
                    console.error('Failed to load configuration:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
var Paddle = /** @class */ (function () {
    function Paddle(posX, posY, innerColor, outerColor, cornerColor) {
        this._goTime = 0;
        this._moveSpeed = data.canvas.height / data.paddleSpeed;
        this._posX = posX;
        this._posY = posY;
        this._innerColor = innerColor;
        this._outerColor = outerColor;
        this._cornerColor = cornerColor;
    }
    Paddle.prototype.go = function (go) { this._goTime = go; };
    Paddle.prototype.stop = function () { clearTimeout(this._goTime); };
    Paddle.prototype.getPosY = function () { return this._posY; };
    Paddle.prototype.getPosX = function () { return this._posX; };
    Paddle.prototype.getMoveSpeed = function () { return this._moveSpeed; };
    Paddle.prototype.draw = function () {
        //draw paddle center
        data.ctx.beginPath();
        data.ctx.fillStyle = this._paddleGrad;
        data.ctx.fillRect(this._posX, this._posY + data.paddleWidth, data.paddleWidth, data.paddleHeight - data.paddleWidth * 2);
        this._paddleGrad = data.ctx.createLinearGradient(this._posX, this._posY, this._posX + data.paddleWidth, this._posY);
        this._paddleGrad.addColorStop(0, this._outerColor);
        this._paddleGrad.addColorStop(0.5, this._innerColor);
        this._paddleGrad.addColorStop(1, this._outerColor);
        //define corner grad
        this._topCornerGrad = data.ctx.createRadialGradient(this._posX + 10, this._posY, data.paddleWidth / 7, this._posX, this._posY, data.paddleWidth);
        this._topCornerGrad.addColorStop(0, "white");
        this._topCornerGrad.addColorStop(0.75, this._cornerColor);
        this._bottomCornerGrad = data.ctx.createRadialGradient(this._posX + 10, this._posY + data.paddleHeight, data.paddleWidth / 7, this._posX, this._posY + data.paddleHeight, data.paddleWidth);
        this._bottomCornerGrad.addColorStop(0, "white");
        this._bottomCornerGrad.addColorStop(0.75, this._cornerColor);
        //left paddle corner
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
        //right paddlecorner
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
    };
    Paddle.prototype.erase = function () {
        data.ctx.beginPath();
        data.ctx.fillStyle = data.bg;
        data.ctx.rect(this._posX - 1, this._posY - 1, data.paddleWidth + 2, data.paddleHeight + 2);
        data.ctx.fill();
    };
    Paddle.prototype.move = function (dir) {
        this.erase();
        this._posY += dir;
        if (this._posY < 0)
            this._posY = 0;
        if (this._posY > data.canvas.height - data.paddleHeight)
            this._posY = data.canvas.height - data.paddleHeight;
        this.draw();
    };
    Paddle.prototype.hit = function () {
        if (data.ballY >= this._posY - data.canvas.width / data.ballSize && data.ballY <= this._posY + data.paddleHeight + data.canvas.width / data.ballSize)
            return true;
        else
            return false;
    };
    return Paddle;
}());
var Ball = /** @class */ (function () {
    function Ball() {
        this._goTime = 0;
        this._ballSpeed = data.canvas.width / data.ballSpeed;
        this._x = data.canvas.width / 2;
        this._dirX = 0;
        this._dirY = 0;
        this._size = data.canvas.width / data.ballSize;
        this._x = data.canvas.width / 2;
        data.ballY = data.canvas.height / 2;
    }
    Ball.prototype.go = function (go) { this._goTime = go; };
    Ball.prototype.stop = function () { clearTimeout(this._goTime); };
    Ball.prototype.getDirX = function () { return this._dirX; };
    Ball.prototype.setDirX = function (dir) { this._dirX = dir; };
    Ball.prototype.setDirY = function (dir) { this._dirY = dir; };
    Ball.prototype.erase = function () {
        data.ctx.beginPath();
        data.ctx.ellipse(this._x, data.ballY, this._size + 1, this._size + 1, 0, 0, Math.PI * 2);
        data.ctx.fillStyle = data.bg;
        data.ctx.fill();
    };
    Ball.prototype.draw = function () {
        data.ctx.beginPath();
        this._grad = data.ctx.createRadialGradient(this._x - this._size / 2, data.ballY - this._size / 2, this._size / 10, this._x, data.ballY, this._size);
        this._grad.addColorStop(0, "white");
        this._grad.addColorStop(0.3, data.ballCol);
        this._grad.addColorStop(0.6, data.ballCol);
        this._grad.addColorStop(1, "black");
        data.ctx.ellipse(this._x, data.ballY, this._size, this._size, 0, 0, Math.PI * 2);
        data.ctx.fillStyle = this._grad;
        data.ctx.fill();
    };
    Ball.prototype.midline = function () {
        if (this._x > (data.canvas.width / 2 - this._size * 2) && this._x < (data.canvas.width / 2 + this._size * 2)) {
            data.ctx.beginPath();
            data.ctx.moveTo(data.canvas.width / 2, 0);
            data.ctx.lineTo(data.canvas.width / 2, data.canvas.height);
            data.ctx.strokeStyle = data.uiCol;
            data.ctx.stroke();
            data.ctx.beginPath();
        }
    };
    Ball.prototype.collision = function (paddle) {
        var angle = Math.abs(Math.atan2(this._dirY, this._dirX) - Math.PI);
        var hitPosition = (data.ballY - (paddle.getPosY() + data.paddleHeight / 2)) / (data.paddleHeight / 2);
        var clampedHit = Math.max(-0.7, Math.min(0.7, hitPosition));
        var isRightPaddle = paddle.getPosX() > (data.canvas.width / 2);
        var baseAngle = isRightPaddle ? Math.PI : 0;
        var variationAngle = clampedHit * (isRightPaddle ? -(Math.PI / 4) : Math.PI / 4) + baseAngle;
        if (isRightPaddle) {
            this._x = data.canvas.width - this._size - data.paddleWidth - 1;
            angle += variationAngle - Math.PI;
        }
        else {
            this._x = this._size + data.paddleWidth + 1;
            angle += variationAngle;
        }
        this._dirX = (Math.cos(angle)) / 100;
        this._dirY = (Math.sin(angle)) / 100;
    };
    Ball.prototype.checkPaddle = function () {
        if (this._x > 0 && this._x < data.paddleWidth + this._size && p1.hit())
            this.collision(p1);
        if (this._x >= data.canvas.width - this._size - data.paddleWidth && this._x < data.canvas.width - this._size && p2.hit())
            this.collision(p2);
    };
    Ball.prototype.checkWalls = function () {
        if (this._x <= this._size || this._x >= data.canvas.width - this._size) {
            ball.stop();
            p1.stop();
            p2.stop();
            if (this._x <= this._size) {
                data.score2++;
                data.scoreP2TB.value = String(data.score2);
                console.log("Player 2 scores!");
                data.serve = -1;
            }
            if (this._x >= data.canvas.width - this._size) {
                data.score1++;
                data.scoreP1TB.value = String(data.score1);
                console.log("Player 1 scores!");
                data.serve = 1;
            }
            if (data.score1 < data.maxScore && data.score2 < data.maxScore)
                setTimeout(startRound, 1000);
            else
                endGame();
        }
        if (data.ballY <= this._size || data.ballY >= data.canvas.height - this._size)
            this._dirY *= -1;
    };
    Ball.prototype.advanceBall = function () {
        for (var i = 0; i < this._ballSpeed; i++) {
            this._x += this._dirX;
            data.ballY += this._dirY;
        }
    };
    Ball.prototype.move = function () {
        this.erase();
        this.midline();
        this.checkPaddle();
        this.checkWalls();
        this.advanceBall();
        this.draw();
    };
    return Ball;
}());
function moveP1() {
    if (data.keys[data.p1Up])
        if (p1.getPosY() > 0)
            data.p1Dir -= p1.getMoveSpeed();
        else
            data.p1Dir = 0;
    if (data.keys[data.p1Down])
        if (p1.getPosY() <= data.canvas.height - data.paddleHeight)
            data.p1Dir += p1.getMoveSpeed();
        else
            data.p1Dir = 0;
    p1.move(data.p1Dir);
}
function moveP2() {
    if (data.keys[data.p2Up])
        if (p2.getPosY() > 0)
            data.p2Dir -= p2.getMoveSpeed();
        else
            data.p2Dir = 0;
    if (data.keys[data.p2Down])
        if (p2.getPosY() <= data.canvas.height - data.paddleHeight)
            data.p2Dir += p2.getMoveSpeed();
        else
            data.p2Dir = 0;
    p2.move(data.p2Dir);
}
function moveAI(ball) {
    if (!p2.hit() && ball.getDirX() > 0) {
        if (p2.getPosY() <= data.ballY && p2.getPosY() > 0)
            data.p2Dir += p2.getMoveSpeed();
        else if (p2.getPosY() + data.paddleHeight > data.ballY && p2.getPosY() <= data.canvas.height - data.paddleHeight)
            data.p2Dir -= p2.getMoveSpeed();
    }
    else
        data.p2Dir = 0;
    p2.move(data.p2Dir);
}
document.addEventListener("keydown", function (ev) {
    if (ev.key == "Shift" || ev.key == "Control") {
        if (ev.location == 1)
            data.keys[ev.key] = true;
    }
    else
        data.keys[ev.key] = true;
});
document.addEventListener("keyup", function (ev) {
    if (ev.key == "Shift" || ev.key == "Control") {
        if (ev.location == 1) {
            if (ev.key == data.p1Up || ev.key == data.p1Down)
                data.p1Dir = 0;
            else if (ev.key == data.p2Up || ev.key == data.p2Down)
                data.p2Dir = 0;
        }
        data.keys[ev.key] = false;
    }
    else {
        if (ev.key == data.p1Up || ev.key == data.p1Down) {
            data.p1Dir = 0;
            data.keys[ev.key] = false;
        }
        if (ev.key == data.p2Up || ev.key == data.p2Down) {
            data.p2Dir = 0;
            data.keys[ev.key] = false;
        }
    }
    if (ev.key == "Escape") { //debug
        data.keys[ev.key] = false;
        ball.stop();
        p1.stop();
        p2.stop();
    }
});
function startRound() {
    data.ctx.fillStyle = data.bg;
    data.ctx.rect(0, 0, data.canvas.width, data.canvas.height);
    data.ctx.fill();
    data.scoreP1TB.value = String(data.score1);
    data.scoreP2TB.value = String(data.score2);
    ball = new Ball();
    p1 = new Paddle(0, data.canvas.height / 2 - data.paddleHeight / 2, data.p1InnerCol, data.p1OuterCol, data.p1CornerCol);
    p2 = new Paddle(data.canvas.width - data.paddleWidth, data.canvas.height / 2 - data.paddleHeight / 2, data.p2InnerCol, data.p2OuterCol, data.p2CornerCol);
    p1.move(0);
    p2.move(0);
    data.ballY = data.canvas.height / 2;
    ball.setDirX(0.01 * data.serve);
    p1.go(window.setInterval(function () { return moveP1(); }, 20));
    if (data.singlePlayer)
        p2.go(window.setInterval(function () { return moveAI(ball); }, 20));
    else
        p2.go(window.setInterval(function () { return moveP2(); }, 20));
    ball.go(window.setInterval(function () { return ball.move(); }, 5));
}
function endGame() {
    if (data.score1 > data.score2)
        console.log("Player 1 wins!");
    else
        console.log("Player 2 wins!");
}
startGame();
