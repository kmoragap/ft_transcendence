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
    
    const { mockSearchUsers } = await import('./mockUsers');
    return mockSearchUsers(query);
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
        
        const { mockSearchUsers } = await import('./mockUsers');
        return mockSearchUsers(query);
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Search failed (${res.status})`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    const { mockSearchUsers } = await import('./mockUsers');
    return mockSearchUsers(query);
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
    
    const { mockGetUserProfile } = await import('./mockUsers');
    const mockUser = mockGetUserProfile(username);
    if (!mockUser) {
      throw new Error('User not found');
    }
    return mockUser;
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
        
        const { mockGetUserProfile } = await import('./mockUsers');
        const mockUser = mockGetUserProfile(username);
        if (mockUser) {
          return mockUser;
        }
        throw new Error('User not found');
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `User not found (${res.status})`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    const { mockGetUserProfile } = await import('./mockUsers');
    const mockUser = mockGetUserProfile(username);
    if (!mockUser) {
      throw new Error('User not found');
    }
    return mockUser;
  }
}

export async function sendFriendRequest(userId: string, username?: string): Promise<void> {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    try {
      const res = await fetch("/api/users/friends/requests", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username: username || userId })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Friend request failed (${res.status})`);
      }

      return;
    } catch (error: any) {
      if (error instanceof Error && error.message === 'Failed to fetch') {
        throw error;
      }
      throw new Error('No access token found');
    }
  }

  try {
    const res = await fetch("/api/users/friends/requests", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: username || userId })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Friend request failed (${res.status})`);
    }
  } catch (error) {
    console.error('Send friend request error:', error);
    throw error;
  }
}

export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    try {
      const res = await fetch(`/api/users/friends/${friendshipId}/accept`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' 
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Accept friend request failed (${res.status})`);
      }

      return;
    } catch (error) {
      throw new Error('No authentication token found');
    }
  }

  try {
    const res = await fetch(`/api/users/friends/${friendshipId}/accept`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Accept friend request failed (${res.status})`);
    }
  } catch (error) {
    console.error('Accept friend request error:', error);
    throw error;
  }
}

export async function removeFriend(friendshipId: string): Promise<void> {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    try {
      const res = await fetch(`/api/users/friends/${friendshipId}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({})
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Remove friend failed (${res.status})`);
      }
      
      return;
    } catch (error) {
      throw new Error('No authentication token found');
    }
  }

  try {
    const res = await fetch(`/api/users/friends/${friendshipId}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Remove friend failed (${res.status})`);
    }
  } catch (error) {
    console.error('Remove friend error:', error);
    throw error;
  }
}


export async function getFriendshipStatus(userId: string, currentUsername?: string): Promise<'none' | 'pending' | 'accepted' | 'rejected'> {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    try {
      const friendshipsRes = await fetch('/api/users/friendships', {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (friendshipsRes.ok) {
        const friendships = await friendshipsRes.json();
        
        const friendship = friendships.find((f: any) => f.otherUser.username === userId);
        
        if (friendship) {
          if (friendship.status === 'ACCEPTED') {
            return 'accepted';
          } else if (friendship.status === 'PENDING') {
            return 'pending';
          } else if (friendship.status === 'REJECTED') {
            return 'rejected';
          }
        }
      }

      return 'none';
    } catch (error) {
      return 'none';
    }
  }

  try {
    const friendshipsRes = await fetch('/api/users/friendships', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (friendshipsRes.ok) {
      const friendships = await friendshipsRes.json();
      
      const friendship = friendships.find((f: any) => f.otherUser.username === userId);
      
      if (friendship) {
        if (friendship.status === 'ACCEPTED') {
          return 'accepted';
        } else if (friendship.status === 'PENDING') {
          return 'pending';
        } else if (friendship.status === 'REJECTED') {
          return 'rejected';
        }
      }
    }

    return 'none';
  } catch (error) {
    console.error('Error checking friendship status:', error);
    return 'none';
  }
}




export async function acceptReceivedFriendRequest(username: string, requestId: string): Promise<void> {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    try {
      const res = await fetch(`/api/users/friends/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'ACCEPTED' })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Accept friend request failed (${res.status})`);
      }
      
      return;
    } catch (error) {
      throw new Error('No access token found');
    }
  }

  try {
    const res = await fetch(`/api/users/friends/requests/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'ACCEPTED' })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Accept friend request failed (${res.status})`);
    }
  } catch (error) {
    console.error('Accept friend request error:', error);
    throw error;
  }
}

export async function rejectFriendRequest(requestId: string): Promise<void> {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    try {
      const res = await fetch(`/api/users/friends/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'REJECTED' })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Reject friend request failed (${res.status})`);
      }
      
      return;
    } catch (error) {
      throw new Error('No access token found');
    }
  }

  try {
    const res = await fetch(`/api/users/friends/requests/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'REJECTED' })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Reject friend request failed (${res.status})`);
    }
  } catch (error) {
    console.error('Reject friend request error:', error);
    throw error;
  }
}

async function removeFriendRequestHelper(
  username: string,
  fetchOptions: RequestInit,
  deleteOptions: (friendshipId: string) => RequestInit
): Promise<void> {
  const friendshipsRes = await fetch('/api/users/friendships', fetchOptions);
  if (!friendshipsRes.ok) {
    throw new Error('Failed to get friendships list');
  }
  const friendships = await friendshipsRes.json();
  const friendship = friendships.find((f: any) => f.otherUser.username === username);
  if (!friendship) {
    throw new Error('Friendship not found');
  }
  const res = await fetch(`/api/users/friends/${friendship.id}`, deleteOptions(friendship.id));
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Remove friend request failed (${res.status})`);
  }
}

export async function removeFriendRequest(username: string): Promise<void> {
  const token = localStorage.getItem('accessToken');
  
  let headers: Record<string, string>;
  let options: Record<string, any> = {};
  let requestBuilder: (friendshipId: string) => RequestInit;

  if (!token) {
    headers = { 'Content-Type': 'application/json' };
    options = { headers, credentials: 'include' };
    requestBuilder = (friendshipId: string) => ({
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({})
    });
  } else {
    headers = { 'Authorization': `Bearer ${token}` };
    options = { headers };
    requestBuilder = (friendshipId: string) => ({
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
  }
  try {
    await removeFriendRequestHelper(
      username,
      options,
      requestBuilder
    );
  } catch (error) {
    if (!token) {
      throw new Error('No access token found');
    } else {
      console.error('Remove friend request error:', error);
      throw error;
    }
  }
}
