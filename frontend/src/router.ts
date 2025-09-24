import { renderHome } from './views/home.ts';
import { renderLogin } from './views/login.ts';
import { renderRegistration } from './views/register.ts';
import { renderMyProfile } from './views/myprofile.ts';
import { renderDashboard } from './views/dashboard.ts';
import { renderGame} from './views/game';
import { updateText } from './i18n';
import { ensureA11yScaffold, announce, setPageTitleAndFocus } from './utils/a11y.ts';
import { store } from './store.ts';
import { shouldRedirectFromAuth, shouldRedirectFromProtected } from './utils/auth.ts';

const protectedRoutes = new Set<string>(['/myprofile']);
const authRoutes = new Set<string>(['/login', '/register']);

const routes: Record<string, () => HTMLElement> = {
  '/': renderHome,
  '/home': renderHome,
  '/login': renderLogin,
  '/register': renderRegistration,
  '/game': renderGame,
  '/myprofile': renderMyProfile,
  '/dashboard': renderDashboard
};

const titles: Record<string, string> = {
  '/': 'Home',
  '/home': 'Home',
  '/login': 'Login',
  '/register': 'Registration',
  '/game': 'Game',
  '/myprofile': 'My Profile',
  '/dashboard': 'Dashboard'
};

ensureA11yScaffold();

export function navigate(path: string) {
  // Redirect unauthenticated users away from protected routes
  if (protectedRoutes.has(path) && shouldRedirectFromProtected()) {
    if (location.hash !== '#/home') {
      location.hash = '/home';
    }
    return;
  }
  
  // Redirect authenticated users away from auth routes (login/register)
  if (authRoutes.has(path) && shouldRedirectFromAuth()) {
    if (location.hash !== '#/dashboard') {
      location.hash = '/dashboard';
    }
    return;
  }
  
  const app = document.getElementById('app');
  if (!app) return;

  // Ensure body classes are maintained for pull-to-refresh functionality
  if (!document.body.classList.contains('overscroll-auto')) {
    document.body.classList.add('overscroll-auto');
  }
  
  // Ensure overscroll behavior is properly set
  if (document.body.style.overscrollBehavior === 'none') {
    document.body.style.overscrollBehavior = '';
  }

  const renderFn = routes[path] || renderHome;
  app.innerHTML = '';
  app.appendChild(renderFn());

  const title = titles[path] || 'App';
  document.title = `Transcendence — ${title}`;
  setPageTitleAndFocus(title);
  announce(`Navigated to ${title}`);
  updateText();
}
