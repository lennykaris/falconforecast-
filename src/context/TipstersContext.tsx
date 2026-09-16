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
  approveTipster: (tipsterId: string) => Promise<string | null>;
  suspendTipster: (tipsterId: string) => Promise<string | null>;
  /** Called by the tipster themselves — admins cannot change another tipster's prices */
  updateOwnPricing: (tipsterId: string, weeklyPrice: number, monthlyPrice: number) => void;
  updateMpesaPhone: (tipsterId: string, mpesaPhone: string) => void;
  applyForTipster: (user: User, bio: string, weeklyPrice: number, monthlyPrice: number) => Promise<{ error: string | null }>;
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
            // != null, not `||` — a tipster who deliberately set a price/win-rate of exactly
            // 0 (a promotional free tier, or a brand-new tipster with no settled tips yet)
            // was having that overwritten by these fallback defaults everywhere this list is
            // read from (marketplace, admin revenue table, tipster dashboard).
            weeklyPrice: p.weekly_price != null ? Number(p.weekly_price) : 500,
            monthlyPrice: p.monthly_price != null ? Number(p.monthly_price) : 1500,
            // mpesa_phone and balance deliberately NOT mapped here — this query's RLS policy
            // ("Public tipsters and own profile viewable") lets ANYONE fetch every row with
            // role = 'tipster', not just the tipster's own. Mapping either field into this
            // shared, publicly-fetched list would leak every tipster's payout phone number
            // and withdrawable earnings balance to any visitor loading the marketplace, even
            // though nothing in the UI happened to render them. TipsterDashboardPage reads its
            // own mpesaPhone/balance from AuthContext's `user` instead, which is genuinely
            // scoped server-side (RLS's `auth.uid() = id` self-select branch) to just its own
            // row's full contents.
            // Every tipster starts at 0% / 0 tips and earns it — no more inherited 75.0
            // fallback for someone with zero real settled predictions.
            winRate: p.win_rate != null ? Number(p.win_rate) : 0,
            totalTips: p.total_tips || 0,
            tipsWon: p.tips_won || 0,
            tipsLost: p.tips_lost || 0,
            verified: p.verified || false,
          }));

          // Real per-tipster subscriber counts via a safe aggregate RPC — RLS means the
          // regular tipster_subscriptions fetch above only ever contains rows the current
          // user is allowed to see, which isn't enough to show subscriber counts for the
          // other tipsters listed on the public marketplace.
          const [{ data: counts }, { data: reviewStats }] = await Promise.all([
            supabase.rpc('tipster_subscriber_counts'),
            supabase.rpc('tipster_review_stats'),
          ]);
          const countMap = new Map<string, number>(
            (counts || []).map((c: any) => [c.tipster_id, Number(c.subscriber_count)])
          );
          const reviewMap = new Map<string, { avg: number; count: number }>(
            (reviewStats || []).map((r: any) => [r.tipster_id, { avg: Number(r.avg_rating), count: Number(r.review_count) }])
          );
          setTipsters(mapped.map(t => ({
            ...t,
            subscribersCount: countMap.get(t.id) || 0,
            avgRating: reviewMap.get(t.id)?.avg,
            reviewCount: reviewMap.get(t.id)?.count || 0,
          })));
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

  // All four writes below used to apply their local state optimistically and only caught a
  // thrown exception — but a write an RLS policy rejects (e.g. an admin whose session got
  // into the panel via AuthContext's hardcoded email allowlist but whose profiles.role isn't
  // actually 'admin' in the DB) doesn't throw at all: supabase-js just returns `{ error }`
  // with zero rows changed. Now writes first and only reflects the change locally once
  // Supabase actually confirms it, so a rejected write shows as a real failure (logged, and
  // the local list stays correct) instead of a false "success".
  // Supabase/PostgREST's `.update()` returns `{ error: null }` even when RLS silently matches
  // ZERO rows — a bare "no error" here does not mean the write happened. This was exactly why
  // admin "Approve tipster" clicks looked like they did nothing (no error shown, so nothing
  // logged either) and why an apparently-approved tipster would show unapproved again on the
  // next page load: the click never actually wrote anything, so the next real fetch from
  // Supabase just showed the true, never-changed row. Chaining `.select('id')` makes Postgres
  // return the rows that were actually touched, so an empty array here is now treated as a
  // real failure instead of a false success.
  const updateProfileRow = async (id: string, payload: Record<string, any>): Promise<string | null> => {
    const { data, error } = await supabase.from('profiles').update(payload).eq('id', id).select('id');
    if (error) {
      console.error('Supabase profile update failed', { id, payload, error });
      return error.message;
    }
    if (!data || data.length === 0) {
      console.error('Supabase profile update matched zero rows (likely blocked by RLS)', { id, payload });
      return "That change wasn't saved — you may not have permission, or the account no longer exists.";
    }
    return null;
  };

  const approveTipster = async (tipsterId: string) => {
    const error = await updateProfileRow(tipsterId, { role: 'tipster', tipster_status: 'active', verified: true });
    if (error) return error;
    setTipsters(prev =>
      prev.map(t =>
        t.id === tipsterId
          ? { ...t, role: 'tipster', tipsterStatus: 'active', verified: true }
          : t
      )
    );
    return null;
  };

  const suspendTipster = async (tipsterId: string) => {
    // verified is cleared too — it's a separate "checkmark" flag from tipsterStatus, and
    // leaving it true on a suspended tipster is what let stale, verified-only filters
    // elsewhere in the app keep listing/paying them after being cut off.
    const error = await updateProfileRow(tipsterId, { tipster_status: 'suspended', verified: false });
    if (error) return error;
    setTipsters(prev =>
      prev.map(t =>
        t.id === tipsterId
          ? { ...t, tipsterStatus: 'suspended', verified: false }
          : t
      )
    );
    return null;
  };

  /** Only callable by the tipster themselves — NOT by admin */
  const updateOwnPricing = async (tipsterId: string, weeklyPrice: number, monthlyPrice: number) => {
    const error = await updateProfileRow(tipsterId, { weekly_price: weeklyPrice, monthly_price: monthlyPrice });
    if (error) return;
    setTipsters(prev =>
      prev.map(t =>
        t.id === tipsterId
          ? { ...t, weeklyPrice, monthlyPrice }
          : t
      )
    );
  };

  /** The M-Pesa number that receives this tipster's automatic payout share. */
  const updateMpesaPhone = async (tipsterId: string, mpesaPhone: string) => {
    const error = await updateProfileRow(tipsterId, { mpesa_phone: mpesaPhone });
    if (error) return;
    setTipsters(prev =>
      prev.map(t => (t.id === tipsterId ? { ...t, mpesaPhone } : t))
    );
  };

  const applyForTipster = async (user: User, bio: string, weeklyPrice: number, monthlyPrice: number) => {
    // role deliberately stays 'user' here — only tipster_status moves to 'pending'. The
    // "Users can update own basic profile" RLS policy explicitly requires role to stay
    // unchanged on a self-update (to stop anyone self-granting tipster/admin access), so a
    // write that also tried to flip role here would be silently rejected: no error thrown,
    // zero rows actually changed. Only approveTipster (an admin-only write, different RLS
    // policy) sets role: 'tipster', at actual approval time.
    const newTipster: User = {
      ...user,
      tipsterStatus: 'pending',
      bio,
      weeklyPrice,
      monthlyPrice,
      // A brand-new applicant has settled zero tips — a hardcoded 70% here (or the DB
      // column's old 75.0 default) showed a fake, unearned track record before they'd ever
      // posted a single tip.
      winRate: 0,
      totalTips: 0,
      tipsWon: 0,
      tipsLost: 0,
      subscribersCount: 0,
      verified: false,
    };

    const error = await updateProfileRow(user.id, {
      tipster_status: 'pending',
      bio,
      weekly_price: weeklyPrice,
      monthly_price: monthlyPrice,
    });
    if (error) return { error };

    setTipsters(prev => [newTipster, ...prev.filter(t => t.id !== user.id)]);
    return { error: null };
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
