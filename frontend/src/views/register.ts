import { t } from './../i18n';

import { attachValidation } from './../form-validation';

export function renderRegistration(): HTMLElement {
  const section = document.createElement('section');
  section.className =
    'flex flex-col m-0 mt-[10%] items-center justify-center h-full text-center relative z-[3] font-[jura] text-[#66fcf1]';

  section.innerHTML = `
    <div class="flex flex-col items-center justify-center">
      <h1 data-i18n="registration" class="text-[70px] font-bold uppercase">Registration</h1>
    </div>
    <form
      id="register-form"
      novalidate
      class="mt-[10px] flex flex-col items-center py-[40px] px-[50px] bg-[rgba(102,252,241,0.1)] rounded-[6px] shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
    >
      <div class="w-full mb-[10px]">
        <input
          id="username"
          type="text"
          name="username"
          autocomplete="username"
          data-i18n-placeholder="username"
          placeholder="..."
          required
          aria-required="true"
          aria-invalid="false"
          aria-describedby="username-error"
          class="px-[20px] py-[8px] border-0 rounded-[6px]"
        />
        <p id="username-error" class="text-red-600 mt-1 my-auto text-sm hidden" role="alert"></p>
      </div>

      <div class="w-full mb-[10px]">
        <input
          id="email"
          type="email"
          name="email"
          autocomplete="email"
          data-i18n-placeholder="email"
          placeholder="..."
          required
          aria-required="true"
          aria-invalid="false"
          aria-describedby="email-error"
          class="px-[20px] py-[8px] border-0 rounded-[6px]"
        />
        <p id="email-error" class="text-red-600 mt-1 my-auto text-sm hidden" role="alert"></p>
      </div>

      <div class="w-full mb-[10px]">
        <input
          id="firstname"
          type="text"
          name="firstname"
          autocomplete="given-name"
          data-i18n-placeholder="firstname"
          placeholder="..."
          required
          aria-required="true"
          aria-invalid="false"
          aria-describedby="firstname-error"
          class="px-[20px] py-[8px] border-0 rounded-[6px]"
        />
        <p id="firstname-error" class="text-red-600 mt-1 my-auto text-sm hidden" role="alert"></p>
      </div>

      <div class="w-full mb-[20px]">
        <input
          id="password"
          type="password"
          name="password"
          autocomplete="new-password"
          data-i18n-placeholder="password"
          placeholder="..."
          required
          aria-required="true"
          aria-invalid="false"
          aria-describedby="password-error"
          class="px-[20px] py-[8px] border-0 rounded-[6px]"
        />
        <p id="password-error" class="text-red-600 mt-1 my-auto text-sm hidden" role="alert"></p>
      </div>

      <button
        type="submit"
        class="btn py-[10px] text-[18px] font-[700] cursor-not-allowed"
      >
        <span data-i18n="submit">Submit</span>
      </button>
    </form>
  `;

  const form = section.querySelector<HTMLFormElement>('#register-form')!;
  attachValidation(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();              

    if (!form.checkValidity())
	{
		form.reportValidity();  
		return;
	}
    const username = (form.querySelector('#username') as HTMLInputElement).value;
    const email    = (form.querySelector('#email')    as HTMLInputElement).value;
    const firstname= (form.querySelector('#firstname')as HTMLInputElement).value;
    const password = (form.querySelector('#password') as HTMLInputElement).value;

    try {
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, firstname, password }),
      });

      if (!res.ok) {
        const { message } = await res.json();
        alert(`Registration failed: ${message}`);
        return;
      }

      alert('Registration successful! You can now log in.');
      window.location.href = '#/login';
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred.');
    }
  });

  return section;
}
