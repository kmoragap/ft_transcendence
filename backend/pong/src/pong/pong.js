var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/controls.ts
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
    if (data.mode != "multi") {
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
    if (data.mode != "multi") {
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
var lastX;
var init_controls = __esm({
  "src/controls.ts"() {
    "use strict";
    init_gameData();
    init_pong();
  }
});

// src/i18n.ts
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
var translations, currentLanguage;
var init_i18n = __esm({
  "src/i18n.ts"() {
    "use strict";
    translations = {};
    currentLanguage = "en";
  }
});

// src/menus.ts
function tournamentSetupMenu() {
  const settings = Object.assign(document.createElement("form"), {
    id: "tournamentSettings",
    className: "editBox flex flex-col h-full p-2 md:p-4"
  });
  const row1 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2"
  });
  const row2 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2"
  });
  const matchLengthLabel = Object.assign(document.createElement("label"), {
    className: "game-text text-sm md:text-base",
    htmlFor: "matchLength",
    textContent: `${t("matchLength")}: `
  });
  const matchLengthInput = Object.assign(document.createElement("input"), {
    className: "custom-input px-1 py-1 text-sm md:text-base",
    type: "number",
    id: "matchLength",
    name: "matchLength",
    min: "1",
    value: "5"
  });
  const playersNumberLabel = Object.assign(document.createElement("label"), {
    className: "game-text text-sm md:text-base",
    htmlFor: "playersNumber",
    textContent: `${t("numberOfPlayers")}: `
  });
  const playersNumberInput = Object.assign(document.createElement("input"), {
    className: "custom-input px-1 py-1 text-sm md:text-base",
    type: "number",
    id: "playersNumber",
    name: "playersNumber",
    min: "2",
    value: "4"
  });
  row1.appendChild(playersNumberLabel);
  row1.appendChild(playersNumberInput);
  row2.appendChild(matchLengthLabel);
  row2.appendChild(matchLengthInput);
  settings.appendChild(row1);
  settings.appendChild(row2);
  const container = Object.assign(document.createElement("div"), {
    className: "tournament-setup-container"
  });
  container.appendChild(settings);
  return { form: container };
}
function playerSetupMenu(list, p, name, isAi, up, down, c1, c2, c3) {
  const idInput = Object.assign(document.createElement("input"), {
    type: "hidden",
    id: `p${p}Id`,
    name: `p${p}Id`,
    value: ""
  });
  list.appendChild(idInput);
  const form = Object.assign(document.createElement("form"), {
    id: `player${p}Menu`,
    className: `editBox`
  });
  const e1 = Object.assign(document.createElement("label"), {
    className: "game-text",
    for: `name_p${p}`,
    textContent: `${t("player")} ${p}: `
  });
  const e2 = Object.assign(document.createElement("input"), {
    className: "custom-input ml-1 px-1 py-1",
    size: "16",
    id: `name_p${p}`,
    name: `name_p${p}`,
    value: name
  });
  const e3 = Object.assign(document.createElement("label"), {
    className: "game-text",
    for: `p${p}Ai`,
    textContent: `${t("ai")} `
  });
  const e4 = Object.assign(document.createElement("input"), {
    type: "checkbox",
    id: `p${p}Ai`,
    name: `p${p}Ai`,
    checked: isAi,
    className: "ml-1"
  });
  e4.addEventListener("change", (event) => {
    const target = event.target;
    if (!target.checked) {
      window.parent.postMessage(
        {
          type: "REQUEST_LOGIN",
          playerId: p,
          playerName: `name_p${p}`
        },
        window.location.origin
      );
    }
  });
  const e5 = Object.assign(document.createElement("label"), {
    className: "game-text",
    for: `p${p}Up`,
    textContent: `${t("up")}: `
  });
  const e6 = Object.assign(document.createElement("input"), {
    className: "custom-input px-1 py-1 ml-1",
    type: "text",
    size: "9",
    id: `p${p}Up`,
    value: up
  });
  const e7 = Object.assign(document.createElement("label"), {
    className: "game-text",
    for: `p${p}Down`,
    textContent: `${t("down")}: `
  });
  const e8 = Object.assign(document.createElement("input"), {
    className: "custom-input px-1 py-1 ml-1",
    type: "text",
    size: "9",
    id: `p${p}Down`,
    value: down
  });
  const e9 = Object.assign(document.createElement("input"), {
    className: "game-text",
    type: "color",
    id: `p${p}InnerCol`,
    name: `p${p}InnerCol`,
    value: c1
  });
  const e10 = Object.assign(document.createElement("label"), {
    className: "game-text",
    for: ` p${p}InnerCol`,
    textContent: `${t("innerColor")}`
  });
  const e11 = Object.assign(document.createElement("input"), {
    className: "game-text",
    type: "color",
    id: `p${p}OuterCol`,
    name: `p${p}OuterCol`,
    value: c2
  });
  const e12 = Object.assign(document.createElement("label"), {
    className: "game-text",
    for: ` p${p}OuterCol`,
    textContent: `${t("outerColor")}`
  });
  const e13 = Object.assign(document.createElement("input"), {
    className: "game-text",
    type: "color",
    id: `p${p}CornerCol`,
    name: `p${p}CornerCol`,
    value: c3
  });
  const e14 = Object.assign(document.createElement("label"), {
    className: "game-text",
    for: ` p${p}CornerCol`,
    textContent: `${t("cornerColor")}`
  });
  const nameRow = Object.assign(document.createElement("div"), {
    className: "flex w-full justify-between items-center mb-2"
  });
  const keysRow = Object.assign(document.createElement("div"), {
    className: "flex w-full justify-between items-center mb-2"
  });
  const innerColRow = Object.assign(document.createElement("div"), {
    className: "flex w-full justify-between items-center mb-2"
  });
  const outerColRow = Object.assign(document.createElement("div"), {
    className: "flex w-full justify-between items-center mb-2"
  });
  const cornerColRow = Object.assign(document.createElement("div"), {
    className: "flex w-full justify-between items-center mb-2"
  });
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
function gameSetupMenu(mode) {
  const settings = Object.assign(document.createElement("form"), {
    id: "settings",
    className: "editBox flex flex-col h-full p-2 md:p-4"
  });
  const bgColors = Object.assign(document.createElement("form"), {
    id: "bgColors",
    className: "editBox flex flex-col h-full p-2 md:p-4"
  });
  const e3 = Object.assign(document.createElement("label"), {
    className: "game-text text-sm md:text-base",
    htmlFor: "paddleSpeed",
    textContent: `${t("paddleSpeed")}`
  });
  const e1 = Object.assign(document.createElement("select"), {
    name: "paddleSpeed",
    id: "paddleSpeed",
    className: "custom-select px-1 py-1 text-sm md:text-base"
  });
  const e2 = [
    { value: "glacial", text: `${t("glacial")}` },
    { value: "slow", text: `${t("slow")}` },
    { value: "standard", text: `${t("standard")}`, selected: true },
    { value: "fast", text: `${t("fast")}` },
    { value: "insane", text: `${t("insane")}` }
  ];
  e2.forEach((option) => {
    const opt = Object.assign(document.createElement("option"), {
      value: option.value,
      textContent: option.text
    });
    if (option.selected) opt.selected = true;
    e1.appendChild(opt);
  });
  const e6 = Object.assign(document.createElement("label"), {
    className: "game-text text-sm md:text-base",
    htmlFor: "ballSpeed",
    textContent: `${t("ballSpeed")}`
  });
  const e4 = Object.assign(document.createElement("select"), {
    name: "ballSpeed",
    id: "ballSpeed",
    className: "custom-select px-1 py-1 text-sm md:text-base"
  });
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
  const e9 = Object.assign(document.createElement("label"), {
    className: "game-text text-sm md:text-base",
    htmlFor: "ballSize",
    textContent: `${t("ballSize")}`
  });
  const e7 = Object.assign(document.createElement("select"), {
    name: "ballSize",
    id: "ballSize",
    className: "custom-select px-1 py-1 text-sm md:text-base",
    style: { width: "20px" }
  });
  const e8 = [
    { value: "tiny", text: `${t("tiny")}` },
    { value: "small", text: `${t("small")}` },
    { value: "normal", text: `${t("normal")}`, selected: true },
    { value: "big", text: `${t("big")}` },
    { value: "huge", text: `${t("huge")}` }
  ];
  e8.forEach((option) => {
    const opt = Object.assign(document.createElement("option"), {
      value: option.value,
      textContent: option.text
    });
    if (option.selected) opt.selected = true;
    e7.appendChild(opt);
  });
  const e10 = Object.assign(document.createElement("input"), {
    type: "checkbox",
    id: "multiball",
    name: "multiball",
    checked: false
  });
  const e11 = Object.assign(document.createElement("label"), {
    className: "game-text",
    htmlFor: "multiball",
    textContent: ` ${t("multiball")}`
  });
  const e12 = Object.assign(document.createElement("input"), {
    type: "checkbox",
    id: "doublePaddle",
    name: "doublePaddle",
    checked: false
  });
  const e13 = Object.assign(document.createElement("label"), {
    className: "game-text",
    htmlFor: "doublePaddle",
    textContent: ` ${t("doublePaddle")}`
  });
  const e14 = Object.assign(document.createElement("input"), {
    className: "game-text",
    type: "color",
    id: "uiCol",
    name: "uiCol",
    value: "#ffffff"
  });
  const e15 = Object.assign(document.createElement("label"), {
    className: "game-text",
    for: "uiCol",
    textContent: ` ${t("uiCol")}`
  });
  const e16 = Object.assign(document.createElement("input"), {
    className: "game-text",
    type: "color",
    id: "ballCol",
    name: "ballCol",
    value: "#0000ff"
  });
  const e17 = Object.assign(document.createElement("label"), {
    className: "game-text",
    for: "ballCol",
    textContent: ` ${t("ballCol")}`
  });
  const e18 = Object.assign(document.createElement("input"), {
    className: "game-text",
    type: "color",
    id: "innerBg",
    name: "innerBg",
    value: "#008000"
  });
  const e19 = Object.assign(document.createElement("label"), {
    className: "game-text",
    for: "innerBg",
    textContent: ` ${t("innerBg")}`
  });
  const e20 = Object.assign(document.createElement("input"), {
    className: "game-text",
    type: "color",
    id: "outerBg",
    name: "outerBg",
    value: "#000000"
  });
  const e21 = Object.assign(document.createElement("label"), {
    className: "game-text",
    for: "outerBg",
    textContent: ` ${t("outerBg")}`
  });
  const e22 = Object.assign(document.createElement("input"), {
    type: "submit",
    className: "btn w-auto py-2 md:py-1.5 px-6 md:px-8 m-0 text-base md:text-lg font-bold w-25 cursor-pointer",
    value: `${t("start")}`
  });
  const row1 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2"
  });
  const row2 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2"
  });
  const row3 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2"
  });
  const row4 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2"
  });
  const row5 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2"
  });
  const colorRow1 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2"
  });
  const colorRow2 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2"
  });
  const colorRow3 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2"
  });
  const colorRow4 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2"
  });
  row1.appendChild(e3);
  row1.appendChild(e1);
  row2.appendChild(e6);
  row2.appendChild(e4);
  row3.appendChild(e9);
  row3.appendChild(e7);
  row4.appendChild(e11);
  row4.appendChild(e10);
  if (mode === "multi") {
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
  if (mode === "multi") {
    settings.appendChild(row5);
  }
  bgColors.appendChild(colorRow1);
  bgColors.appendChild(colorRow2);
  bgColors.appendChild(colorRow3);
  bgColors.appendChild(colorRow4);
  const container = Object.assign(document.createElement("div"), {
    className: "game-setup-container"
  });
  const ul = Object.assign(document.createElement("ul"), {
    id: "gameSetup",
    className: "flex flex-col md:flex-row gap-4 justify-between items-stretch list-none"
  });
  ul.appendChild(settings);
  ul.appendChild(bgColors);
  container.appendChild(ul);
  return { form: container, startButton: e22 };
}
var init_menus = __esm({
  "src/menus.ts"() {
    "use strict";
    init_i18n();
    window.addEventListener("message", (event) => {
      if (event.origin !== window.location.origin) {
        return;
      }
      if (event.data.type === "LOGIN_SUCCESS") {
        const { playerId, playerName, username, userData } = event.data;
        const nameInput = document.getElementById(playerName);
        if (nameInput) {
          nameInput.value = username;
        }
        const idInput = document.getElementById(
          `p${playerId}Id`
        );
        if (idInput && userData?.id) {
          idInput.value = userData.id;
        }
        if (playerId === "2") {
          window.gamePlayer2 = {
            id: userData?.id,
            username,
            userData,
            loggedIn: true
          };
        }
        console.log(
          `Player ${playerId} logged in as: ${username} (ID: ${userData?.id})`
        );
      } else if (event.data.type === "LOGIN_CANCELLED") {
        const { playerId } = event.data;
        const aiCheckbox = document.getElementById(
          `p${playerId}Ai`
        );
        if (aiCheckbox) {
          aiCheckbox.checked = true;
        }
        console.log(`Login cancelled for player ${playerId}, reverting to AI`);
      } else if (event.data.type === "CLEAR_PLAYER2_DATA") {
        window.gamePlayer2 = null;
        console.log("Player 2 data cleared");
      }
    });
  }
});

