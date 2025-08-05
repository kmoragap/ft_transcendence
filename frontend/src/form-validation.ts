// form-validation.ts

// show/hide helpers
function showError(input: HTMLInputElement, message: string) {
  const err = document.getElementById(`${input.id}-error`)! as HTMLElement;
  err.textContent = message;
  err.classList.remove('hidden');
  input.setAttribute('aria-invalid', 'true');
}
function clearError(input: HTMLInputElement) {
  const err = document.getElementById(`${input.id}-error`)! as HTMLElement;
  err.textContent = '';
  err.classList.add('hidden');
  input.setAttribute('aria-invalid', 'false');
}

// field validators
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validateField(input: HTMLInputElement): string {
  switch (input.name) {
    case 'username':
      if (!input.value) return 'Username is required.';
      if (input.value.length < 3) return 'At least 3 characters.';
      return '';
    case 'email':
      if (!input.value) return 'Email is required.';
      return emailRe.test(input.value) ? '' : 'Enter a valid email.';
    case 'firstname':
      return input.value ? '' : 'First name is required.';
    case 'password':
      if (!input.value) return 'Password is required.';
      if (input.value.length < 6) return 'At least 6 characters.';
      return '';
    default:
      return '';
  }
}

function toggleSubmit(form: HTMLFormElement) {
  const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const anyErrors = !!form.querySelector('p[role="alert"]:not(.hidden)');
  const allFilled = Array.from(form.querySelectorAll<HTMLInputElement>('input[required]'))
    .every(i => i.value.trim() !== '');
  if (!anyErrors && allFilled) {
    btn.disabled = false;
    btn.classList.remove('opacity-50', 'cursor-not-allowed');
  } else {
    btn.disabled = true;
    btn.classList.add('opacity-50', 'cursor-not-allowed');
  }
}

export function attachValidation(form: HTMLFormElement) {
  const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('input[name]'));

  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      const msg = validateField(input);
      msg ? showError(input, msg) : clearError(input);
      toggleSubmit(form);
    });
    input.addEventListener('input', () => {
      clearError(input);
      toggleSubmit(form);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let hasError = false;
    inputs.forEach(input => {
      const msg = validateField(input);
      if (msg) {
        showError(input, msg);
        hasError = true;
      }
    });
    if (!hasError) {
      console.log('Registering:', Object.fromEntries(inputs.map(i => [i.name, i.value])));
    }
  });
}
