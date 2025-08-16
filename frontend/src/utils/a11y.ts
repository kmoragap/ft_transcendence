// src/utils/a11y.ts
export const SR_ANNOUNCER_ID = 'sr-announcer';
export const SKIP_LINK_ID = 'skip-to-content';
export const PAGE_TITLE_ID = 'page-title';

function ensurePageTitle() {
  if (document.getElementById(PAGE_TITLE_ID)) return;
  const h1 = document.createElement('h1');
  h1.id = PAGE_TITLE_ID;
  h1.tabIndex = -1;
  h1.className = 'sr-only';
  (document.getElementById('main') ?? document.body).prepend(h1);
}

function ensureSkipLink() {
  if (document.getElementById(SKIP_LINK_ID)) return;

  const a = document.createElement('a');
  a.id = SKIP_LINK_ID;
  a.href = '#main';
  a.textContent = 'Skip to content';
  a.className = 'sr-only focus:not-sr-only fixed top-2 left-2 z-[10000] px-3 py-2 rounded bg-black/80 text-white';
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
  if (h1) {
    h1.textContent = title;
    h1.focus();
  }
}
