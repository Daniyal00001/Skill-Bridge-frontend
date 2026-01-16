import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, mockUsers } from '@/lib/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: 'client' | 'developer' | 'admin') => Promise<void>;
  signup: (name: string, email: string, password: string, role: 'client' | 'developer') => Promise<void>;
  logout: () => void;
  setUserRole: (role: 'client' | 'developer' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role?: 'client' | 'developer' | 'admin') => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Mock login - in real app, this would validate credentials
    const mockUser = role === 'admin' 
      ? mockUsers.find(u => u.role === 'admin')
      : role === 'developer'
        ? mockUsers.find(u => u.role === 'developer')
        : mockUsers.find(u => u.role === 'client');
    
    if (mockUser) {
      setUser({ ...mockUser, email });
    }
  };

  const signup = async (name: string, email: string, password: string, role: 'client' | 'developer') => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      role,
      createdAt: new Date().toISOString(),
    };
    
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const setUserRole = (role: 'client' | 'developer' | 'admin') => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
