'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface AuthResponse {
  user: User;
  access_token: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (authData: AuthResponse) => void;
  logout: () => void;
  showAuthModal: (mode?: 'signin' | 'signup') => void;
  hideAuthModal: () => void;
  isAuthModalOpen: boolean;
  authMode: 'signin' | 'signup';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Load user and token from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('authToken');

      if (savedUser && savedToken) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
        }
      }
    }
  }, []);

  const login = (authData: AuthResponse) => {
    setUser(authData.user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(authData.user));
      localStorage.setItem('authToken', authData.access_token);
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
    }
  };

  const showAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const hideAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    showAuthModal,
    hideAuthModal,
    isAuthModalOpen,
    authMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};