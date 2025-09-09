import { t, loadLanguage } from './../i18n';
import { store } from '../store';
import { logout } from '../utils/auth';
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
  header.className = 'px-10 py-5 bg-gradient-to-r from-[#1f7474] to-[#031b1b] z-50';
  header.style.backgroundImage = 'linear-gradient(91deg, #1f7474 0%, #031b1b 90%)';

  function updateHeader() {
    if (!isSessionRestored) {
      header.innerHTML = '';
      return;
    }
    header.innerHTML = '';

    const bar = document.createElement('div');
    bar.className = 'flex items-center justify-between';

    const searchWrap = document.createElement('div');
    searchWrap.className = 'flex items-center gap-2';
    const searchBtn = document.createElement('button');
    searchBtn.type = 'button';
    searchBtn.className = 'inline-flex items-center justify-center w-9 h-9 border-0 text-[#66fcf1] bg-transparent focus-visible:ring-2 focus-visible:ring-[#66fcf1]';
    searchBtn.setAttribute('aria-label', t('search_users') || 'Search users');

    searchBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M21 21l-4.2-4.2M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
              stroke="#66fcf1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.placeholder = t('search_users') || 'Search users…';
    searchInput.setAttribute('aria-label', t('search_users') || 'Search users');
    searchInput.className = [
      'w-45 focus:w-65 transition-all duration-200',
      'h-9 px-2.5 rounded-lg',
      'bg-[#0a2b2b] text-[#66fcf1] placeholder-[#66fcf1]/60',
      'border border-[#66fcf1]/30 focus:border-[#66fcf1]/60',
      'outline-none font-[jura]'
    ].join(' ');

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') e.preventDefault();
    });

    searchWrap.appendChild(searchBtn);
    searchWrap.appendChild(searchInput);

    const ul = document.createElement('ul');
    ul.classList.add('flex', 'justify-end', 'items-center', 'list-none');

    const links = ['home', 'game', 'dashboard'];
    const { isAuthenticated, currentUser } = store.getState();

    if (!isAuthenticated) {
      links.push('login');
    }

    links.forEach(key => {
      const li = document.createElement('li');
      li.classList.add(
        'ml-5', 'font-[jura]', 'font-semibold', 'text-xl', 'text-[#66fcf1]'
      );
      li.setAttribute('data-i18n', key);
      li.textContent = t(key);
      li.style.cursor = 'pointer';

      li.addEventListener('click', async () => {
        switch (key) {
          case 'logout':
            await logout();
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
    langLi.classList.add('ml-5');
    const langSelect = document.createElement('select');
    langSelect.id = 'language-switcher';
    langSelect.className =
      'px-0.5 py-0.5 mt-1.5 bg-[#0a2b2b] text-[#66fcf1] font-[jura] border border-[#66fcf1] rounded-sm';
    const languages = [
      { code: 'en', label: 'EN' },
      { code: 'de', label: 'DE' },
      { code: 'ru', label: 'RU' },
    ];
    languages.forEach(({ code, label }) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = label;
      option.className = 'border-0 bg-transparent text-[#66fcf1] hover:bg-[#66fcf1]/10';
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
      userLi.className = 'relative ml-5';

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = [
        'flex items-center gap-2',
        'text-[#66fcf1] bg-transparent border-0',
        'focus-visible:ring-2 focus-visible:ring-[#66fcf1] rounded'
      ].join(' ');
      trigger.setAttribute('aria-haspopup', 'menu');
      trigger.setAttribute('aria-expanded', 'false');

      const name = document.createElement('span');
      name.className = 'font-[jura] font-bold text-lg';
      name.textContent = currentUser.username;

      const avatar = document.createElement("img");
      avatar.alt = "Me";
      avatar.width = 32; avatar.height = 32;
      avatar.className = "w-8 h-8 rounded-full object-cover border border-[#66fcf1]/30";
      avatar.src = currentUser?.avatarUrl || "/assets/img/avatar.svg"; 

      trigger.append(name, avatar);

      const menu = document.createElement('div');
      menu.className = [
        'absolute right-0 mt-2',
        'bg-[rgba(102,252,241,0.1)] rounded-md shadow-lg',
        'opacity-0 pointer-events-none transition'
      ].join(' ');
      menu.setAttribute('role', 'menu');

      menu.innerHTML = `
        <button data-i18n="my_profile" data-action="me"
          class="block w-full text-center p-2.5 px-6 text-[#66fcf1] text-base font-[jura] font-bold bg-transparent border-0 rounded-md hover:bg-[#66fcf1]/10">My Profile</button>
        <button data-i18n="logout" data-action="logout"
          class="block w-full text-center p-2.5 px-6 text-[#66fcf1] text-base font-[jura] font-bold bg-transparent border-0 rounded-md hover:bg-[#66fcf1]/10">Logout</button>
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

      menu.addEventListener('click', async (e) => {
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
          await logout();
          location.hash = '/login';
          return;
        }
      });

      userLi.append(trigger, menu);
      ul.appendChild(userLi);
    }
    ul.appendChild(langLi);
    ul.appendChild(renderA11yControls());
    bar.appendChild(searchWrap);
    bar.appendChild(ul);
    header.appendChild(bar);
  }

  updateHeaderCallback = updateHeader;
  updateHeader();
  store.subscribe(updateHeader);

  return header;
}