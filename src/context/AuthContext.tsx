import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/prediction';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isVip: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<{ error: Error | null }>;
  loginWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signupWithEmail: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
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

  const loginWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signupWithEmail = async (email: string, password: string, name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: 'user', plan: 'free' },
      },
    });
    return { error };
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
    if (!user) return;
    const planType = planId.includes('annual') ? 'annual_vip' : 'monthly_vip';
    setUser({
      ...user,
      plan: planType,
      subscribedAt: new Date().toISOString(),
      vipExpiresAt: new Date(Date.now() + (planType === 'annual_vip' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
    });
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
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
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

