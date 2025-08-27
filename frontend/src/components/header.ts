import { t, loadLanguage } from './../i18n';
import { store } from '../store';
import { renderA11yControls } from './a11y-switcher';

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
    }

    links.forEach(key => {
      const li = document.createElement('li');
      li.classList.add(
        'ml-[1.25rem]', 'font-[jura]', 'font-[600]', 'text-[1.625rem]', 'text-[#66fcf1]'
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

          case 'myprofile':
            location.hash = '/myprofile';
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
      'px-[2px] py-[1px] mt-[6px] bg-[#0a2b2b] text-[#66fcf1] font-[jura] border border-[#66fcf1] rounded-[5px]';
    const languages = [
      { code: 'en', label: 'EN' },
      { code: 'de', label: 'DE' },
      { code: 'ru', label: 'RU' },
    ];
    languages.forEach(({ code, label }) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = label;
      option.className = 'border-[0] bg-[transparent] text-[#66fcf1] hover:bg-[#66fcf1]/10';
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
      userLi.className = 'relative ml-[1.25rem]';

      const avatarUrl = currentUser.avatarUrl || '/assets/img/avatar.jpg';

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = [
        'flex items-center gap-2',
        'text-[#66fcf1] bg-[transparent] border-[0]',
        'focus-visible:ring-2 focus-visible:ring-[#66fcf1] rounded'
      ].join(' ');
      trigger.setAttribute('aria-haspopup', 'menu');
      trigger.setAttribute('aria-expanded', 'false');

      const name = document.createElement('span');
      name.className = 'font-[jura] font-[700] text-[1.4375rem]';
      name.textContent = currentUser.username;

      const img = document.createElement('img');
      img.src = avatarUrl;
      img.alt = t('profile_avatar') || 'Avatar';
      img.className = 'w-[2rem] h-[2rem] ml-[0.5rem] rounded-full border border-[#66fcf1] object-cover';

      trigger.append(name, img);

      const menu = document.createElement('div');
      menu.className = [
        'absolute right-0 mt-2 w-[150px]',
        'bg-[rgba(102,252,241,0.1)] rounded-[6px] shadow-[0_4px_10px_rgba(0,0,0,0.5)]',
        'opacity-0 pointer-events-none transition'
      ].join(' ');
      menu.setAttribute('role', 'menu');

      menu.innerHTML = `
        <button data-i18n="my_profile" data-action="me"
          class="block w-full text-center p-[10px] text-[#66fcf1] text-[1.2375rem] font-[jura] font-[700] bg-[transparent] border-[0] rounded-[6px] hover:bg-[#66fcf1]/10">My Profile</button>
        <button data-i18n="logout" data-action="logout"
          class="block w-full text-center p-[10px] text-[#66fcf1] text-[1.2375rem] font-[jura] font-[700] bg-[transparent] border-[0] rounded-[6px] hover:bg-[#66fcf1]/10">Logout</button>
      `;

      let open = false;
      const setOpen = (v: boolean) => {
        open = v;
        trigger.setAttribute('aria-expanded', String(v));
        menu.style.opacity = v ? '1' : '0';
        menu.style.pointerEvents = v ? 'auto' : 'none';
      };

      trigger.addEventListener('click', () => setOpen(!open));

      document.addEventListener('click', (e) => {
        if (!userLi.contains(e.target as Node)) setOpen(false);
      });

      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setOpen(false);
      });
      menu.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          setOpen(false);
          trigger.focus();
        }
      });

      menu.addEventListener('click', (e) => {
        const btn = (e.target as HTMLElement).closest('button');
        if (!btn) return;
        const action = btn.getAttribute('data-action');

        if (action === 'me') {
          setOpen(false);
          location.hash = '/myprofile';
          return;
        }

        if (action === 'logout') {
          setOpen(false);
          store.dispatch({ type: 'LOGOUT' });
          location.hash = '/login';
          return;
        }
      });

      userLi.append(trigger, menu);
      ul.appendChild(userLi);
    }
    ul.appendChild(langLi);
    ul.appendChild(renderA11yControls());
    header.appendChild(ul);
  }

  updateHeaderCallback = updateHeader;
  updateHeader();
  store.subscribe(updateHeader);

  return header;
}