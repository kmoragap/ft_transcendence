import { store } from '../store';
import { t, updateText } from '../i18n';
import { uploadMyAvatar, updateMyProfile } from "../api/users";
import { updateCurrentUserAvatar, updateCurrentUserProfile } from "../store";
import { sessionManager } from '../utils/session';

export interface UserProfile {
  username: string
  email: string
  name: string
  avatarUrl: string
  wins: number
  losses: number
  totalGames: number
  winRate: number
}

function getStaticStats(): { wins: number; losses: number; totalGames: number; winRate: number } {
  return {
    wins: 127,
    losses: 89,
    totalGames: 216,
    winRate: 59
  };
}

function getCurrentUser(): UserProfile {
  const state = store.getState();
  const currentUser = state.currentUser;

  if (!sessionManager.isSessionRestored()) {
    return {
      username: 'Loading...',
      email: 'Loading...',
      name: 'Loading',
      avatarUrl: '/assets/img/avatar.jpg',
      ...getStaticStats()
    };
  }
  
  if (!currentUser) {
    return {
      username: 'Guest',
      email: 'guest@example.com',
      name: 'Guest User',
      avatarUrl: '/assets/img/avatar.jpg',
      ...getStaticStats()
    };
  }
  
  return {
    username: currentUser.username,
    email: currentUser.email,
    name: currentUser.firstname || currentUser.username,
    avatarUrl: currentUser.avatarUrl || '/assets/img/avatar.jpg',
    ...getStaticStats()
  };
}

let user: UserProfile = getCurrentUser();

