function br(): HTMLBRElement {
	return Object.assign(document.createElement("br")) as HTMLBRElement;
}

export function playerSetupMenu (list: HTMLUListElement, p: string, name: string, isAi: boolean, up: string, down: string, c1: string, c2: string, c3: string) {
//create player setup
	const form = Object.assign(document.createElement("form"), {id: `player${p}Menu`, className: `editBox`}) as HTMLFormElement;
//name, AI
	const e1 = Object.assign(document.createElement("label"), {className: "game-text", for: `name_p${p}`, textContent: `Player ${p}: `}) as HTMLLabelElement;
	const e2 = Object.assign(document.createElement("input"), {className: "game-text ml-1", size: "16", id: `name_p${p}`, name: `name_p${p}`, value: name}) as HTMLInputElement;
	const e3 = Object.assign(document.createElement("label"), {className: "game-text", for: `p${p}Ai`, textContent: "AI "}) as HTMLLabelElement;
	const e4 = Object.assign(document.createElement("input"), {type: "checkbox", id: `p${p}Ai`, name: `p${p}Ai`, checked: isAi, className: "ml-1"}) as HTMLInputElement;
//keys
	const e5 = Object.assign(document.createElement("label"), {className: "game-text", for: `p${p}Up`, textContent: "Up: "}) as HTMLLabelElement;
	const e6 = Object.assign(document.createElement("input"), {className: "game-text", type: "text", size: "9", id: `p${p}Up`, value: up}) as HTMLInputElement;
	const e7 = Object.assign(document.createElement("label"), {className: "game-text", for: `p${p}Down`, textContent: "Down: "}) as HTMLLabelElement;
	const e8 = Object.assign(document.createElement("input"), {className: "game-text", type: "text", size: "9", id: `p${p}Down`, value: down}) as HTMLInputElement;
//colors
	const e9  = Object.assign(document.createElement("input"), {className: "game-text", type: "color", id: `p${p}InnerCol`, name: `p${p}InnerCol`, value: c1}) as HTMLInputElement;
	const e10 = Object.assign(document.createElement("label"), {className: "game-text", for: `p${p}InnerCol`, textContent: "paddle inner color"}) as HTMLLabelElement;
	const e11 = Object.assign(document.createElement("input"), {className: "game-text", type: "color", id: `p${p}OuterCol`, name: `p${p}OuterCol`, value: c2}) as HTMLInputElement;
	const e12 = Object.assign(document.createElement("label"), {className: "game-text", for: `p${p}OuterCol`, textContent: "paddle outer color"}) as HTMLLabelElement;
	const e13 = Object.assign(document.createElement("input"), {className: "game-text", type: "color", id: `p${p}CornerCol`, name: `p${p}CornerCol`, value: c3}) as HTMLInputElement;
	const e14 = Object.assign(document.createElement("label"), {className: "game-text", for: `p${p}CornerCol`, textContent: "paddle corner color"}) as HTMLLabelElement;
	
	// Create row containers for each label-input pair
	const nameRow = Object.assign(document.createElement("div"), {className: "flex items-center mb-2"}) as HTMLDivElement;
	const keysRow = Object.assign(document.createElement("div"), {className: "flex justify-between items-center mb-2"}) as HTMLDivElement;
	const innerColRow = Object.assign(document.createElement("div"), {className: "flex justify-between items-center mb-2"}) as HTMLDivElement;
	const outerColRow = Object.assign(document.createElement("div"), {className: "flex justify-between items-center mb-2"}) as HTMLDivElement;
	const cornerColRow = Object.assign(document.createElement("div"), {className: "flex justify-between items-center mb-2"}) as HTMLDivElement;
	
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
}

