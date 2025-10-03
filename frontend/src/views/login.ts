import { t } from './../i18n';
import { store } from '../store';
//import { redirectIfAuthenticated } from '../utils/auth';
import { alertError, alertSuccess } from './../utils/modal-alerts';

export function renderLogin(): HTMLElement {
  //redirectIfAuthenticated();

  const section = document.createElement('section');
  section.className =
    'flex flex-col m-0 items-center justify-center h-full text-center relative z-10 font-[jura] text-[#66fcf1]';

  section.innerHTML = `
    <div class="flex flex-col items-center justify-center">
      <h1 class="title uppercase mobile-title">
        <span class="mid_line" data-i18n="login">LOGIN</span>
      </h1>
    </div>
    <form
      id="login-form"
      novalidate
      class="mt-2.5 flex flex-col items-center py-10 px-10
                            bg-[rgba(102,252,241,0.1)] rounded-md
                            shadow-lg"
    >
      <div class="w-full mb-2.5">
        <input
          id="identifier"
          type="text"
          name="identifier"
          autocomplete="username"
          data-i18n-placeholder="username_or_email"
          placeholder="${t('username_or_email')}"
          required
          aria-required="true"
          aria-invalid="false"
          aria-describedby="identifier-error"
          class='custom-input px-4 py-2'
        />
        <p id="identifier-error" class="text-red-600 mt-1 text-sm hidden" role="alert"></p>
      </div>

      <div class="w-full mb-5">
        <input
          id="password"
          type="password"
          name="password"
          autocomplete="current-password"
          data-i18n-placeholder="password"
          placeholder="${t('password')}"
          required
          aria-required="true"
          aria-invalid="false"
          aria-describedby="password-error"
          class='custom-input px-4 py-2'
        />
        <p id="password-error" class="text-red-600 mt-1 text-sm hidden" role="alert"></p>
      </div>

      <button
        type="submit"
        class="btn py-2 text-lg font-bold !w-full"
        data-i18n="submit"
      >
        ${t('submit')}
      </button>

      <button
        class="btn !w-full"
      >
        <a
          href="#/login_42"
          data-i18n="login_42"
        >
          ${t('login_42')}
        </a>
      </button>

      <button
        class="btn !w-full"
      >
        <a
          href="#/register"
          data-i18n="register"
        >
          ${t('register')}
        </a>
      </button>
    </form>
  `;

  const form = section.querySelector<HTMLFormElement>('#login-form')!;
  const identifierInput = form.querySelector<HTMLInputElement>('#identifier')!;
  const passwordInput   = form.querySelector<HTMLInputElement>('#password')!;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const identifier = identifierInput.value.trim();
    const password   = passwordInput.value;

    const payload: Record<string, string> = { password };
    if (identifier.includes('@')) {
      payload.email = identifier;
    } else {
      payload.username = identifier;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = res.statusText;
        try {
          const err = await res.json();
          msg = err.message || err.error || msg;
        } catch {}
        alertError(`Login failed: ${msg}`);
        return;
      }

      const { token, refresh, username, firstname, email, avatarUrl } = await res.json();
      localStorage.setItem('accessToken',  token);
      localStorage.setItem('refreshToken', refresh);

      const user = { username, firstname, email, avatarUrl };
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