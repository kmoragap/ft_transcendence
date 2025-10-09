export interface LoginRequest {
  username?: string;
  email?: string;
  identifier?: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  firstname: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  refresh?: string;
  username: string;
  firstname: string;
  email: string;
  avatarUrl: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstname: string;
  password: string;
  avatarUrl?: string;
  is2faEnabled?: boolean;
  isOAuthUser?: boolean;
}

export interface JWTPayload {
  userId: string;
  email: string;
}

export interface SessionData {
  token: string;
  userId: string;
  expiresAt: Date;
}

export interface TwoFaCode{
	code: string;
	expiresAt: Date;
}
