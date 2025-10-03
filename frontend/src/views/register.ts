import { t } from './../i18n';
import { attachValidation } from './../form-validation';
//import { redirectIfAuthenticated } from '../utils/auth';
import { alertError, alertSuccess } from './../utils/modal-alerts';
import { store } from '../store';

export function renderRegistration(): HTMLElement {
  //redirectIfAuthenticated();
  const section = document.createElement('section');
  section.className =
    'flex flex-col m-0 items-center justify-center h-full text-center relative z-10 font-[jura] text-[#66fcf1]';

  section.innerHTML = `
    <h1 class="title uppercase mobile-title">
        <span class="mid_line" data-i18n="registration">REGISTRATION</span>
    </h1>
    <form
      id="register-form"
      novalidate
      class="mt-2.5 flex flex-col items-center py-10 px-12 bg-[rgba(102,252,241,0.1)] rounded-md shadow-lg"
    >
      <div class="w-full mb-2.5">
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
          class='w-full px-4 py-2 rounded-lg
          bg-[#0a2b2b] text-[#66fcf1] placeholder-[#66fcf1]/60
          border border-[#66fcf1]/30 focus:border-[#66fcf1]/60
          outline-none font-[jura]'
        />
        <p id="username-error" class="text-red-600 mt-1 my-auto text-sm hidden" role="alert"></p>
      </div>

      <div class="w-full mb-2.5">
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
          class='w-full px-4 py-2 rounded-lg
          bg-[#0a2b2b] text-[#66fcf1] placeholder-[#66fcf1]/60
          border border-[#66fcf1]/30 focus:border-[#66fcf1]/60
          outline-none font-[jura]'
        />
        <p id="email-error" class="text-red-600 mt-1 my-auto text-sm hidden" role="alert"></p>
      </div>

      <div class="w-full mb-2.5">
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
          class='w-full px-4 py-2 rounded-lg
          bg-[#0a2b2b] text-[#66fcf1] placeholder-[#66fcf1]/60
          border border-[#66fcf1]/30 focus:border-[#66fcf1]/60
          outline-none font-[jura]'
        />
        <p id="firstname-error" class="text-red-600 mt-1 my-auto text-sm hidden" role="alert"></p>
      </div>

      <div class="w-full mb-5">
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
          class='w-full px-4 py-2 rounded-lg
          bg-[#0a2b2b] text-[#66fcf1] placeholder-[#66fcf1]/60
          border border-[#66fcf1]/30 focus:border-[#66fcf1]/60
          outline-none font-[jura]'
        />
        <p id="password-error" class="text-red-600 mt-1 my-auto text-sm hidden" role="alert"></p>
      </div>

      <button
        type="submit"
        class="btn !w-full py-2.5 text-lg font-bold cursor-not-allowed"
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, firstname, password }),
      });

      if (!res.ok) {
        const { message } = await res.json();
        alertError(`Registration failed: ${message}`);
        return;
      }

      alertSuccess('Registration successful! You can now log in.');
      const user = { username, firstname, email };

      store.dispatch({ type: 'LOGIN', payload: user });   
      alertSuccess('Login successful!');
      window.location.hash = '/';
    } catch (err) {
      console.error(err);
      alertError('An unexpected error occurred.');
    }
  });

  return section;
}
