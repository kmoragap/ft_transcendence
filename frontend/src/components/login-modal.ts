import { t } from "../i18n";
import { store } from "../store";
import { alertError, alertSuccess } from "../utils/modal-alerts";

export interface LoginModalOptions {
  onSuccess?: (user: any) => void;
  onCancel?: () => void;
  title?: string;
  gameOnly?: boolean;
}

export function createLoginModal(options: LoginModalOptions = {}): HTMLElement {
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
            class='custom-input px-4 py-2'
          />
          <p id="modal-identifier-error" class="text-red-600 mt-1 text-sm hidden" role="alert"></p>
        </div>

        <div class="w-full mb-5">
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
            class='custom-input px-4 py-2'
          />
          <p id="modal-password-error" class="text-red-600 mt-1 text-sm hidden" role="alert"></p>
        </div>

        <div class="flex flex-col gap-3 w-full">
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

  const form = modal.querySelector<HTMLFormElement>("#modal-login-form")!;
  const identifierInput =
    form.querySelector<HTMLInputElement>("#modal-identifier")!;
  const passwordInput =
    form.querySelector<HTMLInputElement>("#modal-password")!;
  const cancelBtn = modal.querySelector<HTMLButtonElement>("#modal-cancel")!;

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

      const { token, refresh, id, username, firstname, email, avatarUrl } =
        await res.json();

      const user = { id, username, firstname, email, avatarUrl };

      if (!options.gameOnly) {
        localStorage.setItem("accessToken", token);
        localStorage.setItem("refreshToken", refresh);
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
