import { t } from "./i18n";

function br(): HTMLBRElement {
	return Object.assign(document.createElement("br")) as HTMLBRElement;
}

export function playerSetupMenu (list: HTMLUListElement, p: string, name: string, isAi: boolean, up: string, down: string, c1: string, c2: string, c3: string) {
//create player setup
	const form = Object.assign(document.createElement("form"), {id: `player${p}Menu`, className: `player${p}Menu`}) as HTMLFormElement;
//name, AI
	const e1 = Object.assign(document.createElement("label"), {className: "game-text", for: `name_p${p}`, textContent: `${t('player')} ${p}: `}) as HTMLLabelElement;
	const e2 = Object.assign(document.createElement("input"), {className: "game-text", size: "16", id: `name_p${p}`, name: `name_p${p}`, value: name}) as HTMLInputElement;
	const e3 = Object.assign(document.createElement("label"), {className: "game-text", for: `p${p}Ai`, textContent: `${t('ai')} `}) as HTMLLabelElement;
	const e4 = Object.assign(document.createElement("input"), {type: "checkbox", id: `p${p}Ai`, name: `p${p}Ai`, checked: isAi}) as HTMLInputElement;
//keys
	const e5 = Object.assign(document.createElement("label"), {className: "game-text", for: `p${p}Up`, textContent: `${t('up')}: `}) as HTMLLabelElement;
	const e6 = Object.assign(document.createElement("input"), {className: "game-text", type: "text", size: "9", id: `p${p}Up`, value: up}) as HTMLInputElement;
	const e7 = Object.assign(document.createElement("label"), {className: "game-text", for: `p${p}Down`, textContent: `${t('down')}: `}) as HTMLLabelElement;
	const e8 = Object.assign(document.createElement("input"), {className: "game-text", type: "text", size: "9", id: `p${p}Down`, value: down}) as HTMLInputElement;
//colors
	const e9  = Object.assign(document.createElement("input"), {className: "game-text", type: "color", id: `p${p}InnerCol`, name: `p${p}InnerCol`, value: c1}) as HTMLInputElement;
	const e10 = Object.assign(document.createElement("label"), {className: "game-text", for: ` p${p}InnerCol`, textContent: `${t('innerColor')}`}) as HTMLLabelElement;
	const e11 = Object.assign(document.createElement("input"), {className: "game-text", type: "color", id: `p${p}OuterCol`, name: `p${p}OuterCol`, value: c2}) as HTMLInputElement;
	const e12 = Object.assign(document.createElement("label"), {className: "game-text", for: ` p${p}OuterCol`, textContent: `${t('outerColor')}`}) as HTMLLabelElement;
	const e13 = Object.assign(document.createElement("input"), {className: "game-text", type: "color", id: `p${p}CornerCol`, name: `p${p}CornerCol`, value: c3}) as HTMLInputElement;
	const e14 = Object.assign(document.createElement("label"), {className: "game-text", for: ` p${p}CornerCol`, textContent: `${t('cornerColor')}`}) as HTMLLabelElement;
	form.append(e1, e2, br(), e3, e4, br(), e5, e6, e7, e8, br(), e9, e10, br(), e11, e12, br(), e13, e14, br());
	const ul = document.createElement("li");
	ul.appendChild(form);
	list.appendChild(ul);
}

