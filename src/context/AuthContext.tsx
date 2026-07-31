import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/prediction';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isVip: boolean;
  isAdmin: boolean;
  login: (email: string, name?: string, role?: 'user' | 'admin', plan?: 'free' | 'monthly_vip' | 'annual_vip') => void;
  loginWithPreset: (preset: 'free' | 'vip' | 'admin') => void;
  logout: () => void;
  subscribeToPlan: (planId: string) => void;
}

const STORAGE_KEY = 'falconforecast_user_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user state', e);
      }
    }
    // Default demo user: Guest / null (or free)
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = (
    email: string,
    name: string = 'Demo User',
    role: 'user' | 'admin' = 'user',
    plan: 'free' | 'monthly_vip' | 'annual_vip' = 'free'
  ) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      role,
      plan,
      subscribedAt: new Date().toISOString(),
      vipExpiresAt: plan !== 'free' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    };
    setUser(newUser);
  };

  const loginWithPreset = (preset: 'free' | 'vip' | 'admin') => {
    if (preset === 'free') {
      login('free.user@falconforecast.com', 'Alex Rivera', 'user', 'free');
    } else if (preset === 'vip') {
      login('vip.pro@falconforecast.com', 'Marcus Sterling', 'user', 'monthly_vip');
    } else if (preset === 'admin') {
      login('admin@falconforecast.com', 'Chief Tipster Admin', 'admin', 'annual_vip');
    }
  };

  const logout = () => {
    setUser(null);
  };

  const subscribeToPlan = (planId: string) => {
    const planType = planId.includes('annual') ? 'annual_vip' : 'monthly_vip';
    if (user) {
      setUser({
        ...user,
        plan: planType,
        subscribedAt: new Date().toISOString(),
        vipExpiresAt: new Date(Date.now() + (planType === 'annual_vip' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
      });
    } else {
      // Auto-create VIP user if subscribing while guest
      login('new.subscriber@falconforecast.com', 'New VIP Member', 'user', planType);
    }
  };

  const isLoggedIn = !!user;
  const isVip = user?.plan === 'monthly_vip' || user?.plan === 'annual_vip' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isVip,
        isAdmin,
        login,
        loginWithPreset,
        logout,
        subscribeToPlan,
      }}
    >
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
