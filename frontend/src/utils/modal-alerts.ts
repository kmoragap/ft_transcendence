// This file provides utility functions to display modal alerts of various types (success, error, warning, info) and a confirmation dialog.
import { showModal, showSuccessModal, showErrorModal, showWarningModal, showInfoModal, showConfirmModal } from '../components/modal';

export function showAlert(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): Promise<boolean> {
  return showModal({
    message,
    type,
    autoClose: type === 'success' ? 3000 : undefined
  });
}

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
  
  return {
    restore: () => {
      window.alert = originalAlert;
      window.confirm = originalConfirm;
    }
  };
}
