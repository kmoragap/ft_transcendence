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
