import { store } from '../store';

let isSessionRestored = false;

export function setProfileSessionRestored() {
  isSessionRestored = true;
}

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
  const currentUserEmail = currentUser?.email || (currentUser ? `${currentUser.username}@example.com` : 'guest@example.com');

  if (!isSessionRestored) {
    return {
      username: 'Loading...',
      email: 'Loading...',
      name: 'Loading...',
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
    email: currentUserEmail || `${currentUser.username}@example.com`,
    name: currentUser.username,
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
      <div class="title">
        <span class="mid_line">MY PROFILE</span>
      </div>
      
      <div class="bg-[rgba(102,252,241,0.1)] rounded-[6px] shadow-[0_4px_10px_rgba(0,0,0,0.5)] p-8 w-80 px-[60px] py-[20px]">
        <div class="flex flex-col items-center space-y-4 mb-6">
          <div class="relative group">
            <img src="${user.avatarUrl}"
                 alt="${user.username}'s avatar"
                 class="w-24 h-24 rounded-full border-4 border-[#66fcf1] shadow-lg transition-transform duration-300 group-hover:scale-110" />
            <div class="absolute inset-0 rounded-full border-4 border-transparent group-hover:border-[#66fcf1] transition-all duration-300"></div>
          </div>
          
          <div class="text-center">
            <h2 class="text-2xl font-bold text-[#66fcf1] mb-1">${user.username}</h2>
            <p class="text-lg text-gray-300 mb-1">${user.name}</p>
            <p class="text-sm text-gray-400">${user.email}</p>
          </div>
        </div>
 
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="p-4 text-center">
            <div class="text-2xl font-bold text-[#66fcf1]">${user.wins}</div>
            <div class="text-sm text-gray-300">Wins</div>
          </div>
          <div class="p-4 text-center">
            <div class="text-2xl font-bold text-[#66fcf1]">${user.losses}</div>
            <div class="text-sm text-gray-300">Losses</div>
          </div>
          <div class="p-4 text-center">
            <div class="text-2xl font-bold text-[#66fcf1]">${user.totalGames}</div>
            <div class="text-sm text-gray-300">Total Games</div>
          </div>
          <div class="p-4 text-center">
            <div class="text-2xl font-bold text-[#66fcf1]">${user.winRate}%</div>
            <div class="text-sm text-gray-300">Win Rate</div>
          </div>
          </div>
          <div class="flex flex-col gap-3">
            <button id="edit-btn" class="cursor-pointer mt-[10px] text-lg font-[700] px-[30px] py-[8px] bg-gradient-to-r from-[#66fcf1] to-[#1f7474] text-[#031b1b] border-0 rounded-[6px] hover:bg-[#45a8a8] font-[jura] hover:shadow-[0_4px_10px_rgba(102,252,241,0.5)] transition-shadow duration-300">
              Edit Profile
            </button>
            <button id="refresh-stats-btn" class="cursor-pointer mt-[10px] text-lg font-[700] px-[30px] py-[8px] bg-gradient-to-r from-[#66fcf1] to-[#1f7474] text-[#031b1b] border-0 rounded-[6px] hover:bg-[#45a8a8] font-[jura] hover:shadow-[0_4px_10px_rgba(102,252,241,0.5)] transition-shadow duration-300">
              Refresh Stats
            </button>
          </div>
        </div>
      </div>
    </div>
  `

  const getEditHTML = () => `
    <div class="flex flex-col items-center space-y-6 w-full px-4">
      <div class="title">
        <span class="first_line"></span>
        <span class="mid_line flicker">EDIT PROFILE</span>
        <span class="last_line"></span>
      </div>
      
      <form class="bg-[rgba(102,252,241,0.1)] rounded-[6px] shadow-[0_4px_10px_rgba(0,0,0,0.5)] p-8 w-80 space-y-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#66fcf1] text-left">Display Name</label>
          <input name="name" type="text" value="${user.name}"
                 class="w-full px-3 py-2 bg-[rgba(102,252,241,0.1)] border border-[#66fcf1] rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66fcf1]" />
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#66fcf1] text-left">Username</label>
          <input name="username" type="text" value="${user.username}"
                 class="w-full px-3 py-2 bg-[rgba(102,252,241,0.1)] border border-[#66fcf1] rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66fcf1]" />
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#66fcf1] text-left">Email</label>
          <input name="email" type="email" value="${user.email}"
                 class="w-full px-3 py-2 bg-[rgba(102,252,241,0.1)] border border-[#66fcf1] rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66fcf1]" />
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#66fcf1] text-left">Avatar URL</label>
          <input name="avatarUrl" type="text" value="${user.avatarUrl}"
                 class="w-full px-3 py-2 bg-[rgba(102,252,241,0.1)] border border-[#66fcf1] rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66fcf1]" />
        </div>
        
        <div class="flex flex-col gap-3 pt-4">
          <button type="button" id="cancel-btn" class="btn w-auto px-8">
            Cancel
          </button>
          <button type="submit" class="btn btn-constant w-auto px-8">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  `

  const updateUserData = () => {
    user = getCurrentUser();
    section.innerHTML = getViewHTML();
    bindViewEvents();
  };

  updateUserData();
  store.subscribe(updateUserData);
  
  setTimeout(() => {
    updateUserData();
  }, 500);

  function bindViewEvents() {
    const editBtn = section.querySelector('#edit-btn') as HTMLButtonElement
    const refreshStatsBtn = section.querySelector('#refresh-stats-btn') as HTMLButtonElement
    
    editBtn?.addEventListener('click', enterEditMode)
    
    refreshStatsBtn?.addEventListener('click', () => {
      const newStats = getStaticStats()
      user = { ...user, ...newStats }
      section.innerHTML = getViewHTML()
      bindViewEvents()
    })
  }

  function enterEditMode() {
    section.innerHTML = getEditHTML()
    const form = section.querySelector('form') as HTMLFormElement
    const cancel = section.querySelector('#cancel-btn') as HTMLButtonElement

    cancel.addEventListener('click', () => {
      section.innerHTML = getViewHTML()
      bindViewEvents()
    })

    form.addEventListener('submit', e => {
      e.preventDefault()
      const data = new FormData(form)
      const updated: UserProfile = {
        name: data.get('name') as string,
        username: data.get('username') as string,
        email: data.get('email') as string,
        avatarUrl: data.get('avatarUrl') as string,
        wins: user.wins,
        losses: user.losses,
        totalGames: user.totalGames,
        winRate: user.winRate,
      }

      console.log('Saving profile →', updated)

      user = updated
      section.innerHTML = getViewHTML()
      bindViewEvents()
    })
  }

  return section
}
