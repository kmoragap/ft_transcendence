import { t, loadLanguage } from './../i18n';
import { store } from '../store';

let isSessionRestored = false;
let updateHeaderCallback: (() => void) | null = null;

export function setSessionRestored() {
  isSessionRestored = true;
  if (updateHeaderCallback) {
    updateHeaderCallback();
  }
}

export function renderHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'px-[40px] py-[10px] bg-gradient-to-r from-[#1f7474] to-[#031b1b] z-10';
  header.style.backgroundImage = 'linear-gradient(91deg, #1f7474 0%, #031b1b 90%)';

  function updateHeader() {
    if (!isSessionRestored) {
      header.innerHTML = '';
      return;
    }
    header.innerHTML = '';

    const ul = document.createElement('ul');
    ul.classList.add('flex', 'justify-end', 'items-center', 'list-none');

    const links = ['home', 'game'];
    const { isAuthenticated, currentUser } = store.getState();

    if (!isAuthenticated) {
      links.push('login');
    } else {
      links.push('profile', 'logout');
    }

    links.forEach(key => {
      const li = document.createElement('li');
      li.classList.add(
        'ml-[1.25rem]', 'font-[jura]', 'font-[600]', 'text-[26px]', 'text-[#66fcf1]'
      );
      li.setAttribute('data-i18n', key);
      li.textContent = t(key);
      li.style.cursor = 'pointer';

      li.addEventListener('click', () => {
        switch (key) {
          case 'logout':
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            store.dispatch({ type: 'LOGOUT' });
            location.hash = '/home';
            break;

          case 'profile':
            location.hash = '/profile';
            break;

          default:
            location.hash = `/${key}`;
        }
      });

      ul.appendChild(li);
    });

    const langLi = document.createElement('li');
    langLi.classList.add('ml-[1.25rem]');
    const langSelect = document.createElement('select');
    langSelect.id = 'language-switcher';
    langSelect.className =
      'px-[2px] py-[1px] mt-[6px] bg-[#031b1b] text-[#66fcf1] border border-[#66fcf1] rounded-[5px]';
    const languages = [
      { code: 'en', label: 'EN' },
      { code: 'de', label: 'DE' },
      { code: 'ru', label: 'RU' },
    ];
    languages.forEach(({ code, label }) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = label;
      langSelect.appendChild(option);
    });
    langSelect.value = localStorage.getItem('lang') || 'en';
    langSelect.addEventListener('change', async (e) => {
      const lang = (e.target as HTMLSelectElement).value;
      localStorage.setItem('lang', lang);
      await loadLanguage(lang);
      updateHeader();
    });
    langLi.appendChild(langSelect);

    if (isAuthenticated && currentUser) {
      const userLi = document.createElement('li');
      const avatarUrl = currentUser.avatarUrl || '/assets/img/avatar.jpg';
      userLi.classList.add('ml-[1.25rem]', 'flex', 'items-center', 'text-[#66fcf1]');
      userLi.innerHTML = `
        <span class="font-[jura] font-[700] text-[23px]">
          ${currentUser.username}
        </span>
      `;
      const img = document.createElement('img');
      img.src = avatarUrl;
      img.width = 32;
      img.height = 32;
      img.style.marginLeft = '10px';
      img.loading = 'lazy';
      img.alt = 'avatar';
      img.className = 'h-8 w-8 rounded-full ml-2';
      img.onerror = () => {
        img.src = '/assets/img/avatar.jpg';
      };
      userLi.appendChild(img);
      ul.appendChild(userLi);
    }
    ul.appendChild(langLi);
    header.appendChild(ul);
  }

  updateHeaderCallback = updateHeader;
  updateHeader();
  store.subscribe(updateHeader);

  return header;
}