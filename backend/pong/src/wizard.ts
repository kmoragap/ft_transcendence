/*
The wizard creates the menu boxes to set up the game according to the chosen game mode
using functions from menus.ts.
*/

import { loadConfig } from "./gameData";
import { t } from "./i18n";
import { gameSetupMenu, playerSetupMenu, tournamentSetupMenu, setGameMode, clearSavedPlayerData } from "./menus";
import { createAndStartTournament } from "./tournamentData";
import { isMobileDevice } from "./utils/mobile";

export let allPlayerData: any[] = [];
let currentStep = 1;
let currentPlayerPage = 0;
let totalPlayerPages = 0;
let currentGameSettingsPage = 0;

function createGameSettingsNavigation(settingsForm: HTMLFormElement, bgColorsForm: HTMLFormElement, container: HTMLElement) {
	settingsForm.style.display = "flex";
	bgColorsForm.style.display = "none";
}

function updateButtonText() {
	const isMobile = isMobileDevice();
	
	if (currentStep === 2 || (currentStep === 1 && totalPlayerPages > 1)) {
		if (totalPlayerPages > 1) {
			nextButton.textContent = currentPlayerPage < totalPlayerPages - 1 ? `Next (${currentPlayerPage + 1}/${totalPlayerPages})` : "Next";
			backButton.textContent = currentPlayerPage > 0 ? `Back (${currentPlayerPage + 1}/${totalPlayerPages})` : "Back";
		} else {
			nextButton.textContent = "Next";
			backButton.textContent = "Back";
		}
	} else if (currentStep === 3 && isMobile) {
		nextButton.textContent = currentGameSettingsPage === 0 ? "Next (1/2)" : "Next";
		backButton.textContent = currentGameSettingsPage === 1 ? "Back (2/2)" : "Back";
	} else {
		nextButton.textContent = "Next";
		backButton.textContent = "Back";
	}
}

const backButton = btn("back", "Back", "backBtn");
const nextButton = btn("next", "Next", "nextBtn");
const finishButton = btn("start", "Start", "finishBtn");
backButton.classList.add("hidden");
finishButton.classList.add("hidden");

