import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  hasRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('user');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
      } catch (err) {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const data = await authService.login(email, password);
    setUser(data.user);
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  const hasRole = (roles: Role[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
