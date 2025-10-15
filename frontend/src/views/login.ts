// Login page

import { t } from "./../utils/i18n";
import { store } from "../store";
import { alertError, alertSuccess } from "./../utils/modal-alerts";
import { enhanceButton, setButtonLoading, removeButtonLoading } from "../utils/button-animations";

export function renderLogin(): HTMLElement {

  const section = document.createElement("section");
  section.className =
    "flex flex-col m-0 items-center justify-center h-full text-center relative z-10 font-[jura] text-[#66fcf1]";

  const urlParams = new URLSearchParams(window.location.hash.includes('?') ? window.location.hash.split('?')[1] : "");
  const oauthError = urlParams.get('error');
  
  if (oauthError) {
    setTimeout(() => {
      if (oauthError === 'username_exists') {
        alertError("OAuth login failed: This 42 username is already registered with a different account. Please use a different authentication method or contact support.");
      } else {
        alertError("OAuth login failed. Please try again or use a different login method.");
      }
      window.location.hash = '/login';
    }, 100);
  }

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
          placeholder="${t("username_or_email")}"
          required
          aria-required="true"
          aria-invalid="false"
          aria-describedby="identifier-error"
          class='custom-input px-4 py-2 w-full'
        />
        <p id="identifier-error" class="text-red-600 mt-1 text-sm hidden" role="alert"></p>
      </div>

      <div class="w-full mb-5">
        <div style="position: relative;">
          <input
            id="password"
            type="password"
            name="password"
            autocomplete="current-password"
            data-i18n-placeholder="password"
            placeholder="${t("password")}"
            required
            aria-required="true"
            aria-invalid="false"
            aria-describedby="password-error"
            class='custom-input px-4 py-2 w-full'
            style="padding-right: 2.5rem;"
          />
          <button
            type="button"
            id="toggle-login-password"
            aria-label="${t('show_password') || 'Show password'}"
            title="${t('show_password') || 'Show password'}"
            class="password-toggle"
            style="position:absolute; right:10px; top:11px; cursor:pointer; user-select:none; background:transparent; border:none; padding:0; line-height:0;"
          ></button>
        </div>
        <p id="password-error" class="text-red-600 mt-1 text-sm hidden" role="alert"></p>
      </div>

      <button
        type="submit"
        class="btn py-2 text-lg font-bold !w-full"
        data-i18n="submit"
      >
        ${t("submit")}
      </button>

      <button
        type="button"
        class="btn !w-full"
        aria-label="${t("login_42")}"
      >
        <a
          href="#/login_42"
          data-i18n="login_42"
        >
          ${t("login_42")}
        </a>
      </button>

      <button
        type="button"
        class="btn !w-full"
        aria-label="${t("register")}"
      >
        <a
          href="#/register"
          data-i18n="register"
        >
          ${t("register")}
        </a>
      </button>
    </form>
  `;

  const form = section.querySelector<HTMLFormElement>("#login-form")!;
  const identifierInput = form.querySelector<HTMLInputElement>("#identifier")!;
  const passwordInput = form.querySelector<HTMLInputElement>("#password")!;
  const toggleLoginPassword = form.querySelector<HTMLButtonElement>("#toggle-login-password")!;
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;

  // Enhance submit button
  enhanceButton(submitBtn, { ripple: true, bounce: true });

  // Password reveal toggle for login
  const eyeOpenSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
  const eyeClosedSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.8 21.8 0 0 1 5.06-7.94"></path><path d="M10.58 10.58a2 2 0 1 0 2.83 2.83"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
  let loginPwdVisible = false;
  const setLoginPwdVisible = (v: boolean) => {
    passwordInput.type = v ? 'text' : 'password';
    toggleLoginPassword.innerHTML = v ? eyeClosedSvg : eyeOpenSvg;
    const hidePwd = t('hide_password') || 'Hide password';
    const showPwd = t('show_password') || 'Show password';
    toggleLoginPassword.setAttribute('aria-label', v ? hidePwd : showPwd);
    toggleLoginPassword.setAttribute('title', v ? hidePwd : showPwd);
    toggleLoginPassword.setAttribute('aria-pressed', String(v));
  };
  setLoginPwdVisible(loginPwdVisible);
  toggleLoginPassword.addEventListener('click', () => {
    loginPwdVisible = !loginPwdVisible;
    setLoginPwdVisible(loginPwdVisible);
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    
    const identifier = identifierInput.value.trim();
    const password = passwordInput.value;
    
    if (!identifier || !password) {
      alertError("Please fill in all fields");
      return;
    }

    // Set loading state
    setButtonLoading(submitBtn, "Logging in...");

    const payload: Record<string, string> = { password };
    if (identifier.includes("@")) {
      payload.email = identifier;
    } else {
      payload.username = identifier;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      const data = await res.json();

      if (data.is2faEnabled && data.email) {
        show2FAForm(section, data.email);
        return;
      }

      const { token, refresh, id, username, firstname, email, avatarUrl, is2faEnabled, isOAuthUser } = data;
      localStorage.setItem("accessToken", token);
      if (refresh != null) localStorage.setItem("refreshToken", refresh);

      const user = { id, username, firstname, email, avatarUrl, is2faEnabled, isOAuthUser };
      store.dispatch({ type: "LOGIN", payload: user });

      alertSuccess("Login successful!");
      window.location.hash = "/";
    } catch (err) {
      console.error(err);
      alertError("An unexpected error occurred.");
    } finally {
      removeButtonLoading(submitBtn);
    }
  });

  return section;
}

function show2FAForm(section: HTMLElement, email: string) {
  section.innerHTML = `
    <div class="flex flex-col items-center justify-center">
      <h1 class="title uppercase mobile-title">
        <span class="mid_line" data-i18n="two_factor_auth">Two-Factor Authentication</span>
      </h1>
      <p class="text-sm text-[#66fcf1] mt-2 mb-4" data-i18n="2fa_code_sent">A verification code has been sent to your email</p>
    </div>
    <form
      id="twofa-form"
      novalidate
      class="mt-2.5 flex flex-col items-center py-10 px-10
                            bg-[rgba(102,252,241,0.1)] rounded-md
                            shadow-lg"
    >
      <div class="w-full mb-5">
        <input
          id="twofa-code"
          type="text"
          name="code"
          autocomplete="one-time-code"
          placeholder="Enter 6-digit code"
          data-i18n-placeholder="enter_2fa_code"
          required
          maxlength="6"
          pattern="[0-9]{6}"
          aria-required="true"
          aria-invalid="false"
          aria-describedby="code-error"
          class='custom-input px-4 py-2 text-center text-2xl tracking-widest'
        />
        <p id="code-error" class="text-red-600 mt-1 text-sm hidden" role="alert"></p>
      </div>

      <button
        type="submit"
        class="btn py-2 text-lg font-bold !w-full"
        data-i18n="verify"
      >
        Verify
      </button>

      <button
        type="button"
        id="resend-code"
        class="btn py-2 text-lg font-bold !w-full"
        data-i18n="resend_code"
      >
        Resend Code
      </button>

      <button
        type="button"
        id="back-to-login"
        class="btn py-2 text-lg font-bold !w-full"
        data-i18n="back_to_login"
      >
        Back to Login
      </button>
    </form>
  `;

  const twoFAForm = section.querySelector<HTMLFormElement>("#twofa-form")!;
  const codeInput = section.querySelector<HTMLInputElement>("#twofa-code")!;
  const resendButton = section.querySelector<HTMLButtonElement>("#resend-code")!;
  const backButton = section.querySelector<HTMLButtonElement>("#back-to-login")!;
  const submitBtn = twoFAForm.querySelector<HTMLButtonElement>('button[type="submit"]')!;

  // Enhance 2FA form buttons
  enhanceButton(resendButton, { ripple: true, bounce: true });
  enhanceButton(backButton, { ripple: true, bounce: true });
  enhanceButton(submitBtn, { ripple: true, bounce: true });

  codeInput.focus();

  resendButton.addEventListener("click", async () => {
    resendButton.disabled = true;
    resendButton.textContent = t("sending");

    try {
      const res = await fetch("/api/auth/resend-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        let msg = res.statusText;
        try {
          const err = await res.json();
          msg = err.message || err.error || msg;
        } catch {}
        alertError(`Failed to resend code: ${msg}`);
      } else {
        alertSuccess(t("A new verification code has been sent to your email"));
      }
    } catch (err) {
      console.error(err);
      alertError(t("Failed to resend code. Please try again."));
    } finally {
      resendButton.disabled = false;
      resendButton.textContent = t("resend_code");
    }
  });

  backButton.addEventListener("click", () => {
    window.location.reload();
  });

  twoFAForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const code = codeInput.value.trim();
    
    if (!code || code.length !== 6 || !/^[0-9]{6}$/.test(code)) {
      alertError("Please enter a valid 6-digit code");
      return;
    }

    // Set loading state
    setButtonLoading(submitBtn, "Verifying...");

    try {
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      if (!res.ok) {
        let msg = res.statusText;
        try {
          const err = await res.json();
          msg = err.message || err.error || msg;
        } catch {}
        alertError(`Verification failed: ${msg}`);
        codeInput.value = "";
        codeInput.focus();
        return;
      }

      const { token, refresh, id, username, firstname, avatarUrl, is2faEnabled, isOAuthUser } = await res.json();
      localStorage.setItem("accessToken", token);
      if (refresh) localStorage.setItem("refreshToken", refresh);

      const user = { id, username, firstname, email, avatarUrl, is2faEnabled, isOAuthUser };
      store.dispatch({ type: "LOGIN", payload: user });

      alertSuccess("Login successful!");
      window.location.hash = "/";
    } catch (err) {
      console.error(err);
      alertError("An unexpected error occurred.");
    } finally {
      removeButtonLoading(submitBtn);
    }
  });
}
