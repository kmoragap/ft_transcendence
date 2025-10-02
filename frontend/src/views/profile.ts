import { store } from '../store';
import { t, updateText } from '../i18n';
import { getUserProfile, sendFriendRequest, getFriendshipStatus, removeFriendRequest, UserSearchResult } from "../api/users";
import { alertError, alertSuccess, alertWarning } from './../utils/modal-alerts';

export function renderProfile(username: string): HTMLElement {
  const section = document.createElement('section')
  section.className = [
    'flex flex-col w-full h-full',
    'items-center justify-center text-center',
    'z-[3] text-[#66fcf1] font-[jura]',
    ''
  ].join(' ')

  let user: UserSearchResult | null = null;
  let isLoading = true;
  let isFriend = false;
  let friendshipStatus: 'none' | 'pending' | 'accepted' | 'rejected' = 'none';

  const getViewHTML = () => {
    if (isLoading) {
      return `
        <div class="flex flex-col items-center space-y-6 w-full px-4">
          <h1 class="title uppercase mobile-title">
            <span class="mid_line" data-i18n="profile">PROFILE</span>
          </h1>
          <div class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#66fcf1]"></div>
          </div>
        </div>
      `;
    }

    if (!user) {
      return `
        <div class="flex flex-col items-center space-y-6 w-full px-4">
          <h1 class="title uppercase mobile-title">
            <span class="mid_line" data-i18n="profile">PROFILE</span>
          </h1>
          <div class="text-center">
            <h2 class="text-2xl font-bold text-[#66fcf1] mb-4" data-i18n="user_not_found">User Not Found</h2>
            <p class="text-[#66fcf1]/70" data-i18n="user_not_found_desc">The user you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      `;
    }

    const winRate = user.gamesPlayed > 0 ? Math.round((user.gamesWon / user.gamesPlayed) * 100) : 0;
    const losses = user.gamesPlayed - user.gamesWon;

    return `
      <div class="flex flex-col items-center space-y-6 w-full px-4">
        <h1 class="title uppercase mobile-title">
          <span class="mid_line" data-i18n="profile">PROFILE</span>
        </h1>

        <section class="w-full
                        rounded-xl shadow-2xl
                        max-w-7xl mx-auto px-4 md:px-15 py-4 md:py-7.5">
          <div class="flex flex-col md:flex-row items-stretch gap-4 md:gap-x-8">
            <div class="bg-[rgba(102,252,241,0.1)] rounded-md flex-1
                        shadow-lg px-4 md:px-10 py-4 md:py-5">
              <div class="flex flex-col items-center space-y-3 md:space-y-4 mb-4 md:mb-6">
                <div class="relative group">
                  <img src="${user.avatarUrl || '/assets/img/avatar.jpg'}" 
                      alt="${user.username}'s avatar"
                      class="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-[#66fcf1] shadow-lg object-cover"
                      onerror="this.src='/assets/img/avatar.jpg'" />
                </div>

                <div class="text-center">
                  <h2 class="text-xl md:text-2xl font-bold text-[#66fcf1] mb-1">${user.username}</h2>
                  <p class="text-base md:text-lg text-gray-300 mb-1">${user.firstname}</p>
                </div>
                
                <div class="flex flex-col gap-2 md:gap-3">
                  ${getFriendButtonHTML()}
                </div>
              </div>
            </div>

            <div class="bg-[rgba(102,252,241,0.1)] rounded-md flex-1
                        shadow-lg px-4 md:px-10 py-4 md:py-5">
              <h2 class="text-lg md:text-xl font-bold text-[#66fcf1] mb-2" data-i18n="game_statistics">Game Statistics</h2>
              <div class="grid grid-cols-2 gap-2 md:gap-4 mb-4 md:mb-6">
                <div class="p-2 md:p-4 text-center">
                  <div class="text-xl md:text-2xl font-bold text-[#66fcf1]">${user.gamesWon}</div>
                  <div class="text-xs md:text-sm text-gray-300" data-i18n="wins_plural">Wins</div>
                </div>
                <div class="p-2 md:p-4 text-center">
                  <div class="text-xl md:text-2xl font-bold text-[#66fcf1]">${losses}</div>
                  <div class="text-xs md:text-sm text-gray-300" data-i18n="losses">Losses</div>
                </div>
                <div class="p-2 md:p-4 text-center">
                  <div class="text-xl md:text-2xl font-bold text-[#66fcf1]">${user.gamesPlayed}</div>
                  <div class="text-xs md:text-sm text-gray-300" data-i18n="total_games">Total Games</div>
                </div>
                <div class="p-2 md:p-4 text-center">
                  <div class="text-xl md:text-2xl font-bold text-[#66fcf1]">${winRate}%</div>
                  <div class="text-xs md:text-sm text-gray-300" data-i18n="win_rate">Win Rate</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  };

  const getFriendButtonHTML = () => {
    switch (friendshipStatus) {
      case 'accepted':
        return `
          <button id="remove-friend-btn" class="cursor-pointer mt-2.5 text-base md:text-lg font-bold px-6 md:px-8 py-2
                  bg-gradient-to-r from-red-500 to-red-700 text-white border-0 rounded-md
                  hover:bg-red-600 font-[jura] hover:shadow-lg
                  transition-shadow duration-300" data-i18n="remove_friend">
            Remove Friend
          </button>
        `;
      case 'pending':
        return `
          <button id="cancel-friend-request-btn" class="cursor-pointer mt-2.5 text-base md:text-lg font-bold px-6 md:px-8 py-2
                  bg-gradient-to-r from-orange-500 to-orange-700 text-white border-0 rounded-md
                  hover:bg-orange-600 font-[jura] hover:shadow-lg
                  transition-shadow duration-300" data-i18n="cancel_friend_request">
            Cancel Friend Request
          </button>
        `;
      case 'rejected':
        return `
          <button id="send-friend-request-btn" class="cursor-pointer mt-2.5 text-base md:text-lg font-bold px-6 md:px-8 py-2
                  bg-gradient-to-r from-[#66fcf1] to-[#1f7474] text-[#031b1b] border-0 rounded-md
                  hover:bg-[#45a8a8] font-[jura] hover:shadow-lg
                  transition-shadow duration-300" data-i18n="send_friend_request">
            Send Friend Request
          </button>
        `;
      default:
        return `
          <button id="send-friend-request-btn" class="cursor-pointer mt-2.5 text-base md:text-lg font-bold px-6 md:px-8 py-2
                  bg-gradient-to-r from-[#66fcf1] to-[#1f7474] text-[#031b1b] border-0 rounded-md
                  hover:bg-[#45a8a8] font-[jura] hover:shadow-lg
                  transition-shadow duration-300" data-i18n="send_friend_request">
            Send Friend Request
          </button>
        `;
    }
  };

  const loadUserProfile = async () => {
    try {
      isLoading = true;
      section.innerHTML = getViewHTML();
      updateText();
      
      user = await getUserProfile(username);
      // Check friendship status with current user
      // Use username as identifier since that's what we store in localStorage
      const { store } = await import('../store');
      const currentUser = store.getState().currentUser;
      friendshipStatus = await getFriendshipStatus(user.username, currentUser?.username);
      
      isLoading = false;
      section.innerHTML = getViewHTML();
      bindEvents();
      updateText();
    } catch (error: any) {
      console.error('Failed to load user profile:', error);
      isLoading = false;
      user = null;
      section.innerHTML = getViewHTML();
      updateText();
    }
  };

  const bindEvents = () => {
    const sendFriendRequestBtn = section.querySelector('#send-friend-request-btn') as HTMLButtonElement;
    const removeFriendBtn = section.querySelector('#remove-friend-btn') as HTMLButtonElement;
    const cancelFriendRequestBtn = section.querySelector('#cancel-friend-request-btn') as HTMLButtonElement;

    sendFriendRequestBtn?.addEventListener('click', async () => {
      if (!user) return;
      
      try {
        await sendFriendRequest(user.id, user.username);
        friendshipStatus = 'pending';
        section.innerHTML = getViewHTML();
        bindEvents();
        updateText();
        alertSuccess(t('friend_request_sent'));
      } catch (error: any) {
        alertError(error?.message || t('friend_request_failed'));
      }
    });

    removeFriendBtn?.addEventListener('click', async () => {
      if (!user) return;
      
      try {
        await removeFriendRequest(user.username);
        friendshipStatus = 'none';
        section.innerHTML = getViewHTML();
        bindEvents();
        updateText();
        alertSuccess('Friend removed successfully');
      } catch (error: any) {
        alertError(error?.message || t('remove_friend_failed'));
      }
    });

    cancelFriendRequestBtn?.addEventListener('click', async () => {
      if (!user) return;
      
      try {
        await removeFriendRequest(user.username);
        friendshipStatus = 'none';
        section.innerHTML = getViewHTML();
        bindEvents();
        updateText();
        alertSuccess(t('friend_request_cancelled'));
      } catch (error: any) {
        alertError(error?.message || t('cancel_friend_request_failed'));  
      }
    });
  };

  loadUserProfile();
  
  window.addEventListener('languageChanged', () => {
    section.innerHTML = getViewHTML();
    bindEvents();
  });
  
  updateText();
  return section;
}