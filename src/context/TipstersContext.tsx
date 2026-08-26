import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, TipsterSubscription } from '../types/prediction';
import { INITIAL_TIPSTERS } from '../data/tipsters';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

/** Platform takes 20% of every tipster subscription payment */
export const PLATFORM_CUT_PCT = 0.20;

/** A subscription counts as active only while it's both flagged active AND unexpired —
 * checking expiry live here means gating stays correct even without a cron job flipping
 * `status` to 'expired' the moment expires_at passes. */
export const isSubscriptionActive = (s: TipsterSubscription) =>
  s.status === 'active' && new Date(s.expiresAt).getTime() > Date.now();

interface TipstersContextType {
  tipsters: User[];
  subscriptions: TipsterSubscription[];
  approveTipster: (tipsterId: string) => void;
  suspendTipster: (tipsterId: string) => void;
  /** Called by the tipster themselves — admins cannot change another tipster's prices */
  updateOwnPricing: (tipsterId: string, weeklyPrice: number, monthlyPrice: number) => void;
  updateMpesaPhone: (tipsterId: string, mpesaPhone: string) => void;
  applyForTipster: (user: User, bio: string, weeklyPrice: number, monthlyPrice: number) => Promise<void>;
  isSubscribedToTipster: (userId: string, tipsterId: string) => boolean;
  getMySubscriptions: (tipsterId: string) => TipsterSubscription[];
  getTipsterRevenue: (tipsterId: string) => { gross: number; platformCut: number; net: number };
  refetchSubscriptions: () => Promise<void>;
}

const STORAGE_KEY = 'falconforecast_tipsters_data';
const SUBS_STORAGE_KEY = 'falconforecast_tipster_subs_data';

const TipstersContext = createContext<TipstersContextType | undefined>(undefined);

const fromSubRow = (s: any): TipsterSubscription => ({
  id: s.id,
  userId: s.user_id,
  userName: s.user_name,
  tipsterId: s.tipster_id,
  billingCycle: s.billing_cycle,
  status: s.status,
  price: Number(s.price),
  platformCut: Number(s.platform_cut),
  tipsterNet: Number(s.tipster_net),
  expiresAt: s.expires_at,
  createdAt: s.created_at,
});