// src/services/tournamentService.ts
var TournamentService, tournamentService;
var init_tournamentService = __esm({
  "src/services/tournamentService.ts"() {
    "use strict";
    TournamentService = class {
      constructor() {
        this.baseUrl = "/api/pong";
      }
      async createTournament(data2) {
        try {
          const response = await fetch(`${this.baseUrl}/tournaments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: data2 })
          });
          if (!response.ok) return null;
          return await response.json();
        } catch (error) {
          console.error("Error creating tournament:", error);
          return null;
        }
      }
      async addGameToTournament(tournamentId, gameId) {
        try {
          const response = await fetch(
            `${this.baseUrl}/tournaments/${tournamentId}/games`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ gameId })
            }
          );
          return response.ok;
        } catch (error) {
          console.error("Error adding game to tournament:", error);
          return false;
        }
      }
      async getTournament(tournamentId) {
        try {
          const response = await fetch(
            `${this.baseUrl}/tournaments/${tournamentId}`
          );
          if (!response.ok) return null;
          return await response.json();
        } catch (error) {
          console.error("Error fetching tournament:", error);
          return null;
        }
      }
    };
    tournamentService = new TournamentService();
  }
});

// src/tournamentGame.ts
async function newTournamentGame(tournamentId) {
  const initialized = await tournamentManager.initializeTournament(tournamentId);
  if (!initialized) return false;
  const nextMatch = tournamentManager.getNextMatch();
  if (!nextMatch) {
    console.log("No more matches in tournament");
    return false;
  }
  return await tournamentManager.startTournamentMatch(nextMatch);
}
async function handleTournamentGameCompletion(winnerId, gameId) {
  const success = await tournamentManager.completeMatch(winnerId, gameId);
  const isComplete = tournamentManager.isTournamentComplete();
  if (success && !isComplete) {
    const nextMatch = tournamentManager.getNextMatch();
    if (nextMatch) {
      tournamentManager.showMatchTransition(nextMatch);
      return true;
    }
  }
  return success;
}
var TournamentManager, tournamentManager;
var init_tournamentGame = __esm({
  "src/tournamentGame.ts"() {
    "use strict";
    init_gameData();
    init_tournamentService();
    init_i18n();
    TournamentManager = class {
      constructor() {
        this.tournament = null;
      }
      async initializeTournament(tournamentId) {
        try {
          const tournamentData = await tournamentService.getTournament(tournamentId);
          if (!tournamentData) {
            console.error("Tournament not found:", tournamentId);
            return false;
          }
          this.tournament = {
            id: tournamentData.id,
            name: tournamentData.name,
            players: tournamentData.playersIds,
            rounds: this.generateBracket(tournamentData.playersIds),
            currentRound: 0,
            status: "IN_PROGRESS"
          };
          console.log("Tournament initialized:", this.tournament);
          return true;
        } catch (error) {
          console.error("Error initializing tournament:", error);
          return false;
        }
      }
      generateBracket(players) {
        const rounds = [];
        const playerIdToNameMap = window.playerIdToNameMap || {};
        let numPlayers = players.length;
        let roundNumber = 1;
        while (numPlayers > 1) {
          const numMatches = Math.floor(numPlayers / 2);
          const matches = [];
          for (let i = 0; i < numMatches; i++) {
            matches.push({
              matchNumber: i + 1,
              player1Id: `TBD_Round${roundNumber}_Match${i + 1}_Player1`,
              player1Name: `TBD Round ${roundNumber} Match ${i + 1} Player 1`,
              player2Id: `TBD_Round${roundNumber}_Match${i + 1}_Player2`,
              player2Name: `TBD Round ${roundNumber} Match ${i + 1} Player 2`,
              isComplete: false
            });
          }
          rounds.push({
            roundNumber,
            matches,
            isComplete: false
          });
          numPlayers = numMatches;
          roundNumber++;
        }
        if (rounds.length > 0) {
          const firstRound = rounds[0];
          for (let i = 0; i < firstRound.matches.length; i++) {
            const player1Index = i * 2;
            const player2Index = player1Index + 1;
            if (player1Index < players.length && player2Index < players.length) {
              const player1Id = players[player1Index];
              const player2Id = players[player2Index];
              const player1Name = playerIdToNameMap[player1Id] || (player1Id === "AI-Roger-Federror" ? "Roger Federror" : `Player ${player1Id}`);
              const player2Name = playerIdToNameMap[player2Id] || (player2Id === "AI-Roger-Federror" ? "Roger Federror" : `Player ${player2Id}`);
              firstRound.matches[i] = {
                matchNumber: i + 1,
                player1Id,
                player1Name,
                player2Id,
                player2Name,
                isComplete: false
              };
            }
          }
        }
        return rounds;
      }
      getNextMatch() {
        if (!this.tournament) return null;
        const currentRound = this.tournament.rounds[this.tournament.currentRound];
        if (!currentRound) return null;
        const nextMatch = currentRound.matches.find((match) => !match.isComplete);
        return nextMatch || null;
      }
      async resetGameState() {
        const { balls: balls2, pad: pad2 } = await Promise.resolve().then(() => (init_pong(), pong_exports));
        while (balls2.length) {
          balls2[0].stop();
          balls2.shift();
        }
        while (pad2.length) {
          pad2[0].stop();
          pad2.shift();
        }
        const existingOverlay = document.getElementById("matchTransitionOverlay");
        if (existingOverlay) {
          existingOverlay.remove();
        }
        data.serve = Math.floor(Math.random() * 2) ? -1 : 1;
      }
      async startTournamentMatch(match) {
        if (!this.tournament) return false;
        await this.resetGameState();
        data.isTournament = true;
        data.tournamentId = this.tournament.id;
        data.tournamentRound = match.matchNumber;
        data.tournamentMatch = match.matchNumber;
        data.p[0].id = match.player1Id;
        data.p[0].name = match.player1Name;
        data.p[0].score = 0;
        data.p[1].id = match.player2Id;
        data.p[1].name = match.player2Name;
        data.p[1].score = 0;
        data.nameTB1.value = match.player1Name;
        data.nameTB2.value = match.player2Name;
        data.scoreTB1.value = "0";
        data.scoreTB2.value = "0";
        data.showingText = false;
        data.go = false;
        const { countdown: countdown2 } = await Promise.resolve().then(() => (init_pong(), pong_exports));
        setTimeout(() => countdown2(3, 500), 500);
        return true;
      }
      async completeMatch(winnerId, gameId) {
        if (!this.tournament) return false;
        const currentRound = this.tournament.rounds[this.tournament.currentRound];
        if (!currentRound) return false;
        const match = currentRound.matches.find(
          (m) => m.player1Id === data.p[0].id && m.player2Id === data.p[1].id || m.player1Id === data.p[1].id && m.player2Id === data.p[0].id
        );
        if (!match) {
          console.error("Match not found in tournament bracket");
          return false;
        }
        match.winnerId = winnerId;
        match.gameId = gameId;
        match.isComplete = true;
        const roundComplete = currentRound.matches.every((m) => m.isComplete);
        if (roundComplete) {
          currentRound.isComplete = true;
          await this.advanceToNextRound();
        }
        return true;
      }
      async advanceToNextRound() {
        if (!this.tournament) return;
        const currentRound = this.tournament.rounds[this.tournament.currentRound];
        const nextRound = this.tournament.rounds[this.tournament.currentRound + 1];
        if (!nextRound) {
          await this.completeTournament();
          return;
        }
        const winners = currentRound.matches.filter((match) => match.winnerId).map((match) => match.winnerId);
        const playerIdToNameMap = window.playerIdToNameMap || {};
        let winnerIndex = 0;
        for (let i = 0; i < nextRound.matches.length; i++) {
          const match = nextRound.matches[i];
          if (winnerIndex < winners.length) {
            const player1Id = winners[winnerIndex];
            match.player1Id = player1Id;
            match.player1Name = playerIdToNameMap[player1Id] || (player1Id === "AI-Roger-Federror" ? "Roger Federror" : `Player ${player1Id}`);
            winnerIndex++;
          }
          if (winnerIndex < winners.length) {
            const player2Id = winners[winnerIndex];
            match.player2Id = player2Id;
            match.player2Name = playerIdToNameMap[player2Id] || (player2Id === "AI-Roger-Federror" ? "Roger Federror" : `Player ${player2Id}`);
            winnerIndex++;
          }
        }
        this.tournament.currentRound++;
      }
      async completeTournament() {
        if (!this.tournament) return;
        const finalRound = this.tournament.rounds[this.tournament.currentRound];
        const winner = finalRound.matches[0]?.winnerId;
        const winnerName = finalRound.matches[0]?.player1Id === winner ? finalRound.matches[0]?.player1Name : finalRound.matches[0]?.player2Name;
        this.tournament.status = "FINISHED";
        this.showTournamentWinner(winnerName || "Unknown");
      }
      showMatchTransition(nextMatch) {
        const overlay = document.createElement("div");
        overlay.className = "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50";
        overlay.id = "matchTransitionOverlay";
        const modal = document.createElement("div");
        modal.className = "bg-[rgba(3,27,27,0.8)] z-50 rounded-lg p-8 max-w-md w-full mx-4 text-center";
        modal.innerHTML = `
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-[#66fcf1] mb-4">${t("next_match")}</h2>
        <div class="text-lg text-gray-600 mb-2">
          <span class="font-semibold text-[#66fcf1]">${nextMatch.player1Name}</span>
          <span class="mx-4 text-[#66fcf1]">${t("vs")}</span>
          <span class="font-semibold text-red-600">${nextMatch.player2Name}</span>
        </div>
        <p class="text-sm text-[#66fcf1] mt-4">${t("get_ready_next_round")}</p>
      </div>
      <button id="startNextMatchBtn" class="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200">
        ${t("start_match")}
      </button>
    `;
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        const startBtn = document.getElementById("startNextMatchBtn");
        if (startBtn) {
          startBtn.addEventListener("click", () => {
            this.startTournamentMatch(nextMatch);
            this.hideMatchTransition();
          });
        }
      }
      hideMatchTransition() {
        const overlay = document.getElementById("matchTransitionOverlay");
        if (overlay) {
          overlay.remove();
        }
      }
      showTournamentWinner(winnerName) {
        const overlay = document.createElement("div");
        overlay.className = "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50";
        const modal = document.createElement("div");
        modal.className = "bg-[rgba(3,27,27,0.8)] z-50 rounded-lg p-8 max-w-md w-full mx-4 text-center";
        modal.innerHTML = `
      <div class="mb-6">
        <h2 class="text-3xl font-bold text-[#66fcf1] mb-4">\u{1F3C6} ${t("tournament_complete")}</h2>
        <div class="text-xl mb-4">
          <span class="text-[#66fcf1]">${t("winner")}:</span>
          <span class="font-bold text-yellow-400 ml-2">${winnerName}</span>
        </div>
        <p class="text-sm text-[#66fcf1] mt-4">${t("congratulations_victory")}</p>
      </div>
      <button id="tournamentExitBtn" class="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200">
        ${t("exit_tournament")}
      </button>
    `;
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        const exitBtn = overlay.querySelector("#tournamentExitBtn");
        exitBtn.addEventListener("click", () => {
          document.body.removeChild(overlay);
          window.parent.postMessage({
            type: "EXIT_GAME",
            winner: winnerName,
            isTournament: true
          }, window.location.origin);
        });
      }
      isTournamentComplete() {
        return this.tournament?.status === "FINISHED";
      }
      getTournamentStatus() {
        if (!this.tournament) return null;
        return {
          name: this.tournament.name,
          currentRound: this.tournament.currentRound + 1,
          totalRounds: this.tournament.rounds.length,
          status: this.tournament.status
        };
      }
      getTournamentBracket() {
        return this.tournament;
      }
    };
    tournamentManager = new TournamentManager();
  }
});

// src/gameData.ts
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth <= 768 && window.innerHeight <= 1024;
}
function toggleFullscreen() {
  if (!isFullscreen) {
    enterFullscreen();
  } else {
    exitFullscreen();
  }
}
function enterFullscreen() {
  const canvas = document.getElementById("board");
  if (!canvas) {
    return Promise.reject(new Error("Canvas not found"));
  }
  return new Promise((resolve, reject) => {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen().then(() => {
        console.log("Fullscreen entered successfully");
        updateCanvasForFullscreen(true);
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock("landscape").catch((err) => {
            console.log("Orientation lock failed:", err);
          });
        }
        resolve();
      }).catch((err) => {
        console.log("Fullscreen failed:", err);
        updateCanvasForFullscreen(true);
        reject(err);
      });
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen().then(() => {
        console.log("Fullscreen entered successfully");
        updateCanvasForFullscreen(true);
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock("landscape").catch((err) => {
            console.log("Orientation lock failed:", err);
          });
        }
        resolve();
      }).catch((err) => {
        console.log("Fullscreen failed:", err);
        updateCanvasForFullscreen(true);
        reject(err);
      });
    } else if (canvas.mozRequestFullScreen) {
      canvas.mozRequestFullScreen().then(() => {
        console.log("Fullscreen entered successfully");
        updateCanvasForFullscreen(true);
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock("landscape").catch((err) => {
            console.log("Orientation lock failed:", err);
          });
        }
        resolve();
      }).catch((err) => {
        console.log("Fullscreen failed:", err);
        updateCanvasForFullscreen(true);
        reject(err);
      });
    } else if (canvas.msRequestFullscreen) {
      canvas.msRequestFullscreen().then(() => {
        console.log("Fullscreen entered successfully");
        updateCanvasForFullscreen(true);
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock("landscape").catch((err) => {
            console.log("Orientation lock failed:", err);
          });
        }
        resolve();
      }).catch((err) => {
        console.log("Fullscreen failed:", err);
        updateCanvasForFullscreen(true);
        reject(err);
      });
    } else {
      reject(new Error("Fullscreen not supported"));
    }
  });
}
function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
  updateCanvasForFullscreen(false);
}
function showFullscreenPrompt() {
  const prompt = document.createElement("div");
  prompt.className = "fixed inset-0 bg-black/80 flex items-center justify-center z-50";
  prompt.id = "fullscreen-prompt";
  prompt.innerHTML = `
		<div class="bg-[rgba(3,27,27,0.95)] rounded-xl p-6 max-w-sm mx-4 border border-[rgba(102,252,241,0.25)] shadow-2xl text-center">
			<div class="text-4xl mb-4">\u{1F4F1}</div>
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
  const fullscreenBtn = prompt.querySelector("#fullscreen-btn");
  fullscreenBtn?.addEventListener("click", async () => {
    try {
      await enterFullscreen();
      prompt.remove();
    } catch (err) {
      console.log("Manual fullscreen failed:", err);
      prompt.remove();
    }
  });
}
function updatePaddlePositions() {
  if (!pad || pad.length === 0) return;
  if (data.mode === "twoPlayers") {
    pad[0].setX(0);
    pad[1].setX(data.canvas.width - data.paddleWidth);
  } else if (data.mode === "doublePaddle") {
    pad[0].setX(0);
    pad[1].setX(data.canvas.width - data.paddleWidth);
    pad[2].setX(data.canvas.width * 0.25 - data.paddleWidth);
    pad[3].setX(data.canvas.width * 0.75 - data.paddleWidth);
  } else if (data.mode === "multi") {
    pad[0].setX(0);
    pad[1].setX(data.canvas.width * 0.25 - data.paddleWidth);
    pad[2].setX(data.canvas.width * 0.75 - data.paddleWidth);
    pad[3].setX(data.canvas.width - data.paddleWidth);
  }
}
function updateCanvasForFullscreen(fullscreen) {
  const canvas = document.getElementById("board");
  if (!canvas) return;
  isFullscreen = fullscreen;
  if (fullscreen) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "9999";
    canvas.style.backgroundColor = "#000";
  } else {
    const margin = 47;
    const availableHeight = window.innerHeight - margin;
    canvas.width = window.innerWidth;
    canvas.height = availableHeight;
    canvas.style.width = "100%";
    canvas.style.height = `${availableHeight}px`;
    canvas.style.position = "static";
    canvas.style.top = "auto";
    canvas.style.left = "auto";
    canvas.style.zIndex = "auto";
    canvas.style.backgroundColor = "transparent";
  }
  if (data && data.canvas) {
    data.canvas = canvas;
    data.ctx = canvas.getContext("2d");
    data.paddleWidth = canvas.width / 60;
    data.paddleHeight = canvas.height / 5;
    data.bg = data.ctx.createLinearGradient(0, 0, canvas.width, 0);
    data.bg.addColorStop(0, data.outerBg);
    data.bg.addColorStop(0.5, data.innerBg);
    data.bg.addColorStop(1, data.outerBg);
    updatePaddlePositions();
  }
}
function handleFullscreenChange() {
  const isCurrentlyFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
  if (isCurrentlyFullscreen !== isFullscreen) {
    updateCanvasForFullscreen(isCurrentlyFullscreen);
  }
}
function loadPlayer(name, id, isAi, up, down, innerCol, outercol, cornerCol) {
  const isAiByName = name.includes("Player") && name !== "Player 1";
  const finalIsAi = isAi || isAiByName;
  let finalId = id;
  if (!finalIsAi && !finalId) {
    const urlParams = new URLSearchParams(window.location.search);
    finalId = urlParams.get("userId") || name;
  }
  var p = {
    name,
    id: finalIsAi ? "AI-Roger-Federror" : finalId,
    score: 0,
    isAi: finalIsAi,
    up,
    down,
    innerCol,
    outerCol: outercol,
    cornerCol
  };
  if (finalIsAi) p.name = "Roger Federror";
  return p;
}
function loadIn(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}
function loadInB(id) {
  const el = document.getElementById(id);
  return el ? el.checked : false;
}
async function newGame(mode) {
  await new Promise((resolve) => {
    if (document.readyState === "complete") resolve();
    else document.addEventListener("DOMContentLoaded", () => resolve());
  });
  console.log("Starting new game in mode:", mode);
  const appDiv = Object.assign(document.createElement("div"), {
    id: "app"
  });
  appDiv.className = [
    "fixed inset-0 flex flex-col items-center justify-center",
    "bg-black/60",
    "z-50 pb-2 md:pb-0"
  ].join(" ");
  document.body.appendChild(appDiv);
  const title = document.createElement("h2");
  if (mode === "tournament") {
    title.textContent = t("tournamentSetup");
  } else {
    title.textContent = t("gameSetup");
  }
  title.className = "text-2xl md:text-3xl font-bold text-[#66fcf1] text-center";
  appDiv.appendChild(title);
  const card = document.createElement("div");
  card.className = [
    "w-[min(900px,92vw)] overflow-y-auto",
    "rounded-2xl flex flex-row flex-wrap",
    "bg-[rgba(3,27,27,0.9)]",
    "shadow-[0_10px_30px_rgba(0,0,0,0.5)]",
    "p-6 md:p-8 space-y-6 gap-4"
  ].join(" ");
  appDiv.appendChild(card);
  const allBoxesContainer = Object.assign(document.createElement("div"), {
    className: "flex flex-col md:flex-row gap-4 justify-start items-stretch flex-wrap"
  });
  const tournamentContiner = Object.assign(document.createElement("div"), {
    className: "flex-1 min-w-[300px]"
  });
  const player1Container = Object.assign(document.createElement("div"), {
    className: "flex-1 min-w-[300px]"
  });
  const player2Container = Object.assign(document.createElement("div"), {
    className: "flex-1 min-w-[300px]"
  });
  const player1List = Object.assign(document.createElement("ul"), {
    className: "list-none"
  });
  const player2List = Object.assign(document.createElement("ul"), {
    className: "list-none"
  });
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get("username") || "Player 1";
  const userId = urlParams.get("userId") || "";
  playerSetupMenu(
    player1List,
    "1",
    username,
    false,
    "Shift",
    "Control",
    "#ffffff",
    "#808080",
    "#ff0000"
  );
  setTimeout(() => {
    const p1IdInput = document.getElementById("p1Id");
    if (p1IdInput && userId) {
      p1IdInput.value = userId;
    }
  }, 0);
  playerSetupMenu(
    player2List,
    "2",
    "Arthur Dent",
    true,
    "ArrowUp",
    "ArrowDown",
    "#ffffff",
    "#808080",
    "#ff0000"
  );
  player1Container.appendChild(player1List);
  player2Container.appendChild(player2List);
  const { form: setupForm, startButton } = gameSetupMenu(mode);
  const settingsForm = setupForm.querySelector("#settings");
  const bgColorsForm = setupForm.querySelector("#bgColors");
  if (mode === "tournament") {
    let createPlayerBoxes2 = function(numPlayers) {
      const container = document.getElementById("playerSetupContainer");
      if (!container) return;
      container.innerHTML = "";
      for (let i = 1; i <= numPlayers; i++) {
        const playerContainer = Object.assign(document.createElement("div"), {
          className: "flex-1"
        });
        const playerList = Object.assign(document.createElement("ul"), {
          className: "list-none"
        });
        const defaultNames = [
          "Player 1",
          "Player 2",
          "Player 3",
          "Player 4",
          "Player 5",
          "Player 6",
          "Player 7",
          "Player 8"
        ];
        const defaultKeys = [
          { up: "Shift", down: "Control" },
          { up: "ArrowUp", down: "ArrowDown" },
          { up: "w", down: "s" },
          { up: "i", down: "k" },
          { up: "t", down: "g" },
          { up: "u", down: "j" },
          { up: "o", down: "l" },
          { up: "p", down: ";" }
        ];
        let playerName = defaultNames[i - 1] || `Player ${i}`;
        const playerKeys = defaultKeys[i - 1] || { up: "q", down: "a" };
        if (i === 1) {
          const urlParams2 = new URLSearchParams(window.location.search);
          const username2 = urlParams2.get("username") || "Player 1";
          playerName = username2;
        }
        playerSetupMenu(
          playerList,
          i.toString(),
          playerName,
          i > 1,
          // First player is human (logged-in user), rest are AI by default
          playerKeys.up,
          playerKeys.down,
          "#ffffff",
          "#808080",
          "#ff0000"
        );
        playerContainer.appendChild(playerList);
        container.appendChild(playerContainer);
      }
    }, showStep2 = function(step) {
      document.querySelectorAll(".wizard-step").forEach((el) => {
        el.classList.add("hidden");
      });
      const stepElement = document.getElementById(`step${step}`);
      if (stepElement) {
        stepElement.classList.remove("hidden");
      }
      backButton.classList.toggle("hidden", step === 1);
      nextButton.classList.toggle("hidden", step === 3);
      finishButton.classList.toggle("hidden", step !== 3);
      if (step === 2) {
        const playersNumberInput2 = document.getElementById("playersNumber");
        if (playersNumberInput2) {
          const numPlayers = parseInt(playersNumberInput2.value) || 4;
          createPlayerBoxes2(numPlayers);
        }
      }
      currentStep = step;
    };
    var createPlayerBoxes = createPlayerBoxes2, showStep = showStep2;
    const tournamentWizard = Object.assign(document.createElement("div"), {
      className: "tournament-wizard"
    });
    const step1Container = Object.assign(document.createElement("div"), {
      className: "wizard-step",
      id: "step1"
    });
    const step2Container = Object.assign(document.createElement("div"), {
      className: "wizard-step hidden",
      id: "step2"
    });
    const step3Container = Object.assign(document.createElement("div"), {
      className: "wizard-step hidden",
      id: "step3"
    });
    const navigationContainer = Object.assign(document.createElement("div"), {
      className: "flex justify-between items-center mt-6"
    });
    const backButton = Object.assign(document.createElement("button"), {
      className: "btn py-2 px-6 text-lg font-bold hidden",
      textContent: t("back") || "Back",
      id: "backBtn"
    });
    const nextButton = Object.assign(document.createElement("button"), {
      className: "btn py-2 px-6 text-lg font-bold",
      textContent: t("next") || "Next",
      id: "nextBtn"
    });
    const finishButton = Object.assign(document.createElement("button"), {
      className: "btn py-2 px-6 text-lg font-bold hidden",
      textContent: t("start") || "Start",
      id: "finishBtn"
    });
    const { form: tournamentForm } = tournamentSetupMenu();
    step1Container.appendChild(tournamentForm);
    const playersNumberInput = document.getElementById("playersNumber");
    if (playersNumberInput) {
      playersNumberInput.addEventListener("input", () => {
        if (currentStep === 2) {
          const numPlayers = parseInt(playersNumberInput.value) || 4;
          createPlayerBoxes2(numPlayers);
        }
      });
    }
    const step2FlexContainer = Object.assign(document.createElement("div"), {
      className: "flex flex-col md:flex-row gap-4 justify-start items-stretch flex-wrap",
      id: "playerSetupContainer"
    });
    step2Container.appendChild(step2FlexContainer);
    const step3FlexContainer = Object.assign(document.createElement("div"), {
      className: "flex flex-col md:flex-row gap-4 justify-start items-stretch flex-wrap"
    });
    step3FlexContainer.appendChild(settingsForm);
    step3FlexContainer.appendChild(bgColorsForm);
    step3Container.appendChild(step3FlexContainer);
    tournamentWizard.appendChild(step1Container);
    tournamentWizard.appendChild(step2Container);
    tournamentWizard.appendChild(step3Container);
    navigationContainer.appendChild(backButton);
    navigationContainer.appendChild(nextButton);
    navigationContainer.appendChild(finishButton);
    tournamentWizard.appendChild(navigationContainer);
    card.appendChild(tournamentWizard);
    let currentStep = 1;
    nextButton.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentStep < 3) {
        showStep2(currentStep + 1);
      }
    });
    backButton.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentStep > 1) {
        showStep2(currentStep - 1);
      }
    });
    finishButton.addEventListener("click", async (e) => {
      e.preventDefault();
      if (mode === "tournament") {
        await createAndStartTournament();
      } else {
        await loadConfig(mode);
      }
    });
  } else {
    let showSingleStep2 = function(step) {
      document.querySelectorAll(".single-player-wizard .wizard-step").forEach((el) => {
        el.classList.add("hidden");
      });
      const stepElement = document.getElementById(`singleStep${step}`);
      if (stepElement) {
        stepElement.classList.remove("hidden");
      }
      singleBackButton.classList.toggle("hidden", step === 1);
      singleNextButton.classList.toggle("hidden", step === 2);
      singleFinishButton.classList.toggle("hidden", step !== 2);
      singleCurrentStep = step;
    };
    var showSingleStep = showSingleStep2;
    const singlePlayerWizard = Object.assign(document.createElement("div"), {
      className: "single-player-wizard"
    });
    const singleStep1Container = Object.assign(document.createElement("div"), {
      className: "wizard-step",
      id: "singleStep1"
    });
    const singleStep2Container = Object.assign(document.createElement("div"), {
      className: "wizard-step hidden",
      id: "singleStep2"
    });
    const singleNavigationContainer = Object.assign(document.createElement("div"), {
      className: "flex justify-between items-center mt-6"
    });
    const singleBackButton = Object.assign(document.createElement("button"), {
      className: "btn py-2 px-6 text-lg font-bold hidden",
      textContent: t("back") || "Back",
      id: "singleBackBtn"
    });
    const singleNextButton = Object.assign(document.createElement("button"), {
      className: "btn py-2 px-6 text-lg font-bold",
      textContent: t("next") || "Next",
      id: "singleNextBtn"
    });
    const singleFinishButton = Object.assign(document.createElement("button"), {
      className: "btn py-2 px-6 text-lg font-bold hidden",
      textContent: t("start") || "Start",
      id: "singleFinishBtn"
    });
    const singleStep1FlexContainer = Object.assign(document.createElement("div"), {
      className: "flex flex-col md:flex-row gap-4 justify-start items-stretch flex-wrap"
    });
    if (mode === "multi") {
      const player3Container = Object.assign(document.createElement("div"), {
        className: "flex-1 min-w-[300px]"
      });
      const player4Container = Object.assign(document.createElement("div"), {
        className: "flex-1 min-w-[300px]"
      });
      const player3List = Object.assign(document.createElement("ul"), {
        className: "list-none"
      });
      const player4List = Object.assign(document.createElement("ul"), {
        className: "list-none"
      });
      playerSetupMenu(
        player3List,
        "3",
        "Trillian Astra",
        true,
        "i",
        "k",
        "#ffffff",
        "#808080",
        "#ff0000"
      );
      playerSetupMenu(
        player4List,
        "4",
        "Zaphod Beeblebrox",
        true,
        "PageUp",
        "PageDown",
        "#ffffff",
        "#808080",
        "#ff0000"
      );
      player3Container.appendChild(player3List);
      player4Container.appendChild(player4List);
      singleStep1FlexContainer.appendChild(player1Container);
      singleStep1FlexContainer.appendChild(player2Container);
      singleStep1FlexContainer.appendChild(player3Container);
      singleStep1FlexContainer.appendChild(player4Container);
    } else {
      singleStep1FlexContainer.appendChild(player1Container);
      singleStep1FlexContainer.appendChild(player2Container);
    }
    singleStep1Container.appendChild(singleStep1FlexContainer);
    const singleStep2FlexContainer = Object.assign(document.createElement("div"), {
      className: "flex flex-col md:flex-row gap-4 justify-start items-stretch flex-wrap"
    });
    singleStep2FlexContainer.appendChild(settingsForm);
    singleStep2FlexContainer.appendChild(bgColorsForm);
    singleStep2Container.appendChild(singleStep2FlexContainer);
    singlePlayerWizard.appendChild(singleStep1Container);
    singlePlayerWizard.appendChild(singleStep2Container);
    singleNavigationContainer.appendChild(singleBackButton);
    singleNavigationContainer.appendChild(singleNextButton);
    singleNavigationContainer.appendChild(singleFinishButton);
    singlePlayerWizard.appendChild(singleNavigationContainer);
    card.appendChild(singlePlayerWizard);
    let singleCurrentStep = 1;
    singleNextButton.addEventListener("click", (e) => {
      e.preventDefault();
      if (singleCurrentStep < 2) {
        showSingleStep2(singleCurrentStep + 1);
      }
    });
    singleBackButton.addEventListener("click", (e) => {
      e.preventDefault();
      if (singleCurrentStep > 1) {
        showSingleStep2(singleCurrentStep - 1);
      }
    });
    singleFinishButton.addEventListener("click", (e) => {
      e.preventDefault();
      loadConfig(mode);
    });
  }
  window.addEventListener("resize", () => {
    const canvas = document.getElementById("board");
    if (canvas) {
      if (isFullscreen) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
      } else {
        const margin = 50;
        const availableHeight = window.innerHeight - margin;
        canvas.width = window.innerWidth;
        canvas.height = availableHeight;
        canvas.style.width = "100%";
        canvas.style.height = `${availableHeight}px`;
        canvas.style.maxWidth = "100%";
        canvas.style.maxHeight = `${availableHeight}px`;
        canvas.style.borderRadius = "0";
        canvas.style.display = "block";
      }
      if (data && data.canvas) {
        data.canvas = canvas;
        data.ctx = canvas.getContext("2d");
        data.paddleWidth = canvas.width / 60;
        data.paddleHeight = canvas.height / 5;
        data.bg = data.ctx.createLinearGradient(0, 0, canvas.width, 0);
        data.bg.addColorStop(0, data.outerBg);
        data.bg.addColorStop(0.5, data.innerBg);
        data.bg.addColorStop(1, data.outerBg);
        updatePaddlePositions();
      }
    }
  });
}
async function createAndStartTournament() {
  try {
    const playersNumber = parseInt(document.getElementById("playersNumber")?.value || "4");
    const players = [];
    for (let i = 1; i <= playersNumber; i++) {
      const playerIdInput = document.getElementById(`p${i}Id`);
      const playerNameInput = document.getElementById(`name_p${i}`);
      const playerAiInput = document.getElementById(`p${i}Ai`);
      const isAi = playerAiInput ? playerAiInput.checked : i > 1;
      if (isAi) {
        players.push("AI-Roger-Federror");
      } else {
        if (playerIdInput && playerIdInput.value) {
          players.push(playerIdInput.value);
        } else if (i === 1) {
          const urlParams2 = new URLSearchParams(window.location.search);
          const userId = urlParams2.get("userId") || playerNameInput?.value || "dvaisman";
          players.push(userId);
        } else {
          const name = playerNameInput?.value || `player${i}`;
          players.push(name);
        }
      }
    }
    console.log("Creating tournament with players:", players);
    console.log("Player details:");
    for (let i = 1; i <= playersNumber; i++) {
      const playerIdInput = document.getElementById(`p${i}Id`);
      const playerNameInput = document.getElementById(`name_p${i}`);
      const playerAiInput = document.getElementById(`p${i}Ai`);
      console.log(`Player ${i}:`, {
        id: playerIdInput?.value || "none",
        name: playerNameInput?.value || "none",
        isAi: playerAiInput?.checked || false,
        finalId: players[i - 1]
      });
    }
    console.log("First player data check:");
    const urlParams = new URLSearchParams(window.location.search);
    console.log("URL userId:", urlParams.get("userId"));
    console.log("URL username:", urlParams.get("username"));
    const playerIdToNameMap = {};
    for (let i = 1; i <= playersNumber; i++) {
      const playerIdInput = document.getElementById(`p${i}Id`);
      const playerNameInput = document.getElementById(`name_p${i}`);
      const playerAiInput = document.getElementById(`p${i}Ai`);
      const isAi = playerAiInput ? playerAiInput.checked : i > 1;
      const playerId = players[i - 1];
      const playerName = playerNameInput?.value || `Player ${i}`;
      if (!isAi) {
        playerIdToNameMap[playerId] = playerName;
      }
    }
    window.playerIdToNameMap = playerIdToNameMap;
    console.log("Player ID to Name mapping:", playerIdToNameMap);
    const tournamentData = {
      name: `Tournament_${Date.now()}`,
      // Use timestamp to make it unique
      playersIds: players
    };
    const tournament = await tournamentService.createTournament(tournamentData);
    if (!tournament || !tournament.id) {
      console.error("Failed to create tournament");
      alert("Failed to create tournament. Please try again.");
      return;
    }
    console.log("Tournament created successfully:", tournament.id);
    pendingTournamentId = tournament.id;
    await loadConfig("tournament");
    const success = await newTournamentGame(tournament.id);
    if (!success) {
      console.error("Failed to start tournament game");
      alert("Failed to start tournament game. Please try again.");
      return;
    }
  } catch (error) {
    console.error("Error creating tournament:", error);
    alert("Error creating tournament. Please try again.");
  }
}
async function loadConfig(mode) {
  const appDiv = document.getElementById("app");
  if (mode === "tournament") {
    if (!pendingTournamentId) {
      console.error("No tournament ID available");
      return;
    }
  }
  const scoreboard = Object.assign(document.createElement("div"), {
    className: "scoreboard w-full flex justify-between items-center"
  });
  const leftSide = Object.assign(document.createElement("div"), {
    className: "flex items-center"
  });
  const p1name = Object.assign(document.createElement("textarea"), {
    className: "p1name game-text",
    rows: "1",
    cols: "30",
    disabled: "true"
  });
  const p1score = Object.assign(document.createElement("textarea"), {
    className: "p1score game-text",
    rows: "1",
    cols: "2",
    disabled: "true"
  });
  leftSide.append(p1name, p1score);
  const center = Object.assign(document.createElement("span"), {
    className: "game-text",
    textContent: " : "
  });
  const rightSide = Object.assign(document.createElement("div"), {
    className: "flex items-center"
  });
  const p2score = Object.assign(document.createElement("textarea"), {
    className: "p2score game-text",
    rows: "1",
    cols: "2",
    disabled: "true"
  });
  const p2name = Object.assign(document.createElement("textarea"), {
    className: "p2name game-text",
    rows: "1",
    cols: "30",
    disabled: "true"
  });
  const fullscreenBtn = Object.assign(document.createElement("button"), {
    className: "fullscreen-btn game-text",
    textContent: "\u26F6",
    title: "Toggle Full Screen"
  });
  fullscreenBtn.addEventListener("click", toggleFullscreen);
  rightSide.append(p2score, p2name, fullscreenBtn);
  scoreboard.append(leftSide, center, rightSide);
  const canvas = Object.assign(document.createElement("canvas"), {
    id: "board",
    tabIndex: 1
  });
  const margin = 47;
  const availableHeight = window.innerHeight - margin;
  canvas.width = window.innerWidth;
  canvas.height = availableHeight;
  canvas.style.width = "100%";
  canvas.style.height = `${availableHeight}px`;
  canvas.style.maxWidth = "100%";
  canvas.style.maxHeight = `${availableHeight}px`;
  canvas.style.borderRadius = "0";
  canvas.style.display = "block";
  canvas.style.touchAction = "none";
  const ctx = canvas.getContext("2d");
  let touchStartY = 0;
  let touchStartX = 0;
  canvas.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchStartY = touch.clientY;
      touchStartX = touch.clientX;
    },
    { passive: false }
  );
  canvas.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      if (!data || !data.p) return;
      const touch = e.touches[0];
      const deltaY = touch.clientY - touchStartY;
      const deltaX = touch.clientX - touchStartX;
      const canvasRect = canvas.getBoundingClientRect();
      const touchX = touch.clientX - canvasRect.left;
      const isLeftSide = touchX < canvas.width / 2;
      if (isLeftSide && data.p[0]) {
        if (deltaY < -10) {
          data.keys[data.p[0].up] = true;
          data.keys[data.p[0].down] = false;
        } else if (deltaY > 10) {
          data.keys[data.p[0].down] = true;
          data.keys[data.p[0].up] = false;
        }
      } else if (!isLeftSide && data.p[1]) {
        if (deltaY < -10) {
          data.keys[data.p[1].up] = true;
          data.keys[data.p[1].down] = false;
        } else if (deltaY > 10) {
          data.keys[data.p[1].down] = true;
          data.keys[data.p[1].up] = false;
        }
      }
    },
    { passive: false }
  );
  canvas.addEventListener(
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
    { passive: false }
  );
  if (isMobile()) {
    setTimeout(async () => {
      try {
        await enterFullscreen();
      } catch (error) {
        console.log("Auto fullscreen failed, showing manual prompt:", error);
        showFullscreenPrompt();
      }
    }, 100);
  }
  var p = [];
  if (mode === "tournament") {
    const playersNumberInput = document.getElementById("playersNumber");
    const numPlayers = playersNumberInput ? parseInt(playersNumberInput.value) || 4 : 4;
    for (let i = 1; i <= numPlayers; i++) {
      let playerId = loadIn(`p${i}Id`);
      if (i === 1 && !playerId) {
        const urlParams = new URLSearchParams(window.location.search);
        playerId = urlParams.get("userId") || "";
      }
      p.push(
        loadPlayer(
          loadIn(`name_p${i}`),
          playerId,
          loadInB(`p${i}Ai`),
          loadIn(`p${i}Up`),
          loadIn(`p${i}Down`),
          loadIn(`p${i}InnerCol`),
          loadIn(`p${i}OuterCol`),
          loadIn(`p${i}CornerCol`)
        )
      );
    }
  } else {
    p.push(
      loadPlayer(
        loadIn("name_p1"),
        loadIn("p1Id"),
        // get user id from hidden input
        loadInB("p1Ai"),
        loadIn("p1Up"),
        loadIn("p1Down"),
        loadIn("p1InnerCol"),
        loadIn("p1OuterCol"),
        loadIn("p1CornerCol")
      )
    );
    p.push(
      loadPlayer(
        loadIn("name_p2"),
        loadIn("p2Id"),
        // get user ID from hidden input
        loadInB("p2Ai"),
        loadIn("p2Up"),
        loadIn("p2Down"),
        loadIn("p2InnerCol"),
        loadIn("p2OuterCol"),
        loadIn("p2CornerCol")
      )
    );
    if (mode === "multi") {
      p.push(
        loadPlayer(
          loadIn("name_p3"),
          "",
          //player ID
          loadInB("p3Ai"),
          loadIn("p3Up"),
          loadIn("p3Down"),
          loadIn("p3InnerCol"),
          loadIn("p3OuterCol"),
          loadIn("p3CornerCol")
        )
      );
      p.push(
        loadPlayer(
          loadIn("name_p4"),
          "",
          //player ID
          loadInB("p4Ai"),
          loadIn("p4Up"),
          loadIn("p4Down"),
          loadIn("p4InnerCol"),
          loadIn("p4OuterCol"),
          loadIn("p4CornerCol")
        )
      );
    }
  }
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
    maxScore: mode === "tournament" ? parseInt(loadIn("matchLength") || "5", 10) : 3,
    trailLength: 20,
    //parseInt(loadIn("trailLength") || "20", 10),
    bg: ctx.createLinearGradient(0, 0, canvas.width, 0),
    uiCol: loadIn("uiCol"),
    ballCol: loadIn("ballCol"),
    ballR: String(parseInt(loadIn("ballCol").slice(1, 3), 16)),
    ballG: String(parseInt(loadIn("ballCol").slice(3, 5), 16)),
    ballB: String(parseInt(loadIn("ballCol").slice(5, 7), 16)),
    outerBg: loadIn("outerBg") || "#000000",
    innerBg: loadIn("innerBg") || "#008000",
    serve: Math.floor(Math.random() * 2) ? -1 : 1,
    keys: {},
    showingText: false,
    gameID: "",
    tournamentID: "",
    go: false,
    touchControl: "ontouchstart" in window || navigator.maxTouchPoints > 0,
    mode: "twoPlayers",
    isTournament: false,
    multiball: loadInB("multiball"),
    maxHits: Math.floor(Math.random() * 5 + 5),
    hits: 0
  };
  loadData.scoreTB1.value = "0";
  loadData.scoreTB2.value = "0";
  if (mode === "tournament") {
    loadData.mode = "tournament";
    loadData.isTournament = true;
    loadData.nameTB1.value = p[0]?.name || "Player 1";
    loadData.nameTB2.value = p[1]?.name || "Player 2";
  } else if (mode === "multi") {
    loadData.mode = "multi";
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
  if (pendingTournamentId) {
    data.tournamentId = pendingTournamentId;
    pendingTournamentId = null;
  }
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
  if (mode !== "tournament") {
    setTimeout(() => countdown(3, 500), 500);
  }
}
var data, pendingTournamentId, isFullscreen;
var init_gameData = __esm({
  "src/gameData.ts"() {
    "use strict";
    init_controls();
    init_pong();
    init_menus();
    init_i18n();
    init_tournamentGame();
    init_tournamentService();
    pendingTournamentId = null;
    isFullscreen = false;
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
  }
});

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
  const arrowSize = data.canvas.height / 6;
  data.ctx.globalAlpha = 0.5;
  data.ctx.fillStyle = "rgb(50 50 50 / 50%)";
  data.ctx.font = `bold ${data.canvas.height / 4}px system-ui`;
  for (let i = 0; i < pad.length; i++) {
    if (i == 0 && !pad[i].isAi()) {
      data.ctx.textBaseline = "top";
      data.ctx.textAlign = "left";
      data.ctx.drawImage(upImg, data.canvas.width / 16 - arrowSize / 2, 0, arrowSize, arrowSize);
      data.ctx.textBaseline = "bottom";
      data.ctx.drawImage(downImg, data.canvas.width / 16 - arrowSize / 2, data.canvas.height - arrowSize, arrowSize, arrowSize);
    }
    if (data.mode === "single") {
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
var upImg, downImg;
var init_Paddle_draw = __esm({
  "src/Paddle.draw.ts"() {
    "use strict";
    init_gameData();
    init_i18n();
    init_pong();
    upImg = new Image();
    upImg.src = "img/up_arrow.svg";
    downImg = new Image();
    downImg.src = "img/down_arrow.svg";
  }
});

// src/Paddle.ts
var Paddle;
var init_Paddle = __esm({
  "src/Paddle.ts"() {
    "use strict";
    init_gameData();
    init_pong();
    init_Paddle_draw();
    Paddle = class {
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
      setX(x) {
        this._x = x;
      }
      setY(y) {
        this._y = y;
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
  }
});

// src/Ball.ts
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
var Ball;
var init_Ball = __esm({
  "src/Ball.ts"() {
    "use strict";
    init_Paddle_draw();
    init_gameData();
    init_pong();
    Ball = class {
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
  }
});

// src/services/gameService.ts
var GameService, gameService;
var init_gameService = __esm({
  "src/services/gameService.ts"() {
    "use strict";
    GameService = class {
      constructor() {
        this.baseUrl = "/api/pong";
      }
      async createGame(data2) {
        try {
          const response = await fetch(`${this.baseUrl}/games`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: data2 })
          });
          return response.ok;
        } catch (error) {
          console.error("Error finishing game:", error);
          return false;
        }
      }
      async finishGame(data2) {
        try {
          const response = await fetch(`${this.baseUrl}/games`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: data2 })
          });
          if (!response.ok) {
            console.error("Error finishing game: Response not OK");
            return null;
          }
          const gameResponse = await response.json();
          return gameResponse;
        } catch (error) {
          console.error("Error finishing game:", error);
          return null;
        }
      }
    };
    gameService = new GameService();
  }
});

