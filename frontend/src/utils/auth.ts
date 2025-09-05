import { store } from '../store';

/**
 * Checks if the current user is authenticated
 */
export function isAuthenticated(): boolean {
  return store.getState().isAuthenticated;
}

/**
 * Checks if the current user should be redirected from auth routes
 */
export function shouldRedirectFromAuth(): boolean {
  return isAuthenticated();
}

/**
 * Checks if the current user should be redirected from protected routes
 */
export function shouldRedirectFromProtected(): boolean {
  return !isAuthenticated();
}

/**
 * Redirects authenticated users away from auth routes
 */
export function redirectIfAuthenticated(): void {
  if (shouldRedirectFromAuth()) {
    location.hash = '/dashboard';
  }
}

/**
 * Redirects unauthenticated users away from protected routes
 */
export function redirectIfUnauthenticated(): void {
  if (shouldRedirectFromProtected()) {
    location.hash = '/home';
  }
}

/**
 * Handles complete logout by calling backend API and clearing frontend state
 */
export async function logout(): Promise<void> {
  try {
    // Get current token before clearing
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      // Call backend logout endpoint to invalidate server session
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });
        
        if (response.ok) {
          console.log('Backend logout successful');
        } else {
          console.warn('Backend logout failed, but continuing with frontend logout');
        }
      } catch (err) {
        console.error('Logout API call failed:', err);
        // Continue with logout even if API call fails
      }
    }
    
    // Clear frontend state regardless of backend response
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    store.dispatch({ type: 'LOGOUT' });
    
    // Force clear any remaining auth-related data
    sessionStorage.clear(); // Clear any session storage
    
    console.log('Frontend logout completed');
    
  } catch (error) {
    console.error('Error during logout:', error);
    // Ensure frontend state is cleared even if there's an error
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    store.dispatch({ type: 'LOGOUT' });
  }
}
