import { t } from './../i18n';
import { store } from '../store';

export function renderLogin(): HTMLElement {
  const section = document.createElement('section');
  section.className =
    'flex flex-col m-0 mt-[10%] items-center justify-center h-full text-center relative z-[3] font-[jura] text-[#66fcf1]';

  section.innerHTML = `
    <div class="flex flex-col items-center justify-center">
      <h1 data-i18n="login" class="text-[4.375rem] font-bold uppercase">
        ${t('login')}
      </h1>
    </div>
    <form
      id="login-form"
      novalidate
      class="mt-[10px] flex flex-col items-center py-[40px] px-[40px]
             bg-[rgba(102,252,241,0.1)] rounded-[6px]
             shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
    >
      <div class="w-full mb-[10px]">
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
          class="px-[20px] py-[8px] border-0 rounded-[6px]"
        />
        <p id="identifier-error" class="text-red-600 mt-1 text-sm hidden" role="alert"></p>
      </div>

      <div class="w-full mb-[20px]">
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
          class="px-[20px] py-[8px] border-0 rounded-[6px]"
        />
        <p id="password-error" class="text-red-600 mt-1 text-sm hidden" role="alert"></p>
      </div>

      <button
        type="submit"
        class="btn py-[10px] text-[1.125rem] font-[700]"
        data-i18n="submit"
      >
        ${t('submit')}
      </button>

      <button
        class="btn"
      >
        <a
          href="#/login_42"
          data-i18n="login_42"
        >
          ${t('login_42')}
        </a>
      </button>

      <button
        class="btn"
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
        alert(`Login failed: ${msg}`);
        return;
      }

      const { token, refresh } = await res.json();
      localStorage.setItem('accessToken',  token);
      localStorage.setItem('refreshToken', refresh);

      const meRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!meRes.ok) {
        console.error('Failed to fetch profile', await meRes.text());
        window.location.hash = '/';
        return;
      }
      const user = await meRes.json();
      store.dispatch({ type: 'LOGIN', payload: user });

      alert('Login successful!');
      window.location.hash = '/';
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred.');
    }
  });

  return section;
}