// My Profile page

import { store } from "../store";
import { t, updateText } from "../utils/i18n";
import { logout } from "../utils/auth";
import {
  uploadMyAvatar,
  updateMyProfile,
  getUserStats,
  toggle2fa,
  getUserGameHistory,
  GameHistoryEntry,
} from "../api/users";
import {
  acceptReceivedFriendRequest,
  rejectFriendRequest,
  removeFriendRequest,
} from "../api/friends";
import { updateCurrentUserAvatar, updateCurrentUserProfile } from "../store";
import { sessionManager } from "../utils/session";
import { attachValidation } from "../utils/form-validation";
import { enhanceButton, handleAsyncButtonClick, setButtonLoading, removeButtonLoading } from "../utils/button-animations";
import {
  alertError,
  alertSuccess,
  alertWarning,
} from "./../utils/modal-alerts";

export interface UserProfile {
  username: string;
  email: string;
  name: string;
  avatarUrl: string;
  wins: number;
  losses: number;
  totalGames: number;
  winRate: number;
  elo?: number;
  is2faEnabled?: boolean;
  isOAuthUser?: boolean;
}

function getDefaultStats(): {
  wins: number;
  losses: number;
  totalGames: number;
  winRate: number;
  elo: number;
} {
  return {
    wins: 0,
    losses: 0,
    totalGames: 0,
    winRate: 0,
    elo: 1000,
  };
}

async function getCurrentUserWithStats(): Promise<UserProfile> {
  const state = store.getState();
  const currentUser = state.currentUser;

  if (!sessionManager.isSessionRestored()) {
    return {
      username: "Loading...",
      email: "Loading...",
      name: "Loading",
      avatarUrl: "/assets/img/avatar.jpg",
      is2faEnabled: false,
      isOAuthUser: false,
      ...getDefaultStats(),
    };
  }

  if (!currentUser) {
    return {
      username: "Guest",
      email: "guest@example.com",
      name: "Guest User",
      avatarUrl: "/assets/img/avatar.jpg",
      is2faEnabled: false,
      isOAuthUser: false,
      ...getDefaultStats(),
    };
  }

  if (!currentUser.id) {
    alertWarning('User ID not available, using default stats');
    return {
      username: currentUser.username,
      email: currentUser.email,
      name: currentUser.firstname || currentUser.username,
      avatarUrl: currentUser.avatarUrl || "/assets/img/avatar.jpg",
      is2faEnabled: currentUser.is2faEnabled || false,
      isOAuthUser: currentUser.isOAuthUser || false,
      ...getDefaultStats(),
    };
  }

  try {
    const stats = await getUserStats(currentUser.id);
    return {
      username: currentUser.username,
      email: currentUser.email,
      name: currentUser.firstname || currentUser.username,
      avatarUrl: currentUser.avatarUrl || "/assets/img/avatar.jpg",
      wins: stats.wins,
      losses: stats.losses,
      totalGames: stats.wins + stats.losses,
      winRate: stats.winRate,
      elo: stats.elo,
      is2faEnabled: currentUser.is2faEnabled || false,
      isOAuthUser: currentUser.isOAuthUser || false,
    };
  } catch (error) {
    console.error('Failed to fetch user stats:', error);
    return {
      username: currentUser.username,
      email: currentUser.email,
      name: currentUser.firstname || currentUser.username,
      avatarUrl: currentUser.avatarUrl || "/assets/img/avatar.jpg",
      is2faEnabled: currentUser.is2faEnabled || false,
      isOAuthUser: currentUser.isOAuthUser || false,
      ...getDefaultStats(),
    };
  }
}

let user: UserProfile = {
  username: "Loading...",
  email: "Loading...",
  name: "Loading",
  avatarUrl: "/assets/img/avatar.jpg",
  is2faEnabled: false,
  isOAuthUser: false,
  ...getDefaultStats(),
};