export function wizard(mode: string) {
	setGameMode(mode);
	clearSavedPlayerData();
	const card = document.getElementById("card") as HTMLDivElement;
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
	navigationContainer.appendChild(finishButton)

	const { form: setupForm } = gameSetupMenu(mode);
	const settingsForm = setupForm.querySelector("#settings") as HTMLFormElement;
	const bgColorsForm = setupForm.querySelector("#bgColors") as HTMLFormElement;
	
	const playerSetupFlexContainer = createFlexContainer();
	playerSetupFlexContainer.id = "playerSetupContainer";
	playerSetupContainer.appendChild(playerSetupFlexContainer);

	const isMobile = isMobileDevice();
	const gameSettingsFlexContainer = createFlexContainer();
	if (isMobile) {
		gameSettingsFlexContainer.style.display = "none";
		gameSettingsContainer.appendChild(settingsForm);
		gameSettingsContainer.appendChild(bgColorsForm);
		createGameSettingsNavigation(settingsForm, bgColorsForm, gameSettingsContainer);
	} else {
		gameSettingsFlexContainer.appendChild(settingsForm);
		gameSettingsFlexContainer.appendChild(bgColorsForm);
		gameSettingsContainer.appendChild(gameSettingsFlexContainer);
	}
	
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
			if (currentStep === 2) {
				const isMobile = isMobileDevice();
				const playersPerPage = isMobile ? 1 : 2;
				if (currentPlayerPage < totalPlayerPages - 1) {
					currentPlayerPage++;
					renderPlayerPage(currentPlayerPage, playersPerPage);
					updateButtonText();
					return;
				}
			}
			if (currentStep === 3 && isMobile) {
				if (currentGameSettingsPage === 0) {
					currentGameSettingsPage = 1;
					const settingsForm = document.querySelector("#settings") as HTMLFormElement;
					const bgColorsForm = document.querySelector("#bgColors") as HTMLFormElement;
					if (settingsForm && bgColorsForm) {
						settingsForm.style.display = "none";
						bgColorsForm.style.display = "flex";
						updateButtonText();
					}
					return;
				}
			}
			if (currentStep < 3) showStep(currentStep + 1, false);
		});
		backButton.addEventListener("click", (e) => {
			e.preventDefault();
			if (currentStep === 2) {
				if (currentPlayerPage > 0) {
					const isMobile = isMobileDevice();
					const playersPerPage = isMobile ? 1 : 2;
					currentPlayerPage--;
					renderPlayerPage(currentPlayerPage, playersPerPage);
					updateButtonText();
					return;
				}
			}
			if (currentStep === 3 && isMobile) {
				if (currentGameSettingsPage === 1) {
					currentGameSettingsPage = 0;
					const settingsForm = document.querySelector("#settings") as HTMLFormElement;
					const bgColorsForm = document.querySelector("#bgColors") as HTMLFormElement;
					if (settingsForm && bgColorsForm) {
						settingsForm.style.display = "flex";
						bgColorsForm.style.display = "none";
						updateButtonText();
					}
					return;
				}
			}
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
			allPlayerData = [
				{ index: 1, name: username, id: userId, isAi: false, keys: { up: "w", down: "s" }, innerCol: "#ffffff", outerCol: "#808080", cornerCol: "#ff0000" },
				{ index: 2, name: "Roger Federror", id: "", isAi: true, keys: { up: "ArrowUp", down: "ArrowDown" }, innerCol: "#ffffff", outerCol: "#808080", cornerCol: "#ff0000" },
				{ index: 3, name: "Boolena Williams", id: "", isAi: true, keys: { up: "i", down: "k" }, innerCol: "#ffffff", outerCol: "#808080", cornerCol: "#ff0000" },
				{ index: 4, name: "Boris Backend", id: "", isAi: true, keys: { up: "PageUp", down: "PageDown" }, innerCol: "#ffffff", outerCol: "#808080", cornerCol: "#ff0000" }
			];
			
			(window as any).allPlayerData = allPlayerData;
			
			const isMobile = isMobileDevice();
			const playersPerPage = isMobile ? 1 : 2;
			totalPlayerPages = Math.ceil(4 / playersPerPage);
			currentPlayerPage = 0;
			
			playerSetupFlexContainer.id = "playerSetupContainer";
			step1Container.appendChild(playerSetupFlexContainer);
			
			renderPlayerPage(currentPlayerPage, playersPerPage, playerSetupFlexContainer);
			
			const p1IdInput = document.getElementById("p1Id") as HTMLInputElement;
			if (p1IdInput && userId) p1IdInput.value = userId;
		} else {
			allPlayerData = [
				{ index: 1, name: username, id: userId, isAi: false, keys: { up: "w", down: "s" }, innerCol: "#ffffff", outerCol: "#808080", cornerCol: "#ff0000" },
				{ index: 2, name: "Roger Federror", id: "", isAi: true, keys: { up: "ArrowUp", down: "ArrowDown" }, innerCol: "#ffffff", outerCol: "#808080", cornerCol: "#ff0000" }
			];
			
			const isMobile = isMobileDevice();
			const playersPerPage = isMobile ? 1 : 2;
			totalPlayerPages = Math.ceil(2 / playersPerPage);
			currentPlayerPage = 0;
			
			playerSetupFlexContainer.id = "playerSetupContainer";
			step1Container.appendChild(playerSetupFlexContainer);
			
			renderPlayerPage(currentPlayerPage, playersPerPage, playerSetupFlexContainer);
			
			const p1IdInput = document.getElementById("p1Id") as HTMLInputElement;
			if (p1IdInput && userId) p1IdInput.value = userId;
		}
		const singleStep2FlexContainer = createFlexContainer();
		singleStep2FlexContainer.appendChild(settingsForm);
		singleStep2FlexContainer.appendChild(bgColorsForm);
		playerSetupContainer.appendChild(singleStep2FlexContainer);

		nextButton.addEventListener("click", (e) => {
			e.preventDefault();
			if (currentStep === 1 && totalPlayerPages > 1) {
				const isMobile = isMobileDevice();
				const playersPerPage = isMobile ? 1 : 2;
				if (currentPlayerPage < totalPlayerPages - 1) {
					currentPlayerPage++;
					renderPlayerPage(currentPlayerPage, playersPerPage);
					updateButtonText();
					return;
				}
			}
			if (currentStep < 2) showStep(currentStep + 1, true);
		});
		backButton.addEventListener("click", (e) => {
			e.preventDefault();
			if (currentStep === 1 && totalPlayerPages > 1) {
				if (currentPlayerPage > 0) {
					const isMobile = isMobileDevice();
					const playersPerPage = isMobile ? 1 : 2;
					currentPlayerPage--;
					renderPlayerPage(currentPlayerPage, playersPerPage);
					updateButtonText();
					return;
				}
			}
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
	
	updateButtonText();
}

function createPlayerBoxes(numPlayers: number) {
	const isMobile = isMobileDevice();
	const playersPerPage = isMobile ? 1 : 2;
	totalPlayerPages = Math.ceil(numPlayers / playersPerPage);
	currentPlayerPage = 0;
	
	allPlayerData = [];
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
		{ up: "w", down: "s" },
		{ up: "ArrowUp", down: "ArrowDown" },
		{ up: "w", down: "s" },
		{ up: "ArrowUp", down: "ArrowDown" },
		{ up: "w", down: "s" },
		{ up: "ArrowUp", down: "ArrowDown" },
		{ up: "w", down: "s" },
		{ up: "ArrowUp", down: "ArrowDown" },
	];
	
	const urlParams = new URLSearchParams(window.location.search);
	const username = urlParams.get("username") || "Player 1";
	const userId = urlParams.get("userId") || "";
	
	for (let i = 1; i <= numPlayers; i++) {
		let playerName = defaultNames[i - 1] || `Player ${i}`;
		const playerKeys = defaultKeys[i - 1] || { up: "q", down: "a" };
		let playerId = "";
		if (i === 1) {
			playerName = username;
			playerId = userId;
		}
		allPlayerData.push({
			index: i,
			name: playerName,
			id: playerId,
			isAi: i > 1,
			keys: playerKeys,
			innerCol: "#ffffff",
			outerCol: "#808080",
			cornerCol: "#ff0000"
		});
	}
	
	renderPlayerPage(currentPlayerPage, playersPerPage);
	
	const p1IdInput = document.getElementById("p1Id") as HTMLInputElement;
	if (p1IdInput && userId) p1IdInput.value = userId;
	
	updateButtonText();
}

function renderPlayerPage(pageIndex: number, playersPerPage: number, container?: HTMLElement) {
	if (!container) {
		const foundContainer = document.getElementById("playerSetupContainer");
		container = foundContainer || undefined;
	}
	if (!container) {
		return;
	}
	
	const existingPlayers = container.querySelectorAll('[id^="player"][id$="Container"]');
	existingPlayers.forEach(player => player.remove());
	
	const start = pageIndex * playersPerPage;
	const end = Math.min(start + playersPerPage, allPlayerData.length);
	
	for (let i = start; i < end; i++) {
		const playerData = allPlayerData[i];
		const playerContainer = createPlayerContainer(playerData.index);
		const playerList = createPlayerList();
		
		playerSetupMenu(playerList, playerData.index.toString(), playerData.name, playerData.isAi,
			playerData.keys.up, playerData.keys.down,
			playerData.innerCol || "#ffffff", playerData.outerCol || "#808080", playerData.cornerCol || "#ff0000");
		playerContainer.appendChild(playerList);
		container.appendChild(playerContainer);
	}
	
	updatePlayerNavigation();
}

function updatePlayerNavigation() {
	const navContainer = document.getElementById("playerNavigation");
	if (navContainer) {
		navContainer.remove();
	}
	
	if (currentStep === 1 && totalPlayerPages > 1) {
		const shouldHideBack = currentPlayerPage === 0;
		backButton.classList.toggle("hidden", shouldHideBack);
	}
}

function showStep(step: number, singleMatch: boolean) {
	currentStep = step;
	document.querySelectorAll(".wizard-step").forEach((el) => {
		el.classList.add("hidden");
	});
	const stepElement = document.getElementById(`step${step}`);
	if (stepElement) stepElement.classList.remove("hidden");
	if (singleMatch) {
		const shouldHideBack = step === 1 && currentPlayerPage === 0;
		backButton.classList.toggle("hidden", shouldHideBack);
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
	updateButtonText();
}

function btn(ts: string, alt: string, id: string): HTMLButtonElement {
	const button =  Object.assign(document.createElement("button"), {className: "",
		textContent: t(ts) || alt,
		id: id,
	}) as HTMLButtonElement;
	button.classList.add("btn", "py-2", "px-6", "text-lg", "font-bold");
	if (id === "finishBtn") {
		button.textContent = button.textContent?.toUpperCase() || "START";
	}
	return button;
}

function createPlayerContainer(p: number): HTMLDivElement {
	return Object.assign(document.createElement("div"), {
		className: "flex flex-col flex-1",
		id: `player${p}Container`,
	}) as HTMLDivElement;
}

function createPlayerList(): HTMLUListElement {
	return Object.assign(document.createElement("ul"), {className: "list-none",}) as HTMLUListElement;
}

function createFlexContainer(): HTMLDivElement {
	return Object.assign(document.createElement("div"), {
		className: "flex flex-col md:flex-row gap-4 items-stretch"
	}) as HTMLDivElement;
}

function createStepContainer(className: string, id: string): HTMLDivElement {
	return Object.assign(document.createElement("div"), {className, id}) as HTMLDivElement;
}