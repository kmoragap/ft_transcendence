// Mobile detection utilities for both device and screen size

export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isMobileScreen(): boolean {
  return window.innerWidth <= 768 && window.innerHeight <= 1024;
}

export function isMobile(): boolean {
  return isMobileDevice() || isMobileScreen();
}
