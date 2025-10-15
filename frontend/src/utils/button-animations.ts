// This file provides utility functions for button animations including loading states, ripple effects, and interactive feedback.

export function setButtonLoading(button: HTMLButtonElement, loadingText: string = "Loading..."): void {
  if (button.classList.contains('btn-loading')) return;
  
  const originalText = button.textContent;
  button.dataset.originalText = originalText || '';
  button.textContent = loadingText;
  button.classList.add('btn-loading');
  button.disabled = true;
}

export function removeButtonLoading(button: HTMLButtonElement): void {
  if (!button.classList.contains('btn-loading')) return;
  
  const originalText = button.dataset.originalText || '';
  button.textContent = originalText;
  button.classList.remove('btn-loading');
  button.disabled = false;
  delete button.dataset.originalText;
}

export function addRippleEffect(button: HTMLButtonElement): void {
  button.classList.add('btn-ripple');
  
  button.addEventListener('click', function(e: MouseEvent) {
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple-animation 0.6s ease-out;
      pointer-events: none;
    `;
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
}

export function addBounceEffect(button: HTMLButtonElement): void {
  button.classList.add('btn-bounce');
}

export function addShakeEffect(button: HTMLButtonElement): void {
  button.classList.add('btn-shake');
  
  setTimeout(() => {
    button.classList.remove('btn-shake');
  }, 500);
}


export function enhanceButton(
  button: HTMLButtonElement, 
  options: {
    ripple?: boolean;
    bounce?: boolean;
    loading?: boolean;
  } = {}
): void {
  const { ripple = true, bounce = true, loading = false } = options;
  
  if (ripple) addRippleEffect(button);
  if (bounce) addBounceEffect(button);
  if (loading) setButtonLoading(button);
}

export async function handleAsyncButtonClick(
  button: HTMLButtonElement,
  asyncOperation: () => Promise<void>,
  options: {
    loadingText?: string;
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: () => void;
    onError?: (error: any) => void;
  } = {}
): Promise<void> {
  const { 
    loadingText = "Loading...", 
    successMessage, 
    errorMessage = "An error occurred",
    onSuccess,
    onError 
  } = options;
  
  try {
    setButtonLoading(button, loadingText);
    await asyncOperation();
    
    if (successMessage) {
      // You can integrate with your alert system here
      console.log(successMessage);
    }
    
    if (onSuccess) onSuccess();
  } catch (error) {
    addShakeEffect(button);
    
    if (onError) {
      onError(error);
    } else {
      // You can integrate with your alert system here
      console.error(errorMessage, error);
    }
  } finally {
    removeButtonLoading(button);
  }
}

if (!document.querySelector('#ripple-animation-styles')) {
  const style = document.createElement('style');
  style.id = 'ripple-animation-styles';
  style.textContent = `
    @keyframes ripple-animation {
      to {
        transform: scale(2);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}
