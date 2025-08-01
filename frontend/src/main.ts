import { renderHeader } from './components/header.ts';
import { renderFooter } from './components/footer.ts';
import { renderHome } from './views/home';
import { renderLogin } from './views/login';
import { renderRegistration } from './views/register.ts';
import { loadLanguage, updateText } from './i18n';

export function navigate(path: string) {
  const app = document.getElementById('app')!;
  app.innerHTML = '';

  switch (path) {
    case '/login':
      app.appendChild(renderLogin());
      break;
    case '/register':
      app.appendChild(renderRegistration());
      break;
    default:
      app.appendChild(renderHome());
  }
  updateText();
}

function buildShell() {
  // 1) Body background
  document.body.className = 'flex flex-col overflow-hidden min-h-screen bg-cover bg-center text-white m-0 p-0 z-0 relative';
  document.body.style.backgroundImage = "url('/assets/img/bg.webp')";

  // 2) Overlay over the entire body background
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-[rgba(0,0,0,0.7)] pointer-events-none z-1 w-full h-full';                           // behind everything else
  document.body.appendChild(overlay);

  const header = renderHeader();
  header.classList.add('relative', 'z-10');
  document.body.appendChild(header);

  const main = document.createElement('main');
  main.id = 'app';
  main.className = 'relative z-10 flex-grow container mx-auto mt-8 px-4';
  document.body.appendChild(main);

  const footer = renderFooter();
  footer.classList.add('relative', 'z-10');
  document.body.appendChild(footer);
}

window.addEventListener('DOMContentLoaded', async () => {
  buildShell();

  const saved = localStorage.getItem('lang') || 'en';
  await loadLanguage(saved);

  navigate(location.hash.slice(1) || '/');
});

window.addEventListener('hashchange', () => {
  navigate(location.hash.slice(1));
});