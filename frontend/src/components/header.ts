import { t, loadLanguage } from './../i18n';
import { store } from '../store';

export function renderHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'px-[40px] py-[10px] bg-gradient-to-r from-[#1f7474] to-[#031b1b] z-10';
  header.style.backgroundImage = 'linear-gradient(91deg, #1f7474 0%, #031b1b 90%)';

  // render function closes over `header`
  function updateHeader() {
    // clear out old content
    header.innerHTML = '';

    // build nav + lang + user
    const ul = document.createElement('ul');
    ul.classList.add('flex', 'justify-end', 'items-center', 'list-none');

    // nav links
    const links = ['home', 'game'];
    const { isAuthenticated, currentUser } = store.getState();

    // if not authed, show "login"
    if (!isAuthenticated) links.push('login');

    links.forEach(key => {
      const li = document.createElement('li');
      li.classList.add(
        'ml-[1.25rem]', 'font-[mclaren]', 'font-[700]', 'text-[23px]', 'text-[#66fcf1]'
      );
      li.setAttribute('data-i18n', key);
      li.textContent = t(key);
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => {
        location.hash = `/${key}`;
      });
      ul.appendChild(li);
    });

    // language selector
    const langLi = document.createElement('li');
    langLi.classList.add('ml-[1.25rem]');
    const langSelect = document.createElement('select');
    langSelect.id = 'language-switcher';
    langSelect.className =
      'px-[2px] py-[1px] bg-[#031b1b] text-[#66fcf1] border border-[#66fcf1] rounded-[5px]';
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
    ul.appendChild(langLi);

    if (isAuthenticated && currentUser) {
      const userLi = document.createElement('li');
      userLi.classList.add('ml-[1.25rem]', 'flex', 'items-center', 'text-[#66fcf1]');
      userLi.innerHTML = `
        <span class="font-[mclaren] font-[700] text-[23px]">
          ${currentUser.username}
        </span>
      `;
      const img = document.createElement('img');
      img.src = currentUser.avatarUrl;
      img.alt = 'avatar';
      img.className = 'h-8 w-8 rounded-full ml-2';
      userLi.appendChild(img);
      ul.appendChild(userLi);
    }

    header.appendChild(ul);
  }

  updateHeader();
  store.subscribe(updateHeader);

  return header;
}