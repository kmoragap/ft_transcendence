// i18n implementation for pong game
let translations: Record<string, string> = {};
let currentLanguage = 'en';

export function t(key: string): string {
  return translations[key] || key;
}

export async function initI18n(lang: string = 'en'): Promise<void> {
  currentLanguage = lang;
  
  try {
    const response = await fetch(`/pong/locales/${lang}.json`);
    if (response.ok) {
      translations = await response.json();
    } else {
      if (lang !== 'en') {
        const fallbackResponse = await fetch('/pong/locales/en.json');
        if (fallbackResponse.ok) {
          translations = await fallbackResponse.json();
        }
      }
    }
  } catch (error) {
    translations = {
      'scores': 'Scores',
      'wins': 'Wins',
      'player_1': 'Player 1',
      'player_2': 'Player 2',
      'game_over': 'Game Over',
      'restart': 'Restart',
      'pause': 'Pause',
      'resume': 'Resume'
    };
  }
  
  updateHTMLTranslations();
}

function updateHTMLTranslations(): void {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key && translations[key]) {
      el.textContent = translations[key];
    }
  });
}
