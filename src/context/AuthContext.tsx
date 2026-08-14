import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/prediction';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isVip: boolean;
  isAdmin: boolean;
  login: (email: string, name?: string, role?: 'user' | 'tipster' | 'admin', plan?: 'free' | 'monthly_vip' | 'annual_vip') => void;
  loginWithGoogle: () => Promise<{ error: Error | null }>;
  loginWithPreset: (preset: 'free' | 'vip' | 'admin' | 'tipster') => void;
  logout: () => Promise<void>;
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
    return null;
  });

  useEffect(() => {
    // Check initial Supabase auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const sbUser = session.user;
        setUser({
          id: sbUser.id,
          name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'User',
          email: sbUser.email || '',
          role: sbUser.user_metadata?.role || 'user',
          plan: sbUser.user_metadata?.plan || 'free',
          subscribedAt: sbUser.created_at,
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const sbUser = session.user;
        setUser({
          id: sbUser.id,
          name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'User',
          email: sbUser.email || '',
          role: sbUser.user_metadata?.role || 'user',
          plan: sbUser.user_metadata?.plan || 'free',
          subscribedAt: sbUser.created_at,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
    role: 'user' | 'tipster' | 'admin' = 'user',
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

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      return { error };
    }
    return { error: null };
  };

  const loginWithPreset = (preset: 'free' | 'vip' | 'admin' | 'tipster') => {
    if (preset === 'free') {
      login('free.user@falconforecast.com', 'Alex Rivera', 'user', 'free');
    } else if (preset === 'vip') {
      login('vip.pro@falconforecast.com', 'Marcus Sterling', 'user', 'monthly_vip');
    } else if (preset === 'admin') {
      login('admin@falconforecast.com', 'Chief Tipster Admin', 'admin', 'annual_vip');
    } else if (preset === 'tipster') {
      login('tipster.demo@falconforecast.com', 'Jordan Tipmaster', 'tipster', 'monthly_vip');
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Supabase signOut error', e);
    }
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
        loginWithGoogle,
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

