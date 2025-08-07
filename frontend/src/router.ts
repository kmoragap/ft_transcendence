import { renderHome } from './views/home.ts';
import { renderLogin } from './views/login.ts';
import { renderRegistration } from './views/register.ts';
import { renderGame } from './views/game.ts';
import { renderProfile } from './views/profile.ts';
import { updateText } from './i18n';

const routes: Record<string, () => HTMLElement> = {
  '/': renderHome,
  '/home': renderHome,
  '/login': renderLogin,
  '/register': renderRegistration,
  '/game': renderGame,
  '/profile': renderProfile,
};

export function navigate(path: string) {
  const app = document.getElementById('app');
  if (!app) return;

  const renderFn = routes[path] || renderHome;
  app.innerHTML = '';
  app.appendChild(renderFn());

  updateText();
}