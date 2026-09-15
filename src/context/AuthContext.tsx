import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/prediction';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isVip: boolean;
  isAdmin: boolean;
  isTipster: boolean;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  loginWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signupWithEmail: (email: string, password: string, name?: string) => Promise<{ error: Error | null; needsEmailConfirmation: boolean }>;
  sendPasswordReset: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const STORAGE_KEY = 'falconforecast_user_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type SupabaseAuthUser = NonNullable<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>['user'];

/** `profiles` is the source of truth for role/plan/tipster status; auth metadata is only a fallback
 * for the brief window before that row exists (or if the fetch fails).
 *
 * This used to also treat a hardcoded email list as an automatic admin, independent of the
 * real profiles.role column — every RLS policy in supabase_schema.sql checks that column via
 * is_admin(), not this list, so an account recognized as admin only here (DB role still
 * 'user') could open /admin's UI but have every actual read/write silently rejected —
 * confusing failures already hit more than once. Trust the DB row alone now. */
const buildUser = (sbUser: SupabaseAuthUser, profile: Record<string, any> | null): User => {
  return {
    id: sbUser.id,
    name: profile?.name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'User',
    email: sbUser.email || '',
    role: profile?.role || sbUser.user_metadata?.role || 'user',
    plan: profile?.plan || sbUser.user_metadata?.plan || 'free',
    tipsterStatus: profile?.tipster_status,
    bio: profile?.bio,
    avatarUrl: profile?.avatar_url,
    weeklyPrice: profile?.weekly_price != null ? Number(profile.weekly_price) : undefined,
    monthlyPrice: profile?.monthly_price != null ? Number(profile.monthly_price) : undefined,
    mpesaPhone: profile?.mpesa_phone || undefined,
    winRate: profile?.win_rate != null ? Number(profile.win_rate) : undefined,
    totalTips: profile?.total_tips,
    verified: profile?.verified,
    subscribedAt: profile?.subscribed_at || sbUser.created_at,
    vipExpiresAt: profile?.vip_expires_at,
  };
};

const loadUser = async (sbUser: SupabaseAuthUser): Promise<User> => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', sbUser.id)
    .maybeSingle();
  return buildUser(sbUser, profile);
};

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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(await loadUser(session.user));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(await loadUser(session.user));
      } else {
        setUser(null);
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

  /** Supabase's hosted Google OAuth flow — redirects through Google, then Supabase's fixed
   * callback URL, then back here. More reliable than a client-side token flow because the
   * only redirect URI that ever needs registering in Google Console is Supabase's own
   * (https://<project-ref>.supabase.co/auth/v1/callback), which never changes with the app's
   * port or domain. */
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    return { error };
  };

  const loginWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signupWithEmail = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: 'user', plan: 'free' },
      },
    });
    // Supabase returns a user with no active session when email confirmation is required —
    // the caller needs to know this so it can show a "check your email" state instead of
    // treating the signup as an immediate, logged-in success.
    const needsEmailConfirmation = !error && !!data.user && !data.session;
    return { error, needsEmailConfirmation };
  };

  const sendPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
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

  /** Re-fetches the profile row from Supabase — used after a real payment completes, since
   * the webhook updates `profiles.plan`/`vip_expires_at` server-side and the client's local
   * user state has no other way to learn about that. */
  const refetchUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(await loadUser(session.user));
    }
  };

  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'admin';
  const isTipster = user?.role === 'tipster';
  // Mirrors the "VIP predictions viewable by subscribers or admins" RLS policy in
  // supabase_schema.sql — plan alone used to grant VIP forever, since nothing ever reset it
  // back to 'free' once vip_expires_at passed. A weekly_pass buyer kept full VIP access
  // permanently from one KSh 500 payment.
  const hasUnexpiredVip =
    (user?.plan === 'weekly_pass' || user?.plan === 'monthly_vip' || user?.plan === 'annual_vip') &&
    !!user?.vipExpiresAt &&
    new Date(user.vipExpiresAt).getTime() > Date.now();
  const isVip = hasUnexpiredVip || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isVip,
        isAdmin,
        isTipster,
        signInWithGoogle,
        loginWithEmail,
        signupWithEmail,
        sendPasswordReset,
        updatePassword,
        logout,
        refetchUser,
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
