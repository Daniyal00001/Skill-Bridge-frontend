// use context hook ---> for global state management

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, mockUsers } from '@/lib/mockData';




interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: 'client' | 'freelancer' | 'admin') => Promise<void>;
  signup: (name: string, email: string, password: string, role: 'client' | 'freelancer') => Promise<void>;
  logout: () => void;
  setUserRole: (role: 'client' | 'freelancer' | 'admin') => void;
}



// syntax for context
const AuthContext = createContext<AuthContextType | undefined>(undefined);



// syntax for provider
export function AuthProvider({ children }: { children: ReactNode }) {


// syntax for useState ---> global state management
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('skillbridge_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email: string, password: string, role?: 'client' | 'freelancer' | 'admin') => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock login - in real app, this would validate credentials
    const mockUser = role === 'admin'
      ? mockUsers.find(u => u.role === 'admin')
      : role === 'freelancer'
        ? mockUsers.find(u => u.role === 'freelancer')
        : mockUsers.find(u => u.role === 'client');

    if (mockUser) {
      const userWithEmail = { ...mockUser, email };
      setUser(userWithEmail);
      localStorage.setItem('skillbridge_user', JSON.stringify(userWithEmail));
    }
  };

  const signup = async (name: string, email: string, password: string, role: 'client' | 'freelancer') => {
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
    localStorage.setItem('skillbridge_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skillbridge_user');
  };

  const setUserRole = (role: 'client' | 'freelancer' | 'admin') => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem('skillbridge_user', JSON.stringify(updatedUser));
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
