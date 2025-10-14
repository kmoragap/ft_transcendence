// This file implements authentication utilities including checking auth status, redirecting based on auth state, and handling logout.
import { store } from '../store';

export function isAuthenticated(): boolean {
  return store.getState().isAuthenticated;
}

export function shouldRedirectFromAuth(): boolean {
  return isAuthenticated();
}

export function shouldRedirectFromProtected(): boolean {
  return !isAuthenticated();
}

export function redirectIfUnauthenticated(): void {
  if (shouldRedirectFromProtected()) {
    location.hash = '/home';
  }
}

export async function logout(): Promise<void> {
  try {
    const token = localStorage.getItem('accessToken');
    
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers,
        credentials: 'include'
      });
      
      if (response.ok) {
      } else {
        console.warn('Backend logout failed, but continuing with frontend logout');
      }
    } catch (err) {
      console.error('Logout API call failed:', err);
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    store.dispatch({ type: 'LOGOUT' });
    
    sessionStorage.clear();
    
    
  } catch (error) {
    console.error('Error during logout:', error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    store.dispatch({ type: 'LOGOUT' });
  }
}
