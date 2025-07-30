type Translations = { [key: string]: string };
let translations: Translations = {};

export async function loadLanguage(lang: string) {
  const response = await fetch(`/locales/${lang}.json`);
  translations = await response.json();
  updateText();
}

export function t(key: string): string {
  return translations[key] || key;
}

export function updateText() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
  const key = el.getAttribute('data-i18n-placeholder');
  if (key && el instanceof HTMLInputElement) {
    el.placeholder = t(key);
  }
  });
}