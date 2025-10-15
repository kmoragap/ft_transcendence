// This file contains functions to interact with the user-related API endpoints, including profile management, avatar upload, user search, and user statistics.

export async function uploadMyAvatar(file: File): Promise<string> {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const fd = new FormData();
  fd.append("avatar", file);

  const res = await fetch("/api/users/me/avatar", {
    method: "POST",
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: fd,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Upload failed (${res.status})`);
  }

  const data = await res.json();
  return data.avatarUrl as string;
}

export async function updateMyProfile(profileData: { username?: string; firstname?: string; email?: string }): Promise<void> {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const res = await fetch("/api/users/me", {
    method: "PUT",
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Profile update failed (${res.status})`);
  }
}

export interface UserSearchResult {
  id: string;
  username: string;
  firstname: string;
  avatarUrl: string;
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
}

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const token = localStorage.getItem('accessToken');
  
  // If no token, try with cookies
  if (!token) {
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (error) {
    }
    
    throw new Error('Search service unavailable');
  }
  
  try {
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      if (res.status === 404) {
        try {
          const allUsersRes = await fetch('/api/users/', {
            method: "GET",
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (allUsersRes.ok) {
            const allUsers = await allUsersRes.json();
            const filteredUsers = allUsers.filter((user: any) => 
              user.username.toLowerCase().includes(query.toLowerCase()) ||
              user.firstname.toLowerCase().includes(query.toLowerCase())
            );
            return filteredUsers;
          }
        } catch (fallbackError) {
        }
        
        throw new Error('Search service unavailable');
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Search failed (${res.status})`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    throw new Error('Search service unavailable');
  }
}

export async function getUserProfile(username: string): Promise<UserSearchResult> {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    try {
      const byUsernameRes = await fetch(`/api/users/by-username/${username}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (byUsernameRes.ok) {
        const data = await byUsernameRes.json();
        return data;
      }
    } catch (error) {
    }
    
    throw new Error('Profile service unavailable');
  }
  
  try {
    // Try the direct user endpoint first
    const res = await fetch(`/api/users/${username}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      if (res.status === 404) {
        try {
          const byUsernameRes = await fetch(`/api/users/by-username/${username}`, {
            method: "GET",
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (byUsernameRes.ok) {
            const data = await byUsernameRes.json();
            return data;
          }
        } catch (fallbackError) {
        }
        
        throw new Error('Profile service unavailable');
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `User not found (${res.status})`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    throw new Error('Profile service unavailable');
  }
}

export interface UserStats {
  id: string;
  username: string;
  wins: number;
  losses: number;
  elo: number;
  winRate: number;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const token = localStorage.getItem('accessToken');
  
  let headers: Record<string, string>;
  let credentials: RequestCredentials | undefined;

  if (!token) {
    headers = { 'Content-Type': 'application/json' };
    credentials = 'include';
  } else {
    headers = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  try {
    const res = await fetch(`/api/users/${userId}/stats`, {
      method: 'GET',
      headers,
      credentials
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to get user stats (${res.status})`);
    }

    const stats = await res.json();
    return stats;
  } catch (error) {
    console.error('Get user stats error:', error);
    throw error;
  }
}

export async function toggle2fa(is2faEnabled: boolean): Promise<void> {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const res = await fetch("/api/users/me/2fa", {
    method: "PUT",
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ is2faEnabled }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `2FA toggle failed (${res.status})`);
  }
}

export interface GameHistoryEntry {
  id: string;
  gameId: string;
  isWinner: boolean;
  eloChange: number;
  playedAt: string;
  opponentUsername: string;
  myScore: number;
  opponentScore: number;
}

export async function getUserGameHistory(userId: string): Promise<GameHistoryEntry[]> {
  const token = localStorage.getItem('accessToken');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`/api/users/${userId}/matches`, {
    method: "GET",
    headers,
    credentials: token ? undefined : 'include', // Use cookies if no token
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch game history (${res.status})`);
  }
  
  return res.json();
}