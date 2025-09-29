import { t, loadLanguage } from './../i18n';
import { store } from '../store';
import { logout } from '../utils/auth';
import { renderA11yControls } from './a11y-switcher';
import { sessionManager } from '../utils/session';

export function renderHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'px-4 md:px-10 py-3 md:py-5 bg-gradient-to-r from-[#1f7474] to-[#031b1b] z-50';
  header.style.backgroundImage = 'linear-gradient(91deg, #1f7474 0%, #031b1b 90%)';

  let lastAuthState: { isAuthenticated: boolean; currentUser: any } | null = null;
  let abortController: AbortController | null = null;
  
  function updateHeader() {
    if (!sessionManager.isSessionRestored()) {
      header.innerHTML = '';
      return;
    }
    
    const currentAuthState = store.getState();
    
    if (lastAuthState && 
        lastAuthState.isAuthenticated === currentAuthState.isAuthenticated &&
        lastAuthState.currentUser?.id === currentAuthState.currentUser?.id) {
      return;
    }
    
    lastAuthState = { ...currentAuthState };
    
    // Clean up previous event listeners
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();
    
    header.innerHTML = '';

    // Define languages array once for reuse
    const languages = [
      { code: 'en', label: 'EN' },
      { code: 'de', label: 'DE' },
      { code: 'ru', label: 'RU' },
    ];

    const bar = document.createElement('div');
    bar.className = 'flex items-center justify-between';

    const searchWrap = document.createElement('div');
    searchWrap.className = 'flex items-center gap-2 flex-1 md:flex-none';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.placeholder = t('search_users') || 'Search users…';
    searchInput.setAttribute('aria-label', t('search_users') || 'Search users');
    searchInput.className = [
      'w-48 md:w-48 md:focus:w-64 transition-all duration-200',
      'h-8 md:h-9 px-2 md:px-2.5 rounded-lg text-sm md:text-base',
      'bg-[#0a2b2b] text-[#66fcf1] placeholder-[#66fcf1]/60',
      'border border-[#66fcf1]/30 focus:border-[#66fcf1]/60',
      'outline-none font-[jura]'
    ].join(' ');

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') e.preventDefault();
    });

    searchWrap.appendChild(searchInput);

    // Mobile hamburger menu (right side)
    const hamburgerBtn = document.createElement('button');
    hamburgerBtn.type = 'button';
    hamburgerBtn.className = 'md:hidden inline-flex items-center justify-center w-10 h-10 border-0 text-[#66fcf1] bg-transparent focus-visible:ring-2 focus-visible:ring-[#66fcf1] rounded';
    hamburgerBtn.setAttribute('aria-label', 'Open menu');
    hamburgerBtn.setAttribute('aria-expanded', 'false');

    hamburgerBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 12h18M3 6h18M3 18h18" stroke="#66fcf1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    // Desktop navigation (hidden on mobile)
    const desktopNav = document.createElement('ul');
    desktopNav.className = 'hidden md:flex justify-end items-center list-none';

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

      desktopNav.appendChild(li);
    });

    // Mobile menu overlay
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'fixed inset-0 bg-black/50 z-50 md:hidden opacity-0 pointer-events-none transition-opacity duration-300';
    
    const mobileMenuContent = document.createElement('div');
    mobileMenuContent.className = 'fixed right-0 top-0 h-full w-64 bg-[rgba(3,27,27,0.95)] backdrop-blur-sm transform translate-x-full transition-transform duration-300 shadow-2xl';
    
    // Mobile menu state management - single source of truth
    let open = false;
    
    function setMenu(next: boolean) {
      open = next;
      hamburgerBtn.setAttribute('aria-expanded', String(open));

      mobileMenu.classList.toggle('opacity-0', !open);
      mobileMenu.classList.toggle('pointer-events-none', !open);
      mobileMenuContent.classList.toggle('translate-x-full', !open);

      document.body.classList.toggle('mobile-menu-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }
    
    const mobileMenuHeader = document.createElement('div');
    mobileMenuHeader.className = 'flex items-center justify-between p-4 border-b border-[#66fcf1]/20';
    
    // Create a compact language selector for the header
    const headerLangSelect = document.createElement('select');
    headerLangSelect.className = 'px-2 py-1 bg-[#0a2b2b] text-[#66fcf1] font-[jura] border border-[#66fcf1]/30 rounded text-sm';
    languages.forEach(({ code, label }) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = label;
      option.className = 'border-0 bg-transparent text-[#66fcf1]';
      headerLangSelect.appendChild(option);
    });
    headerLangSelect.value = localStorage.getItem('lang') || 'en';
    headerLangSelect.addEventListener('change', async (e) => {
      const lang = (e.target as HTMLSelectElement).value;
      localStorage.setItem('lang', lang);
      await loadLanguage(lang);
      
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.placeholder = t('search_users') || 'Search users…';
        searchInput.setAttribute('aria-label', t('search_users') || 'Search users');
      }
      
      updateHeader();
      
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    });
    
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'inline-flex items-center justify-center w-8 h-8 border-0 text-[#66fcf1] bg-transparent focus-visible:ring-2 focus-visible:ring-[#66fcf1] rounded';
    closeBtn.setAttribute('aria-label', 'Close menu');
    closeBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M18 6L6 18M6 6l12 12" stroke="#66fcf1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    mobileMenuHeader.appendChild(headerLangSelect);
    mobileMenuHeader.appendChild(closeBtn);
    
    const mobileNav = document.createElement('nav');
    mobileNav.className = 'p-4 flex flex-col items-end';
    mobileNav.setAttribute('role', 'navigation');
    mobileNav.setAttribute('aria-label', 'Mobile navigation');
    
    // Create mobile navigation items
    const mobileLinks = [...links];
    if (isAuthenticated && currentUser) {
      mobileLinks.push('myprofile', 'logout');
    }
    
    mobileLinks.forEach(key => {
      const menuItem = document.createElement('button');
      menuItem.type = 'button';
      menuItem.className = [
        'block text-right p-2 mb-2',
        'text-[#66fcf1] font-[jura] font-semibold text-lg',
        'bg-transparent border-0 rounded-lg',
        'hover:bg-[#66fcf1]/10 focus:bg-[#66fcf1]/10',
        'focus:outline-none focus:ring-2 focus:ring-[#66fcf1]'
      ].join(' ');
      menuItem.setAttribute('data-i18n', key);
      menuItem.textContent = t(key);
      
      menuItem.addEventListener('click', async () => {
        setMenu(false); // Keep state and UI in sync
        
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
      
      mobileNav.appendChild(menuItem);
    });
    
    mobileMenuContent.appendChild(mobileMenuHeader);
    mobileMenuContent.appendChild(mobileNav);
    mobileMenu.appendChild(mobileMenuContent);
    
    hamburgerBtn.addEventListener('click', () => setMenu(!open), { signal: abortController.signal });
    closeBtn.addEventListener('click', () => setMenu(false), { signal: abortController.signal });
    
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) setMenu(false);
    }, { signal: abortController.signal });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && open) setMenu(false);
    }, { signal: abortController.signal });
    
    window.addEventListener('hashchange', () => setMenu(false), { signal: abortController.signal });

    const langLi = document.createElement('li');
    langLi.classList.add('ml-5');
    const langSelect = document.createElement('select');
    langSelect.id = 'language-switcher';
    langSelect.className =
      'px-0.5 py-0.5 mt-1.5 bg-[#0a2b2b] text-[#66fcf1] font-[jura] border border-[#66fcf1] rounded-sm';
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
      
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.placeholder = t('search_users') || 'Search users…';
        searchInput.setAttribute('aria-label', t('search_users') || 'Search users');
      }
      
      updateHeader();
      
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    });
    langLi.appendChild(langSelect);
    
    // Mobile language selector
    const mobileLangSelect = document.createElement('select');
    mobileLangSelect.className = 'px-0.5 py-0.5 mt-1.5 bg-[#0a2b2b] text-[#66fcf1] font-[jura] border border-[#66fcf1] rounded-sm';
    languages.forEach(({ code, label }) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = label;
      option.className = 'border-0 bg-transparent text-[#66fcf1]';
      mobileLangSelect.appendChild(option);
    });
    mobileLangSelect.value = localStorage.getItem('lang') || 'en';
    mobileLangSelect.addEventListener('change', async (e) => {
      const lang = (e.target as HTMLSelectElement).value;
      localStorage.setItem('lang', lang);
      await loadLanguage(lang);
      
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.placeholder = t('search_users') || 'Search users…';
        searchInput.setAttribute('aria-label', t('search_users') || 'Search users');
      }
      
      updateHeader();
      
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    });
    
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
        'absolute right-0 mt-2 w-48',
        'bg-[rgba(102,252,241,0.1)] rounded-md shadow-lg',
        'opacity-0 pointer-events-none transition'
      ].join(' ');
      menu.setAttribute('role', 'menu');

      menu.innerHTML = `
        <button data-i18n="my_profile" data-action="me"
          class="block w-full text-center p-2.5 px-6 text-[#66fcf1] text-base font-[jura] font-bold bg-transparent border-0 rounded-md hover:bg-[#66fcf1]/10">${t('my_profile')}</button>
        <button data-i18n="logout" data-action="logout"
          class="block w-full text-center p-2.5 px-6 text-[#66fcf1] text-base font-[jura] font-bold bg-transparent border-0 rounded-md hover:bg-[#66fcf1]/10">${t('logout')}</button>
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
      desktopNav.appendChild(userLi);
    }
    
    desktopNav.appendChild(langLi);
    desktopNav.appendChild(renderA11yControls());
    
    const mobileA11y = renderA11yControls();
    mobileA11y.className = mobileA11y.className.replace('ml-5', 'mb-4');
    mobileNav.appendChild(mobileA11y);
    
    bar.appendChild(searchWrap);
    bar.appendChild(hamburgerBtn);
    bar.appendChild(desktopNav);
    header.appendChild(bar);
    header.appendChild(mobileMenu);
  }

  updateHeader();
  store.subscribe(updateHeader);
  sessionManager.onSessionRestored(updateHeader);

  return header;
}