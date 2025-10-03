import { t } from './../i18n';
import { store } from '../store';
import { alertError } from './../utils/modal-alerts';

export function renderOAuthCallback(): HTMLElement {
	const section = document.createElement('section');
	section.className = 'flex flex-col w-full h-full absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center z-10 font-[pressstart2p]';

	section.innerHTML = `
		<div class="title">
			<span class="first_line"></span>
			<span class="mid_line">Processing Login...</span>
			<span class="last_line"></span>
		</div>
		<div class="mt-4">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#66fcf1] mx-auto"></div>
		</div>
	`;
	processOAuthCallback();

	return section;
}

async function processOAuthCallback() {
  try {
    const hashPart = window.location.hash.split('?')[1] || '';
    const urlParams = new URLSearchParams(hashPart);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      alertError('OAuth authentication failed. Please try again.');
      window.location.hash = '/login';
      return;
    }

    if (success === 'true') {
      try {
        const meRes = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (meRes.ok) {
          const user = await meRes.json();
          store.dispatch({ type: 'LOGIN', payload: user });
          console.log('OAuth login successful:', user);
          window.location.hash = '/dashboard';
        } else {
          throw new Error('Failed to fetch user data');
        }
      } catch (err) {
        console.error('Failed to fetch user data after OAuth:', err);
        alertError('Authentication completed but failed to load user data.');
        window.location.hash = '/login';
      }
    } else {
      console.error('OAuth callback missing success parameter');
      alertError('Authentication status unclear. Please try logging in again.');
      window.location.hash = '/login';
    }

  } catch (error) {
    console.error('OAuth callback processing error:', error);
    alertError('An error occurred during authentication. Please try again.');
    window.location.hash = '/login';
  }
}