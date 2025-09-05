export const SKIP_LINK_ID = 'skip-to-content';
export const SR_ANNOUNCER_ID = 'sr-announcer';
export const PAGE_TITLE_ID = 'page-title';
const STORAGE = { HC: 'a11y.hc', SCALE: 'a11y.textScale' };

type A11yState = { hc: boolean; scale: number };
let state: A11yState = {
  hc: (localStorage.getItem(STORAGE.HC) ?? 'false') === 'true',
  scale: parseFloat(localStorage.getItem(STORAGE.SCALE) || '1') || 1,
};

function ensureSkipLink() {
  if (document.getElementById(SKIP_LINK_ID)) return;
  const a = document.createElement('a');
  a.id = SKIP_LINK_ID;
  a.href = '#main';
  a.textContent = 'Skip to content';
  a.className =
    'sr-only focus:not-sr-only fixed top-2 left-2 z-50 px-3 py-2 rounded ' +
    'bg-black/80 text-white';
  document.body.prepend(a);
}

function ensureLiveRegion() {
  if (document.getElementById(SR_ANNOUNCER_ID)) return;
  const div = document.createElement('div');
  div.id = SR_ANNOUNCER_ID;
  div.setAttribute('aria-live', 'polite');
  div.className = 'sr-only';
  document.body.prepend(div);
}

function ensurePageTitle() {
  if (document.getElementById(PAGE_TITLE_ID)) return;
  const h1 = document.createElement('h1');
  h1.id = PAGE_TITLE_ID;
  h1.tabIndex = -1;         
  h1.className = 'sr-only'; 
  (document.getElementById('main') ?? document.body).prepend(h1);
}

export function ensureA11yScaffold() {
  ensureSkipLink();
  ensureLiveRegion();
  ensurePageTitle();
}

export function announce(msg: string) {
  const el = document.getElementById(SR_ANNOUNCER_ID);
  if (!el) return;
  el.textContent = '';
  requestAnimationFrame(() => { el.textContent = msg; });
}

export function setPageTitleAndFocus(title: string) {
  const h1 = document.getElementById(PAGE_TITLE_ID) as HTMLElement | null;
  if (h1) { h1.textContent = title; h1.focus(); }
}

export function focusMain() {
  const main = document.getElementById('main') as HTMLElement | null;
  if (!main) return;
  if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
  main.focus();
}

export function setTextScale(next: number) {
  state.scale = Math.min(1.6, Math.max(0.9, +next.toFixed(2)));
  applyTheme();
}

function applyTheme() {
  document.documentElement.classList.toggle('hc', state.hc);
  const base = 16; // keep aligned with your Tailwind base
  document.documentElement.style.fontSize = `calc(${base}px * ${state.scale})`;
  localStorage.setItem(STORAGE.HC, String(state.hc));
  localStorage.setItem(STORAGE.SCALE, String(state.scale));
}

export function initA11yTheme() { applyTheme(); }
export function toggleHighContrast() { state.hc = !state.hc; applyTheme(); }
export function increaseText() { state.scale = Math.min(1.6, +(state.scale + 0.1).toFixed(2)); applyTheme(); }
export function decreaseText() { state.scale = Math.max(0.9,  +(state.scale - 0.1).toFixed(2)); applyTheme(); }
export function resetText()    { state.scale = 1; applyTheme(); }
export function getA11yState(): A11yState { return { ...state }; }