export function gameSetupMenu(fourPlayers: boolean): HTMLDivElement {
	const settings = Object.assign(document.createElement("form"), {id: "settings", className: "editBox flex-1 flex flex-col space-y-3"}) as HTMLFormElement;
	const bgColors = Object.assign(document.createElement("form"), {id: "bgColors", className: "editBox flex-1 flex flex-col space-y-3"}) as HTMLFormElement;
//paddle speed
	const e3 = Object.assign(document.createElement("label"), {className: "game-text", htmlFor: "paddleSpeed", textContent: "Paddle speed"}) as HTMLLabelElement;
	const e1 = Object.assign(document.createElement("select"), {name: "paddleSpeed", id: "paddleSpeed"}) as HTMLSelectElement;
	const e2 = [
		{ value: "glacial", text: "glacial" },
		{ value: "slow", text: "slow" },
		{ value: "standard", text: "standard", selected: true },
		{ value: "fast", text: "fast" },
		{ value: "insane", text: "insane" }
	];
	e2.forEach(option => {
		const opt = Object.assign(document.createElement("option"), {value: option.value, textContent: option.text}) as HTMLOptionElement;
		if (option.selected) opt.selected = true;
		e1.appendChild(opt);
	});
//ball speed
	const e6 = Object.assign(document.createElement("label"), {className: "game-text", htmlFor: "ballSpeed", textContent: "Ball speed"}) as HTMLLabelElement;
	const e4 = Object.assign(document.createElement("select"), {name: "ballSpeed", id: "ballSpeed"}) as HTMLSelectElement;
	const e5 = [
		{ value: "glacial", text: "glacial" },
		{ value: "slow", text: "slow" },
		{ value: "standard", text: "standard", selected: true },
		{ value: "fast", text: "fast" },
		{ value: "insane", text: "insane" }
	];
	e5.forEach(option => {
		const opt = Object.assign(document.createElement("option"), {
			value: option.value,
			textContent: option.text
		}) as HTMLOptionElement;
		if (option.selected) opt.selected = true;
		e4.appendChild(opt);
	});
//ball size
	const e9 = Object.assign(document.createElement("label"), {className: "game-text", htmlFor: "ballSize", textContent: "Ball size"}) as HTMLLabelElement;
	const e7 = Object.assign(document.createElement("select"), {name: "ballSize", id: "ballSize", style: { width: "20px" }}) as HTMLSelectElement;
	const e8 = [
		{ value: "tiny", text: "tiny" },
		{ value: "small", text: "small" },
		{ value: "normal", text: "normal", selected: true },
		{ value: "big", text: "big" },
		{ value: "huge", text: "huge" }
	];
	e8.forEach(option => {
		const opt = Object.assign(document.createElement("option"), {value: option.value, textContent: option.text}) as HTMLOptionElement;
		if (option.selected) opt.selected = true;
		e7.appendChild(opt);
	});
//multiball
	const e10 = Object.assign(document.createElement("input"), {type: "checkbox", id: "multiball", name: "multiball", checked: false}) as HTMLInputElement;
	const e11 = Object.assign(document.createElement("label"), {className: "game-text", htmlFor: "multiball", textContent: "Multiball"}) as HTMLLabelElement;
//double paddle
	const e12 = Object.assign(document.createElement("input"), {type: "checkbox", id: "doublePaddle", name: "doublePaddle", checked: false}) as HTMLInputElement;
	const e13 = Object.assign(document.createElement("label"), {className: "game-text", htmlFor: "doublePaddle", textContent: "Double paddles"}) as HTMLLabelElement;
//colors
	const e14 = Object.assign(document.createElement("input"), {className: "game-text", type: "color", id: "uiCol", name: "uiCol", value: "#ffffff"}) as HTMLInputElement;
	const e15 = Object.assign(document.createElement("label"), {className: "game-text", for: "uiCol", textContent: "UI color"}) as HTMLLabelElement;
	const e16 = Object.assign(document.createElement("input"), {className: "game-text", type: "color", id: "ballCol", name: "ballCol", value: "#0000ff"}) as HTMLInputElement;
	const e17 = Object.assign(document.createElement("label"), {className: "game-text", for: "ballCol", textContent: "Ball color"}) as HTMLLabelElement;
	const e18 = Object.assign(document.createElement("input"), {className: "game-text", type: "color", id: "innerBg", name: "innerBg", value: "#008000"}) as HTMLInputElement;
	const e19 = Object.assign(document.createElement("label"), {className: "game-text", for: "innerBg", textContent: "inner background color"}) as HTMLLabelElement;
	const e20 = Object.assign(document.createElement("input"), {className: "game-text", type: "color", id: "outerBg", name: "outerBg", value: "#000000"}) as HTMLInputElement;
	const e21 = Object.assign(document.createElement("label"), {className: "game-text", for: "outerBg", textContent: "outer background color"}) as HTMLLabelElement;
//start button
	const e22 = Object.assign(document.createElement("input"), {type: "submit", className: "btn w-auto py-1.5 px-8 m-0 text-lg font-bold w-25 cursor-pointer", value: "START"});
//assemble - create row containers for each label-select pair
	const row1 = Object.assign(document.createElement("div"), {className: "flex justify-between items-center mb-2"}) as HTMLDivElement;
	const row2 = Object.assign(document.createElement("div"), {className: "flex justify-between items-center mb-2"}) as HTMLDivElement;
	const row3 = Object.assign(document.createElement("div"), {className: "flex justify-between items-center mb-2"}) as HTMLDivElement;
	const row4 = Object.assign(document.createElement("div"), {className: "flex justify-between items-center mb-2"}) as HTMLDivElement;
	const row5 = Object.assign(document.createElement("div"), {className: "flex justify-between items-center mb-2"}) as HTMLDivElement;
	
	const colorRow1 = Object.assign(document.createElement("div"), {className: "flex justify-between items-center mb-2"}) as HTMLDivElement;
	const colorRow2 = Object.assign(document.createElement("div"), {className: "flex justify-between items-center mb-2"}) as HTMLDivElement;
	const colorRow3 = Object.assign(document.createElement("div"), {className: "flex justify-between items-center mb-2"}) as HTMLDivElement;
	const colorRow4 = Object.assign(document.createElement("div"), {className: "flex justify-between items-center mb-2"}) as HTMLDivElement;
	
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
	
	const container = Object.assign(document.createElement("div"), {className: "game-setup-container"}) as HTMLDivElement;
	const ul = Object.assign(document.createElement("ul"), {id: "gameSetup", className: "flex flex-row gap-4 justify-between items-center list-none"}) as HTMLUListElement;
	ul.appendChild(settings);
	ul.appendChild(bgColors);
	
	// Create centered button container
	const buttonContainer = Object.assign(document.createElement("div"), {className: "flex justify-center mt-4"}) as HTMLDivElement;
	buttonContainer.appendChild(e22);
	
	// Add click event listener to the START button
	e22.addEventListener('click', (e) => {
		e.preventDefault();
		// Trigger form submission by dispatching a submit event on the gameSetup form
		const gameSetupForm = document.getElementById('gameSetup');
		if (gameSetupForm) {
			const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
			gameSetupForm.dispatchEvent(submitEvent);
		}
	});
	
	// Add both ul and button to container
	container.appendChild(ul);
	container.appendChild(buttonContainer);
	
	return container;
}