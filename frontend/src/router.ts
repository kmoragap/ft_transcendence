// Simple client-side router for SPA navigation

import { renderHome } from './views/home.ts';
import { renderLogin } from './views/login.ts';
import { renderRegistration } from './views/register.ts';
import { renderMyProfile } from './views/myprofile.ts';
import { renderProfile } from './views/profile.ts';
import { renderDashboard } from './views/dashboard.ts';
import { renderGame} from './views/game';
import { updateText } from './utils/i18n';
import { ensureA11yScaffold, announce, setPageTitleAndFocus } from './utils/a11y.ts';
import { renderOAuthCallback } from './views/oauth.ts';
import { shouldRedirectFromAuth, shouldRedirectFromProtected } from './utils/auth.ts';

const protectedRoutes = new Set<string>(['/myprofile', '/dashboard', '/game']);
const authRoutes = new Set<string>(['/login', '/register']);

const routes: Record<string, () => HTMLElement> = {
  '/': renderHome,
  '/home': renderHome,
  '/login': renderLogin,
  '/register': renderRegistration,
  '/game': renderGame,
  '/myprofile': renderMyProfile,
  '/dashboard': renderDashboard,
  '/login/callback?success=true': renderOAuthCallback,
  '/login_42': () => {
    window.location.href = '/api/auth/oauth/42';
    return document.createElement('div');
  }
};

const titles: Record<string, string> = {
  '/': 'Home',
  '/home': 'Home',
  '/login': 'Login',
  '/register': 'Registration',
  '/game': 'Game',
  '/myprofile': 'My Profile',
  '/dashboard': 'Dashboard',
  '/login/callback': 'OAuth Callback'
};

ensureA11yScaffold();

// Navigate to a given path, handling auth redirects and rendering
export function navigate(path: string) {
  const isProtected = protectedRoutes.has(path) || path.startsWith('/profile/');
  
  if (isProtected && shouldRedirectFromProtected()) {
    if (location.hash !== '#/home') {
      location.hash = '/home';
    }
    return;
  }
  
  if (authRoutes.has(path) && shouldRedirectFromAuth()) {
    if (location.hash !== '#/dashboard') {
      location.hash = '/dashboard';
    }
    return;
  }
  
  const app = document.getElementById('app');
  if (!app) return;

  if (!document.body.classList.contains('overscroll-auto')) {
    document.body.classList.add('overscroll-auto');
  }
  
  if (document.body.style.overscrollBehavior === 'none') {
    document.body.style.overscrollBehavior = '';
  }

  let renderFn = routes[path];
  let title = titles[path] || 'App';
  
  if (!renderFn && path.startsWith('/profile/')) {
    const username = path.split('/')[2];
    renderFn = () => {
      return renderProfile(username);
    };
    title = `Profile - ${username}`;
  }
  
  renderFn = renderFn || renderHome;
  app.innerHTML = '';
  app.appendChild(renderFn());

  document.title = `Transcendence — ${title}`;
  setPageTitleAndFocus(title);
  announce(`Navigated to ${title}`);
  updateText();
}
