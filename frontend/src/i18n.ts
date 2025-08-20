type Translations = Record<string, string>;
let translations: Translations = {};
let currentLang = 'en';

export async function loadLanguage(lang: string) {
  currentLang = lang;

  document.documentElement.setAttribute('lang', lang);

  try {
    const res = await fetch(`/locales/${lang}.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Missing locale: ${lang}`);
    translations = await res.json();
    localStorage.setItem('lang', lang);
  } catch (err) {
    if (lang !== 'en') {
      const res = await fetch(`/locales/en.json`, { cache: 'no-store' });
      translations = await res.json();
      currentLang = 'en';
      document.documentElement.setAttribute('lang', 'en');
      document.documentElement.dir = 'ltr';
      localStorage.setItem('lang', 'en');
    }
  }

  updateText();
}

export function t(key: string): string {
  return translations[key] ?? key;
}

export function updateText() {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
      el.placeholder = t(key);
    }
  });

  document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (key) el.setAttribute('title', t(key));
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-aria-label]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria-label');
    if (key) el.setAttribute('aria-label', t(key));
  });
}

export function getCurrentLang() { return currentLang; }

export async function initI18n() {
  const saved = localStorage.getItem('lang') || 'en';
  await loadLanguage(saved);
}