// src/pong.ts
var pong_exports = {};
__export(pong_exports, {
  balls: () => balls,
  countdown: () => countdown,
  endGame: () => endGame,
  endRound: () => endRound,
  finito: () => finito,
  pad: () => pad,
  removeBall: () => removeBall,
  startGame: () => startGame,
  startRound: () => startRound
});
function removeBall(ball) {
  let shrunk = [];
  for (let i = 0; i < balls.length; i++)
    if (balls[i] != ball) shrunk.push(balls[i]);
  balls = shrunk;
}
async function startGame() {
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
  data.ctx.strokeText(
    String(nr),
    data.canvas.width / 2,
    data.canvas.height / 2
  );
  data.ctx.fillText(String(nr), data.canvas.width / 2, data.canvas.height / 2);
  if (nr - 1) setTimeout(() => countdown(nr - 1, ms), ms);
  else setTimeout(() => startRound(), ms);
}
function startRound() {
  initBoard();
  pad[0].go();
  pad[1].go();
  if (data.mode == "multi" || data.mode == "doublePaddle") pad[2].go();
  if (data.mode == "multi" || data.mode == "doublePaddle") pad[3].go();
  if (data.mode == "tournament") {
  }
  balls[0].go();
  data.go = true;
  window.requestAnimationFrame(loop);
}
function initBoard() {
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
  if (data.trailLength)
    for (let i = 0; i < balls.length; i++) balls[i].drawTrail();
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
  if (data.p[0].score >= data.maxScore || data.p[1].score >= data.maxScore) {
    if (data.isTournament) {
      finito();
    } else {
      endGame();
    }
    return;
  }
  if (data.p[0].score < data.maxScore && data.p[1].score < data.maxScore) {
    setTimeout(startRound, 1500);
  }
}
async function finito() {
  let winnerId;
  if (data.p[0].score > data.p[1].score) {
    winnerId = data.p[0].id;
  } else {
    winnerId = data.p[1].id;
  }
  const gameData = {
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
    //false in single mode
    tournamentId: data.tournamentId,
    // null in case of single game
    tournamentRound: data.tournamentRound,
    //null in case of single game
    tournamentMatch: data.tournamentMatch,
    //null in case of single game
    winnerId
  };
  const result = await gameService.finishGame(gameData);
  if (!result) {
    console.error("Failed to finish game on server");
    return;
  }
  console.log("Game data successfully sent to server");
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
async function endGame() {
  var winner;
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
  if (isMobile2()) {
    showExitButton(winner);
  } else {
    if (data.isTournament && data.tournamentId) {
      console.log("Tournament mode: not auto-exiting, waiting for transition window");
    } else {
      setTimeout(() => {
        exitGameMessage(winner);
      }, 3e3);
    }
  }
}
function exitGameMessage(winner) {
  window.parent.postMessage(
    {
      type: "EXIT_GAME",
      winner
    },
    window.location.origin
  );
}
function isMobile2() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth <= 768 && window.innerHeight <= 1024;
}
function showExitButton(winner) {
  const exitOverlay = document.createElement("div");
  exitOverlay.className = "fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-[10000]";
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
  const exitBtn = document.getElementById("exit-game-btn");
  if (exitBtn) {
    exitBtn.addEventListener("click", () => {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      exitGameMessage(winner);
      document.body.removeChild(exitOverlay);
    });
  }
}
var pad, balls;
var init_pong = __esm({
  "src/pong.ts"() {
    init_gameData();
    init_Paddle();
    init_Ball();
    init_Paddle_draw();
    init_i18n();
    init_gameService();
    init_tournamentGame();
    pad = [];
    balls = [];
    startGame();
  }
});
init_pong();
export {
  balls,
  countdown,
  endGame,
  endRound,
  finito,
  pad,
  removeBall,
  startGame,
  startRound
};
