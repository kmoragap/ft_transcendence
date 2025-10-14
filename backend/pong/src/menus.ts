import { t } from "./i18n";
import { allPlayerData } from "./wizard";

let currentGameMode: string = "single";

const AI_NAMES = [
  "Roger Federror",
  "Boolena Williams", 
  "Boris Backend",
  "Steffi Graph",
  "Array Agassi",
  "Maria Charapova",
  "Novak Breaković",
  "Rafael Nodal",
  "Serena Williams",
  "Andy Murray",
  "Venus Williams",
  "Pete Sampras",
  "Steffi Graf",
  "Bjorn Borg",
  "Martina Navratilova",
  "John McEnroe"
];

function getAvailableAIName(excludePlayerId?: string): string {
  const usedNames = new Set<string>();
  
  const allNameInputs = document.querySelectorAll('input[id*="name_p"]') as NodeListOf<HTMLInputElement>;
  for (const input of allNameInputs) {
    const playerId = input.id.match(/name_p(\d+)/)?.[1];
    if (playerId && playerId !== excludePlayerId) {
      usedNames.add(input.value);
    }
  }
  
  for (const aiName of AI_NAMES) {
    if (!usedNames.has(aiName)) {
      return aiName;
    }
  }
  
  return `AI Player ${Date.now().toString().slice(-3)}`;
}

function createKeyCaptureInput(id: string, initialValue: string): HTMLInputElement {
  const input = Object.assign(document.createElement("input"), {
    className: "custom-input px-1 py-1 ml-1 key-capture-input",
    type: "text",
    size: "9",
    id: id,
    value: initialValue,
    readonly: true,
    placeholder: "Press any key..."
  }) as HTMLInputElement;

  input.addEventListener("focus", () => {
    input.value = "Press any key...";
    input.style.backgroundColor = "rgba(102,252,241,0.2)";
  });

  input.addEventListener("blur", () => {
    input.style.backgroundColor = "";
  });

  input.addEventListener("keydown", (event) => {
    event.preventDefault();
    
    let keyName = event.key;
    
    if (event.key === " ") {
      keyName = "Space";
    } else if (event.key === "Meta") {
      keyName = "Cmd";
    }
    
    if (keyName === "Control" || keyName === "Shift" || keyName === "Alt" || keyName === "Meta" || keyName === "Cmd") {
      showKeyRestrictedWarning(keyName);
      input.style.backgroundColor = "rgba(255,0,0,0.2)";
      setTimeout(() => {
        input.style.backgroundColor = "";
      }, 500);
      return;
    }
    
    if (checkKeyConflict(id, keyName)) {
      input.style.backgroundColor = "rgba(255,0,0,0.2)";
      setTimeout(() => {
        input.style.backgroundColor = "";
      }, 500);
      return;
    }
    
    input.value = keyName;
    input.style.backgroundColor = "rgba(0,255,0,0.2)";
    
    setTimeout(() => {
      input.style.backgroundColor = "";
    }, 300);
    
    input.blur();
    
    const playerKeyMatch = id.match(/^p(\d+)(Up|Down)$/);
    if (playerKeyMatch && allPlayerData) {
      const playerIndex = parseInt(playerKeyMatch[1]) - 1;
      const direction = playerKeyMatch[2].toLowerCase() as 'up' | 'down';
      
      if (allPlayerData[playerIndex]) {
        if (!allPlayerData[playerIndex].keys) {
          allPlayerData[playerIndex].keys = { up: '', down: '' };
        }
        allPlayerData[playerIndex].keys[direction] = keyName;
      }
    }
  });

  return input;
}

function checkKeyConflict(currentInputId: string, newKeyName: string): boolean {
  const isTournament = currentGameMode === "tournament";
  
  if (isTournament) {
    if (currentInputId.includes("tournament")) {
      return false;
    }
    console.warn("Individual player key conflict check in tournament mode - this shouldn't happen");
  }
  
  const allKeyInputs = document.querySelectorAll('input[id*="Up"], input[id*="Down"]') as NodeListOf<HTMLInputElement>;
  
  for (const input of allKeyInputs) {
    if (input.id === currentInputId) continue;
    
    if (input.value === newKeyName) {
      showKeyConflictWarning(input.id, newKeyName);
      return true;
    }
  }
  
  return false;
}

