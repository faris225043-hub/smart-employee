import api from './api';
import { User } from '../types';

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data.user;
  },

  createUser: async (userData: any) => {
    const res = await api.post('/auth/users', userData);
    return res.data;
  },
};
