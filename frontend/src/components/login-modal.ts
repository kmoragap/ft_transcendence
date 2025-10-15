// This file defines and exports functions to create and display a login modal 
// dialog with form validation and submission handling.

import { t } from "../utils/i18n";
import { store } from "../store";
import { alertError, alertSuccess } from "../utils/modal-alerts";
import { enhanceButton, setButtonLoading, removeButtonLoading } from "../utils/button-animations";

export interface LoginModalOptions {
  onSuccess?: (user: any) => void;
  onCancel?: () => void;
  title?: string;
  gameOnly?: boolean;
}

export function createLoginModal(options: LoginModalOptions = {}): HTMLElement {
  const existingModals = document.querySelectorAll("#login-modal");
  existingModals.forEach(modal => modal.remove());
  
  const modal = document.createElement("div");
  modal.className =
    "fixed inset-0 bg-[rgba(3,27,27,0.75)] flex items-center justify-center z-50";
  modal.id = "login-modal";

  const modalContent = document.createElement("div");
  modalContent.className =
    "bg-[rgba(3,27,27,0.95)] rounded-lg p-8 max-w-md mx-4 border border-[rgba(102,252,241,0.15)]";

  modalContent.innerHTML = `
    <div class="flex flex-col items-center">
      <h2 class="text-2xl font-bold text-[#66fcf1] mb-6 ${
        options.title ? "" : "hidden"
      }" data-i18n='login'>
        ${t("login")}
      </h2>
      
      <form
        id="modal-login-form"
        novalidate
        class="w-full flex flex-col items-center"
      >
        <div class="w-full mb-2.5">
          <input
            id="modal-identifier"
            type="text"
            name="identifier"
            autocomplete="username"
            data-i18n-placeholder="username_or_email"
            placeholder="${t("username_or_email")}"
            required
            aria-required="true"
            aria-invalid="false"
            aria-describedby="modal-identifier-error"
            class='custom-input px-4 py-2 w-full'
          />
          <p id="modal-identifier-error" class="text-red-600 mt-1 text-sm hidden" role="alert"></p>
        </div>

        <div class="w-full mb-5">
          <div style="position: relative;">
            <input
              id="modal-password"
              type="password"
              name="password"
              autocomplete="current-password"
              data-i18n-placeholder="password"
              placeholder="${t("password")}"
              required
              aria-required="true"
              aria-invalid="false"
              aria-describedby="modal-password-error"
              class='custom-input px-4 py-2 w-full'
              style="padding-right: 2.5rem;"
            />
            <button
              type="button"
              id="toggle-password"
              aria-label="${t('show_password') || 'Show password'}"
              title="${t('show_password') || 'Show password'}"
              class="password-toggle"
              style="position:absolute; right:10px; top:11px; cursor:pointer; user-select:none; background:transparent; border:none; padding:0; line-height:0;"
            ></button>
          </div>
          <p id="modal-password-error" class="text-red-600 mt-1 text-sm hidden" role="alert"></p>
        </div>

        <div class="flex flex-col gap-2 w-full">
          <button
            type="submit"
            class="btn py-2 text-lg font-bold flex-1"
            data-i18n="submit"
          >
            ${t("submit")}
          </button>
          <button
            type="button"
            id="modal-cancel"
            class="btn py-2 text-lg font-bold flex-1"
            data-i18n="cancel"
          >
            ${t("cancel") || "Cancel"}
          </button>
        </div>
      </form>
    </div>
  `;

  modal.appendChild(modalContent);

  function show2FAForm(email: string) {
    modalContent.innerHTML = `
    <div class="flex flex-col items-center">
      <h2 class="text-2xl font-bold text-[#66fcf1] mb-2" data-i18n='two_factor_auth'>Two-Factor Authentication</h2>
      <p class="text-sm text-[#66fcf1] mb-6" data-i18n="2fa_code_sent">A verification code has been sent to your email</p>
      <form id="twofa-form" novalidate class="w-full flex flex-col items-center">
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
            class='custom-input px-4 py-2 text-center text-2xl tracking-widest w-full'
          />
          <p id="code-error" class="text-red-600 mt-1 text-sm hidden" role="alert"></p>
        </div>

        <div class="flex flex-col gap-2 w-full">
          <button type="submit" class="btn py-2 text-lg font-bold !w-full" data-i18n="verify">Verify</button>
          <button type="button" id="resend-code" class="btn py-2 text-lg font-bold !w-full" data-i18n="resend_code">Resend Code</button>
          <button type="button" id="back-to-login" class="btn py-2 text-lg font-bold !w-full" data-i18n="back_to_login">Back to Login</button>
        </div>
      </form>
    </div>
    `;

    const twoFAForm = modalContent.querySelector<HTMLFormElement>("#twofa-form")!;
    const codeInput = modalContent.querySelector<HTMLInputElement>("#twofa-code")!;
    const resendButton = modalContent.querySelector<HTMLButtonElement>("#resend-code")!;
    const backButton = modalContent.querySelector<HTMLButtonElement>("#back-to-login")!;
    const submitBtn = twoFAForm.querySelector<HTMLButtonElement>('button[type="submit"]')!;

    enhanceButton(resendButton, { ripple: true, bounce: true });
    enhanceButton(backButton, { ripple: true, bounce: true });
    enhanceButton(submitBtn, { ripple: true, bounce: true });

    codeInput.focus();

    resendButton.addEventListener("click", async () => {
      resendButton.disabled = true;
      const originalText = resendButton.textContent || "";
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
        resendButton.textContent = originalText || t("resend_code");
      }
    });

    backButton.addEventListener("click", () => {
      closeModal();
    });

    twoFAForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const code = codeInput.value.trim();
      if (!code || code.length !== 6 || !/^[0-9]{6}$/.test(code)) {
        alertError("Please enter a valid 6-digit code");
        return;
      }
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
        const user = { id, username, firstname, email, avatarUrl, is2faEnabled, isOAuthUser };

        if (!options.gameOnly) {
          localStorage.setItem("accessToken", token);
          if (refresh) localStorage.setItem("refreshToken", refresh);
          store.dispatch({ type: "LOGIN", payload: user });
        }

        if (options.onSuccess) {
          options.onSuccess(user);
        }

        if (!options.gameOnly) {
          alertSuccess("Login successful!");
        }

        closeModal();
      } catch (err) {
        console.error(err);
        alertError("An unexpected error occurred.");
      } finally {
        removeButtonLoading(submitBtn);
      }
    });
  }

  const form = modal.querySelector<HTMLFormElement>("#modal-login-form")!;
  const identifierInput =
    form.querySelector<HTMLInputElement>("#modal-identifier")!;
  const passwordInput =
    form.querySelector<HTMLInputElement>("#modal-password")!;
  const togglePassword = modal.querySelector<HTMLButtonElement>("#toggle-password")!;
  const cancelBtn = modal.querySelector<HTMLButtonElement>("#modal-cancel")!;
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const eyeOpenSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
  const eyeClosedSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.8 21.8 0 0 1 5.06-7.94"></path><path d="M10.58 10.58a2 2 0 1 0 2.83 2.83"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
  const setPasswordVisibility = (visible: boolean) => {
    passwordInput.type = visible ? "text" : "password";
    togglePassword.innerHTML = visible ? eyeClosedSvg : eyeOpenSvg;
    togglePassword.setAttribute("aria-label", visible ? (t('hide_password') || 'Hide password') : (t('show_password') || 'Show password'));
    togglePassword.setAttribute("title", visible ? (t('hide_password') || 'Hide password') : (t('show_password') || 'Show password'));
    togglePassword.setAttribute("aria-pressed", String(visible));
  };
  let passwordVisible = false;
  setPasswordVisibility(passwordVisible);

  togglePassword.addEventListener('click', () => {
    passwordVisible = !passwordVisible;
    setPasswordVisibility(passwordVisible);
    passwordInput.focus();
  });
  togglePassword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      passwordVisible = !passwordVisible;
      setPasswordVisibility(passwordVisible);
      passwordInput.focus();
    }
  });


  // Enhance modal buttons with animations
  enhanceButton(cancelBtn, { ripple: true, bounce: true });
  enhanceButton(submitBtn, { ripple: true, bounce: true });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const identifier = identifierInput.value.trim();
    const password = passwordInput.value;
    const payload: Record<string, string> = { password };
    if (identifier.includes("@")) {
      payload.email = identifier;
    } else {
      payload.username = identifier;
    }

    // Set loading state
    setButtonLoading(submitBtn, "Logging in...");

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
        alertError(`${t("login_failed")}: ${msg}`);
        return;
      }

      const data = await res.json();

      if (data.is2faEnabled && data.email) {
        show2FAForm(data.email);
        return;
      }

      const { token, refresh, id, username, firstname, email, avatarUrl, is2faEnabled, isOAuthUser } = data;

      const user = { id, username, firstname, email, avatarUrl, is2faEnabled, isOAuthUser };

      if (!options.gameOnly) {
        localStorage.setItem("accessToken", token);
        if (refresh != null) localStorage.setItem("refreshToken", refresh);
        store.dispatch({ type: "LOGIN", payload: user });
      }

      if (options.onSuccess) {
        options.onSuccess(user);
      }

      if (!options.gameOnly) {
        alertSuccess(t("login_successful"));
      }

      closeModal();
    } catch (err) {
      console.error(err);
      alertError(t("unexpected_error"));
    } finally {
      removeButtonLoading(submitBtn);
    }
  });

  cancelBtn.addEventListener("click", () => {
    if (options.onCancel) {
      options.onCancel();
    }
    closeModal();
  });

  modal.addEventListener("click", e => {
    if (e.target === modal) {
      if (options.onCancel) {
        options.onCancel();
      }
      closeModal();
    }
  });

  function closeModal() {
    modal.remove();
  }

  return modal;
}

export function showLoginModal(options: LoginModalOptions = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const modal = createLoginModal({
      ...options,
      onSuccess: user => {
        resolve(user);
        options.onSuccess?.(user);
      },
      onCancel: () => {
        reject(new Error(t("login_cancelled")));
        options.onCancel?.();
      },
    });

    document.body.appendChild(modal);

    setTimeout(() => {
      const input = modal.querySelector<HTMLInputElement>("#modal-identifier");
      input?.focus();
    }, 100);
  });
}
