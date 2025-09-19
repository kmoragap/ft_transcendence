// src/controls.ts
var lastX;
function controlKeys() {
  document.addEventListener("keydown", (ev) => {
    ev.preventDefault();
    if (ev.key == "Shift" || ev.key == "Control") {
      if (ev.location == 1) data.keys[ev.key] = true;
    } else data.keys[ev.key] = true;
  });
  document.addEventListener("keyup", (ev) => {
    if (pad.length) {
      if (ev.key == "Shift" || ev.key == "Control") {
        if (ev.location == 1) {
          if (ev.key == data.p[0].up || ev.key == data.p[0].down) {
            pad[0].setDir(0);
            if (data.mode == "doublePaddle") pad[2].setDir(0);
          } else if (ev.key == data.p[1].up || ev.key == data.p[1].down) {
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
    ev.preventDefault();
    var x = lastX = ev.touches[0].clientX;
    var y = ev.touches[0].clientY;
    if (x < data.canvas.width / 4) {
      if (y < data.canvas.height / 4) data.keys[data.p[0].up] = true;
      if (y > data.canvas.height * 3 / 4) data.keys[data.p[0].down] = true;
    }
    if (data.mode != "fourPlayers") {
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
    if (data.mode != "fourPlayers") {
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

// src/i18n.ts
var translations = {};
var currentLanguage = "en";
function t(key) {
  return translations[key] || key;
}
async function initI18n(lang = "en") {
  currentLanguage = lang;
  try {
    const response = await fetch(`/pong/locales/${lang}.json`);
    if (response.ok) {
      translations = await response.json();
    } else {
      if (lang !== "en") {
        const fallbackResponse = await fetch("/pong/locales/en.json");
        if (fallbackResponse.ok) {
          translations = await fallbackResponse.json();
        }
      }
    }
  } catch (error) {
    translations = {
      "scores": "Scores",
      "wins": "Wins",
      "player_1": "Player 1",
      "player_2": "Player 2",
      "game_over": "Game Over",
      "restart": "Restart",
      "pause": "Pause",
      "resume": "Resume"
    };
  }
  updateHTMLTranslations();
}
function updateHTMLTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key && translations[key]) {
      el.textContent = translations[key];
    }
  });
}

// src/menus.ts
window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin) {
    return;
  }
  if (event.data.type === "LOGIN_SUCCESS") {
    const { playerId, playerName, username } = event.data;
    const nameInput = document.getElementById(playerName);
    if (nameInput) {
      nameInput.value = username;
    }
    console.log(`Player ${playerId} logged in as: ${username}`);
  } else if (event.data.type === "LOGIN_CANCELLED") {
    const { playerId } = event.data;
    const aiCheckbox = document.getElementById(`p${playerId}Ai`);
    if (aiCheckbox) {
      aiCheckbox.checked = true;
    }
    console.log(`Login cancelled for player ${playerId}, reverting to AI`);
  }
});
function playerSetupMenu(list, p, name, isAi, up, down, c1, c2, c3) {
  const form = Object.assign(document.createElement("form"), { id: `player${p}Menu`, className: `editBox` });
  const e1 = Object.assign(document.createElement("label"), { className: "game-text", for: `name_p${p}`, textContent: `${t("player")} ${p}: ` });
  const e2 = Object.assign(document.createElement("input"), { className: "custom-input ml-1 px-1 py-1", size: "16", id: `name_p${p}`, name: `name_p${p}`, value: name });
  const e3 = Object.assign(document.createElement("label"), { className: "game-text", for: `p${p}Ai`, textContent: `${t("ai")} ` });
  const e4 = Object.assign(document.createElement("input"), { type: "checkbox", id: `p${p}Ai`, name: `p${p}Ai`, checked: isAi, className: "ml-1" });
  if (p === "2") {
    e4.addEventListener("change", (event) => {
      const target = event.target;
      if (!target.checked) {
        window.parent.postMessage({
          type: "REQUEST_LOGIN",
          playerId: "2",
          playerName: `name_p${p}`
        }, window.location.origin);
      }
    });
  }
  const e5 = Object.assign(document.createElement("label"), { className: "game-text", for: `p${p}Up`, textContent: `${t("up")}: ` });
  const e6 = Object.assign(document.createElement("input"), { className: "custom-input px-1 py-1 ml-1", type: "text", size: "9", id: `p${p}Up`, value: up });
  const e7 = Object.assign(document.createElement("label"), { className: "game-text", for: `p${p}Down`, textContent: `${t("down")}: ` });
  const e8 = Object.assign(document.createElement("input"), { className: "custom-input px-1 py-1 ml-1", type: "text", size: "9", id: `p${p}Down`, value: down });
  const e9 = Object.assign(document.createElement("input"), { className: "game-text", type: "color", id: `p${p}InnerCol`, name: `p${p}InnerCol`, value: c1 });
  const e10 = Object.assign(document.createElement("label"), { className: "game-text", for: ` p${p}InnerCol`, textContent: `${t("innerColor")}` });
  const e11 = Object.assign(document.createElement("input"), { className: "game-text", type: "color", id: `p${p}OuterCol`, name: `p${p}OuterCol`, value: c2 });
  const e12 = Object.assign(document.createElement("label"), { className: "game-text", for: ` p${p}OuterCol`, textContent: `${t("outerColor")}` });
  const e13 = Object.assign(document.createElement("input"), { className: "game-text", type: "color", id: `p${p}CornerCol`, name: `p${p}CornerCol`, value: c3 });
  const e14 = Object.assign(document.createElement("label"), { className: "game-text", for: ` p${p}CornerCol`, textContent: `${t("cornerColor")}` });
  const nameRow = Object.assign(document.createElement("div"), { className: "flex w-full justify-between items-center mb-2" });
  const keysRow = Object.assign(document.createElement("div"), { className: "flex w-full justify-between items-center mb-2" });
  const innerColRow = Object.assign(document.createElement("div"), { className: "flex w-full justify-between items-center mb-2" });
  const outerColRow = Object.assign(document.createElement("div"), { className: "flex w-full justify-between items-center mb-2" });
  const cornerColRow = Object.assign(document.createElement("div"), { className: "flex w-full justify-between items-center mb-2" });
  nameRow.appendChild(e1);
  nameRow.appendChild(e2);
  nameRow.appendChild(e3);
  nameRow.appendChild(e4);
  keysRow.appendChild(e5);
  keysRow.appendChild(e6);
  keysRow.appendChild(e7);
  keysRow.appendChild(e8);
  innerColRow.appendChild(e10);
  innerColRow.appendChild(e9);
  outerColRow.appendChild(e12);
  outerColRow.appendChild(e11);
  cornerColRow.appendChild(e14);
  cornerColRow.appendChild(e13);
  form.appendChild(nameRow);
  form.appendChild(keysRow);
  form.appendChild(innerColRow);
  form.appendChild(outerColRow);
  form.appendChild(cornerColRow);
  const ul = document.createElement("li");
  ul.appendChild(form);
  list.appendChild(ul);
}
function gameSetupMenu(fourPlayers) {
  const settings = Object.assign(document.createElement("form"), { id: "settings", className: "editBox flex-1 flex flex-col h-full" });
  const bgColors = Object.assign(document.createElement("form"), { id: "bgColors", className: "editBox flex-1 flex flex-col h-full" });
  const e3 = Object.assign(document.createElement("label"), { className: "game-text", htmlFor: "paddleSpeed", textContent: `${t("paddleSpeed")}` });
  const e1 = Object.assign(document.createElement("select"), { name: "paddleSpeed", id: "paddleSpeed", className: "custom-select px-1 py-1" });
  const e2 = [
    { value: "glacial", text: `${t("glacial")}` },
    { value: "slow", text: `${t("slow")}` },
    { value: "standard", text: `${t("standard")}`, selected: true },
    { value: "fast", text: `${t("fast")}` },
    { value: "insane", text: `${t("insane")}` }
  ];
  e2.forEach((option) => {
    const opt = Object.assign(document.createElement("option"), { value: option.value, textContent: option.text });
    if (option.selected) opt.selected = true;
    e1.appendChild(opt);
  });
  const e6 = Object.assign(document.createElement("label"), { className: "game-text", htmlFor: "ballSpeed", textContent: `${t("ballSpeed")}` });
  const e4 = Object.assign(document.createElement("select"), { name: "ballSpeed", id: "ballSpeed", className: "custom-select px-1 py-1" });
  const e5 = [
    { value: "glacial", text: `${t("glacial")}` },
    { value: "slow", text: `${t("slow")}` },
    { value: "standard", text: `${t("standard")}`, selected: true },
    { value: "fast", text: `${t("fast")}` },
    { value: "insane", text: `${t("insane")}` }
  ];
  e5.forEach((option) => {
    const opt = Object.assign(document.createElement("option"), {
      value: option.value,
      textContent: option.text
    });
    if (option.selected) opt.selected = true;
    e4.appendChild(opt);
  });
  const e9 = Object.assign(document.createElement("label"), { className: "game-text", htmlFor: "ballSize", textContent: `${t("ballSize")}` });
  const e7 = Object.assign(document.createElement("select"), { name: "ballSize", id: "ballSize", className: "custom-select px-1 py-1", style: { width: "20px" } });
  const e8 = [
    { value: "tiny", text: `${t("tiny")}` },
    { value: "small", text: `${t("small")}` },
    { value: "normal", text: `${t("normal")}`, selected: true },
    { value: "big", text: `${t("big")}` },
    { value: "huge", text: `${t("huge")}` }
  ];
  e8.forEach((option) => {
    const opt = Object.assign(document.createElement("option"), { value: option.value, textContent: option.text });
    if (option.selected) opt.selected = true;
    e7.appendChild(opt);
  });
  const e10 = Object.assign(document.createElement("input"), { type: "checkbox", id: "multiball", name: "multiball", checked: false });
  const e11 = Object.assign(document.createElement("label"), { className: "game-text", htmlFor: "multiball", textContent: ` ${t("multiball")}` });
  const e12 = Object.assign(document.createElement("input"), { type: "checkbox", id: "doublePaddle", name: "doublePaddle", checked: false });
  const e13 = Object.assign(document.createElement("label"), { className: "game-text", htmlFor: "doublePaddle", textContent: ` ${t("doublePaddle")}` });
  const e14 = Object.assign(document.createElement("input"), { className: "game-text", type: "color", id: "uiCol", name: "uiCol", value: "#ffffff" });
  const e15 = Object.assign(document.createElement("label"), { className: "game-text", for: "uiCol", textContent: ` ${t("uiCol")}` });
  const e16 = Object.assign(document.createElement("input"), { className: "game-text", type: "color", id: "ballCol", name: "ballCol", value: "#0000ff" });
  const e17 = Object.assign(document.createElement("label"), { className: "game-text", for: "ballCol", textContent: ` ${t("ballCol")}` });
  const e18 = Object.assign(document.createElement("input"), { className: "game-text", type: "color", id: "innerBg", name: "innerBg", value: "#008000" });
  const e19 = Object.assign(document.createElement("label"), { className: "game-text", for: "innerBg", textContent: ` ${t("innerBg")}` });
  const e20 = Object.assign(document.createElement("input"), { className: "game-text", type: "color", id: "outerBg", name: "outerBg", value: "#000000" });
  const e21 = Object.assign(document.createElement("label"), { className: "game-text", for: "outerBg", textContent: ` ${t("outerBg")}` });
  const e22 = Object.assign(document.createElement("input"), { type: "submit", className: "btn w-auto py-1.5 px-8 m-0 text-lg font-bold w-25 cursor-pointer", value: `${t("start")}` });
  const row1 = Object.assign(document.createElement("div"), { className: "flex justify-between items-center mb-2" });
  const row2 = Object.assign(document.createElement("div"), { className: "flex justify-between items-center mb-2" });
  const row3 = Object.assign(document.createElement("div"), { className: "flex justify-between items-center mb-2" });
  const row4 = Object.assign(document.createElement("div"), { className: "flex justify-between items-center mb-2" });
  const row5 = Object.assign(document.createElement("div"), { className: "flex justify-between items-center mb-2" });
  const colorRow1 = Object.assign(document.createElement("div"), { className: "flex justify-between items-center mb-2" });
  const colorRow2 = Object.assign(document.createElement("div"), { className: "flex justify-between items-center mb-2" });
  const colorRow3 = Object.assign(document.createElement("div"), { className: "flex justify-between items-center mb-2" });
  const colorRow4 = Object.assign(document.createElement("div"), { className: "flex justify-between items-center mb-2" });
  row1.appendChild(e3);
  row1.appendChild(e1);
  row2.appendChild(e6);
  row2.appendChild(e4);
  row3.appendChild(e9);
  row3.appendChild(e7);
  row4.appendChild(e11);
  row4.appendChild(e10);
  if (!fourPlayers) {
    row5.appendChild(e13);
    row5.appendChild(e12);
  }
  colorRow1.appendChild(e15);
  colorRow1.appendChild(e14);
  colorRow2.appendChild(e17);
  colorRow2.appendChild(e16);
  colorRow3.appendChild(e19);
  colorRow3.appendChild(e18);
  colorRow4.appendChild(e21);
  colorRow4.appendChild(e20);
  settings.appendChild(row1);
  settings.appendChild(row2);
  settings.appendChild(row3);
  settings.appendChild(row4);
  if (!fourPlayers) {
    settings.appendChild(row5);
  }
  bgColors.appendChild(colorRow1);
  bgColors.appendChild(colorRow2);
  bgColors.appendChild(colorRow3);
  bgColors.appendChild(colorRow4);
  const container = Object.assign(document.createElement("div"), { className: "game-setup-container" });
  const ul = Object.assign(document.createElement("ul"), { id: "gameSetup", className: "flex flex-row gap-4 justify-between items-stretch list-none" });
  ul.appendChild(settings);
  ul.appendChild(bgColors);
  container.appendChild(ul);
  return { form: container, startButton: e22 };
}

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
function loadIn(id) {
  const el = document.getElementById(id);
  return el.value;
}
function loadInB(id) {
  const el = document.getElementById(id);
  return el.checked;
}
async function newGame(fourPlayers) {
  await new Promise((resolve) => {
    if (document.readyState === "complete") resolve();
    else document.addEventListener("DOMContentLoaded", () => resolve());
  });
  const appDiv = Object.assign(document.createElement("div"), { id: "app" });
  appDiv.className = [
    "fixed inset-0 flex flex-col items-center justify-center",
    "bg-black/60",
    "z-50"
  ].join(" ");
  document.body.appendChild(appDiv);
  const title = document.createElement("h2");
  title.textContent = "Game Setup";
  title.className = "text-2xl md:text-3xl font-bold text-[#66fcf1] text-center";
  appDiv.appendChild(title);
  const card = document.createElement("div");
  card.className = [
    "w-[min(900px,92vw)]",
    "rounded-2xl flex flex-row flex-wrap",
    "bg-[rgba(3,27,27,0.9)]",
    "shadow-[0_10px_30px_rgba(0,0,0,0.5)]",
    "p-6 md:p-8 space-y-6 gap-4"
  ].join(" ");
  appDiv.appendChild(card);
  const allBoxesContainer = Object.assign(document.createElement("div"), {
    className: "flex flex-row gap-4 justify-between items-stretch"
  });
  const player1Container = Object.assign(document.createElement("div"), {
    className: "flex-1"
  });
  const player2Container = Object.assign(document.createElement("div"), {
    className: "flex-1"
  });
  const player1List = Object.assign(document.createElement("ul"), {
    className: "list-none"
  });
  const player2List = Object.assign(document.createElement("ul"), {
    className: "list-none"
  });
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get("username") || "Player 1";
  playerSetupMenu(player1List, "1", username, false, "Shift", "Control", "#ffffff", "#808080", "#ff0000");
  playerSetupMenu(player2List, "2", "Arthur Dent", true, "ArrowUp", "ArrowDown", "#ffffff", "#808080", "#ff0000");
  player1Container.appendChild(player1List);
  player2Container.appendChild(player2List);
  if (fourPlayers) {
    const player3Container = Object.assign(document.createElement("div"), {
      className: "flex-1"
    });
    const player4Container = Object.assign(document.createElement("div"), {
      className: "flex-1"
    });
    const player3List = Object.assign(document.createElement("ul"), {
      className: "list-none"
    });
    const player4List = Object.assign(document.createElement("ul"), {
      className: "list-none"
    });
    playerSetupMenu(player3List, "3", "Trillian Astra", true, "i", "k", "#ffffff", "#808080", "#ff0000");
    playerSetupMenu(player4List, "4", "Zaphod Beeblebrox", true, "PageUp", "PageDown", "#ffffff", "#808080", "#ff0000");
    player3Container.appendChild(player3List);
    player4Container.appendChild(player4List);
    allBoxesContainer.appendChild(player3Container);
    allBoxesContainer.appendChild(player4Container);
  }
  const { form: setupForm, startButton } = gameSetupMenu(fourPlayers);
  const settingsForm = setupForm.querySelector("#settings");
  const bgColorsForm = setupForm.querySelector("#bgColors");
  allBoxesContainer.appendChild(player1Container);
  allBoxesContainer.appendChild(player2Container);
  allBoxesContainer.appendChild(settingsForm);
  allBoxesContainer.appendChild(bgColorsForm);
  card.appendChild(allBoxesContainer);
  const buttonContainer = Object.assign(document.createElement("div"), { className: "flex justify-center mt-6" });
  buttonContainer.appendChild(startButton);
  appDiv.appendChild(buttonContainer);
  startButton.addEventListener("click", (e) => {
    e.preventDefault();
    loadConfig(fourPlayers);
  });
}
function loadConfig(fourPlayers) {
  const appDiv = document.getElementById("app");
  const scoreboard = Object.assign(document.createElement("div"), { className: "scoreboard" });
  const p1name = Object.assign(document.createElement("textarea"), { className: "p1name game-text", rows: "1", cols: "30", disabled: "true" });
  const p1score = Object.assign(document.createElement("textarea"), { className: "p1score game-text", rows: "1", cols: "2", disabled: "true" });
  const p2score = Object.assign(document.createElement("textarea"), { className: "p2score game-text", rows: "1", cols: "2", disabled: "true" });
  const p2name = Object.assign(document.createElement("textarea"), { className: "p2name game-text", rows: "1", cols: "30", disabled: "true" });
  scoreboard.append(p1name, p1score, " : ", p2score, p2name);
  const canvas = Object.assign(document.createElement("canvas"), { id: "board", tabIndex: 1 });
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - p1score.clientHeight;
  const ctx = canvas.getContext("2d");
  var p = [];
  p.push(loadPlayer(
    loadIn("name_p1"),
    "",
    //player ID
    loadInB("p1Ai"),
    loadIn("p1Up"),
    loadIn("p1Down"),
    loadIn("p1InnerCol"),
    loadIn("p1OuterCol"),
    loadIn("p1CornerCol")
  ));
  p.push(loadPlayer(
    loadIn("name_p2"),
    "",
    //player ID
    loadInB("p2Ai"),
    loadIn("p2Up"),
    loadIn("p2Down"),
    loadIn("p2InnerCol"),
    loadIn("p2OuterCol"),
    loadIn("p2CornerCol")
  ));
  if (fourPlayers) p.push(loadPlayer(
    loadIn("name_p3"),
    "",
    //player ID
    loadInB("p3Ai"),
    loadIn("p3Up"),
    loadIn("p3Down"),
    loadIn("p3InnerCol"),
    loadIn("p3OuterCol"),
    loadIn("p3CornerCol")
  ));
  if (fourPlayers) p.push(loadPlayer(
    loadIn("name_p4"),
    "",
    //player ID
    loadInB("p4Ai"),
    loadIn("p4Up"),
    loadIn("p4Down"),
    loadIn("p4InnerCol"),
    loadIn("p4OuterCol"),
    loadIn("p4CornerCol")
  ));
  const loadData = {
    canvas,
    fps: 50,
    nameTB1: p1name,
    scoreTB1: p1score,
    scoreTB2: p2score,
    nameTB2: p2name,
    timestamp: 0,
    lastTime: 0,
    paddleWidth: canvas.width / 60,
    paddleHeight: canvas.height / 5,
    ctx,
    p,
    paddleSpeed: 40,
    ballSpeed: 10,
    ballSize: 80,
    maxScore: 3,
    //parseInt(loadIn("maxScore") || "10", 10),
    trailLength: 20,
    //parseInt(loadIn("trailLength") || "20", 10),
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
    mode: "twoPlayers",
    multiball: loadInB("multiball"),
    maxHits: Math.floor(Math.random() * 5 + 5),
    hits: 0
  };
  loadData.scoreTB1.value = "0";
  loadData.scoreTB2.value = "0";
  if (fourPlayers) {
    loadData.mode = "fourPlayers";
    loadData.nameTB1.value = p[0].name + " / " + p[1].name;
    loadData.nameTB2.value = p[2].name + " / " + p[3].name;
  } else {
    if (loadInB("doublePaddle")) loadData.mode = "doublePaddle";
    loadData.nameTB1.value = p[0].name;
    loadData.nameTB2.value = p[1].name;
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
  const gameAppDiv = document.getElementById("app");
  if (gameAppDiv) {
    gameAppDiv.innerHTML = "";
    gameAppDiv.className = [
      "fixed inset-0 flex flex-col",
      "bg-black/60",
      "z-50"
    ].join(" ");
    gameAppDiv.appendChild(scoreboard);
    gameAppDiv.appendChild(canvas);
  }
  controlKeys();
  document.getElementById("board")?.focus();
  setTimeout(() => countdown(3, 500), 500);
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
  var fillGrad = data.ctx.createLinearGradient(0, data.canvas.height * 2 / 5, 0, data.canvas.height * 3 / 5);
  fillGrad.addColorStop(0, p.getPl().outerCol);
  fillGrad.addColorStop(0.5, p.getPl().innerCol);
  fillGrad.addColorStop(1, p.getPl().outerCol);
  data.ctx.fillStyle = fillGrad;
  data.ctx.strokeStyle = p.getPl().cornerCol;
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
function touchControlArrows() {
  data.ctx.fillStyle = "rgb(50 50 50 / 50%)";
  data.ctx.font = `bold ${data.canvas.height / 4}px system-ui`;
  for (let i = 0; i < pad.length; i++) {
    if (i == 0 && !pad[i].isAi()) {
      data.ctx.textBaseline = "top";
      data.ctx.textAlign = "left";
      data.ctx.fillText("\u2B06", data.canvas.width / 16, 0);
      data.ctx.textBaseline = "bottom";
      data.ctx.fillText("\u2B07", data.canvas.width / 16, data.canvas.height);
    }
    if (data.mode != "fourPlayers") {
      if (i == 1 && !pad[i].isAi()) {
        data.ctx.textBaseline = "top";
        data.ctx.textAlign = "right";
        data.ctx.fillText("\u2B06", data.canvas.width * 15 / 16, 0);
        data.ctx.textBaseline = "bottom";
        data.ctx.fillText("\u2B07", data.canvas.width * 15 / 16, data.canvas.height);
      }
    } else {
      if (i == 1 && !pad[i].isAi()) {
        data.ctx.textBaseline = "top";
        data.ctx.textAlign = "right";
        data.ctx.fillText("\u2B06", data.canvas.width * 2 / 5, 0);
        data.ctx.textBaseline = "bottom";
        data.ctx.fillText("\u2B07", data.canvas.width * 2 / 5, data.canvas.height);
      }
      if (i == 2 && !pad[i].isAi()) {
        data.ctx.textBaseline = "top";
        data.ctx.textAlign = "left";
        data.ctx.fillText("\u2B06", data.canvas.width * 3 / 5, 0);
        data.ctx.textBaseline = "bottom";
        data.ctx.fillText("\u2B07", data.canvas.width * 3 / 5, data.canvas.height);
      }
      if (i == 3 && !pad[i].isAi()) {
        data.ctx.textBaseline = "top";
        data.ctx.textAlign = "right";
        data.ctx.fillText("\u2B06", data.canvas.width * 15 / 16, 0);
        data.ctx.textBaseline = "bottom";
        data.ctx.fillText("\u2B07", data.canvas.width * 15 / 16, data.canvas.height);
      }
    }
  }
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
    const outerCol = this._p.outerCol || "#808080";
    const innerCol = this._p.innerCol || "#ffffff";
    this._paddleGrad.addColorStop(0, outerCol);
    this._paddleGrad.addColorStop(0.5, innerCol);
    this._paddleGrad.addColorStop(1, outerCol);
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
  getPl() {
    return this._p;
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
          data.p[1].score++;
          data.scoreTB2.value = String(data.p[1].score);
          if (pad.length) setTimeout(() => scoreText(pad[1], data.p[1].score == data.maxScore), 100);
          data.serve = -1;
        }
        if (this._x >= data.canvas.width - this._size) {
          data.p[0].score++;
          data.scoreTB1.value = String(data.p[0].score);
          if (pad.length) setTimeout(() => scoreText(pad[0], data.p[0].score == data.maxScore), 100);
          data.serve = 1;
        }
      }
      removeBall(this);
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
  async createAIGame(playerData2) {
    try {
      const gameData = {
        player1Id: playerData2.playerId,
        player2Id: "ai_opponent",
        player1Name: playerData2.playerName,
        player2Name: "IA_OPPONENT",
        maxScore: playerData2.maxScore || 5,
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
function removeBall(ball) {
  let shrunk = [];
  for (let i = 0; i < balls.length; i++)
    if (balls[i] != ball) shrunk.push(balls[i]);
  balls = shrunk;
}
async function startGame(fourPlayers) {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get("lang") || "en";
    await initI18n(lang);
    await newGame(fourPlayers);
    document.getElementById("board")?.focus();
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
  pad = new Array(new Paddle(0, data.p[0]));
  if (data.mode == "twoPlayers") pad.push(new Paddle(data.canvas.width - data.paddleWidth, data.p[1]));
  if (data.mode == "doublePaddle") {
    pad.push(new Paddle(data.canvas.width - data.paddleWidth, data.p[1]));
    pad.push(new Paddle(data.canvas.width * 0.25 - data.paddleWidth, data.p[0]));
    pad.push(new Paddle(data.canvas.width * 0.75 - data.paddleWidth, data.p[1]));
  }
  if (data.mode == "fourPlayers") {
    pad.push(new Paddle(data.canvas.width * 0.25 - data.paddleWidth, data.p[1]));
    pad.push(new Paddle(data.canvas.width * 0.75 - data.paddleWidth, data.p[2]));
    pad.push(new Paddle(data.canvas.width - data.paddleWidth, data.p[3]));
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
  if (data.touchControl) touchControlArrows();
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
  if (data.p[0].score < data.maxScore && data.p[1].score < data.maxScore) setTimeout(startRound, 1500);
  else endGame();
}
async function endGame() {
  var winner;
  if (data.p[0].score > data.p[1].score)
    winner = data.p[0].name;
  else winner = data.p[1].name;
  data.showingText = false;
}
startGame(false);
export {
  balls,
  countdown,
  endGame,
  endRound,
  pad,
  removeBall,
  startGame,
  startRound
};
