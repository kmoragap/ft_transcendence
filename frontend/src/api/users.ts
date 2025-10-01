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
  
  // If no token, go straight to mock data
  if (!token) {
    const { mockSearchUsers } = await import('./mockUsers');
    return mockSearchUsers(query);
  }
  
  try {
    // Try the search endpoint first, if it doesn't exist, fall back to getting all users
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      // If search endpoint doesn't exist (404), try getting all users and filter on frontend
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
            // Filter users on frontend
            const filteredUsers = allUsers.filter((user: any) => 
              user.username.toLowerCase().includes(query.toLowerCase()) ||
              user.firstname.toLowerCase().includes(query.toLowerCase())
            );
            return filteredUsers;
          }
        } catch (fallbackError) {
          // If that also fails, use mock data
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
    // Fallback to mock data for testing
    const { mockSearchUsers } = await import('./mockUsers');
    return mockSearchUsers(query);
  }
}

export async function getUserProfile(username: string): Promise<UserSearchResult> {
  const token = localStorage.getItem('accessToken');
  
  // If no token, go straight to mock data
  if (!token) {
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
      // If direct user endpoint doesn't exist (404), try the by-username endpoint
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
            return await byUsernameRes.json();
          }
        } catch (fallbackError) {
          // If that also fails, use mock data
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
    // Fallback to mock data for testing
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
    throw new Error('No access token found');
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
    throw new Error('No authentication token found');
  }

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
}

export async function removeFriend(friendshipId: string): Promise<void> {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const res = await fetch(`/api/users/friends/${friendshipId}`, {
    method: "DELETE",
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Remove friend failed (${res.status})`);
  }
}


export async function getFriendshipStatus(userId: string, currentUsername?: string): Promise<'none' | 'pending' | 'accepted' | 'rejected'> {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return 'none';
  }

  try {
    // Get current user's friends list
    const friendsRes = await fetch('/api/users/friends', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (friendsRes.ok) {
      const friends = await friendsRes.json();
      const isFriend = friends.some((friend: any) => friend.username === userId);
      if (isFriend) {
        return 'accepted';
      }
    }

    // Get pending friend requests
    const requestsRes = await fetch('/api/users/friends/requests/pending', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (requestsRes.ok) {
      const requests = await requestsRes.json();
      const hasPendingRequest = requests.some((request: any) => request.username === userId);
      if (hasPendingRequest) {
        return 'pending';
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
    throw new Error('No access token found');
  }

  try {
    // Accept the friend request using the request ID directly
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
    throw new Error('No access token found');
  }

  try {
    // Reject the friend request using the request ID directly
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

export async function removeFriendRequest(userId: string): Promise<void> {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No access token found');
  }

  try {
    // First, get the friendship ID from friends list
    const friendsRes = await fetch('/api/users/friends', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!friendsRes.ok) {
      throw new Error('Failed to get friends list');
    }

    const friends = await friendsRes.json();
    const friendship = friends.find((friend: any) => friend.username === userId);
    
    if (!friendship) {
      throw new Error('Friend not found');
    }

    // Remove the friendship
    const res = await fetch(`/api/users/friends/${friendship.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
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
