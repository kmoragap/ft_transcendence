import { UserSearchResult } from './users';

const mockUsers: UserSearchResult[] = [
];

export function mockSearchUsers(query: string): UserSearchResult[] {
  if (!query || query.length < 2) return [];
  
  return mockUsers.filter(user => 
    user.username.toLowerCase().includes(query.toLowerCase()) ||
    user.firstname.toLowerCase().includes(query.toLowerCase())
  );
}

export function mockGetUserProfile(username: string): UserSearchResult | null {
  return mockUsers.find(user => user.username === username) || null;
}