export function renderMyProfile(): HTMLElement {
  const section = document.createElement("section");
  section.className = [
    "flex flex-col w-full h-full",
    "items-center justify-center text-center",
    "z-[3] text-[#66fcf1] font-[jura]",
    "",
  ].join(" ");

  const getViewHTML = () => `
    <div class="flex flex-col items-center space-y-6 w-full px-4">
    <h1 class="title uppercase mobile-title">
      <span class="mid_line" data-i18n="myprofile">MY PROFILE</span>
    </h1>

    <section class="w-full
                    rounded-xl shadow-2xl
                    max-w-7xl mx-auto px-4 lg:px-15 py-4 lg:py-7.5">
      <div class="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-x-8">
        <div class="flex flex-col bg-[rgba(102,252,241,0.1)] rounded-md flex-1
                    shadow-lg px-2 lg:px-4 py-4 min-h-50 lg:py-5">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-lg lg:text-xl font-bold text-[#66fcf1]" data-i18n="social">Social</h2>
          </div>
          <div class="bg-[rgba(30,41,40,0.7)] w-full flex-1 border border-[rgba(102,252,241,0.15)] p-4">
            <div id="friend-requests-section">
              <div id="friend-requests-list" class="space-y-2">
              </div>
            </div>
          </div>
        </div>

        <div class="bg-[rgba(102,252,241,0.1)] rounded-md flex-1
                    shadow-lg px-4 lg:px-10 py-4 lg:py-5">
          <div class="flex flex-col items-center space-y-3 lg:space-y-4 mb-4 lg:mb-6">
            <div class="relative group">
              <img id="profile-avatar-img" src="${user.avatarUrl}" alt="${user.username}'s avatar"
                  class="w-20 h-20 lg:w-24 lg:h-24 rounded-full border-4 border-[#66fcf1] shadow-lg transition-transform duration-300 group-hover:scale-110 object-cover ${!user.isOAuthUser ? 'cursor-pointer' : 'cursor-default'}" 
                  title="${!user.isOAuthUser ? 'Click to change photo' : 'Avatar managed by 42 OAuth'}" />
              <div
                class="absolute inset-0 rounded-full bg-black/50 opacity-0
                       group-hover:opacity-100 transition-opacity duration-300
                       flex items-center justify-center pointer-events-none"
              >
                <span class="text-white text-xs font-bold" data-i18n="change_photo">${!user.isOAuthUser ? 'Change Photo' : '42 OAuth Avatar'}</span>
              </div>
            </div>

            <input id="avatar-file-input" type="file" accept="image/*" class="hidden" ${user.isOAuthUser ? 'disabled' : ''} />

            <div class="text-center">
              <h2 class="text-xl lg:text-2xl font-bold text-[#66fcf1] mb-1">${user.username}</h2>
              <p class="text-base lg:text-lg text-gray-300 mb-1">${user.name}</p>
              <p class="text-sm text-gray-400">${user.email}</p>
            </div>
            <div class="flex flex-col gap-2 lg:gap-3">
              ${!user.isOAuthUser ? `<button id=\"edit-btn\" type=\"button\" aria-label=\"${t('edit_profile') || 'Edit profile'}\" class=\"cursor-pointer mt-2.5 text-base lg:text-lg font-bold px-6 lg:px-8 py-2
                      bg-gradient-to-r from-[#66fcf1] to-[#1f7474] text-[#031b1b] border-0 rounded-md
                      hover:bg-[#45a8a8] font-[jura] hover:shadow-lg
                      transition-shadow duration-300\" data-i18n=\"edit_profile\">
                Edit Profile
              </button>` : ''}
              <button id=\"refresh-stats-btn\" type=\"button\" aria-label=\"${t('refresh_stats') || 'Refresh stats'}\" class=\"cursor-pointer mt-2.5 text-base lg:text-lg font-bold px-6 lg:px-8 py-2
                      bg-gradient-to-r from-[#66fcf1] to-[#1f7474] text-[#031b1b] border-0 rounded-md
                      hover:bg-[#45fcf1] font-[jura] hover:shadow-lg
                      transition-shadow duration-300\" data-i18n=\"refresh_stats\">
                Refresh Stats
              </button>
            </div>
          </div>
        </div>

        <div class="bg-[rgba(102,252,241,0.1)] rounded-md flex-1
                    shadow-lg px-4 lg:px-10 py-4 lg:py-5">
          <h2 class="text-lg lg:text-xl font-bold text-[#66fcf1] mb-2" data-i18n="game_statistics">Game Statistics</h2>
          <div class="grid grid-cols-2 gap-2 lg:gap-2 mb-2 lg:mb-2">
            <div class="p-2 lg:p-2 text-center">
              <div class="text-xl lg:text-2xl font-bold text-[#66fcf1]">${user.wins}</div>
              <div class="text-xs lg:text-sm text-gray-300" data-i18n="wins_plural">Wins</div>
            </div>
            <div class="p-2 lg:p-2 text-center">
              <div class="text-xl lg:text-2xl font-bold text-[#66fcf1]">${user.losses}</div>
              <div class="text-xs lg:text-sm text-gray-300" data-i18n="losses">Losses</div>
            </div>
            <div class="p-2 lg:p-2 text-center">
              <div class="text-xl lg:text-2xl font-bold text-[#66fcf1]">${user.totalGames}</div>
              <div class="text-xs lg:text-sm text-gray-300" data-i18n="total_games">Total Games</div>
            </div>
            <div class="p-2 lg:p-2 text-center">
              <div class="text-xl lg:text-2xl font-bold text-[#66fcf1]">${user.winRate}%</div>
              <div class="text-xs lg:text-sm text-gray-300" data-i18n="win_rate">Win Rate</div>
            </div>
            <div class="p-2 lg:p-2 text-center col-span-2">
              <div class="text-xl lg:text-2xl font-bold text-[#66fcf1]">${user.elo || 1000}</div>
              <div class="text-xs lg:text-sm text-gray-300" data-i18n="elo_rating">ELO Rating</div>
            </div>
          </div>
          
          <div class="border-t border-[rgba(102,252,241,0.15)] pt-4">
            <h3 class="text-base lg:text-lg font-bold text-[#66fcf1] mb-3" data-i18n="last_game">Last Game</h3>
            <div id="game-history-list" class="bg-[rgba(30,41,40,0.7)] border border-[rgba(102,252,241,0.15)] rounded p-3">
              <div class="text-center text-gray-400 text-sm" data-i18n="loading_games">Loading games...</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  `;

  const getEditHTML = () => `
    <div class="flex flex-col items-center space-y-6 w-full px-4">
    <h1 class="title uppercase mobile-title">
      <span class="mid_line" data-i18n="myprofile">MY PROFILE</span>
    </h1>
      
      <form class="bg-[rgba(102,252,241,0.1)] rounded-md shadow-lg p-8 w-80 space-y-4" novalidate aria-label="${t('edit_profile') || 'Edit profile'}">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#66fcf1] text-left" data-i18n="display_name">Display Name</label>
          <input name="name" type="text" value="${user.name}" id="name" required
                 aria-required="true" aria-invalid="false" aria-describedby="name-error"
                 class="w-full px-3 py-2 bg-[rgba(102,252,241,0.1)] border border-[#66fcf1] rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66fcf1]" />
          <p id="name-error" class="text-red-600 mt-1 text-sm hidden" role="alert"></p>
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#66fcf1] text-left" data-i18n="username">Username</label>
          <input name="username" type="text" value="${user.username}" id="username" required
                 aria-required="true" aria-invalid="false" aria-describedby="username-error"
                 class="w-full px-3 py-2 bg-[rgba(102,252,241,0.1)] border border-[#66fcf1] rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66fcf1]" />
          <p id="username-error" class="text-red-600 mt-1 text-sm hidden" role="alert"></p>
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#66fcf1] text-left" data-i18n="email">Email</label>
          <input name="email" type="email" value="${user.email}" id="email" required
                 aria-required="true" aria-invalid="false" aria-describedby="email-error"
                 class="w-full px-3 py-2 bg-[rgba(102,252,241,0.1)] border border-[#66fcf1] rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66fcf1]" />
          <p id="email-error" class="text-red-600 mt-1 text-sm hidden" role="alert"></p>
        </div>
        
        <div class="space-y-2">
          <label class="flex items-center space-x-3">
            <input name="is2faEnabled" type="checkbox" ${user.is2faEnabled ? 'checked' : ''}
                   class="w-4 h-4 text-[#66fcf1] bg-[rgba(102,252,241,0.1)] border-[#66fcf1] rounded focus:ring-[#66fcf1] focus:ring-2" />
            <span class="text-sm font-medium text-[#66fcf1]" data-i18n="enable_2fa">Enable Two-Factor Authentication</span>
          </label>
        </div>
        
        <div class="flex flex-col gap-3 pt-4">
          <button type="button" id="cancel-btn" aria-label="${t('cancel') || 'Cancel'}" class="cursor-pointer text-lg font-bold px-8 py-2
                  bg-gradient-to-r from-[#66fcf1] to-[#1f7474] text-[#031b1b] border-0 rounded-md
                  hover:bg-[#45a8a8] font-[jura] hover:shadow-lg
                  transition-shadow duration-300" data-i18n="cancel">
            Cancel
          </button>
          <button type="submit" aria-label="${t('save_changes') || 'Save changes'}" class="cursor-pointer text-lg font-bold px-8 py-2
                  bg-gradient-to-r from-[#66fcf1] to-[#1f7474] text-[#031b1b] border-0 rounded-md
                  hover:bg-[#45a8a8] font-[jura] hover:shadow-lg
                  transition-shadow duration-300" data-i18n="save_changes">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
  `;

  const updateUserData = async () => {
    if (!sessionManager.isSessionRestored()) {
      user = {
        username: "Loading...",
        email: "Loading...",
        name: "Loading",
        avatarUrl: "/assets/img/avatar.jpg",
        ...getDefaultStats(),
      };
      section.innerHTML = getViewHTML();
      bindViewEvents();
      updateText();
      return;
    }

    user = await getCurrentUserWithStats();
    section.innerHTML = getViewHTML();
    bindViewEvents();
    try {
      await populateFriendRequests();
    } catch (err) {
      console.error("Failed to populate friend requests:", err);
    }
    try {
      await populateGameHistory();
    } catch (err) {
      console.error("Failed to populate game history:", err);
    }
    updateText();
  };

  const fetchFriendsAndRequests = async (token: string | null) => {
    const headers: Record<string, string> = token
      ? { Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };

    const credentials = token ? undefined : "include";

    const [friendsRes, requestsRes] = await Promise.all([
      fetch("/api/users/friends", { headers, credentials }).catch(() => null),
      fetch("/api/users/friends/requests/pending", { headers, credentials }).catch(() => null),
    ]);

    let allFriends: any[] = [];

    if (friendsRes && friendsRes.ok) {
      const friends = await friendsRes.json();
      allFriends = friends.map((friend: any) => ({
        id: friend.id,
        username: friend.username,
        avatarUrl: friend.avatarUrl || "/assets/img/avatar.jpg",
        type: "friend",
        status: "accepted",
        isOnline: friend.isOnline || false,
      }));
    }

    if (requestsRes && requestsRes.ok) {
      const requests = await requestsRes.json();
      const pendingFriends = requests.map((request: any) => ({
        id: request.id,
        username: request.requester?.username || "Unknown User",
        avatarUrl: request.requester?.avatarUrl || "/assets/img/avatar.jpg",
        type: "request",
        status: "pending",
      }));
      allFriends = [...allFriends, ...pendingFriends];
    }

    return allFriends;
  };

  const renderFriendsList = (
    allFriends: any[],
    friendRequestsList: HTMLElement
  ) => {
    if (allFriends.length === 0) {
      friendRequestsList.innerHTML = `<p class="text-gray-400 text-sm">${t(
        "no_friends_or_requests"
      )}</p>`;
      return;
    }

    friendRequestsList.innerHTML = allFriends
      .map((friend: any) => {
        if (friend.type === "friend") {
          return `
          <div class="flex items-center justify-between p-2">
            <div class="flex items-center space-x-3">
              <img src="${
                friend.avatarUrl || "/assets/img/avatar.jpg"
              }" alt="User avatar" class="w-8 h-8 rounded-full" onerror="this.src='/assets/img/avatar.jpg'">
              <a href="#/profile/${
                friend.username
              }" class="text-[#66fcf1] font-medium hover:text-[#4dd0e1] hover:underline transition-colors cursor-pointer" aria-label="View profile of ${friend.username}">${
            friend.username
          }</a>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full ${
                friend.isOnline ? "bg-green-500" : "bg-red-500"
              }" title="${friend.isOnline ? "Online" : "Offline"}"></div>
            </div>
          </div>
        `;
        } else {
          return `
          <div class="flex items-center justify-between p-2">
            <div class="flex items-center space-x-3">
              <img src="${
                friend.avatarUrl || "/assets/img/avatar.jpg"
              }" alt="User avatar" class="w-8 h-8 rounded-full" onerror="this.src='/assets/img/avatar.jpg'">
              <a href="#/profile/${
                friend.username
              }" class="text-[#66fcf1] font-medium hover:text-[#4dd0e1] hover:underline transition-colors cursor-pointer" aria-label="View profile of ${friend.username}">${
            friend.username
          }</a>
            </div>
            <div class="flex space-x-2">
              <button class="accept-friend-request-btn px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors" type="button" aria-label="Accept friend request" data-request-id="${
                friend.id
              }" data-username="${friend.username}" title="Accept">
                ✓
              </button>
              <button class="reject-friend-request-btn px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors" type="button" aria-label="Reject friend request" data-request-id="${
                friend.id
              }" data-username="${friend.username}" title="Reject">
                ✗
              </button>
            </div>
          </div>
        `;
        }
      })
      .join("");
  };

  const bindFriendRequestEvents = (friendRequestsList: HTMLElement) => {
    friendRequestsList
      .querySelectorAll(".accept-friend-request-btn")
      .forEach(btn => {
        const button = btn as HTMLButtonElement;
        enhanceButton(button, { ripple: true, bounce: true });
        
        button.addEventListener("click", async e => {
          const target = e.target as HTMLButtonElement;
          const requestId = target.dataset.requestId;
          const username = target.dataset.username;
          if (requestId && username) {
            await handleAsyncButtonClick(
              target,
              async () => {
                await acceptReceivedFriendRequest(username, requestId);
                await populateFriendRequests();
              },
              {
                loadingText: t("accepting") || "Accepting...",
                successMessage: t("friend_request_accepted"),
                errorMessage: t("friend_request_accept_failed"),
                onSuccess: () => alertSuccess(t("friend_request_accepted")),
                onError: (error: any) => alertError(error?.message || t("friend_request_accept_failed"))
              }
            );
          }
        });
      });

    friendRequestsList
      .querySelectorAll(".reject-friend-request-btn")
      .forEach(btn => {
        const button = btn as HTMLButtonElement;
        enhanceButton(button, { ripple: true, bounce: true });
        
        button.addEventListener("click", async e => {
          const target = e.target as HTMLButtonElement;
          const requestId = target.dataset.requestId;
          const username = target.dataset.username;
          if (requestId && username) {
            await handleAsyncButtonClick(
              target,
              async () => {
                await rejectFriendRequest(requestId);
                await populateFriendRequests();
              },
              {
                loadingText: t("rejecting") || "Rejecting...",
                successMessage: t("friend_request_rejected"),
                errorMessage: t("friend_request_reject_failed"),
                onSuccess: () => alertSuccess(t("friend_request_rejected")),
                onError: (error: any) => alertError(error?.message || t("friend_request_reject_failed"))
              }
            );
          }
        });
      });

    friendRequestsList.querySelectorAll(".remove-friend-btn").forEach(btn => {
      btn.addEventListener("click", async e => {
        const target = e.target as HTMLButtonElement;
        const username = target.dataset.username;
        if (username) {
          try {
            await removeFriendRequest(username);
            await populateFriendRequests();
            alertSuccess(t("friend_removed_successfully"));
          } catch (error: any) {
            alertError(error?.message || t("friend_remove_failed"));
          }
        }
      });
    });
  };

  const populateFriendRequests = async () => {
    const friendRequestsList = section.querySelector(
      "#friend-requests-list"
    ) as HTMLElement;
    if (!friendRequestsList) return;

    const token = localStorage.getItem("accessToken");
    const state = store.getState();
    
    if (!token && !state.isAuthenticated) {
      friendRequestsList.innerHTML = `<p class="text-gray-400 text-sm">${t(
        "please_login_to_see_friends"
      )}</p>`;
      return;
    }

    try {
      const allFriends = await fetchFriendsAndRequests(token);
      renderFriendsList(allFriends, friendRequestsList);
      bindFriendRequestEvents(friendRequestsList);
    } catch (error) {
      console.error("Error loading friend requests:", error);
      if (!token) {
        friendRequestsList.innerHTML = `<p class="text-gray-400 text-sm">${t(
          "please_login_to_see_friends"
        )}</p>`;
      } else {
        friendRequestsList.innerHTML = `<p class="text-red-400 text-sm">${t(
          "error_loading_friend_requests"
        )}</p>`;
      }
    }
  };

  const formatDate = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const populateGameHistory = async () => {
    const gameHistoryList = section.querySelector("#game-history-list") as HTMLElement;
    if (!gameHistoryList) return;

    const state = store.getState();
    const currentUser = state.currentUser;
    
    if (!currentUser || !currentUser.id) {
      gameHistoryList.innerHTML = `<p class="text-gray-400 text-sm">${t("please_login_to_see_games")}</p>`;
      return;
    }

    try {
      const gameHistory = await getUserGameHistory(currentUser.id);
      
      if (gameHistory.length === 0) {
        gameHistoryList.innerHTML = `<p class="text-gray-400 text-sm">${t("no_games_played")}</p>`;
        return;
      }

      gameHistoryList.innerHTML = gameHistory
        .slice(0, 1)
        .map((game: GameHistoryEntry) => {
          const resultClass = game.isWinner ? "text-green-400" : "text-red-400";
          const resultIcon = game.isWinner ? "✓" : "✗";
          const eloChange = game.eloChange > 0 ? `+${game.eloChange}` : `${game.eloChange}`;
          const eloClass = game.eloChange > 0 ? "text-green-400" : "text-red-400";
          
          return `
            <div class="p-2">
              <div class="flex items-center justify-between">
                <div class="flex w-full items-center justify-between gap-2">
                  <span class="${resultClass} font-bold">${resultIcon}</span>
                  <span class="text-white text-sm">${user.username} - ${game.isWinner ? 'Won' : 'Lost'}</span>
                  <span class="text-xs ${eloClass}">${eloChange} ELO</span>
                </div>
              </div>
              <div class="text-xs text-gray-400 mt-1 text-center">${formatDate(game.playedAt)}</div>
            </div>
          `;
        })
        .join("");
    } catch (error) {
      console.error("Error loading game history:", error);
      gameHistoryList.innerHTML = `<p class="text-red-400 text-sm">${t("error_loading_game_history")}</p>`;
    }
  };

  updateUserData();
  store.subscribe(updateUserData);
  sessionManager.onSessionRestored(updateUserData);

  window.addEventListener("languageChanged", () => {
    updateUserData();
  });

  setTimeout(() => {
    updateUserData();
  }, 500);

  let statusPollingInterval: number | null = null;
  let isComponentMounted = true;
  const startStatusPolling = () => {
    if (statusPollingInterval) return;

    statusPollingInterval = window.setInterval(async () => {
      if (!isComponentMounted || !location.hash.includes("/myprofile")) {
        stopStatusPolling();
        return;
      }
      try {
        await populateFriendRequests();
      } catch (error) {
        console.error("Error polling friend status:", error);
      }
    }, 5000);
  };

  const stopStatusPolling = () => {
    if (statusPollingInterval) {
      clearInterval(statusPollingInterval);
      statusPollingInterval = null;
    }
  };

  if (location.hash.includes("/myprofile")) {
    startStatusPolling();
  }

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const removedNode of Array.from(mutation.removedNodes)) {
        if (removedNode === section) {
          isComponentMounted = false;
          stopStatusPolling();
          observer.disconnect();
        }
      }
    }
  });
  if (section.parentNode) {
    observer.observe(section.parentNode, { childList: true });
  }

  function bindViewEvents() {
    const editBtn = section.querySelector("#edit-btn") as HTMLButtonElement;
    const refreshStatsBtn = section.querySelector(
      "#refresh-stats-btn"
    ) as HTMLButtonElement;
    const refreshFriendsBtn = section.querySelector(
      "#refresh-friends-btn"
    ) as HTMLButtonElement;

    const fileInput = section.querySelector(
      "#avatar-file-input"
    ) as HTMLInputElement | null;
    const avatarImg = section.querySelector(
      "#profile-avatar-img"
    ) as HTMLImageElement | null;

    if (avatarImg && fileInput) {
      if (user.isOAuthUser) {
        avatarImg.style.cursor = "default";
        fileInput.disabled = true;
      } else {
        avatarImg.addEventListener("click", () => fileInput.click());

        fileInput.addEventListener("change", async () => {
          const file = fileInput.files?.[0];
          if (!file) return;

          if (file.size > 2 * 1024 * 1024) {
            alertWarning(t("image_too_large"));
            fileInput.value = "";
            return;
          }

          if (avatarImg) {
            avatarImg.style.opacity = "0.5";
            avatarImg.style.cursor = "wait";
          }

          try {
            const url = await uploadMyAvatar(file);
            if (avatarImg) avatarImg.src = url;
            user = { ...user, avatarUrl: url };
            updateCurrentUserAvatar(url);
          } catch (e: any) {
            alertError(e?.message || t("upload_failed"));
          } finally {
            if (avatarImg) {
              avatarImg.style.opacity = "1";
              avatarImg.style.cursor = "pointer";
            }
            fileInput.value = "";
          }
        });
      }
    }

    if (editBtn) {
      enhanceButton(editBtn, { ripple: true, bounce: true });
      editBtn.addEventListener("click", enterEditMode);
    }

    if (refreshStatsBtn) {
      enhanceButton(refreshStatsBtn, { ripple: true, bounce: true });
      refreshStatsBtn.addEventListener("click", async () => {
        await handleAsyncButtonClick(
          refreshStatsBtn,
          async () => {
            user = await getCurrentUserWithStats();
            section.innerHTML = getViewHTML();
            bindViewEvents();
            updateText();
          },
          {
            loadingText: t("refreshing") || "Refreshing...",
            successMessage: t("stats_refreshed"),
            errorMessage: t("stats_refresh_failed"),
            onSuccess: () => alertSuccess(t("stats_refreshed")),
            onError: (error: any) => {
              console.error("Error refreshing stats:", error);
              alertError(t("stats_refresh_failed"));
            }
          }
        );
      });
    }

    if (refreshFriendsBtn) {
      enhanceButton(refreshFriendsBtn, { ripple: true, bounce: true });
      refreshFriendsBtn.addEventListener("click", async () => {
        await handleAsyncButtonClick(
          refreshFriendsBtn,
          async () => {
            await populateFriendRequests();
          },
          {
            loadingText: t("refreshing") || "Refreshing...",
            successMessage: t("friend_status_refreshed"),
            errorMessage: t("friend_status_refresh_failed"),
            onSuccess: () => alertSuccess(t("friend_status_refreshed")),
            onError: (error: any) => {
              console.error("Error refreshing friends:", error);
              alertError(t("friend_status_refresh_failed"));
            }
          }
        );
      });
    }
  }

  async function enterEditMode() {
    section.innerHTML = getEditHTML();
    updateText();
    const form = section.querySelector("form") as HTMLFormElement;
    const cancel = section.querySelector("#cancel-btn") as HTMLButtonElement;

    attachValidation(form);

    if (cancel) {
      enhanceButton(cancel, { ripple: true, bounce: true });
      cancel.addEventListener("click", () => {
        section.innerHTML = getViewHTML();
        bindViewEvents();
        updateText();
      });
    }

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitBtn) {
      enhanceButton(submitBtn, { ripple: true, bounce: true });
    }

    form.addEventListener("submit", async e => {
      e.preventDefault();
      const data = new FormData(form);

      const profileData = {
        username: data.get("username") as string,
        firstname: data.get("name") as string,
        email: data.get("email") as string,
      };

      const is2faEnabled = data.get("is2faEnabled") === "on";

      if (submitBtn) {
        setButtonLoading(submitBtn, t("saving") || "Saving...");
      }
      
      try {
        const emailChanged = profileData.email !== user.email;
        const usernameChanged = profileData.username !== user.username;

        await updateMyProfile(profileData);
        updateCurrentUserProfile(profileData);

        if (is2faEnabled !== user.is2faEnabled) {
          await toggle2fa(is2faEnabled);
          updateCurrentUserProfile({ is2faEnabled });
        }
        let oldUsername = user.username;
        const updated: UserProfile = {
          name: profileData.firstname,
          username: profileData.username,
          email: profileData.email,
          avatarUrl: user.avatarUrl,
          wins: user.wins,
          losses: user.losses,
          totalGames: user.totalGames,
          winRate: user.winRate,
          is2faEnabled: is2faEnabled,
        };

        user = updated;
        section.innerHTML = getViewHTML();
        bindViewEvents();
        updateText();
        if (usernameChanged) {
          try {
            await fetch(`/api/pong/update-username?oldUsername=${encodeURIComponent(oldUsername)}&newUsername=${encodeURIComponent(profileData.username)}`, { method: 'PATCH', credentials: 'include' });
          } catch (err) {
            console.error("Failed to update username in games:", err);
          }
        }
        if (emailChanged || usernameChanged) {
          alertSuccess(t("profile_updated"));
          await logout();
          location.hash = "#/login";
          return;
        }

        alertSuccess(t("profile_updated"));
      } catch (error: any) {
        console.error("Failed to update profile:", error);
        alertError(error?.message || t("update_failed"));
      } finally {
        if (submitBtn) {
          removeButtonLoading(submitBtn);
        }
      }
    });
  }
  updateText();
  
  return section;
}
