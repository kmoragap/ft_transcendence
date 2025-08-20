import { renderHeader, setSessionRestored } from './components/header.ts';
import { renderFooter } from './components/footer.ts';
import { navigate } from './router.ts';
import { initI18n } from './i18n';
import { store } from './store';
import { setProfileSessionRestored } from './views/profile.ts';

let isSessionRestored = false;

function buildShell() {
  document.body.className = 'flex flex-col overflow-hidden min-h-screen bg-cover bg-center text-white m-0 p-0 z-0 relative';
  document.body.style.backgroundImage = "url('/assets/img/bg.webp')";

  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-[rgba(0,0,0,0.7)] pointer-events-none z-1 w-full h-full';                           // behind everything else
  document.body.appendChild(overlay);

  const header = renderHeader();
  header.classList.add('relative', 'z-10');
  document.body.appendChild(header);

  const main = document.createElement('main');
  main.id = 'main';
  main.className = 'relative z-10 flex-grow container mx-auto mt-8 px-4 focus:outline-none';
  const app = document.createElement('div');
  app.id = 'app';
  app.className = 'w-full h-full flex flex-col items-center justify-center';
  main.appendChild(app);
  document.body.appendChild(main);

  const footer = renderFooter();
  footer.classList.add('relative', 'z-10');
  document.body.appendChild(footer);
}

async function restoreSession() {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    isSessionRestored = true;
    setSessionRestored();
    setProfileSessionRestored();
    return;
  }

  try {
    const meRes = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (meRes.ok) {
      const user = await meRes.json();
      store.dispatch({ type: 'LOGIN', payload: user });
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  } catch (err) {
    console.error('Failed to restore session:', err);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  } finally {
    isSessionRestored = true;
    setSessionRestored();
    setProfileSessionRestored();
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  await initI18n();
  buildShell();
  await restoreSession();
  navigate(location.hash.slice(1) || '/');
});

window.addEventListener('hashchange', () => {
  navigate(location.hash.slice(1));
});