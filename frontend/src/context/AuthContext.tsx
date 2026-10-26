import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('crowd_sync_token');
    const savedUser = localStorage.getItem('crowd_sync_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('crowd_sync_token');
        localStorage.removeItem('crowd_sync_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('crowd_sync_token', data.access_token);
      localStorage.setItem('crowd_sync_user', JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role = 'student') => {
    setIsLoading(true);
    try {
      const data = await authService.register(name, email, password, role);
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('crowd_sync_token', data.access_token);
      localStorage.setItem('crowd_sync_user', JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: UserRole) => {
    const credentials = {
      admin: { email: 'admin@campus.edu', pass: 'admin123' },
      organizer: { email: 'organizer@campus.edu', pass: 'organizer123' },
      student: { email: 'student@campus.edu', pass: 'student123' },
    };
    const cred = credentials[role];
    await login(cred.email, cred.pass);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('crowd_sync_token');
    localStorage.removeItem('crowd_sync_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