export function renderMyProfile(): HTMLElement {
  const section = document.createElement('section')
  section.className = [
    'flex flex-col w-full h-full absolute',
    'top-1/2 left-1/2 transform',
    '-translate-x-1/2 -translate-y-1/2',
    'items-center justify-center text-center',
    'z-[3] text-[#66fcf1] font-[jura]',
    ''
  ].join(' ')

  const getViewHTML = () => `
    <div class="flex flex-col items-center space-y-6 w-full px-4">
    <h1 class="title uppercase">
      <span class="mid_line" data-i18n="my_profile">MY PROFILE</span>
    </h1>

    <section class="w-full
                    rounded-xl shadow-2xl
                    max-w-7xl mx-auto px-15 py-7.5">
      <div class="flex flex-row items-stretch gap-x-8">
        <div class="flex flex-col bg-[rgba(102,252,241,0.1)] rounded-md flex-1
                    shadow-lg px-10 py-5">
          <h2 class="text-xl font-bold text-[#66fcf1] mb-2" data-i18n="social">Social</h2>
          <div class="bg-[rgba(30,41,40,0.7)] w-full flex-1 border border-[rgba(102,252,241,0.15)]"></div>
        </div>

        <div class="bg-[rgba(102,252,241,0.1)] rounded-md flex-1
                    shadow-lg px-10 py-5">
          <div class="flex flex-col items-center space-y-4 mb-6">
            <div class="relative group">
              <img id="profile-avatar-img" src="${user.avatarUrl}" alt="${user.username}'s avatar"
                  class="w-24 h-24 rounded-full border-4 border-[#66fcf1] shadow-lg transition-transform duration-300 group-hover:scale-110 object-cover cursor-pointer" 
                  title="Click to change photo" />
              <!-- Upload overlay -->
              <div class="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                <span class="text-white text-xs font-bold" data-i18n="change_photo">Change Photo</span>
              </div>
            </div>

            <input id="avatar-file-input" type="file" accept="image/*" class="hidden" />

            <div class="text-center">
              <h2 class="text-2xl font-bold text-[#66fcf1] mb-1">${user.username}</h2>
              <p class="text-lg text-gray-300 mb-1">${user.name}</p>
              <p class="text-sm text-gray-400">${user.email}</p>
            </div>
            <div class="flex flex-col gap-3">
              <button id="edit-btn" class="cursor-pointer mt-2.5 text-lg font-bold px-8 py-2
                      bg-gradient-to-r from-[#66fcf1] to-[#1f7474] text-[#031b1b] border-0 rounded-md
                      hover:bg-[#45a8a8] font-[jura] hover:shadow-lg
                      transition-shadow duration-300" data-i18n="edit_profile">
                Edit Profile
              </button>
              <button id="refresh-stats-btn" class="cursor-pointer mt-2.5 text-lg font-bold px-8 py-2
                      bg-gradient-to-r from-[#66fcf1] to-[#1f7474] text-[#031b1b] border-0 rounded-md
                      hover:bg-[#45fcf1] font-[jura] hover:shadow-lg
                      transition-shadow duration-300" data-i18n="refresh_stats">
                Refresh Stats
              </button>
            </div>
          </div>
        </div>

        <div class="bg-[rgba(102,252,241,0.1)] rounded-md flex-1
                    shadow-lg px-10 py-5">
          <h2 class="text-xl font-bold text-[#66fcf1] mb-2" data-i18n="game_statistics">Game Statistics</h2>
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="p-4 text-center">
              <div class="text-2xl font-bold text-[#66fcf1]">${user.wins}</div>
              <div class="text-sm text-gray-300" data-i18n="wins_plural">Wins</div>
            </div>
            <div class="p-4 text-center">
              <div class="text-2xl font-bold text-[#66fcf1]">${user.losses}</div>
              <div class="text-sm text-gray-300" data-i18n="losses">Losses</div>
            </div>
            <div class="p-4 text-center">
              <div class="text-2xl font-bold text-[#66fcf1]">${user.totalGames}</div>
              <div class="text-sm text-gray-300" data-i18n="total_games">Total Games</div>
            </div>
            <div class="p-4 text-center">
              <div class="text-2xl font-bold text-[#66fcf1]">${user.winRate}%</div>
              <div class="text-sm text-gray-300" data-i18n="win_rate">Win Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  `

  const getEditHTML = () => `
    <div class="flex flex-col items-center space-y-6 w-full px-4">
    <h1 class="title uppercase">
      <span class="mid_line" data-i18n="my_profile">MY PROFILE</span>
    </h1>
      
      <form class="bg-[rgba(102,252,241,0.1)] rounded-md shadow-lg p-8 w-80 space-y-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#66fcf1] text-left" data-i18n="display_name">Display Name</label>
          <input name="name" type="text" value="${user.name}"
                 class="w-full px-3 py-2 bg-[rgba(102,252,241,0.1)] border border-[#66fcf1] rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66fcf1]" />
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#66fcf1] text-left" data-i18n="username">Username</label>
          <input name="username" type="text" value="${user.username}"
                 class="w-full px-3 py-2 bg-[rgba(102,252,241,0.1)] border border-[#66fcf1] rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66fcf1]" />
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#66fcf1] text-left" data-i18n="email">Email</label>
          <input name="email" type="email" value="${user.email}"
                 class="w-full px-3 py-2 bg-[rgba(102,252,241,0.1)] border border-[#66fcf1] rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66fcf1]" />
        </div>
        
        <div class="flex flex-col gap-3 pt-4">
          <button type="button" id="cancel-btn" class="cursor-pointer text-lg font-bold px-8 py-2
                  bg-gradient-to-r from-[#66fcf1] to-[#1f7474] text-[#031b1b] border-0 rounded-md
                  hover:bg-[#45a8a8] font-[jura] hover:shadow-lg
                  transition-shadow duration-300" data-i18n="cancel">
            Cancel
          </button>
          <button type="submit" class="cursor-pointer text-lg font-bold px-8 py-2
                  bg-gradient-to-r from-[#66fcf1] to-[#1f7474] text-[#031b1b] border-0 rounded-md
                  hover:bg-[#45a8a8] font-[jura] hover:shadow-lg
                  transition-shadow duration-300" data-i18n="save_changes">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
  `

  const updateUserData = () => {
    user = getCurrentUser();
    section.innerHTML = getViewHTML();
    bindViewEvents();
    updateText(); // Ensure translations are applied after re-rendering
  };

  updateUserData();
  store.subscribe(updateUserData);
  sessionManager.onSessionRestored(updateUserData);
  
  // Listen for language changes
  window.addEventListener('languageChanged', () => {
    updateUserData();
  });
  
  setTimeout(() => {
    updateUserData();
  }, 500);

  function bindViewEvents() {
    const editBtn = section.querySelector('#edit-btn') as HTMLButtonElement
    const refreshStatsBtn = section.querySelector('#refresh-stats-btn') as HTMLButtonElement

    // ---- Avatar upload bindings (VIEW MODE) ----
    const fileInput = section.querySelector('#avatar-file-input') as HTMLInputElement | null;
    const avatarImg = section.querySelector('#profile-avatar-img') as HTMLImageElement | null;

    if (avatarImg && fileInput) {
      // Make avatar image clickable
      avatarImg.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', async () => {
        const file = fileInput.files?.[0];
        if (!file) return;

        // Optional 2MB client-side guard (match backend)
        if (file.size > 2 * 1024 * 1024) {
          alert(t('image_too_large'));
          fileInput.value = '';
          return;
        }

        // UI feedback - show loading state on avatar
        if (avatarImg) {
          avatarImg.style.opacity = '0.5';
          avatarImg.style.cursor = 'wait';
        }

        try {
          const url = await uploadMyAvatar(file);
          // Update UI immediately
          if (avatarImg) avatarImg.src = url;
          // Update local data + global store
          user = { ...user, avatarUrl: url };
          updateCurrentUserAvatar(url);
        } catch (e: any) {
          alert(e?.message || t('upload_failed'));
        } finally {
          // Reset UI state
          if (avatarImg) {
            avatarImg.style.opacity = '1';
            avatarImg.style.cursor = 'pointer';
          }
          fileInput.value = '';
        }
      });
    }
    // -------------------------------------------

    editBtn?.addEventListener('click', enterEditMode)
    
    refreshStatsBtn?.addEventListener('click', () => {
      const newStats = getStaticStats()
      user = { ...user, ...newStats }
      section.innerHTML = getViewHTML()
      bindViewEvents()
      updateText(); // Apply translations after refresh
    })
  }

  function enterEditMode() {
    section.innerHTML = getEditHTML()
    updateText(); // Apply translations to edit mode
    const form = section.querySelector('form') as HTMLFormElement
    const cancel = section.querySelector('#cancel-btn') as HTMLButtonElement

    cancel.addEventListener('click', () => {
      section.innerHTML = getViewHTML()
      bindViewEvents()
      updateText(); // Apply translations when returning to view mode
    })

    form.addEventListener('submit', async e => {
      e.preventDefault()
      const data = new FormData(form)
      
      const profileData = {
        username: data.get('username') as string,
        firstname: data.get('name') as string,
        email: data.get('email') as string,
      }

      try {
        // Save to backend
        await updateMyProfile(profileData);
        
        // Update local store
        updateCurrentUserProfile(profileData);
        
        // Update local user data
        const updated: UserProfile = {
          name: profileData.firstname,
          username: profileData.username,
          email: profileData.email,
          avatarUrl: user.avatarUrl, // Keep existing avatar URL
          wins: user.wins,
          losses: user.losses,
          totalGames: user.totalGames,
          winRate: user.winRate,
        }


        user = updated
        section.innerHTML = getViewHTML()
        bindViewEvents()
        updateText(); // Apply translations after successful update
        
        alert(t('profile_updated'));
      } catch (error: any) {
        console.error('Failed to update profile:', error);
        alert(error?.message || t('update_failed'));
      }
    })
  }
  updateText();
  return section
}
