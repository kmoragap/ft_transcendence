import { t } from './../i18n';

export function renderGame(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'relative m-0 mt-[10%] flex items-center justify-center h-[70vh] text-center z-[3]';

  section.innerHTML = `
    <div class="w-full max-w-[1100px] h-[70vh] rounded-[10px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[rgba(102,252,241,0.15)] bg-[rgba(3,27,27,0.8)]">
      <div class="flex items-center justify-between px-4 py-2 border-b border-[rgba(102,252,241,0.15)]">
        <h2 class="pl-[10px] font-[jura] text-[#66fcf1] text-[22px] uppercase" data-i18n="game">Game</h2>
        <button id="game-exit" class="btn py-[8px] m-[0] mr-[10px] text-[18px] font-[700] w-[100px]" data-i18n="exit">Exit</button>
      </div>
      <div id="game-root" class="w-full h-[calc(70vh-50px)]"></div>
    </div>
  `;

  // Initialize game controller or any other game logic here

  return section;
}