import { t, loadLanguage } from './../i18n';

export function renderHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'px-[40px] py-[10px] bg-gradient-to-r from-[#1f7474] to-[#031b1b] z-10';
  header.style.backgroundImage = 'linear-gradient(91deg, #1f7474 0%, #031b1b 90%)';

  const ul = document.createElement('ul');
  ul.classList.add('flex', 'justify-end', 'list-none');

  ['home', 'game', 'login'].forEach(key => {
    const li = document.createElement('li');
    li.classList.add('ml-[1.25rem]', 'font-[mclaren]', 'font-[700]', 'text-[23px]', 'text-[#66fcf1]');
    li.setAttribute('data-i18n', key);
    li.textContent = t(key);
    li.style.cursor = 'pointer';
    li.addEventListener('click', () => {
      location.hash = `/${key}`;
    });
    ul.appendChild(li);
  });

  const langSelect = document.createElement('select');
  langSelect.id = 'language-switcher';
  langSelect.className = 'ml-[15px] mt-[8px] px-[2px] py-[1px] bg-[#031b1b] text-[#66fcf1] border border-[#66fcf1] rounded-[5px]';

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
  });

  const langLi = document.createElement('li');
  langLi.appendChild(langSelect);
  ul.appendChild(langLi);

  header.appendChild(ul);
  return header;
}