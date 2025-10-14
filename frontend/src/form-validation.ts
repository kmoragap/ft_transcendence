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

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
function validateField(input: HTMLInputElement): string {
  switch (input.name) {
    case 'username':
      if (!input.value) return 'Username is required.';
      if (input.value.length < 3) return 'At least 3 characters.';
      if(input.value.length > 20) return 'Must be at most 20 characters.'
      return '';
    case 'email':
      if (!input.value) return 'Email is required.';
      return emailRe.test(input.value) ? '' : 'Enter a valid email.';
    case 'firstname':
      return input.value ? '' : 'First name is required.';
    case 'password':
      if (!input.value) return 'Password is required.';
      if (input.value.length < 8) return 'At least 8 characters.';
      if (!/\p{Lu}/u.test(input.value)) return 'Include at least one uppercase letter.';
      if (!/\p{Ll}/u.test(input.value)) return 'Include at least one lowercase letter.';
      if (!/[0-9]/.test(input.value)) return 'Include at least one number.';
      if (!/[^\p{L}\p{N}_\s]/u.test(input.value)) return 'Include at least one special character.';
      if (input.form) {
        const username = (input.form.elements.namedItem('username') as HTMLInputElement)?.value;
        const email = (input.form.elements.namedItem('email') as HTMLInputElement)?.value;
        if (username && input.value.toLowerCase().includes(username.toLowerCase()))
          return 'Password should not contain your username.';
        if (email) {
          const emailName = email.split('@')[0];
          if (emailName && input.value.toLowerCase().includes(emailName.toLowerCase()))
            return 'Password should not contain your email.';
        }
      }
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

  // Validate all fields and return whether form is valid
  form.addEventListener('submit', e => {
    let hasError = false;
    inputs.forEach(input => {
      const msg = validateField(input);
      if (msg) {
        showError(input, msg);
        hasError = true;
      }
    });
    
    // If there are validation errors, prevent form submission
    if (hasError) {
      e.preventDefault();
      e.stopImmediatePropagation(); // Prevent other submit handlers from running
    }
  });
}
