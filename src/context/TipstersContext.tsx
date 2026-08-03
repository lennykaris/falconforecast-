import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, TipsterSubscription } from '../types/prediction';
import { INITIAL_TIPSTERS } from '../data/tipsters';
import { supabase } from '../lib/supabase';

/** Platform takes 20% of every tipster subscription payment */
export const PLATFORM_CUT_PCT = 0.20;

interface TipstersContextType {
  tipsters: User[];
  subscriptions: TipsterSubscription[];
  approveTipster: (tipsterId: string) => void;
  suspendTipster: (tipsterId: string) => void;
  /** Called by the tipster themselves — admins cannot change another tipster's prices */
  updateOwnPricing: (tipsterId: string, weeklyPrice: number, monthlyPrice: number) => void;
  applyForTipster: (user: User, bio: string, weeklyPrice: number, monthlyPrice: number) => void;
  subscribeToTipster: (userId: string, userName: string, tipsterId: string, cycle: 'weekly' | 'monthly', price: number) => void;
  isSubscribedToTipster: (userId: string, tipsterId: string) => boolean;
  getMySubscriptions: (tipsterId: string) => TipsterSubscription[];
  getTipsterRevenue: (tipsterId: string) => { gross: number; platformCut: number; net: number };
}

const STORAGE_KEY = 'falconforecast_tipsters_data';
const SUBS_STORAGE_KEY = 'falconforecast_tipster_subs_data';

const TipstersContext = createContext<TipstersContextType | undefined>(undefined);

export const TipstersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

        if (!error && data && data.length > 0) {
          const mapped: User[] = data.map((p: any) => ({
            id: p.id,
            name: p.name || p.email.split('@')[0],
            email: p.email,
            role: p.role,
            plan: p.plan,
            tipsterStatus: p.tipster_status,
            bio: p.bio,
            avatarUrl: p.avatar_url,
            weeklyPrice: Number(p.weekly_price || 9.99),
            monthlyPrice: Number(p.monthly_price || 29.99),
            winRate: Number(p.win_rate || 75.0),
            totalTips: p.total_tips || 0,
            verified: p.verified || false,
          }));
          setTipsters(mapped);
        }
      } catch (e) {
        console.warn('Failed to load tipsters from Supabase', e);
      }
    }
    loadTipsters();
  }, []);

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

  const subscribeToTipster = async (
    userId: string,
    userName: string,
    tipsterId: string,
    cycle: 'weekly' | 'monthly',
    price: number
  ) => {
    const days = cycle === 'weekly' ? 7 : 30;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    const platformCut = parseFloat((price * PLATFORM_CUT_PCT).toFixed(2));
    const tipsterNet  = parseFloat((price - platformCut).toFixed(2));

    const newSub: TipsterSubscription = {
      id: `sub-${Date.now()}`,
      userId,
      userName,
      tipsterId,
      billingCycle: cycle,
      status: 'active',
      price,
      platformCut,
      tipsterNet,
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    setSubscriptions(prev => [newSub, ...prev]);

    // Increment tipster's subscriber count locally
    setTipsters(prev =>
      prev.map(t => (t.id === tipsterId ? { ...t, subscribersCount: (t.subscribersCount || 0) + 1 } : t))
    );

    try {
      await supabase.from('tipster_subscriptions').insert([{
        user_id: userId,
        tipster_id: tipsterId,
        billing_cycle: cycle,
        status: 'active',
        price,
        platform_cut: platformCut,
        tipster_net: tipsterNet,
        expires_at: expiresAt,
      }]);
    } catch (e) {
      console.warn('Supabase subscribeToTipster error', e);
    }
  };

  const isSubscribedToTipster = (userId: string, tipsterId: string) => {
    return subscriptions.some(
      s => s.userId === userId && s.tipsterId === tipsterId && s.status === 'active'
    );
  };

  /** All subscriptions for a specific tipster — used in tipster dashboard */
  const getMySubscriptions = (tipsterId: string) =>
    subscriptions.filter(s => s.tipsterId === tipsterId);

  /** Revenue breakdown with 20% platform cut for a tipster */
  const getTipsterRevenue = (tipsterId: string) => {
    const mySubs = getMySubscriptions(tipsterId).filter(s => s.status === 'active');
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
        applyForTipster,
        subscribeToTipster,
        isSubscribedToTipster,
        getMySubscriptions,
        getTipsterRevenue,
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
