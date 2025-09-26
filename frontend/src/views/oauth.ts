import { t } from './../i18n';
import { store } from '../store';

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
		const urlParams = new URLSearchParams(window.location.search);
		const token = urlParams.get('token');
		const username = urlParams.get('username');
		const firstname = urlParams.get('firstname');
		const email = urlParams.get('email');
		const avatarUrl = urlParams.get('avatarUrl');
		const error = urlParams.get('error');

		if (error) {
			console.error('OAuth error:', error);
			alert('OAuth authentication failed. Please try again.');
			window.location.hash = '/login';
			return;
		}

		if (!token || !username || !email) {
			console.error('Missing required OAuth parameters');
			alert('Authentication failed. Missing required data.');
			window.location.hash = '/login';
			return;
		}

		localStorage.setItem('accessToken', token);

		const user = {
			username: decodeURIComponent(username),
			firstname: firstname ? decodeURIComponent(firstname) : username,
			email: decodeURIComponent(email),
			avatarUrl: avatarUrl ? decodeURIComponent(avatarUrl) : '/assets/img/avatar.jpg'
		};

		store.dispatch({ type: 'LOGIN', payload: user });

		console.log('OAuth login successful:', user);

		window.location.hash = '/dashboard';

	} catch (error) {
		console.error('OAuth callback processing error:', error);
		alert('An error occurred during authentication. Please try again.');
		window.location.hash = '/login';
	}
}