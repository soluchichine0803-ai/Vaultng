import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User
} from '../types/auth';

// Mock delay to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock User Data
const MOCK_USER: User = {
  id: 'u123',
  firstName: 'Demo',
  lastName: 'User',
  email: 'demo@example.com',
  phone: '+2348000000000',
  username: 'demo_user',
  role: 'user',
  balance: 50000,
  referralCode: 'DEMO123',
  createdAt: new Date().toISOString(),
};

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await delay(1000);
    // For now, any email/password works for the mock
    if (credentials.email && credentials.password) {
      return {
        user: { ...MOCK_USER, email: credentials.email },
        token: 'mock-jwt-token-' + Math.random().toString(36).substr(2),
      };
    }
    throw new Error('Invalid credentials');
  },

  register: async (data: RegisterCredentials): Promise<AuthResponse> => {
    await delay(1000);
    return {
      user: {
        ...MOCK_USER,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      },
      token: 'mock-jwt-token-' + Math.random().toString(36).substr(2),
    };
  },

  forgotPassword: async (email: string): Promise<void> => {
    await delay(1000);
    console.log(`Password reset link requested for: ${email}`);
  },

  resetPassword: async (_password: string, token: string): Promise<void> => {
    await delay(1000);
    console.log(`Password reset with token: ${token}`);
  },

  getCurrentUser: async (): Promise<User> => {
    await delay(500);
    return MOCK_USER;
  },

  logout: async (): Promise<void> => {
    await delay(500);
  },
};
