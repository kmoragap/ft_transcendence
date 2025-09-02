import { t } from './../i18n';

let iframeRef: HTMLIFrameElement | null = null;

type GameMode = 'menu' | 'single' | 'multi';

export function renderGame(): HTMLElement {
  const section = document.createElement('section');
  section.className =
    'w-full flex-1 relative m-0 flex items-center justify-items-center justify-center text-center z-[3]';

  section.innerHTML = `
    <div class="w-full max-w-[1100px] flex-1 rounded-[10px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[rgba(102,252,241,0.15)] bg-[rgba(3,27,27,0.8)]">
     <div class="flex items-center justify-between px-[10px] py-[10px] border-b border-[rgba(102,252,241,0.15)]">
      <button id="game-back"
        class="btn py-[8px] px-[10px] w-[auto] m-[0] text-[1.2rem] font-[700] cursor-[pointer] invisible pointer-events-none"
        aria-hidden="true"
        data-i18n="back_to_modes">
        Back
      </button>
      <button id="game-exit"
        class="btn py-[8px] m-[0 text-[1.2rem] font-[700] w-[100px] cursor-[pointer]"
        data-i18n="exit">
        Exit
      </button>
    </div>
      <div id="game-root" class="flex flex-col justify-center items-center w-full min-h-[320px] relative"></div>
    </div>
  `;

  const root = section.querySelector('#game-root') as HTMLDivElement;
  const exitBtn = section.querySelector('#game-exit') as HTMLButtonElement;
  const backBtn = section.querySelector('#game-back') as HTMLButtonElement;

    function showBack() {
      backBtn.classList.remove('invisible', 'pointer-events-none');
      backBtn.removeAttribute('aria-hidden');
    }

    function hideBack() {
      backBtn.classList.add('invisible', 'pointer-events-none');
      backBtn.setAttribute('aria-hidden', 'true');
    }

  function destroyIframe() {
    if (iframeRef) {
      try {
        iframeRef.contentWindow?.postMessage({ type: 'PONG_DESTROY' }, window.location.origin);
      } catch {}
      iframeRef.remove();
      iframeRef = null;
    }
  }

  function setMode(mode: GameMode) {
    if (mode === 'menu') {
      hideBack();
      destroyIframe();
      root.innerHTML = renderMenuHTML();
      wireMenuHandlers();
    } else {
      showBack();
      root.innerHTML = renderIframeHTML(mode);
      iframeRef = root.querySelector('#pong-frame') as HTMLIFrameElement;
    }
  }

  function renderMenuHTML() {
    return `
      <div class="p-[24px] flex flex-col justify-center items-center h-full">
        <div class="grid grid-cols-2 gap-[16px] max-w-[700px] mx-auto">
          <button
            id="btn-create"
            class="px-[24px] py-[16px] rounded-[8px] border border-[rgba(102,252,241,0.15)]
                  bg-[rgba(102,252,241,0.06)] text-[#66fcf1] font-[700] text-[1.5rem]
                  shadow-[0_4px_10px_rgba(0,0,0,0.4)]
                  cursor-not-allowed opacity-50"
            aria-disabled="true"
            title="${t('coming_soon') || 'Coming soon'}"
            data-i18n="create_tournament"
          >
            Create a tournament
          </button>
          <button
            id="btn-join"
            class="px-[24px] py-[16px] rounded-[8px] border border-[rgba(102,252,241,0.15)]
                  bg-[rgba(102,252,241,0.06)] text-[#66fcf1] font-[700] text-[1.5rem]
                  shadow-[0_4px_10px_rgba(0,0,0,0.4)]
                  cursor-not-allowed opacity-50"
            aria-disabled="true"
            title="${t('coming_soon') || 'Coming soon'}"
            data-i18n="join_tournament"
          >
            Join a tournament
          </button>
          <button
            id="btn-single"
            class="px-[24px] py-[16px] rounded-[8px] border border-[rgba(102,252,241,0.25)]
                  bg-[rgba(102,252,241,0.12)] text-[#66fcf1] font-[700] text-[1.5rem]
                  shadow-[0_6px_16px_rgba(0,0,0,0.5)]
                  hover:bg-[rgba(102,252,241,0.18)] focus:outline-none focus:ring-[2px] focus:ring-[#66fcf1]/40"
            data-i18n="single_play"
          >
            Single play
          </button>
          <button
            id="btn-multi"
            class="px-[24px] py-[16px] rounded-[8px] border border-[rgba(102,252,241,0.25)]
                  bg-[rgba(102,252,241,0.12)] text-[#66fcf1] font-[700] text-[1.5rem]
                  shadow-[0_6px_16px_rgba(0,0,0,0.5)]
                  hover:bg-[rgba(102,252,241,0.18)] focus:outline-none focus:ring-[2px] focus:ring-[#66fcf1]/40"
            data-i18n="multiplayer"
          >
            Multiplayer
          </button>
        </div>
      </div>
    `;
  }


  function wireMenuHandlers() {
    root.querySelector<HTMLButtonElement>('#btn-single')?.addEventListener('click', () => setMode('single'));
    root.querySelector<HTMLButtonElement>('#btn-multi')?.addEventListener('click', () => setMode('multi'));
  }

  function renderIframeHTML(mode: Exclude<GameMode, 'menu'>) {
    const src = mode === 'single' ? '/pong.html?mode=single' : '/pong.html?mode=multi';
    return `
      <div class="w-full h-[calc(60vh-0px)]"> 
        <iframe id="pong-frame" class="w-full h-full" src="${src}" allow="cross-origin-isolated"></iframe>
      </div>
    `;
  }

  backBtn.addEventListener('click', () => setMode('menu'));
  exitBtn.addEventListener('click', () => {
    destroyIframe();
    window.location.href = '#/home';
  });

  setMode('menu');

  (section as any).__destroyGameView = destroyGameView;

  return section;
}

export function destroyGameView() {
  if (iframeRef) {
    try {
      iframeRef.contentWindow?.postMessage({ type: 'PONG_DESTROY' }, window.location.origin);
    } catch {}
    iframeRef.remove();
    iframeRef = null;
  }
}
