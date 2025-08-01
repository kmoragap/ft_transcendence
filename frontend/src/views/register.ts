import { t } from './../i18n';

export function renderRegistration(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'flex flex-col m-0 mt-[10%] items-center justify-center h-full text-center relative z-[3] font-[mclaren] text-[#66fcf1]';

  section.innerHTML = `
	<div class="flex flex-col items-center justify-center">
	  <h1 data-i18n="registration" class="text-[70px] font-bold uppercase">Registration</h1>
	</div>
	<form id="register-form" class="mt-[10px] flex flex-col items-center py-[40px] px-[40px] bg-[rgba(102,252,241,0.1)] rounded-[6px] shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
	  <input type="text" name="username" autocomplete="username" data-i18n-placeholder="username" placeholder="..." class="w-full px-[20px] py-[8px] mb-[10px] border-0 rounded-[6px]" required>
	  <input type="email" name="email" autocomplete="email" data-i18n-placeholder="email" placeholder="..." class="w-full px-[20px] py-[8px] mb-[10px] border-0 rounded-[6px]" required>
	  <input type="text" name="firstname" autocomplete="firstname" data-i18n-placeholder="firstname" placeholder="..." class="w-full px-[20px] py-[8px] mb-[10px] border-0 rounded-[6px]" required>
	  <input type="password" name="password" autocomplete="current-password" data-i18n-placeholder="password" placeholder="..." class="w-full px-[20px] py-[8px] mb-[10px] border-0 rounded-[6px]" required>
	  <button type="submit" class="w-full cursor-pointer text-[18px] font-[700] px-[30px] py-[8px] bg-gradient-to-r from-[#66fcf1] to-[#1f7474] text-[#031b1b] border-0 rounded-[6px] hover:bg-[#45a8a8] font-[mclaren] hover:shadow-[0_4px_10px_rgba(102,252,241,0.5)] transition-shadow duration-300" data-i18n="submit">Submit</button>
	</form>
  `;


  return section;
}