import { showModal, showSuccessModal, showErrorModal, showWarningModal, showInfoModal, showConfirmModal } from '../components/modal';

export function showAlert(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): Promise<boolean> {
  return showModal({
    message,
    type,
    autoClose: type === 'success' ? 3000 : undefined
  });
}

// Convenience functions that match common alert() usage patterns
export function alertSuccess(message: string): Promise<boolean> {
  return showSuccessModal(message, undefined, 3000);
}

export function alertError(message: string): Promise<boolean> {
  return showErrorModal(message);
}

export function alertWarning(message: string): Promise<boolean> {
  return showWarningModal(message);
}

export function alertInfo(message: string): Promise<boolean> {
  return showInfoModal(message, undefined, 3000);
}

export function alertConfirm(message: string, title?: string): Promise<boolean> {
  return showConfirmModal(message, title);
}

export function replaceGlobalAlert() {
  const originalAlert = window.alert;
  
  window.alert = (message: string) => {
    showAlert(message, 'info');
  };
  
  const originalConfirm = window.confirm;
  // Do NOT override window.confirm with an async function, as it breaks synchronous expectations.
  // If you need a custom confirm modal, use alertConfirm() directly.
  
  return {
    restore: () => {
      window.alert = originalAlert;
      window.confirm = originalConfirm;
    }
  };
}
