import { t, getCurrentLang, updateText } from './../i18n';
import { store } from './../store';
import { showLoginModal } from './../components/login-modal';

let iframeRef: HTMLIFrameElement | null = null;

type GameMode = 'menu' | 'single' | 'multi';

export function renderGame(): HTMLElement {
  const section = document.createElement('section');
  section.className =
    'w-full flex-1 relative m-0 flex flex-col items-center justify-items-center justify-center text-center z-10';

  section.innerHTML = `
     <h1 id="game-title" class="title uppercase mobile-title">
        <span class="mid_line" data-i18n="pong">PONG</span>
      </h1>
          <div class="w-full max-w-7xl rounded-t-xl overflow-hidden shadow-2xl border border-[rgba(102,252,241,0.15)] bg-[rgba(3,27,27,0.8)]">
     <div class="flex items-center justify-between px-2.5 py-2.5 border-b border-[rgba(102,252,241,0.15)]">
      <button id="game-back"
        class="btn py-1.5 px-4 w-auto m-0 text-lg font-bold cursor-pointer invisible pointer-events-none"
        aria-hidden="true"
        data-i18n="back_to_modes">
        Back
      </button>
      <button id="game-exit"
        class="btn py-1.5 px-8 m-0 text-lg font-bold cursor-pointer"
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
  const title = section.querySelector('#game-title') as HTMLHeadingElement;

    function showBack() {
      backBtn.classList.remove('invisible', 'pointer-events-none');
      backBtn.removeAttribute('aria-hidden');
    }

    function hideBack() {
      backBtn.classList.add('invisible', 'pointer-events-none');
      backBtn.setAttribute('aria-hidden', 'true');
    }

    function showTitle() {
      title.style.display = 'table';
    }

    function hideTitle() {
      title.style.display = 'none';
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
      showTitle();
      destroyIframe();
      root.innerHTML = renderMenuHTML();
      wireMenuHandlers();
      updateText(); // Apply translations after HTML is inserted into DOM
    } else {
      showBack();
      hideTitle();
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
        <div class="flex flex-col md:grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <button
            id="btn-create"
            class="px-4 md:px-6 py-3 md:py-4 rounded-lg border border-[rgba(102,252,241,0.15)]
                  bg-[rgba(102,252,241,0.06)] text-[#66fcf1] font-bold text-lg md:text-2xl
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
            class="px-4 md:px-6 py-3 md:py-4 rounded-lg border border-[rgba(102,252,241,0.15)]
                  bg-[rgba(102,252,241,0.06)] text-[#66fcf1] font-bold text-lg md:text-2xl
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
            class="px-4 md:px-6 py-3 md:py-4 rounded-lg border border-[rgba(102,252,241,0.25)]
                  bg-[rgba(102,252,241,0.12)] text-[#66fcf1] font-bold text-lg md:text-2xl
                  shadow-xl
                  hover:bg-[rgba(102,252,241,0.18)] focus:outline-none focus:ring-2 focus:ring-[#66fcf1]/40"
            data-i18n="single_play"
          >
            Single play
          </button>
          <button
            id="btn-multi"
            class="px-4 md:px-6 py-3 md:py-4 rounded-lg border border-[rgba(102,252,241,0.25)]
                  bg-[rgba(102,252,241,0.12)] text-[#66fcf1] font-bold text-lg md:text-2xl
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
    const { currentUser } = store.getState();
    let src = mode === 'single' 
      ? `/pong/?mode=single&lang=${currentLang}` 
      : `/pong/?mode=multi&lang=${currentLang}`;

      if (mode === 'single' && currentUser?.username) {
        src += `&username=${encodeURIComponent(currentUser.username)}`;
      }
      
    
    return `
      <div class="w-full h-[70vh] min-h-[400px] max-h-[800px]"> 
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

  const languageChangeHandler = () => {
    if (iframeRef) {
      const currentSrc = iframeRef.src;
      const url = new URL(currentSrc);
      const mode = url.searchParams.get('mode');
      
      if (mode === 'single' || mode === 'multi') {
        setMode(mode as Exclude<GameMode, 'menu'>);
      }
    } else {
      updateText();
    }
  };
  
  window.addEventListener('storage', (e) => {
    if (e.key === 'lang') {
      languageChangeHandler();
    }
  });
  
  window.addEventListener('languageChanged', languageChangeHandler);

  window.addEventListener('message', async (event) => {
    if (event.origin !== window.location.origin) {
      return;
    }

    if (event.data.type === 'REQUEST_LOGIN') {
      const { playerId, playerName } = event.data;
      
      try {
        const user = await showLoginModal({
          title: 'Login Second Player',
          gameOnly: true, 
          onSuccess: (user) => {
            alert('Second player logged in: ' + user.username);
          },
          onCancel: () => {
            if (iframeRef?.contentWindow) {
              iframeRef.contentWindow.postMessage({
                type: 'LOGIN_CANCELLED',
                playerId: playerId
              }, window.location.origin);
            }
          }
        });

        if (iframeRef?.contentWindow) {
          iframeRef.contentWindow.postMessage({
            type: 'LOGIN_SUCCESS',
            playerId: playerId,
            playerName: playerName,
            username: user.username,
            userData: user // Send full user data for game statistics
          }, window.location.origin);
        }

      } catch (error) {
        alert('Login failed or cancelled:' + error);
        if (iframeRef?.contentWindow) {
          iframeRef.contentWindow.postMessage({
            type: 'LOGIN_CANCELLED',
            playerId: playerId
          }, window.location.origin);
        }
      }
    } else if (event.data.type === 'EXIT_GAME') {
      // Handle game exit from mobile fullscreen
      const { winner } = event.data;
      console.log(`Game ended. Winner: ${winner}`);
      
      // Navigate back to home page
      window.location.href = '#/home';
    }
  });

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
