// profile.ts

export interface UserProfile {
  username: string
  email: string
  avatarUrl: string
  wins: number
  losses: number
}

let user: UserProfile = {
  username: 'PongMaster',
  email:    'pong@game.io',
  avatarUrl:'../../assets/img/avatar.jpg',
  wins:     42,
  losses:   17,
}

export function renderProfile(): HTMLElement {
  const section = document.createElement('section')
  section.className = [
    'flex flex-col w-full h-full absolute',
    'top-1/2 left-1/2 transform',
    '-translate-x-1/2 -translate-y-1/2',
    'items-center justify-center text-center',
    'z-[3] font-[mclaren]',
  ].join(' ')

  const getViewHTML = () => `
    <div class="profile-card bg-white p-6 rounded-lg shadow-md w-80 mt-[10px] flex flex-col items-center py-[40px] px-[50px] bg-[rgba(102,252,241,0.1)] rounded-[6px] shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
      <img src="${user.avatarUrl}"
           alt="${user.username}'s avatar"
           class="w-24 h-24 rounded-full mx-auto" />
      <h2 class="mt-4 text-2xl font-semibold">${user.username}</h2>
      <p class="text-gray-600">${user.email}</p>
      <div class="mt-4 flex justify-around text-center">
        <div>
          <span class="text-lg font-bold">${user.wins}</span>
          <p class="text-sm">Wins</p>
        </div>
        <div>
          <span class="text-lg font-bold">${user.losses}</span>
          <p class="text-sm">Losses</p>
        </div>
      </div>
      <button id="edit-btn"
              class="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Edit
      </button>
    </div>
  `

  const getEditHTML = () => `
    <form class="profile-card bg-white p-6 rounded-lg shadow-md w-80 flex flex-col space-y-4">
      <label class="text-left">
        <span class="block text-sm font-medium">Avatar URL</span>
        <input name="avatarUrl" type="text" value="${user.avatarUrl}"
               class="mt-1 block w-full border rounded px-2 py-1" />
      </label>
      <label class="text-left">
        <span class="block text-sm font-medium">Username</span>
        <input name="username" type="text" value="${user.username}"
               class="mt-1 block w-full border rounded px-2 py-1" />
      </label>
      <label class="text-left">
        <span class="block text-sm font-medium">Email</span>
        <input name="email" type="email" value="${user.email}"
               class="mt-1 block w-full border rounded px-2 py-1" />
      </label>
      <div class="flex justify-between">
        <button type="button" id="cancel-btn"
                class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
          Cancel
        </button>
        <button type="submit"
                class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Save
        </button>
      </div>
    </form>
  `

  function bindViewEvents() {
    const editBtn = section.querySelector('#edit-btn') as HTMLButtonElement
    editBtn?.addEventListener('click', enterEditMode)
  }

  function enterEditMode() {
    section.innerHTML = getEditHTML()
    const form   = section.querySelector('form') as HTMLFormElement
    const cancel = section.querySelector('#cancel-btn') as HTMLButtonElement

    cancel.addEventListener('click', () => {
      section.innerHTML = getViewHTML()
      bindViewEvents()
    })

    form.addEventListener('submit', e => {
      e.preventDefault()
      const data = new FormData(form)
      const updated: UserProfile = {
        avatarUrl: data.get('avatarUrl') as string,
        username:  data.get('username')  as string,
        email:     data.get('email')     as string,
        wins:      user.wins,
        losses:    user.losses,
      }

      console.log('Saving profile →', updated)

      user = updated
      section.innerHTML = getViewHTML()
      bindViewEvents()
    })
  }

  // initial render
  section.innerHTML = getViewHTML()
  bindViewEvents()

  return section
}