function showKeyConflictWarning(conflictingInputId: string, keyName: string): void {
  const warning = document.createElement("div");
  warning.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 0, 0, 0.9);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    font-family: 'jura', sans-serif;
    font-weight: bold;
    z-index: 10000;
    box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
  `;
  warning.textContent = `Key "${keyName}" is already used by ${getPlayerNameFromInputId(conflictingInputId)}`;
  
  document.body.appendChild(warning);
  
  setTimeout(() => {
    if (warning.parentNode) {
      warning.parentNode.removeChild(warning);
    }
  }, 2000);
}

function showAINameWarning(aiName: string): void {
  const warning = document.createElement("div");
  warning.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 0, 0, 0.9);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    font-family: 'jura', sans-serif;
    font-weight: bold;
    z-index: 10000;
    box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
  `;
  warning.textContent = `Name "${aiName}" is reserved for AI players`;
  
  document.body.appendChild(warning);
  
  setTimeout(() => {
    if (warning.parentNode) {
      warning.parentNode.removeChild(warning);
    }
  }, 2000);
}

function showKeyRestrictedWarning(keyName: string): void {
  const warning = document.createElement("div");
  warning.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 0, 0, 0.9);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    font-family: 'jura', sans-serif;
    font-weight: bold;
    z-index: 10000;
    box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
  `;
  warning.textContent = `"${keyName}" key is restricted (interferes with browser shortcuts)`;
  
  document.body.appendChild(warning);
  
  setTimeout(() => {
    if (warning.parentNode) {
      warning.parentNode.removeChild(warning);
    }
  }, 2000);
}

function getPlayerNameFromInputId(inputId: string): string {
  const match = inputId.match(/p(\d+)/);
  if (match) {
    const playerNum = match[1];
    return `Player ${playerNum}`;
  }
  return "another player";
}

let savedPlayerData: Record<string, any> = {};

function savePlayerData(playerId: string): void {
  const nameInput = document.getElementById(`name_p${playerId}`) as HTMLInputElement;
  const idInput = document.getElementById(`p${playerId}Id`) as HTMLInputElement;
  const aiCheckbox = document.getElementById(`p${playerId}Ai`) as HTMLInputElement;
  
  if (nameInput || idInput || aiCheckbox) {
    savedPlayerData[playerId] = {
      name: nameInput?.value || "",
      id: idInput?.value || "",
      isAi: aiCheckbox?.checked || false,
      loggedInUsername: savedPlayerData[playerId]?.loggedInUsername || "", // Preserve the actual logged-in username
    };
  }
}

function restorePlayerData(playerId: string, nameInput: HTMLInputElement, idInput: HTMLInputElement, aiCheckbox: HTMLInputElement): void {
  const saved = savedPlayerData[playerId];
  if (saved && saved.name) {
    nameInput.value = saved.name;
    idInput.value = saved.id;
    aiCheckbox.checked = saved.isAi;
  }
}

window.addEventListener("message", event => {
  if (event.origin !== window.location.origin) {
    return;
  }

  if (event.data.type === "LOGIN_SUCCESS") {
    const { playerId, playerName, username, userData } = event.data;
    
    const nameInput = document.getElementById(playerName) as HTMLInputElement;
    if (nameInput) {
      nameInput.value = username;
    }

    const idInput = document.getElementById(
      `p${playerId}Id`
    ) as HTMLInputElement;
    if (idInput && userData?.id) {
      idInput.value = userData.id;
    }
    
    const aiCheckbox = document.getElementById(`p${playerId}Ai`) as HTMLInputElement;
    if (aiCheckbox) {
      aiCheckbox.checked = false;
    }

    if (savedPlayerData[playerId]) {
      savedPlayerData[playerId].name = username;
      savedPlayerData[playerId].id = userData?.id || "";
      savedPlayerData[playerId].isAi = false;
      savedPlayerData[playerId].loggedInUsername = username;
    }
    
    const playerIdx = parseInt(playerId) - 1;
    if (allPlayerData && allPlayerData[playerIdx]) {
      allPlayerData[playerIdx].name = username;
      allPlayerData[playerIdx].id = userData?.id || "";
      allPlayerData[playerIdx].isAi = false;
    }

    if (playerId === "2") {
      (window as any).gamePlayer2 = {
        id: userData?.id,
        username: username,
        userData: userData,
        loggedIn: true,
      };
    }
  } else if (event.data.type === "LOGIN_CANCELLED") {
    const { playerId } = event.data;
    
    const hasSavedData = savedPlayerData[playerId] && savedPlayerData[playerId].id;
    
    if (!hasSavedData) {
      const aiCheckbox = document.getElementById(
        `p${playerId}Ai`
      ) as HTMLInputElement;
      if (aiCheckbox) {
        aiCheckbox.checked = true;
      }
    }
  } else if (event.data.type === "CLEAR_PLAYER2_DATA") {
    (window as any).gamePlayer2 = null;
  }
});

export function tournamentSetupMenu(): {
  form: HTMLDivElement;
} {
  const settings = Object.assign(document.createElement("form"), {
    id: "tournamentSettings",
    className: "editBox flex flex-col p-2 md:p-4 min-h-[300px]",
  }) as HTMLFormElement;
  
  const row1 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2",
  }) as HTMLDivElement;
  const row2 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2",
  }) as HTMLDivElement;
  
  // Number of rounds
  const matchLengthLabel = Object.assign(document.createElement("label"), {
    className: "game-text text-sm md:text-base",
    htmlFor: "matchLength",
    textContent: `${t("matchLength")}: `,
  }) as HTMLLabelElement;
  const matchLengthInput = Object.assign(document.createElement("select"), {
    className: "custom-input px-1 py-1 text-sm md:text-base",
    id: "matchLength",
    name: "matchLength",
  }) as HTMLSelectElement;
  [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(length => {
    const option = document.createElement("option");
    option.value = length.toString();
    option.textContent = length.toString();
    if (length === 3) {
      option.selected = true;
    }
    matchLengthInput.appendChild(option);
  });

  // Number of players
  const playersNumberLabel = Object.assign(document.createElement("label"), {
    className: "game-text text-sm md:text-base",
    htmlFor: "playersNumber",
    textContent: `${t("numberOfPlayers")}: `,
  }) as HTMLLabelElement;

  const playersNumberInput = Object.assign(document.createElement("select"), {
    className: "custom-input px-1 py-1 text-sm md:text-base",
    id: "playersNumber",
    name: "playersNumber",
  }) as HTMLSelectElement;
  [4, 8].forEach(num => {
    const option = document.createElement("option");
    option.value = num.toString();
    option.textContent = num.toString();
    if (num === 4) {
      option.selected = true;
    }
    playersNumberInput.appendChild(option);
  });
  
  const controlsTitle = Object.assign(document.createElement("h3"), {
    className: "game-text font-bold mt-4 mb-2 text-center",
    textContent: "Match Controls",
  }) as HTMLHeadingElement;
  
  const row3 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2",
  }) as HTMLDivElement;
  
  const leftUpLabel = Object.assign(document.createElement("label"), {
    className: "game-text text-sm md:text-base",
    htmlFor: "tournamentLeftUp",
    textContent: `Left Player ${t("up")}: `,
  }) as HTMLLabelElement;
  
  const leftUpInput = createKeyCaptureInput("tournamentLeftUp", "w");
  
  const row4 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-3",
  }) as HTMLDivElement;
  
  const leftDownLabel = Object.assign(document.createElement("label"), {
    className: "game-text text-sm md:text-base",
    htmlFor: "tournamentLeftDown",
    textContent: `Left Player ${t("down")}: `,
  }) as HTMLLabelElement;
  
  const leftDownInput = createKeyCaptureInput("tournamentLeftDown", "s");
  
  const row5 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-3",
  }) as HTMLDivElement;
  
  const rightUpLabel = Object.assign(document.createElement("label"), {
    className: "game-text text-sm md:text-base",
    htmlFor: "tournamentRightUp",
    textContent: `Right Player ${t("up")}: `,
  }) as HTMLLabelElement;
  
  const rightUpInput = createKeyCaptureInput("tournamentRightUp", "ArrowUp");
  
  const row6 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2",
  }) as HTMLDivElement;
  
  const rightDownLabel = Object.assign(document.createElement("label"), {
    className: "game-text text-sm md:text-base",
    htmlFor: "tournamentRightDown",
    textContent: `Right Player ${t("down")}: `,
  }) as HTMLLabelElement;
  
  const rightDownInput = createKeyCaptureInput("tournamentRightDown", "ArrowDown");
  
  // Add elements to rows
  row1.appendChild(playersNumberLabel);
  row1.appendChild(playersNumberInput);
  row2.appendChild(matchLengthLabel);
  row2.appendChild(matchLengthInput);
  row3.appendChild(leftUpLabel);
  row3.appendChild(leftUpInput);
  row4.appendChild(leftDownLabel);
  row4.appendChild(leftDownInput);
  row5.appendChild(rightUpLabel);
  row5.appendChild(rightUpInput);
  row6.appendChild(rightDownLabel);
  row6.appendChild(rightDownInput);
  
  // Add rows to settings form
  settings.appendChild(row1);
  settings.appendChild(row2);
  settings.appendChild(controlsTitle);
  settings.appendChild(row3);
  settings.appendChild(row4);
  settings.appendChild(row5);
  settings.appendChild(row6);
  
  // Create container
  const container = Object.assign(document.createElement("div"), {
    className: "tournament-setup-container",
  }) as HTMLDivElement;
  container.appendChild(settings);
  
  return { form: container };
}

export function setGameMode(mode: string): void {
  currentGameMode = mode;
}

export function clearSavedPlayerData(): void {
  savedPlayerData = {};
  (window as any).gamePlayer2 = null;
}

export function playerSetupMenu(
  list: HTMLUListElement,
  p: string,
  name: string,
  isAi: boolean,
  up: string,
  down: string,
  c1: string,
  c2: string,
  c3: string
) {
  if (!savedPlayerData[p]) {
    savedPlayerData[p] = {
      name: name,
      id: "",
      isAi: isAi,
      loggedInUsername: "",
    };
  }
  
  const idInput = Object.assign(document.createElement("input"), {
    type: "hidden",
    id: `p${p}Id`,
    name: `p${p}Id`,
    value: "",
  }) as HTMLInputElement;
  list.appendChild(idInput);
  const form = Object.assign(document.createElement("form"), {
    id: `player${p}Menu`,
    className: `editBox h-full flex flex-col`,
  }) as HTMLFormElement;
  const e1 = Object.assign(document.createElement("label"), {
    className: "game-text",
    for: `name_p${p}`,
    textContent: `${t("player")} ${p}: `,
  }) as HTMLLabelElement;
  const e2 = Object.assign(document.createElement("input"), {
    className: "custom-input ml-1 px-1 py-1",
    size: "16",
    id: `name_p${p}`,
    name: `name_p${p}`,
    value: name,
  }) as HTMLInputElement;
  
  e2.addEventListener("blur", () => {
    const aiCheckbox = document.getElementById(`p${p}Ai`) as HTMLInputElement;
    if (!aiCheckbox?.checked && AI_NAMES.includes(e2.value)) {
      showAINameWarning(e2.value);
      e2.value = savedPlayerData[p]?.name || `Player ${p}`;
    }
  });
  
  const e3 = Object.assign(document.createElement("label"), {
    className: "game-text",
    for: `p${p}Ai`,
    textContent: "AI",
  }) as HTMLLabelElement;
  const e4 = Object.assign(document.createElement("input"), {
    type: "checkbox",
    id: `p${p}Ai`,
    name: `p${p}Ai`,
    checked: isAi,
    className: "ml-1",
  }) as HTMLInputElement;
  e4.addEventListener("change", event => {
    const target = event.target as HTMLInputElement;
    
    
    if (!target.checked) {
      window.parent.postMessage(
        {
          type: "REQUEST_LOGIN",
          playerId: p,
          playerName: `name_p${p}`,
        },
        window.location.origin
      );
    } else {
      const nameInput = document.getElementById(`name_p${p}`) as HTMLInputElement;
      const idInput = document.getElementById(`p${p}Id`) as HTMLInputElement;
      
      if (nameInput) {
        const aiName = getAvailableAIName(p);
        nameInput.value = aiName;
      }
      
      if (idInput) {
        idInput.value = "";
      }
      
      if (p === "2") {
        (window as any).gamePlayer2 = null;
      }
      
      const actualLoggedInUsername = savedPlayerData[p]?.loggedInUsername || "";
      
      if (savedPlayerData[p]) {
        savedPlayerData[p].name = nameInput?.value || `AI-${t("player")}-${p}`;
        savedPlayerData[p].id = "";
        savedPlayerData[p].isAi = true;
        savedPlayerData[p].loggedInUsername = ""; // Clear the logged-in username
      }
      
      if (actualLoggedInUsername) {
        window.parent.postMessage(
          {
            type: "PLAYER_LOGOUT",
            playerId: p,
            username: actualLoggedInUsername,
          },
          window.location.origin
        );
      }
    }
  });
  //keys
  const e5 = Object.assign(document.createElement("label"), {
    className: currentGameMode === "tournament" ? "game-text hidden" : "game-text",
    for: `p${p}Up`,
    textContent: `${t("up")}: `,
  }) as HTMLLabelElement;
  const e6 = createKeyCaptureInput(`p${p}Up`, up);
  if (currentGameMode === "tournament") {
    e6.classList.add("hidden");
  }
  const e7 = Object.assign(document.createElement("label"), {
    className: currentGameMode === "tournament" ? "game-text hidden" : "game-text",
    for: `p${p}Down`,
    textContent: `${t("down")}: `,
  }) as HTMLLabelElement;
  const e8 = createKeyCaptureInput(`p${p}Down`, down);
  if (currentGameMode === "tournament") {
    e8.classList.add("hidden");
  }
  //colors
  const e9 = Object.assign(document.createElement("input"), {
    className: "game-text",
    type: "color",
    id: `p${p}InnerCol`,
    name: `p${p}InnerCol`,
    value: c1,
  }) as HTMLInputElement;
  const e10 = Object.assign(document.createElement("label"), {
    className: "game-text",
    for: ` p${p}InnerCol`,
    textContent: `${t("innerColor")}`,
  }) as HTMLLabelElement;
  const e11 = Object.assign(document.createElement("input"), {
    className: "game-text",
    type: "color",
    id: `p${p}OuterCol`,
    name: `p${p}OuterCol`,
    value: c2,
  }) as HTMLInputElement;
  const e12 = Object.assign(document.createElement("label"), {
    className: "game-text",
    for: ` p${p}OuterCol`,
    textContent: `${t("outerColor")}`,
  }) as HTMLLabelElement;
  const e13 = Object.assign(document.createElement("input"), {
    className: "game-text",
    type: "color",
    id: `p${p}CornerCol`,
    name: `p${p}CornerCol`,
    value: c3,
  }) as HTMLInputElement;
  const e14 = Object.assign(document.createElement("label"), {
    className: "game-text",
    for: ` p${p}CornerCol`,
    textContent: `${t("cornerColor")}`,
  }) as HTMLLabelElement;

  // Create row containers for each label-input pair
  const nameRow = Object.assign(document.createElement("div"), {
    className: "flex w-full justify-between items-center mb-2",
  }) as HTMLDivElement;
  const keysRow = Object.assign(document.createElement("div"), {
    className: currentGameMode === "tournament" ? "flex w-full justify-between items-center mb-2 hidden" : "flex w-full justify-between items-center mb-2",
  }) as HTMLDivElement;
  const innerColRow = Object.assign(document.createElement("div"), {
    className: "flex w-full justify-between items-center mb-2",
  }) as HTMLDivElement;
  const outerColRow = Object.assign(document.createElement("div"), {
    className: "flex w-full justify-between items-center mb-2",
  }) as HTMLDivElement;
  const cornerColRow = Object.assign(document.createElement("div"), {
    className: "flex w-full justify-between items-center mb-2",
  }) as HTMLDivElement;

  // Populate rows
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

  // Add rows to form
  form.appendChild(nameRow);
  form.appendChild(keysRow);
  form.appendChild(innerColRow);
  form.appendChild(outerColRow);
  form.appendChild(cornerColRow);

  const ul = document.createElement("li");
  ul.appendChild(form);
  list.appendChild(ul);
  
  restorePlayerData(p, e2, idInput, e4);
}

export function gameSetupMenu(mode: string): {
  form: HTMLDivElement;
  startButton: HTMLInputElement;
} {
  const settings = Object.assign(document.createElement("form"), {
    id: "settings",
    className: "editBox flex flex-col p-2 md:p-4 flex-1 min-h-[300px]",
  }) as HTMLFormElement;
  const bgColors = Object.assign(document.createElement("form"), {
    id: "bgColors",
    className: "editBox flex flex-col p-2 md:p-4 flex-1 min-h-[300px]",
  }) as HTMLFormElement;
  //paddle speed
  const e3 = Object.assign(document.createElement("label"), {
    className: "game-text text-sm md:text-base",
    htmlFor: "paddleSpeed",
    textContent: `${t("paddleSpeed")}`,
  }) as HTMLLabelElement;
  const e1 = Object.assign(document.createElement("select"), {
    name: "paddleSpeed",
    id: "paddleSpeed",
    className: "custom-select px-1 py-1 text-sm md:text-base",
  }) as HTMLSelectElement;
  const e2 = [
    { value: "glacial", text: `${t("glacial")}` },
    { value: "slow", text: `${t("slow")}` },
    { value: "standard", text: `${t("standard")}`, selected: true },
    { value: "fast", text: `${t("fast")}` },
    { value: "insane", text: `${t("insane")}` },
  ];
  e2.forEach(option => {
    const opt = Object.assign(document.createElement("option"), {
      value: option.value,
      textContent: option.text,
    }) as HTMLOptionElement;
    if (option.selected) opt.selected = true;
    e1.appendChild(opt);
  });
  //ball speed
  const e6 = Object.assign(document.createElement("label"), {
    className: "game-text text-sm md:text-base",
    htmlFor: "ballSpeed",
    textContent: `${t("ballSpeed")}`,
  }) as HTMLLabelElement;
  const e4 = Object.assign(document.createElement("select"), {
    name: "ballSpeed",
    id: "ballSpeed",
    className: "custom-select px-1 py-1 text-sm md:text-base",
  }) as HTMLSelectElement;
  const e5 = [
    { value: "glacial", text: `${t("glacial")}` },
    { value: "slow", text: `${t("slow")}` },
    { value: "standard", text: `${t("standard")}`, selected: true },
    { value: "fast", text: `${t("fast")}` },
    { value: "insane", text: `${t("insane")}` },
  ];
  e5.forEach(option => {
    const opt = Object.assign(document.createElement("option"), {
      value: option.value,
      textContent: option.text,
    }) as HTMLOptionElement;
    if (option.selected) opt.selected = true;
    e4.appendChild(opt);
  });
  //ball size
  const e9 = Object.assign(document.createElement("label"), {
    className: "game-text text-sm md:text-base",
    htmlFor: "ballSize",
    textContent: `${t("ballSize")}`,
  }) as HTMLLabelElement;
  const e7 = Object.assign(document.createElement("select"), {
    name: "ballSize",
    id: "ballSize",
    className: "custom-select px-1 py-1 text-sm md:text-base",
    style: { width: "20px" },
  }) as HTMLSelectElement;
  const e8 = [
    { value: "tiny", text: `${t("tiny")}` },
    { value: "small", text: `${t("small")}` },
    { value: "normal", text: `${t("normal")}`, selected: true },
    { value: "big", text: `${t("big")}` },
    { value: "huge", text: `${t("huge")}` },
  ];
  e8.forEach(option => {
    const opt = Object.assign(document.createElement("option"), {
      value: option.value,
      textContent: option.text,
    }) as HTMLOptionElement;
    if (option.selected) opt.selected = true;
    e7.appendChild(opt);
  });
  const e10 = Object.assign(document.createElement("input"), {
    type: "checkbox",
    id: "multiball",
    name: "multiball",
    checked: false,
  }) as HTMLInputElement;
  const e11 = Object.assign(document.createElement("label"), {
    className: "game-text",
    htmlFor: "multiball",
    textContent: ` ${t("multiball")}`,
  }) as HTMLLabelElement;
  const e12 = Object.assign(document.createElement("input"), {
    type: "checkbox",
    id: "doublePaddle",
    name: "doublePaddle",
    checked: false,
  }) as HTMLInputElement;
  const e13 = Object.assign(document.createElement("label"), {
    className: "game-text",
    htmlFor: "doublePaddle",
    textContent: ` ${t("doublePaddle")}`,
  }) as HTMLLabelElement;
  const e14 = Object.assign(document.createElement("input"), {
    className: "game-text",
    type: "color",
    id: "uiCol",
    name: "uiCol",
    value: "#ffffff",
  }) as HTMLInputElement;
  const e15 = Object.assign(document.createElement("label"), {
    className: "game-text",
    for: "uiCol",
    textContent: ` ${t("uiCol")}`,
  }) as HTMLLabelElement;
  const e16 = Object.assign(document.createElement("input"), {
    className: "game-text",
    type: "color",
    id: "ballCol",
    name: "ballCol",
    value: "#0000ff",
  }) as HTMLInputElement;
  const e17 = Object.assign(document.createElement("label"), {
    className: "game-text",
    for: "ballCol",
    textContent: ` ${t("ballCol")}`,
  }) as HTMLLabelElement;
  const e18 = Object.assign(document.createElement("input"), {
    className: "game-text",
    type: "color",
    id: "innerBg",
    name: "innerBg",
    value: "#1a4d4d",
  }) as HTMLInputElement;
  const e19 = Object.assign(document.createElement("label"), {
    className: "game-text",
    for: "innerBg",
    textContent: ` ${t("innerBg")}`,
  }) as HTMLLabelElement;
  const e20 = Object.assign(document.createElement("input"), {
    className: "game-text",
    type: "color",
    id: "outerBg",
    name: "outerBg",
    value: "#001a1a",
  }) as HTMLInputElement;
  const e21 = Object.assign(document.createElement("label"), {
    className: "game-text",
    for: "outerBg",
    textContent: ` ${t("outerBg")}`,
  }) as HTMLLabelElement;
  const e22 = Object.assign(document.createElement("input"), {
    type: "submit",
    className:
      "btn w-auto py-2 md:py-1.5 px-6 md:px-8 m-0 text-base md:text-lg font-bold w-25 cursor-pointer",
    value: `${t("start")}`,
  });
  const row1 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2",
  }) as HTMLDivElement;
  const row2 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2",
  }) as HTMLDivElement;
  const row3 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2",
  }) as HTMLDivElement;
  const row4 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2",
  }) as HTMLDivElement;
  const row5 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2",
  }) as HTMLDivElement;

  const colorRow1 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2",
  }) as HTMLDivElement;
  const colorRow2 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2",
  }) as HTMLDivElement;
  const colorRow3 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2",
  }) as HTMLDivElement;
  const colorRow4 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2",
  }) as HTMLDivElement;


  row1.appendChild(e3);
  row1.appendChild(e1);
  row2.appendChild(e6);
  row2.appendChild(e4);
  row3.appendChild(e9);
  row3.appendChild(e7);
  
  if (mode !== "tournament") {
    row4.appendChild(e11);
    row4.appendChild(e10);
  }
  
  if (mode === "single") {
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
  
  if (mode !== "tournament") {
    settings.appendChild(row4);
  }
  
  if (mode === "single" || mode === "multi") {
    settings.appendChild(row5);
  }

  bgColors.appendChild(colorRow1);
  bgColors.appendChild(colorRow2);
  bgColors.appendChild(colorRow3);
  bgColors.appendChild(colorRow4);

  const container = Object.assign(document.createElement("div"), {
    className: "game-setup-container",
  }) as HTMLDivElement;
  const ul = Object.assign(document.createElement("ul"), {
    id: "gameSetup",
    className:
      "flex flex-col md:flex-row gap-4 justify-between items-stretch list-none",
  }) as HTMLUListElement;
  ul.appendChild(settings);
  ul.appendChild(bgColors);
  container.appendChild(ul);


  return { form: container, startButton: e22 };
}
