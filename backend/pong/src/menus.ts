import { t } from "./i18n";

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
  if (saved) {
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

    if (savedPlayerData[playerId]) {
      savedPlayerData[playerId].name = username;
      savedPlayerData[playerId].id = userData?.id || "";
      savedPlayerData[playerId].isAi = false;
      savedPlayerData[playerId].loggedInUsername = username; // Store the actual logged-in username
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
    const aiCheckbox = document.getElementById(
      `p${playerId}Ai`
    ) as HTMLInputElement;
    if (aiCheckbox) {
      aiCheckbox.checked = true;
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
    className: "editBox flex flex-col h-full p-2 md:p-4",
  }) as HTMLFormElement;
  
  const row1 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2",
  }) as HTMLDivElement;
  const row2 = Object.assign(document.createElement("div"), {
    className: "flex justify-between items-center mb-2",
  }) as HTMLDivElement;
  
  // Match length
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
  [4, 6, 8].forEach(num => {
    const option = document.createElement("option");
    option.value = num.toString();
    option.textContent = num.toString();
    if (num === 4) {
      option.selected = true;
    }
    playersNumberInput.appendChild(option);
  });
  
  // Add elements to rows
  row1.appendChild(playersNumberLabel);
  row1.appendChild(playersNumberInput);
  row2.appendChild(matchLengthLabel);
  row2.appendChild(matchLengthInput);
  
  // Add rows to settings form
  settings.appendChild(row1);
  settings.appendChild(row2);
  
  // Create container
  const container = Object.assign(document.createElement("div"), {
    className: "tournament-setup-container",
  }) as HTMLDivElement;
  container.appendChild(settings);
  
  return { form: container };
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
  savePlayerData(p);
  
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
    className: `editBox`,
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
  // Add login modal for any player when AI is unchecked, logout when checked
  e4.addEventListener("change", event => {
    const target = event.target as HTMLInputElement;
    if (!target.checked) {
      // Request login when AI is unchecked
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
        nameInput.value = `AI-${t("player")}-${p}`;
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
    className: "game-text",
    for: `p${p}Up`,
    textContent: `${t("up")}: `,
  }) as HTMLLabelElement;
  const e6 = Object.assign(document.createElement("input"), {
    className: "custom-input px-1 py-1 ml-1",
    type: "text",
    size: "9",
    id: `p${p}Up`,
    value: up,
  }) as HTMLInputElement;
  const e7 = Object.assign(document.createElement("label"), {
    className: "game-text",
    for: `p${p}Down`,
    textContent: `${t("down")}: `,
  }) as HTMLLabelElement;
  const e8 = Object.assign(document.createElement("input"), {
    className: "custom-input px-1 py-1 ml-1",
    type: "text",
    size: "9",
    id: `p${p}Down`,
    value: down,
  }) as HTMLInputElement;
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
    className: "flex w-full justify-between items-center mb-2",
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
    className: "editBox flex flex-col h-full p-2 md:p-4",
  }) as HTMLFormElement;
  const bgColors = Object.assign(document.createElement("form"), {
    id: "bgColors",
    className: "editBox flex flex-col h-full p-2 md:p-4",
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
  //multiball
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
  //double paddle
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
  //colors
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
    value: "#008000",
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
    value: "#000000",
  }) as HTMLInputElement;
  const e21 = Object.assign(document.createElement("label"), {
    className: "game-text",
    for: "outerBg",
    textContent: ` ${t("outerBg")}`,
  }) as HTMLLabelElement;
  //start button
  const e22 = Object.assign(document.createElement("input"), {
    type: "submit",
    className:
      "btn w-auto py-2 md:py-1.5 px-6 md:px-8 m-0 text-base md:text-lg font-bold w-25 cursor-pointer",
    value: `${t("start")}`,
  });
  //assemble - create row containers for each label-select pair
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