export const TipstersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tipsters, setTipsters] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse tipsters cache', e);
      }
    }
    return INITIAL_TIPSTERS;
  });

  const [subscriptions, setSubscriptions] = useState<TipsterSubscription[]>(() => {
    const saved = localStorage.getItem(SUBS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse subscriptions cache', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tipsters));
  }, [tipsters]);

  useEffect(() => {
    localStorage.setItem(SUBS_STORAGE_KEY, JSON.stringify(subscriptions));
  }, [subscriptions]);

  // Load from Supabase profiles where role = 'tipster' or tipster_status != 'none'
  useEffect(() => {
    async function loadTipsters() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or('role.eq.tipster,tipster_status.neq.none');

        if (!error && data) {
          const mapped: User[] = data.map((p: any) => ({
            id: p.id,
            name: p.name || p.email.split('@')[0],
            email: p.email,
            role: p.role,
            plan: p.plan,
            tipsterStatus: p.tipster_status,
            bio: p.bio,
            avatarUrl: p.avatar_url,
            weeklyPrice: Number(p.weekly_price || 500),
            monthlyPrice: Number(p.monthly_price || 1500),
            mpesaPhone: p.mpesa_phone || undefined,
            winRate: Number(p.win_rate || 75.0),
            totalTips: p.total_tips || 0,
            verified: p.verified || false,
          }));

          // Real per-tipster subscriber counts via a safe aggregate RPC — RLS means the
          // regular tipster_subscriptions fetch above only ever contains rows the current
          // user is allowed to see, which isn't enough to show subscriber counts for the
          // other tipsters listed on the public marketplace.
          const { data: counts } = await supabase.rpc('tipster_subscriber_counts');
          const countMap = new Map<string, number>(
            (counts || []).map((c: any) => [c.tipster_id, Number(c.subscriber_count)])
          );
          setTipsters(mapped.map(t => ({ ...t, subscribersCount: countMap.get(t.id) || 0 })));
        }
      } catch (e) {
        console.warn('Failed to load tipsters from Supabase', e);
      }
    }
    loadTipsters();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const { data, error } = await supabase.from('tipster_subscriptions').select('*');
      if (!error && data) {
        setSubscriptions(data.map(fromSubRow));
      }
    } catch (e) {
      console.warn('Failed to load subscriptions from Supabase', e);
    }
  };

  // Load real subscriptions from Supabase — RLS scopes this to exactly what the current
  // user should see: their own subscriptions, subscriptions to them (if a tipster), or
  // everything (if admin). Re-fetches on login/logout so switching accounts stays correct.
  useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      return;
    }
    loadSubscriptions();
  }, [user?.id]);

  const approveTipster = async (tipsterId: string) => {
    setTipsters(prev =>
      prev.map(t =>
        t.id === tipsterId
          ? { ...t, role: 'tipster', tipsterStatus: 'active', verified: true }
          : t
      )
    );

    try {
      await supabase
        .from('profiles')
        .update({ role: 'tipster', tipster_status: 'active', verified: true })
        .eq('id', tipsterId);
    } catch (e) {
      console.warn('Supabase update approveTipster error', e);
    }
  };

  const suspendTipster = async (tipsterId: string) => {
    setTipsters(prev =>
      prev.map(t =>
        t.id === tipsterId
          ? { ...t, tipsterStatus: 'suspended' }
          : t
      )
    );

    try {
      await supabase
        .from('profiles')
        .update({ tipster_status: 'suspended' })
        .eq('id', tipsterId);
    } catch (e) {
      console.warn('Supabase update suspendTipster error', e);
    }
  };

  /** Only callable by the tipster themselves — NOT by admin */
  const updateOwnPricing = async (tipsterId: string, weeklyPrice: number, monthlyPrice: number) => {
    setTipsters(prev =>
      prev.map(t =>
        t.id === tipsterId
          ? { ...t, weeklyPrice, monthlyPrice }
          : t
      )
    );

    try {
      await supabase
        .from('profiles')
        .update({ weekly_price: weeklyPrice, monthly_price: monthlyPrice })
        .eq('id', tipsterId);
    } catch (e) {
      console.warn('Supabase update pricing error', e);
    }
  };

  /** The M-Pesa number that receives this tipster's automatic payout share. */
  const updateMpesaPhone = async (tipsterId: string, mpesaPhone: string) => {
    setTipsters(prev =>
      prev.map(t => (t.id === tipsterId ? { ...t, mpesaPhone } : t))
    );

    try {
      await supabase
        .from('profiles')
        .update({ mpesa_phone: mpesaPhone })
        .eq('id', tipsterId);
    } catch (e) {
      console.warn('Supabase update mpesa phone error', e);
    }
  };

  const applyForTipster = async (user: User, bio: string, weeklyPrice: number, monthlyPrice: number) => {
    const newTipster: User = {
      ...user,
      role: 'tipster',
      tipsterStatus: 'pending',
      bio,
      weeklyPrice,
      monthlyPrice,
      winRate: 70.0,
      totalTips: 0,
      subscribersCount: 0,
      verified: false,
    };

    setTipsters(prev => [newTipster, ...prev.filter(t => t.id !== user.id)]);

    try {
      await supabase
        .from('profiles')
        .update({
          role: 'tipster',
          tipster_status: 'pending',
          bio,
          weekly_price: weeklyPrice,
          monthly_price: monthlyPrice,
        })
        .eq('id', user.id);
    } catch (e) {
      console.warn('Supabase applyForTipster error', e);
    }
  };

  const isSubscribedToTipster = (userId: string, tipsterId: string) => {
    return subscriptions.some(
      s => s.userId === userId && s.tipsterId === tipsterId && isSubscriptionActive(s)
    );
  };

  /** All subscriptions for a specific tipster — used in tipster dashboard */
  const getMySubscriptions = (tipsterId: string) =>
    subscriptions.filter(s => s.tipsterId === tipsterId);

  /** Revenue breakdown with 20% platform cut for a tipster */
  const getTipsterRevenue = (tipsterId: string) => {
    const mySubs = getMySubscriptions(tipsterId).filter(isSubscriptionActive);
    const gross = mySubs.reduce((sum, s) => sum + (s.price || 0), 0);
    const platformCut = parseFloat((gross * PLATFORM_CUT_PCT).toFixed(2));
    const net = parseFloat((gross - platformCut).toFixed(2));
    return { gross, platformCut, net };
  };

  return (
    <TipstersContext.Provider
      value={{
        tipsters,
        subscriptions,
        approveTipster,
        suspendTipster,
        updateOwnPricing,
        updateMpesaPhone,
        applyForTipster,
        isSubscribedToTipster,
        getMySubscriptions,
        getTipsterRevenue,
        refetchSubscriptions: loadSubscriptions,
      }}
    >
      {children}
    </TipstersContext.Provider>
  );
};

export const useTipsters = () => {
  const context = useContext(TipstersContext);
  if (!context) {
    throw new Error('useTipsters must be used within a TipstersProvider');
  }
  return context;
};
