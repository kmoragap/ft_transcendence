// This file contains functions to interact with the friendship-related API endpoints, including friend requests, friendship management, and friendship status checking.

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
        throw new Error('No access token found');
      }
      throw error;
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
