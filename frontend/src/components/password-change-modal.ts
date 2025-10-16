// Password Change Modal Component

import { t, updateText } from '../utils/i18n';
import { enhanceButton } from '../utils/button-animations';
import { changePassword } from '../api/users';
import { alertError, alertSuccess, alertConfirm } from '../utils/modal-alerts';

export interface PasswordChangeModalOptions {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function showPasswordChangeModal(options: PasswordChangeModalOptions = {}): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      const confirmed = await alertConfirm(
        t('change_password_confirm') || 'Are you sure you want to change your password?',
        t('change_password') || 'Change Password'
      );
      
      if (!confirmed) {
        options.onCancel?.();
        resolve(false);
        return;
      }

      const modal = createPasswordChangeModal({
        ...options,
        onSuccess: () => {
          resolve(true);
          options.onSuccess?.();
        },
        onCancel: () => {
          resolve(false);
          options.onCancel?.();
        }
      });

      document.body.appendChild(modal);
      
      setTimeout(() => {
        const currentPasswordInput = modal.querySelector<HTMLInputElement>('#current-password');
        currentPasswordInput?.focus();
      }, 100);
    } catch (error) {
      console.error('Error showing password change modal:', error);
      options.onCancel?.();
      resolve(false);
    }
  });
}

function createPasswordChangeModal(options: PasswordChangeModalOptions & { onSuccess: () => void; onCancel: () => void }): HTMLElement {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-[rgba(3,27,27,0.85)] backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in';
  modal.id = 'password-change-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'password-change-title');

  const modalContent = document.createElement('div');
  modalContent.className = 'bg-[rgba(3,27,27,0.95)] rounded-xl p-8 max-w-sm mx-4 border border-[rgba(102,252,241,0.25)] shadow-2xl backdrop-blur-sm animate-scale-in shadow-[0_0_20px_rgba(102,252,241,0.2)]';
  modalContent.setAttribute('role', 'document');

  modalContent.innerHTML = `
    <div class="flex flex-col items-center text-center">
      <h2 id="password-change-title" class="text-2xl font-bold text-[#66fcf1] mb-6 font-[jura]">
        ${t('change_password') || 'Change Password'}
      </h2>
      
      <form id="password-change-form" class="w-full space-y-4" novalidate>
        <div class="space-y-2">
          <label for="current-password" class="block text-sm font-medium text-[#66fcf1] text-left">
            ${t('current_password') || 'Current Password'}
          </label>
          <div class="relative">
            <input 
              type="password" 
              id="current-password" 
              name="currentPassword"
              required
              aria-required="true"
              aria-invalid="false"
              aria-describedby="current-password-error"
              class="w-full px-3 py-2 bg-[rgba(102,252,241,0.1)] border border-[#66fcf1] rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66fcf1] pr-10"
              placeholder="${t('enter_current_password') || 'Enter your current password'}"
            />
            <button 
              type="button" 
              id="toggle-current-password" 
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#66fcf1] focus:outline-none"
              aria-label="${t('toggle_password_visibility') || 'Toggle password visibility'}"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
          <p id="current-password-error" class="text-red-600 mt-1 text-sm hidden" role="alert"></p>
        </div>
        
        <div class="space-y-2">
          <label for="new-password" class="block text-sm font-medium text-[#66fcf1] text-left">
            ${t('new_password') || 'New Password'}
          </label>
          <div class="relative">
            <input 
              type="password" 
              id="new-password" 
              name="password"
              required
              aria-required="true"
              aria-invalid="false"
              aria-describedby="new-password-error"
              class="w-full px-3 py-2 bg-[rgba(102,252,241,0.1)] border border-[#66fcf1] rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66fcf1] pr-10"
              placeholder="${t('enter_new_password') || 'Enter your new password'}"
            />
            <button 
              type="button" 
              id="toggle-new-password" 
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#66fcf1] focus:outline-none"
              aria-label="${t('toggle_password_visibility') || 'Toggle password visibility'}"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
          <p id="new-password-error" class="text-red-600 mt-1 text-sm hidden" role="alert"></p>
        </div>
        
        <div class="space-y-2">
          <label for="confirm-password" class="block text-sm font-medium text-[#66fcf1] text-left">
            ${t('confirm_new_password') || 'Confirm New Password'}
          </label>
          <div class="relative">
            <input 
              type="password" 
              id="confirm-password" 
              name="confirmPassword"
              required
              aria-required="true"
              aria-invalid="false"
              aria-describedby="confirm-password-error"
              class="w-full px-3 py-2 bg-[rgba(102,252,241,0.1)] border border-[#66fcf1] rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66fcf1] pr-10"
              placeholder="${t('confirm_new_password') || 'Confirm your new password'}"
            />
            <button 
              type="button" 
              id="toggle-confirm-password" 
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#66fcf1] focus:outline-none"
              aria-label="${t('toggle_password_visibility') || 'Toggle password visibility'}"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
          <p id="confirm-password-error" class="text-red-600 mt-1 text-sm hidden" role="alert"></p>
        </div>
        
        <div class="flex flex-col gap-3 w-full pt-2">
          <button
            type="submit"
            id="password-change-confirm"
            class="btn py-2.5 px-6 text-lg font-bold w-full"
          >
            ${t('change_password') || 'Change Password'}
          </button>
          
          <button
            type="button"
            id="password-change-cancel"
            class="btn py-2.5 px-6 text-lg font-bold w-full bg-[rgba(102,252,241,0.1)] hover:bg-[rgba(102,252,241,0.2)]"
          >
            ${t('cancel') || 'Cancel'}
          </button>
        </div>
      </form>
    </div>
  `;

  modal.appendChild(modalContent);

  const form = modal.querySelector<HTMLFormElement>('#password-change-form')!;
  const currentPasswordInput = modal.querySelector<HTMLInputElement>('#current-password')!;
  const newPasswordInput = modal.querySelector<HTMLInputElement>('#new-password')!;
  const confirmPasswordInput = modal.querySelector<HTMLInputElement>('#confirm-password')!;
  const confirmBtn = modal.querySelector<HTMLButtonElement>('#password-change-confirm')!;
  const cancelBtn = modal.querySelector<HTMLButtonElement>('#password-change-cancel')!;

  const toggleCurrentPassword = modal.querySelector<HTMLButtonElement>('#toggle-current-password')!;
  const toggleNewPassword = modal.querySelector<HTMLButtonElement>('#toggle-new-password')!;
  const toggleConfirmPassword = modal.querySelector<HTMLButtonElement>('#toggle-confirm-password')!;

  enhanceButton(confirmBtn, { ripple: true, bounce: true });
  enhanceButton(cancelBtn, { ripple: true, bounce: true });

  const eyeOpenSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
  const eyeClosedSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.8 21.8 0 0 1 5.06-7.94"></path><path d="M10.58 10.58a2 2 0 1 0 2.83 2.83"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';

  const setupPasswordToggle = (input: HTMLInputElement, toggleBtn: HTMLButtonElement) => {
    let isVisible = false;
    const setVisibility = (visible: boolean) => {
      input.type = visible ? 'text' : 'password';
      toggleBtn.innerHTML = visible ? eyeClosedSvg : eyeOpenSvg;
      const hidePwd = t('hide_password') || 'Hide password';
      const showPwd = t('show_password') || 'Show password';
      toggleBtn.setAttribute('aria-label', visible ? hidePwd : showPwd);
      toggleBtn.setAttribute('title', visible ? hidePwd : showPwd);
      toggleBtn.setAttribute('aria-pressed', String(visible));
      isVisible = visible;
    };
    
    setVisibility(false);
    toggleBtn.addEventListener('click', () => {
      setVisibility(!isVisible);
      input.focus();
    });
  };

  setupPasswordToggle(currentPasswordInput, toggleCurrentPassword);
  setupPasswordToggle(newPasswordInput, toggleNewPassword);
  setupPasswordToggle(confirmPasswordInput, toggleConfirmPassword);

  const validateForm = (): boolean => {
    let isValid = true;
    
    modal.querySelectorAll('[id$="-error"]').forEach(error => {
      (error as HTMLElement).classList.add('hidden');
      (error as HTMLElement).textContent = '';
    });

    if (!currentPasswordInput.value.trim()) {
      const error = modal.querySelector('#current-password-error')!;
      error.textContent = t('current_password_required') || 'Current password is required';
      error.classList.remove('hidden');
      currentPasswordInput.setAttribute('aria-invalid', 'true');
      isValid = false;
    } else {
      currentPasswordInput.setAttribute('aria-invalid', 'false');
    }

    const newPassword = newPasswordInput.value;
    if (!newPassword) {
      const error = modal.querySelector('#new-password-error')!;
      error.textContent = t('new_password_required') || 'New password is required';
      error.classList.remove('hidden');
      newPasswordInput.setAttribute('aria-invalid', 'true');
      isValid = false;
    } else if (newPassword.length < 8) {
      const error = modal.querySelector('#new-password-error')!;
      error.textContent = t('password_too_short') || 'Password must be at least 8 characters';
      error.classList.remove('hidden');
      newPasswordInput.setAttribute('aria-invalid', 'true');
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\p{S}\p{P}])/u.test(newPassword)) {
      const error = modal.querySelector('#new-password-error')!;
      error.textContent = t('password_requirements_not_met') || 'Password must contain uppercase, lowercase, number, and special character';
      error.classList.remove('hidden');
      newPasswordInput.setAttribute('aria-invalid', 'true');
      isValid = false;
    } else {
      newPasswordInput.setAttribute('aria-invalid', 'false');
    }

    if (!confirmPasswordInput.value) {
      const error = modal.querySelector('#confirm-password-error')!;
      error.textContent = t('confirm_password_required') || 'Please confirm your new password';
      error.classList.remove('hidden');
      confirmPasswordInput.setAttribute('aria-invalid', 'true');
      isValid = false;
    } else if (confirmPasswordInput.value !== newPassword) {
      const error = modal.querySelector('#confirm-password-error')!;
      error.textContent = t('passwords_do_not_match') || 'Passwords do not match';
      error.classList.remove('hidden');
      confirmPasswordInput.setAttribute('aria-invalid', 'true');
      isValid = false;
    } else {
      confirmPasswordInput.setAttribute('aria-invalid', 'false');
    }

    return isValid;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const formData = new FormData(form);
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('password') as string;

    const originalText = confirmBtn.textContent;
    confirmBtn.textContent = t('changing_password') || 'Changing Password...';
    confirmBtn.disabled = true;

    try {
      await changePassword(currentPassword, newPassword);
      closeModal();
      await alertSuccess(t('password_changed_successfully') || 'Password changed successfully');
      options.onSuccess();
    } catch (error: any) {
      console.error('Password change error:', error);
      await alertError(error?.message || t('password_change_failed') || 'Failed to change password');
    } finally {
      confirmBtn.textContent = originalText;
      confirmBtn.disabled = false;
    }
  });

  cancelBtn.addEventListener('click', () => {
    options.onCancel();
    closeModal();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      options.onCancel();
      closeModal();
    }
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      options.onCancel();
      closeModal();
    }
  };
  document.addEventListener('keydown', handleKeyDown);

  const handleLanguageChange = () => {
    updateText();
  };
  window.addEventListener('languageChanged', handleLanguageChange);

  function closeModal() {
    document.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('languageChanged', handleLanguageChange);
    modal.remove();
  }

  return modal;
}
