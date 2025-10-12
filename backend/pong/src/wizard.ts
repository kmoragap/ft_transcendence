import { loadConfig } from "./gameData";
import { t } from "./i18n";
import { gameSetupMenu, playerSetupMenu, tournamentSetupMenu, setGameMode } from "./menus";
import { createAndStartTournament } from "./tournamentData";

let currentStep = 1;
//navigation
const backButton = btn("back", "Back", "backBtn");
const nextButton = btn("next", "Next", "nextBtn");
const finishButton = btn("start", "Start", "finishBtn");
backButton.classList.add("hidden");
finishButton.classList.add("hidden");

export function wizard(mode: string) {
	setGameMode(mode);
	const card = document.getElementById("card") as HTMLDivElement;
	const player1Container = createPlayerContainer(1);
	const player2Container = createPlayerContainer(2);
	const player1List = createPlayerList();
	const player2List = createPlayerList();

	const urlParams = new URLSearchParams(window.location.search);
	const username = urlParams.get("username") || "Player 1";
	const userId = urlParams.get("userId") || "";
	const wizardContainer = createStepContainer("tournament-wizard", "");
	const step1Container = createStepContainer("wizard-step", "step1");
	const playerSetupContainer = createStepContainer("wizard-step hidden", "step2");
	const gameSettingsContainer = createStepContainer("wizard-step hidden", "step3");
	const navigationContainer = Object.assign(document.createElement("div"), {
		className: "flex justify-between items-center mt-6",
	}) as HTMLDivElement;
	navigationContainer.appendChild(backButton);
	navigationContainer.appendChild(nextButton);
	navigationContainer.appendChild(finishButton);
	
	playerSetupMenu(player1List, "1", username, false, "Shift", "Control", "#ffffff", "#808080", "#ff0000");
	const p1IdInput = document.getElementById("p1Id") as HTMLInputElement;
	if (p1IdInput && userId) p1IdInput.value = userId;
	playerSetupMenu(player2List, "2", "Roger Federror", true, "ArrowUp", "ArrowDown", "#ffffff", "#808080", "#ff0000");

	player1Container.appendChild(player1List);
	player2Container.appendChild(player2List);

	const { form: setupForm } = gameSetupMenu(mode);
	const settingsForm = setupForm.querySelector("#settings") as HTMLFormElement;
	const bgColorsForm = setupForm.querySelector("#bgColors") as HTMLFormElement;
	
	const playerSetupFlexContainer = createFlexContainer();
	playerSetupFlexContainer.id = "playerSetupContainer";
	playerSetupContainer.appendChild(playerSetupFlexContainer);

	const gameSettingsFlexContainer = createFlexContainer();
	gameSettingsFlexContainer.appendChild(settingsForm);
	gameSettingsFlexContainer.appendChild(bgColorsForm);
	gameSettingsContainer.appendChild(gameSettingsFlexContainer);
	
	if (mode === "tournament") {
		const { form: tournamentForm } = tournamentSetupMenu();
		step1Container.appendChild(tournamentForm);
		const playersNumberInput = document.getElementById("playersNumber") as HTMLInputElement;
		if (playersNumberInput) {
			playersNumberInput.addEventListener("input", () => {
				if (currentStep === 2) {
					const numPlayers = parseInt(playersNumberInput.value) || 4;
					createPlayerBoxes(numPlayers);
				}
			});
		}
		nextButton.addEventListener("click", (e) => {
			e.preventDefault();
			if (currentStep < 3) showStep(currentStep + 1, false);
		});
		backButton.addEventListener("click", (e) => {
			e.preventDefault();
			if (currentStep > 1) showStep(currentStep - 1, false);
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
		if (mode === "multi") {
			const player3Container = createPlayerContainer(3);
			const player4Container = createPlayerContainer(4);

			const player3List = createPlayerList();
			const player4List = createPlayerList();

			playerSetupMenu(player3List, "3", "Boolena Williams", true, "i", "k", "#ffffff", "#808080", "#ff0000");
			playerSetupMenu(player4List, "4", "Boris Backend", true, "PageUp", "PageDown", "#ffffff", "#808080", "#ff0000");

			player3Container.appendChild(player3List);
			player4Container.appendChild(player4List);

			playerSetupFlexContainer.appendChild(player1Container);
			playerSetupFlexContainer.appendChild(player2Container);
			playerSetupFlexContainer.appendChild(player3Container);
			playerSetupFlexContainer.appendChild(player4Container);
		} else {
			playerSetupFlexContainer.appendChild(player1Container);
			playerSetupFlexContainer.appendChild(player2Container);
		}
		step1Container.appendChild(playerSetupFlexContainer);
		const singleStep2FlexContainer = createFlexContainer();
		singleStep2FlexContainer.appendChild(settingsForm);
		singleStep2FlexContainer.appendChild(bgColorsForm);
		playerSetupContainer.appendChild(singleStep2FlexContainer);

		nextButton.addEventListener("click", (e) => {
			e.preventDefault();
			if (currentStep < 2) showStep(currentStep + 1, true);
		});
		backButton.addEventListener("click", (e) => {
			e.preventDefault();
			if (currentStep > 1) showStep(currentStep - 1, true);
		});
		finishButton.addEventListener("click", (e) => {
			e.preventDefault();
			loadConfig(mode);
		});
	}
	wizardContainer.appendChild(step1Container);
	wizardContainer.appendChild(playerSetupContainer);
	wizardContainer.appendChild(gameSettingsContainer);
	wizardContainer.appendChild(navigationContainer);
	card.appendChild(wizardContainer);
}

function createPlayerBoxes(numPlayers: number) {
	const container = document.getElementById("playerSetupContainer");
	if (!container) return;
	container.innerHTML = "";
	for (let i = 1; i <= numPlayers; i++) {
		const playerContainer = createPlayerContainer(i);
		const playerList = createPlayerList();
		const defaultNames = [
			"Player 1",
			"Roger Federror",
			"Boolena Williams",
			"Boris Backend",
			"Steffi Graph",
			"Array Agassi",
			"Maria Charapova",
			"Novak Breaković",
		];
		const defaultKeys = [
			{ up: "Shift", down: "Control" },
			{ up: "ArrowUp", down: "ArrowDown" },
			{ up: "Shift", down: "Control" },
			{ up: "ArrowUp", down: "ArrowDown" },
			{ up: "Shift", down: "Control" },
			{ up: "ArrowUp", down: "ArrowDown" },
			{ up: "Shift", down: "Control" },
			{ up: "ArrowUp", down: "ArrowDown" },
		];

		let playerName = defaultNames[i - 1] || `Player ${i}`;
		const playerKeys = defaultKeys[i - 1] || { up: "q", down: "a" };
		if (i === 1) {
			const urlParams = new URLSearchParams(window.location.search);
			const username = urlParams.get("username") || "Player 1";
			playerName = username;
		}
		playerSetupMenu(playerList, i.toString(), playerName, i > 1,
			playerKeys.up, playerKeys.down,
			"#ffffff", "#808080", "#ff0000",);
		playerContainer.appendChild(playerList);
		container.appendChild(playerContainer);
	}
}

function showStep(step: number, singleMatch: boolean) {
	document.querySelectorAll(".wizard-step").forEach((el) => {
		el.classList.add("hidden");
	});
	const stepElement = document.getElementById(`step${step}`);
	if (stepElement) stepElement.classList.remove("hidden");
	if (singleMatch) {
		backButton.classList.toggle("hidden", step === 1);
		nextButton.classList.toggle("hidden", step === 2);
		finishButton.classList.toggle("hidden", step !== 2);
	} else {
		backButton.classList.toggle("hidden", step === 1);
		nextButton.classList.toggle("hidden", step === 3);
		finishButton.classList.toggle("hidden", step !== 3);
		if (step === 2) {
			const playersNumberInput = document.getElementById("playersNumber") as HTMLInputElement;
			if (playersNumberInput) {
				const numPlayers = parseInt(playersNumberInput.value) || 4;
				createPlayerBoxes(numPlayers);
			}
		}
	}
	currentStep = step;
}

function btn(ts: string, alt: string, id: string): HTMLButtonElement {
	const button =  Object.assign(document.createElement("button"), {className: "",
		textContent: t(ts) || alt,
		id: id,
	}) as HTMLButtonElement;
	button.classList.add("btn", "py-2", "px-6", "text-lg", "font-bold");
	return button;
}

function createPlayerContainer(p: number): HTMLDivElement {
	return Object.assign(document.createElement("div"), {
		className: "flex-1 min-w-[300px] flex flex-col",
		id: `player${p}Container`,
	}) as HTMLDivElement;
}

function createPlayerList(): HTMLUListElement {
	return Object.assign(document.createElement("ul"), {className: "list-none",}) as HTMLUListElement;
}

function createFlexContainer(): HTMLDivElement {
	return Object.assign(document.createElement("div"), {
		className: "flex flex-col md:flex-row gap-4 justify-start items-stretch flex-wrap"
	}) as HTMLDivElement;
}

function createStepContainer(className: string, id: string): HTMLDivElement {
	return Object.assign(document.createElement("div"), {className, id}) as HTMLDivElement;
}