import { t, getCurrentLang } from './../i18n';

let iframeRef: HTMLIFrameElement | null = null;

type GameMode = 'menu' | 'single' | 'multi';

export function renderGame(): HTMLElement {
  const section = document.createElement('section');
  section.className =
    'w-full flex-1 relative m-0 flex flex-col items-center justify-items-center justify-center text-center z-10';

  section.innerHTML = `
     <h1 class="title uppercase">
        <span class="mid_line" data-i18n="pong">PONG</span>
      </h1>
          <div class="w-full max-w-7xl rounded-xl overflow-hidden shadow-2xl border border-[rgba(102,252,241,0.15)] bg-[rgba(3,27,27,0.8)]">
     <div class="flex items-center justify-between px-2.5 py-2.5 border-b border-[rgba(102,252,241,0.15)]">
      <button id="game-back"
        class="btn py-1.5 px-4 w-auto m-0 text-lg font-bold cursor-pointer invisible pointer-events-none"
        aria-hidden="true"
        data-i18n="back_to_modes">
        Back
      </button>
      <button id="game-exit"
        class="btn w-auto py-1.5 px-8 m-0 text-lg font-bold w-25 cursor-pointer"
        data-i18n="exit">
        Exit
      </button>
    </div>
      <div id="game-root" class="flex flex-col justify-center items-center w-full min-h-80 relative"></div>
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

  function reloadIframe() {
    if (iframeRef) {
      const currentLang = getCurrentLang();
      const currentSrc = iframeRef.src;
      const url = new URL(currentSrc);
      url.searchParams.set('lang', currentLang);
      iframeRef.src = url.toString();
    }
  }

  function renderMenuHTML() {
    return `
      <div class="p-6 flex flex-col justify-center items-center h-full">
        <div class="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
          <button
            id="btn-create"
            class="px-6 py-4 rounded-lg border border-[rgba(102,252,241,0.15)]
                  bg-[rgba(102,252,241,0.06)] text-[#66fcf1] font-bold text-2xl
                  shadow-lg
                  cursor-not-allowed opacity-50"
            aria-disabled="true"
            title="${t('coming_soon') || 'Coming soon'}"
            data-i18n="create_tournament"
          >
            Create a tournament
          </button>
          <button
            id="btn-join"
            class="px-6 py-4 rounded-lg border border-[rgba(102,252,241,0.15)]
                  bg-[rgba(102,252,241,0.06)] text-[#66fcf1] font-bold text-2xl
                  shadow-lg
                  cursor-not-allowed opacity-50"
            aria-disabled="true"
            title="${t('coming_soon') || 'Coming soon'}"
            data-i18n="join_tournament"
          >
            Join a tournament
          </button>
          <button
            id="btn-single"
            class="px-6 py-4 rounded-lg border border-[rgba(102,252,241,0.25)]
                  bg-[rgba(102,252,241,0.12)] text-[#66fcf1] font-bold text-2xl
                  shadow-xl
                  hover:bg-[rgba(102,252,241,0.18)] focus:outline-none focus:ring-2 focus:ring-[#66fcf1]/40"
            data-i18n="single_play"
          >
            Single play
          </button>
          <button
            id="btn-multi"
            class="px-6 py-4 rounded-lg border border-[rgba(102,252,241,0.25)]
                  bg-[rgba(102,252,241,0.12)] text-[#66fcf1] font-bold text-2xl
                  shadow-lg
                  hover:bg-[rgba(102,252,241,0.18)] focus:outline-none focus:ring-2 focus:ring-[#66fcf1]/40"
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
    const currentLang = getCurrentLang();
    const src = mode === 'single' 
      ? `/pong/?mode=single&lang=${currentLang}` 
      : `/pong/?mode=multi&lang=${currentLang}`;
    
    return `
      <div class="w-full h-[60vh]"> 
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

  // Listen for language changes and reload iframe if needed
  const languageChangeHandler = () => {
    if (iframeRef) {
      // Get current mode from the iframe URL
      const currentSrc = iframeRef.src;
      const url = new URL(currentSrc);
      const mode = url.searchParams.get('mode');
      
      if (mode === 'single' || mode === 'multi') {
        // Destroy and recreate the iframe with new language
        setMode(mode as Exclude<GameMode, 'menu'>);
      }
    }
  };
  
  // Listen for storage changes (language changes)
  window.addEventListener('storage', (e) => {
    if (e.key === 'lang') {
      languageChangeHandler();
    }
  });
  
  // Also listen for custom language change events
  window.addEventListener('languageChanged', languageChangeHandler);

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
