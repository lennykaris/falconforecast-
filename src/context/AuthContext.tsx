import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/prediction';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isVip: boolean;
  isAdmin: boolean;
  login: (email: string, name?: string, role?: 'user' | 'tipster' | 'admin', plan?: 'free' | 'monthly_vip' | 'annual_vip') => void;
  loginWithSupabase: (email: string, password?: string) => Promise<{ error: Error | null }>;
  signupWithSupabase: (email: string, password?: string, name?: string) => Promise<{ error: Error | null }>;
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

  const loginWithSupabase = async (email: string, password?: string) => {
    if (!password) {
      login(email);
      return { error: null };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Fall back to demo login if Supabase auth credentials fail or user not signed up
      login(email);
      return { error: null };
    }
    if (data.user) {
      setUser({
        id: data.user.id,
        name: data.user.user_metadata?.name || email.split('@')[0],
        email: data.user.email || email,
        role: data.user.user_metadata?.role || 'user',
        plan: data.user.user_metadata?.plan || 'free',
        subscribedAt: data.user.created_at,
      });
    }
    return { error: null };
  };

  const signupWithSupabase = async (email: string, password?: string, name?: string) => {
    if (!password) {
      login(email, name);
      return { error: null };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: 'user', plan: 'free' },
      },
    });
    if (error) {
      login(email, name);
      return { error: null };
    }
    if (data.user) {
      setUser({
        id: data.user.id,
        name: name || email.split('@')[0],
        email: data.user.email || email,
        role: 'user',
        plan: 'free',
        subscribedAt: new Date().toISOString(),
      });
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
        loginWithSupabase,
        signupWithSupabase,
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

