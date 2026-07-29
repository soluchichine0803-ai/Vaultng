import api from '../lib/api';
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User
} from '../types/auth';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data.data;
  },

  register: async (data: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  },


  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  updateProfile: async (data: { username?: string, email?: string, phone?: string }): Promise<User> => {
    const response = await api.patch('/auth/profile', data);
    return response.data.data.user;
  },

  changePassword: async (data: { currentPassword: string, newPassword: string }): Promise<void> => {
    await api.patch('/auth/change-password', data);
  },
};
