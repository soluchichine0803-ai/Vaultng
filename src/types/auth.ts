export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  phone: string;
  username: string;
  role: UserRole;
  balance: number;
  referralCode: string;
  referredBy?: string | null;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  referralCode?: string;
}