export function gameSetupMenu(fourPlayers: boolean): HTMLUListElement {
	const settings = Object.assign(document.createElement("form"), {id: "settings", className: "settings"}) as HTMLFormElement;
	const bgColors = Object.assign(document.createElement("form"), {id: "bgColors", className: "bgColors"}) as HTMLFormElement;
	const startBtn = Object.assign(document.createElement("form"), {id: "startBtn", className: "startBtn"}) as HTMLFormElement;
//paddle speed
	const e1 = Object.assign(document.createElement("select"), {name: "paddleSpeed", id: "paddleSpeed"}) as HTMLSelectElement;
	const e2 = [
		{ value: "glacial", text: `${t('glacial')}` },
		{ value: "slow", text: `${t('slow')}` },
		{ value: "standard", text: `${t('standard')}`, selected: true },
		{ value: "fast", text: `${t('fast')}` },
		{ value: "insane", text: `${t('insane')}` }
	];
	e2.forEach(option => {
		const opt = Object.assign(document.createElement("option"), {value: option.value, textContent: option.text}) as HTMLOptionElement;
		if (option.selected) opt.selected = true;
		e1.appendChild(opt);
	});
	const e3 = Object.assign(document.createElement("label"), {className: "game-text", htmlFor: "paddleSpeed", textContent: ` ${t('paddleSpeed')}`}) as HTMLLabelElement;
//ball speed
	const e4 = Object.assign(document.createElement("select"), {name: "ballSpeed", id: "ballSpeed"}) as HTMLSelectElement;
	const e5 = [
		{ value: "glacial", text: `${t('glacial')}` },
		{ value: "slow", text: `${t('slow')}` },
		{ value: "standard", text: `${t('standard')}`, selected: true },
		{ value: "fast", text: `${t('fast')}` },
		{ value: "insane", text: `${t('insane')}` }
	];
	e5.forEach(option => {
		const opt = Object.assign(document.createElement("option"), {
			value: option.value,
			textContent: option.text
		}) as HTMLOptionElement;
		if (option.selected) opt.selected = true;
		e4.appendChild(opt);
	});
	const e6 = Object.assign(document.createElement("label"), {className: "game-text", htmlFor: "ballSpeed", textContent: ` ${t('ballSpeed')}`}) as HTMLLabelElement;
//ball size
	const e7 = Object.assign(document.createElement("select"), {name: "ballSize", id: "ballSize", style: { width: "20px" }}) as HTMLSelectElement;
	const e8 = [
		{ value: "tiny", text: `${t('tiny')}` },
		{ value: "small", text: `${t('small')}` },
		{ value: "normal", text: `${t('normal')}`, selected: true },
		{ value: "big", text: `${t('big')}` },
		{ value: "huge", text: `${t('huge')}` }
	];
	e8.forEach(option => {
		const opt = Object.assign(document.createElement("option"), {value: option.value, textContent: option.text}) as HTMLOptionElement;
		if (option.selected) opt.selected = true;
		e7.appendChild(opt);
	});
	const e9 = Object.assign(document.createElement("label"), {className: "game-text", htmlFor: "ballSize", textContent: ` ${t('ballSize')}`}) as HTMLLabelElement;
//multiball
	const e10 = Object.assign(document.createElement("input"), {type: "checkbox", id: "multiball", name: "multiball", checked: false}) as HTMLInputElement;
	const e11 = Object.assign(document.createElement("label"), {className: "game-text", htmlFor: "multiball", textContent: ` ${t('multiball')}`}) as HTMLLabelElement;
//double paddle
	const e12 = Object.assign(document.createElement("input"), {type: "checkbox", id: "doublePaddle", name: "doublePaddle", checked: false}) as HTMLInputElement;
	const e13 = Object.assign(document.createElement("label"), {className: "game-text", htmlFor: "doublePaddle", textContent: ` ${t('doublePaddle')}`}) as HTMLLabelElement;
//colors
	const e14 = Object.assign(document.createElement("input"), {className: "game-text", type: "color", id: "uiCol", name: "uiCol", value: "#ffffff"}) as HTMLInputElement;
	const e15 = Object.assign(document.createElement("label"), {className: "game-text", for: "uiCol", textContent: ` ${t('uiCol')}`}) as HTMLLabelElement;
	const e16 = Object.assign(document.createElement("input"), {className: "game-text", type: "color", id: "ballCol", name: "ballCol", value: "#0000ff"}) as HTMLInputElement;
	const e17 = Object.assign(document.createElement("label"), {className: "game-text", for: "ballCol", textContent: ` ${t('ballCol')}`}) as HTMLLabelElement;
	const e18 = Object.assign(document.createElement("input"), {className: "game-text", type: "color", id: "innerBg", name: "innerBg", value: "#008000"}) as HTMLInputElement;
	const e19 = Object.assign(document.createElement("label"), {className: "game-text", for: "innerBg", textContent: ` ${t('innerBg')}`}) as HTMLLabelElement;
	const e20 = Object.assign(document.createElement("input"), {className: "game-text", type: "color", id: "outerBg", name: "outerBg", value: "#000000"}) as HTMLInputElement;
	const e21 = Object.assign(document.createElement("label"), {className: "game-text", for: "outerBg", textContent: ` ${t('outerBg')}`}) as HTMLLabelElement;
//start button
	const e22 = Object.assign(document.createElement("input"), {type: "submit", className: "game-start-button", value: `${t('start')}`});
//assemble
	if (fourPlayers)
		settings.append(e1, e3, br(), e4, e6, br(), e7, e9, br(), br(), e10, e11, br());
	 else settings.append(e1, e3, br(), e4, e6, br(), e7, e9, br(), br(), e10, e11, br(), e12, e13, br());
	bgColors.append(e14, e15, br(), e16, e17, br(), e18, e19, br(), e20, e21, br());
	startBtn.append(e22);
	const ul = Object.assign(document.createElement("ul"), {id: "gameSetup", className: "flex items-center list-none"}) as HTMLUListElement;
	ul.appendChild(settings);
	ul.appendChild(bgColors);
	ul.append(startBtn);
	return ul;
}