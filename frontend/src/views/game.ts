import { t } from './../i18n';

let iframeRef: HTMLIFrameElement | null = null;

export function renderGame(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'w-full flex-1 relative m-0 flex items-center justify-items-center justify-center text-center z-[3]';

  section.innerHTML = `
    <div class="w-full max-w-[1100px] flex-1 rounded-[10px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[rgba(102,252,241,0.15)] bg-[rgba(3,27,27,0.8)]">
      <div class="flex items-center justify-between px-4 py-2 border-b border-[rgba(102,252,241,0.15)]">
        <h2 class="pl-[10px] font-[jura] text-[#66fcf1] text-[1.375rem] uppercase" data-i18n="game">Game</h2>
        <button id="game-exit" class="btn py-[8px] m-[0] mr-[10px] text-lg font-[700] w-[100px] cursor-[pointer]" data-i18n="exit">Exit</button>
      </div>
      <div id="game-root" class="w-full h-[calc(70vh-50px)]">
        <iframe id="pong-frame" class="w-full h-full" src="/pong.html"></iframe>
      </div>
    </div>
  `;

  iframeRef = section.querySelector('#pong-frame') as HTMLIFrameElement;

  section.querySelector('#game-exit')?.addEventListener('click', () => {
    window.location.href = '#/home';
  });

  return section;
}

export function destroyGameView() {
  if (iframeRef) {
    iframeRef.contentWindow?.postMessage({ type: 'PONG_DESTROY' }, window.location.origin);
    iframeRef.remove();
    iframeRef = null;
  }
}
