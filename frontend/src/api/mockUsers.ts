import { UserSearchResult } from './users';

// Mock data for testing until backend is implemented
const mockUsers: UserSearchResult[] = [
  // No mock users - using real backend data only
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
