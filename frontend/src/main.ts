import { renderHeader } from './components/header';
import { renderFooter } from './components/footer';
import { navigate } from './router';
import { initI18n } from './i18n';
import { store } from './store';
import { initA11yTheme } from './utils/a11y';
import { sessionManager } from './utils/session';

function buildShell() {
  document.body.className = 'flex flex-col font-Jura overflow-x-hidden min-h-[100svh] overflow-y-auto overscroll-auto bg-cover bg-center text-white m-0 p-0 z-0 relative';
  document.body.style.backgroundImage = "url('/assets/img/bg.webp')";

  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-[rgba(0,0,0,0.7)] pointer-events-none z-1 w-full h-full';                           // behind everything else
  document.body.appendChild(overlay);

  const header = renderHeader();
  header.classList.add('relative', 'z-100', 'shrink-0');
  document.body.appendChild(header);

  const main = document.createElement('main');
  main.id = 'main';
  main.className = 'relative z-10 flex-1 overflow-y-auto focus:outline-none flex flex-col py-4';
  const inner = document.createElement('div');
  inner.className = 'container mx-auto px-4 flex-1 flex flex-col';
  const app = document.createElement('div');
  app.id = 'app';
  app.className = 'w-full flex-1 flex flex-col items-center justify-center';
  inner.appendChild(app);
  main.appendChild(inner);
  document.body.appendChild(main);

  const footer = renderFooter();
  footer.classList.add('relative', 'z-10', 'shrink-0');
  document.body.appendChild(footer);
}

async function restoreSession() {
  const token = localStorage.getItem('accessToken');
  
  if (token) {
    try {
      const meRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (meRes.ok) {
        const user = await meRes.json();
        store.dispatch({ type: 'LOGIN', payload: user });
        sessionManager.setSessionRestored();
        return;
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } catch (err) {
      console.error('Failed to restore session with token:', err);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  try {
    const meRes = await fetch('/api/auth/me', {
      credentials: 'include'
    });
    
    if (meRes.ok) {
      const user = await meRes.json();
      store.dispatch({ type: 'LOGIN', payload: user });
    }
  } catch (err) {
    console.error('Failed to restore session with cookie:', err);
  } finally {
    sessionManager.setSessionRestored();
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  await initI18n();
  buildShell();
  initA11yTheme();
  await restoreSession();
  navigate(location.hash.slice(1) || '/');
});

window.addEventListener('hashchange', () => {
  navigate(location.hash.slice(1));
});