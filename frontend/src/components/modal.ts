import { t } from '../i18n';

export interface ModalOptions {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  autoClose?: number; // Auto close after X milliseconds
}

export function createModal(options: ModalOptions): HTMLElement {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-[rgba(3,27,27,0.85)] backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in';
  modal.id = 'custom-modal';

  const modalContent = document.createElement('div');
  modalContent.className = 'bg-[rgba(3,27,27,0.95)] rounded-xl p-8 max-w-md mx-4 border border-[rgba(102,252,241,0.25)] shadow-2xl backdrop-blur-sm animate-scale-in';
  
  const glowClass = getGlowClass(options.type);
  modalContent.classList.add(glowClass);

  const icon = getIcon(options.type);
  const titleColor = getTitleColor(options.type);

  modalContent.innerHTML = `
    <div class="flex flex-col items-center text-center">
      <div class="mb-4 text-4xl">
        ${icon}
      </div>
      
      ${options.title ? `
        <h2 class="text-2xl font-bold ${titleColor} mb-4 font-[jura]">
          ${options.title}
        </h2>
      ` : ''}
      
      <p class="text-[#66fcf1] mb-6 text-lg font-[jura] leading-relaxed">
        ${options.message}
      </p>
      
      <div class="flex flex-col sm:flex-row gap-3 w-full">
        <button
          id="modal-confirm"
          class="btn py-2.5 px-6 text-lg font-bold flex-1 min-w-[120px]"
        >
          ${options.confirmText || t('ok') || 'OK'}
        </button>
        
        ${options.showCancel ? `
          <button
            id="modal-cancel"
            class="btn py-2.5 px-6 text-lg font-bold flex-1 min-w-[120px] bg-[rgba(102,252,241,0.1)] hover:bg-[rgba(102,252,241,0.2)]"
          >
            ${options.cancelText || t('cancel') || 'Cancel'}
          </button>
        ` : ''}
      </div>
    </div>
  `;

  modal.appendChild(modalContent);

  const confirmBtn = modal.querySelector<HTMLButtonElement>('#modal-confirm')!;
  const cancelBtn = modal.querySelector<HTMLButtonElement>('#modal-cancel');

  confirmBtn.addEventListener('click', () => {
    if (options.onConfirm) {
      options.onConfirm();
    }
    closeModal();
  });

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (options.onCancel) {
        options.onCancel();
      }
      closeModal();
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      if (options.onCancel) {
        options.onCancel();
      }
      closeModal();
    }
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (options.onCancel) {
        options.onCancel();
      }
      closeModal();
    }
  };
  document.addEventListener('keydown', handleKeyDown);

  function closeModal() {
    document.removeEventListener('keydown', handleKeyDown);
    modal.remove();
  }

  if (options.autoClose && options.autoClose > 0) {
    setTimeout(() => {
      closeModal();
    }, options.autoClose);
  }

  return modal;
}

export function showModal(options: ModalOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const modal = createModal({
      ...options,
      onConfirm: () => {
        resolve(true);
        options.onConfirm?.();
      },
      onCancel: () => {
        resolve(false);
        options.onCancel?.();
      }
    });

    document.body.appendChild(modal);
    
    setTimeout(() => {
      const confirmBtn = modal.querySelector<HTMLButtonElement>('#modal-confirm');
      confirmBtn?.focus();
    }, 100);
  });
}

function getIcon(type?: string): string {
  switch (type) {
    case 'success':
      return '<div class="text-[#66fcf1]">✓</div>';
    case 'error':
      return '<div class="text-red-400">✗</div>';
    case 'warning':
      return '<div class="text-yellow-400">⚠</div>';
    case 'info':
    default:
      return '<div class="text-[#66fcf1]">ℹ</div>';
  }
}

function getTitleColor(type?: string): string {
  switch (type) {
    case 'success':
      return 'text-green-400';
    case 'error':
      return 'text-red-400';
    case 'warning':
      return 'text-yellow-400';
    case 'info':
    default:
      return 'text-[#66fcf1]';
  }
}

function getGlowClass(type?: string): string {
  switch (type) {
    case 'success':
      return 'shadow-[0_0_20px_rgba(102,252,241,0.3)]';
    case 'error':
      return 'shadow-[0_0_20px_rgba(239,68,68,0.3)]';
    case 'warning':
      return 'shadow-[0_0_20px_rgba(251,191,36,0.3)]';
    case 'info':
    default:
      return 'shadow-[0_0_20px_rgba(102,252,241,0.2)]';
  }
}

export function showSuccessModal(message: string, title?: string, autoClose?: number): Promise<boolean> {
  return showModal({
    message,
    title,
    type: 'success',
    autoClose
  });
}

export function showErrorModal(message: string, title?: string): Promise<boolean> {
  return showModal({
    message,
    title,
    type: 'error'
  });
}

export function showWarningModal(message: string, title?: string): Promise<boolean> {
  return showModal({
    message,
    title,
    type: 'warning'
  });
}

export function showInfoModal(message: string, title?: string, autoClose?: number): Promise<boolean> {
  return showModal({
    message,
    title,
    type: 'info',
    autoClose
  });
}

export function showConfirmModal(message: string, title?: string): Promise<boolean> {
  return showModal({
    message,
    title,
    type: 'info',
    showCancel: true,
    confirmText: t('yes') || 'Yes',
    cancelText: t('no') || 'No'
  });
}
