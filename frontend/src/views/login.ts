import { t } from './../i18n';

export function renderLogin(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'flex flex-col m-0 mt-[10%] items-center justify-center h-full text-center relative z-[3] font-[mclaren] text-[#66fcf1]';

  section.innerHTML = `
	<div>
	  <h1 data-i18n="login" class="text-[70px] font-bold uppercase">Login</h1>
	</div>
	<form id="login-form" class="mt-[10px] flex flex-col items-center">
	  <input type="text" data-i18n-placeholder="username" placeholder="..." class="px-[20px] py-[8px] mb-[10px] border-0 rounded-[6px]" required>
	  <input type="text" data-i18n-placeholder="password" placeholder="..." class="px-[20px] py-[8px] mb-[10px] border-0 rounded-[6px]" required>
	  <button type="submit" class="text-[18px] font-[700] px-[30px] py-[8px] bg-[#66fcf1] text-[#031b1b] border-0 rounded-[6px] hover:bg-[#45a8a8] font-[mclaren] hover:shadow-[0_4px_10px_rgba(102,252,241,0.5)] transition-shadow duration-300" data-i18n="submit">Submit</button>
	</form>
  `;


  return section;
}