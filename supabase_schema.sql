-- FieldForecast / Falcon Forecast - Production Supabase Database Schema (Multi-Vendor Tipster SaaS)
-- Execute this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'tipster', 'admin')),
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'monthly_vip', 'annual_vip')),
  tipster_status TEXT NOT NULL DEFAULT 'none' CHECK (tipster_status IN ('none', 'pending', 'active', 'suspended')),
  bio TEXT,
  avatar_url TEXT,
  weekly_price NUMERIC(10,2) DEFAULT 9.99,
  monthly_price NUMERIC(10,2) DEFAULT 29.99,
  win_rate NUMERIC(5,2) DEFAULT 75.0,
  total_tips INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  vip_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================================================
-- 2a. RLS HELPER FUNCTIONS — any policy on `profiles` that queries `profiles` from inside
-- itself re-triggers that same policy under RLS, causing "infinite recursion detected in
-- policy for relation profiles" (Postgres error 42P17). Every other table's policies that
-- check role/plan by querying profiles hit the same wall, since that query also goes
-- through profiles' RLS. SECURITY DEFINER functions run as their owner and bypass RLS on
-- the tables they touch, breaking the cycle. This is the standard Supabase-recommended fix.
-- =====================================================================================
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT COALESCE((SELECT role = 'admin' FROM public.profiles WHERE id = uid), false);
$$;

CREATE OR REPLACE FUNCTION public.get_profile(uid UUID DEFAULT auth.uid())
RETURNS public.profiles
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT * FROM public.profiles WHERE id = uid;
$$;

-- Hardened Profiles Policies
DROP POLICY IF EXISTS "Public profiles viewable" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own basic profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Anyone can view Active Tipster profiles; users can view their own profile; admins view all
DROP POLICY IF EXISTS "Public tipsters and own profile viewable" ON public.profiles;
CREATE POLICY "Public tipsters and own profile viewable"
  ON public.profiles FOR SELECT
  USING (
    role = 'tipster' OR
    auth.uid() = id OR
    public.is_admin()
  );

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Users can update bio/name/prices, but CANNOT self-grant role = 'admin'
-- (superseded by the hardened version in section 6b below, which also runs on every
-- re-run of this file — kept here so the table has a valid policy even if 6b is trimmed off)
CREATE POLICY "Users can update own basic profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (public.get_profile()).role -- prevents role tampering
  );

-- Admins have full update rights over any profile (approve tipsters, ban users, change roles)
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    public.is_admin()
  );

-- Secure trigger function: Default to 'user' for public signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, plan, tipster_status)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'user',
    'free',
    'none'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. CREATE TIPSTER SUBSCRIPTIONS TABLE (Users subscribing to specific Tipsters)
CREATE TABLE IF NOT EXISTS public.tipster_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tipster_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('weekly', 'monthly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  price NUMERIC(10,2) NOT NULL,
  platform_cut NUMERIC(10,2) NOT NULL DEFAULT 0,   -- 20% platform fee
  tipster_net  NUMERIC(10,2) NOT NULL DEFAULT 0,   -- 80% tipster earnings
  user_name TEXT,                                   -- display name snapshot at time of sub
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tipster_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own subscriptions" ON public.tipster_subscriptions;
DROP POLICY IF EXISTS "Tipsters view subscribers" ON public.tipster_subscriptions;
DROP POLICY IF EXISTS "Admins view all subscriptions" ON public.tipster_subscriptions;

CREATE POLICY "Users view own subscriptions" 
  ON public.tipster_subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Tipsters view subscribers" 
  ON public.tipster_subscriptions FOR SELECT 
  USING (auth.uid() = tipster_id);

CREATE POLICY "Admins view all subscriptions"
  ON public.tipster_subscriptions FOR SELECT
  USING (public.is_admin());

-- Subscriptions are created ONLY by the server after a real Kentapay payment confirms (see
-- api/kentapay/callback.js), using the service role key which bypasses RLS entirely. There is
-- deliberately no client-facing INSERT policy: a user inserting their own row directly would
-- grant themselves a paid subscription for free. (An earlier version of this schema allowed
-- this before real payments existed; removing it now that money is actually involved.)
DROP POLICY IF EXISTS "Users insert own subscriptions" ON public.tipster_subscriptions;

-- Allow admins or tipsters to cancel/expire subscriptions (UPDATE)
DROP POLICY IF EXISTS "Cancel subscription" ON public.tipster_subscriptions;
CREATE POLICY "Cancel subscription"
  ON public.tipster_subscriptions FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = tipster_id OR public.is_admin());

-- 4. CREATE PREDICTIONS TABLE (Linked to Tipster Author)
CREATE TABLE IF NOT EXISTS public.predictions (
  id TEXT PRIMARY KEY DEFAULT ('pred-' || floor(extract(epoch from now()) * 1000)::text),
  tipster_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tipster_name TEXT,
  league TEXT NOT NULL,
  match_time TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_flag TEXT,
  away_flag TEXT,
  tip TEXT NOT NULL,
  odds NUMERIC(5,2) NOT NULL,
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'vip')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'void')),
  rationale TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================================
-- 4b. SCHEMA REPAIR — if your tables already existed from an earlier version of this
-- file, the `CREATE TABLE IF NOT EXISTS` statements above are no-ops against them, so
-- newer columns (like predictions.tipster_id) never actually get added, and every
-- policy below that references them — including this table's OWN policies just a few
-- lines down — fails with "column ... does not exist". This block runs before any of
-- that, right after all three tables are guaranteed to exist, so it's safe. These
-- ADD COLUMN IF NOT EXISTS lines are safe to re-run any number of times.
-- =====================================================================================
ALTER TABLE public.predictions ADD COLUMN IF NOT EXISTS tipster_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.predictions ADD COLUMN IF NOT EXISTS tipster_name TEXT;
ALTER TABLE public.predictions ADD COLUMN IF NOT EXISTS home_flag TEXT;
ALTER TABLE public.predictions ADD COLUMN IF NOT EXISTS away_flag TEXT;
ALTER TABLE public.predictions ADD COLUMN IF NOT EXISTS rationale TEXT;
ALTER TABLE public.predictions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tipster_status TEXT NOT NULL DEFAULT 'none';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weekly_price NUMERIC(10,2) DEFAULT 9.99;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_price NUMERIC(10,2) DEFAULT 29.99;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS win_rate NUMERIC(5,2) DEFAULT 75.0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_tips INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vip_expires_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.tipster_subscriptions ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE public.tipster_subscriptions ADD COLUMN IF NOT EXISTS platform_cut NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE public.tipster_subscriptions ADD COLUMN IF NOT EXISTS tipster_net NUMERIC(10,2) NOT NULL DEFAULT 0;

ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Free predictions viewable by anyone" ON public.predictions;
DROP POLICY IF EXISTS "VIP predictions viewable by subscribers or admins" ON public.predictions;
DROP POLICY IF EXISTS "Tipsters and admins insert predictions" ON public.predictions;
DROP POLICY IF EXISTS "Tipsters update own predictions, admins update any" ON public.predictions;

-- Anyone can view free predictions
CREATE POLICY "Free predictions viewable by anyone" 
  ON public.predictions FOR SELECT 
  USING (tier = 'free');

-- VIP predictions viewable by subscribers of that tipster or global VIP / Admin users
CREATE POLICY "VIP predictions viewable by subscribers or admins"
  ON public.predictions FOR SELECT
  USING (
    tier = 'free' OR
    EXISTS (
      SELECT 1 FROM public.tipster_subscriptions ts
      WHERE ts.user_id = auth.uid()
      AND ts.tipster_id = predictions.tipster_id
      AND ts.status = 'active'
      AND ts.expires_at > now()
    ) OR
    public.is_admin() OR
    (public.get_profile()).plan IN ('monthly_vip', 'annual_vip')
  );

-- Active tipsters and admins can publish predictions
CREATE POLICY "Tipsters and admins insert predictions"
  ON public.predictions FOR INSERT
  WITH CHECK (
    (public.get_profile()).role IN ('tipster', 'admin')
  );

-- Tipsters can update own predictions; Admins can update any prediction
CREATE POLICY "Tipsters update own predictions, admins update any"
  ON public.predictions FOR UPDATE
  USING (
    tipster_id = auth.uid() OR public.is_admin()
  );

-- Tipsters can delete own predictions; Admins can delete any prediction
DROP POLICY IF EXISTS "Tipsters delete own predictions, admins delete any" ON public.predictions;
CREATE POLICY "Tipsters delete own predictions, admins delete any"
  ON public.predictions FOR DELETE
  USING (
    tipster_id = auth.uid() OR public.is_admin()
  );

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_predictions_tipster ON public.predictions(tipster_id);
CREATE INDEX IF NOT EXISTS idx_predictions_tier_created ON public.predictions(tier, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_tipster_status ON public.profiles(tipster_status);
CREATE INDEX IF NOT EXISTS idx_tipster_subs_user ON public.tipster_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_tipster_subs_tipster ON public.tipster_subscriptions(tipster_id);

-- =====================================================================================
-- 6. MIGRATION — RLS hardening (re-run this whole file any time; every statement below
--    is idempotent via DROP POLICY IF EXISTS + CREATE POLICY, same as the rest of the file)
-- =====================================================================================

-- 6a. Predictions INSERT previously let any tipster/admin attribute a tip to ANY
-- tipster_id (not just their own). Tighten so tipsters can only publish under their own id;
-- admins keep full power (including posting platform tips with tipster_id = NULL).
DROP POLICY IF EXISTS "Tipsters and admins insert predictions" ON public.predictions;
CREATE POLICY "Tipsters and admins insert predictions"
  ON public.predictions FOR INSERT
  WITH CHECK (
    (
      tipster_id = auth.uid() AND
      (public.get_profile()).role = 'tipster'
    )
    OR
    public.is_admin()
  );

-- 6b. The self-update policy on profiles blocked users from tampering with their own
-- `role`, but not `tipster_status` or `verified` — meaning a user could self-grant
-- active/verified tipster status via a raw client call, bypassing admin approval entirely.
-- Now: a user's own update may only leave tipster_status unchanged, or move it to
-- 'pending' (the apply-to-become-a-tipster action) — never straight to 'active', and
-- `verified` can never be self-set. Admins are unaffected (they use the separate
-- "Admins can update any profile" policy, which has no such restriction).
DROP POLICY IF EXISTS "Users can update own basic profile" ON public.profiles;
CREATE POLICY "Users can update own basic profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (public.get_profile()).role AND
    verified = (public.get_profile()).verified AND
    (
      tipster_status = (public.get_profile()).tipster_status
      OR tipster_status = 'pending'
    )
  );

-- =====================================================================================
-- 7. MATCH COMMENTS — previously entirely client-side/in-memory (lost on refresh, seeded
-- with fake hardcoded comments). Real persisted comments + per-user like tracking.
-- =====================================================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id TEXT REFERENCES public.predictions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
CREATE POLICY "Anyone can view comments"
  ON public.comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can post comments" ON public.comments;
CREATE POLICY "Authenticated users can post comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own comments, admins delete any" ON public.comments;
CREATE POLICY "Users delete own comments, admins delete any"
  ON public.comments FOR DELETE
  USING (user_id = auth.uid() OR public.is_admin());

CREATE TABLE IF NOT EXISTS public.comment_likes (
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (comment_id, user_id)
);

ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view comment likes" ON public.comment_likes;
CREATE POLICY "Anyone can view comment likes"
  ON public.comment_likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users add own likes" ON public.comment_likes;
CREATE POLICY "Users add own likes"
  ON public.comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users remove own likes" ON public.comment_likes;
CREATE POLICY "Users remove own likes"
  ON public.comment_likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_comments_prediction ON public.comments(prediction_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON public.comment_likes(comment_id);

-- =====================================================================================
-- 8. PUBLIC PLATFORM STATS — a safe, aggregate-only RPC for the marketing landing page.
-- Row Level Security intentionally restricts tipster_subscriptions to each user's own
-- rows, so a logged-out visitor can never see real aggregate counts directly. This
-- SECURITY DEFINER function returns only rounded/counted numbers, never individual rows,
-- so it's safe to expose to anonymous visitors without leaking anyone's subscription data.
-- =====================================================================================
CREATE OR REPLACE FUNCTION public.platform_stats()
RETURNS TABLE(active_subscribers BIGINT, avg_win_rate NUMERIC, active_tipsters BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT
    (SELECT COUNT(DISTINCT user_id) FROM public.tipster_subscriptions WHERE status = 'active' AND expires_at > now()),
    (SELECT COALESCE(ROUND(AVG(win_rate), 1), 0) FROM public.profiles WHERE role = 'tipster' AND tipster_status = 'active'),
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'tipster' AND tipster_status = 'active');
$$;

-- =====================================================================================
-- 9. KENTAPAY PAYMENTS — real M-Pesa collect (user pays) and disburse (automatic tipster
-- payout) via Kentapay (Eclectics International's "Swivel" gateway). All writes to this
-- table happen server-side from the Vercel functions in api/kentapay/*.js using the
-- Supabase service role key, which bypasses RLS entirely — there is deliberately no
-- INSERT/UPDATE policy for any client role, since a browser must never be able to
-- fabricate or edit a money-moving record directly.
-- =====================================================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mpesa_phone TEXT;

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('collect', 'disburse')),
  kind TEXT NOT NULL CHECK (kind IN ('tipster_subscription', 'vip_subscription', 'tipster_payout')),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tipster_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.tipster_subscriptions(id) ON DELETE SET NULL,
  related_payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  billing_cycle TEXT CHECK (billing_cycle IN ('weekly', 'monthly')),
  plan_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  platform_cut NUMERIC(10,2),
  tipster_net NUMERIC(10,2),
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETE', 'FAILED')),
  receipt_number TEXT,
  failure_message TEXT,
  -- Kentapay's own request identifier from the initial acknowledgement (NOT included in the
  -- final callback) — required to verify that callback's HASH. See api/kentapay/_lib/kentapay.js.
  cloud_packet_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Idempotent for anyone who already ran this file back when the table had no cloud_packet_id.
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS cloud_packet_id TEXT;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own payments" ON public.payments;
CREATE POLICY "Users view own payments"
  ON public.payments FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Tipsters view own payouts" ON public.payments;
CREATE POLICY "Tipsters view own payouts"
  ON public.payments FOR SELECT
  USING (tipster_id = auth.uid());

DROP POLICY IF EXISTS "Admins view all payments" ON public.payments;
CREATE POLICY "Admins view all payments"
  ON public.payments FOR SELECT
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_tipster ON public.payments(tipster_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription ON public.payments(subscription_id);

GRANT EXECUTE ON FUNCTION public.platform_stats() TO anon, authenticated;

-- Per-tipster subscriber counts for the public marketplace (/tipsters). RLS on
-- tipster_subscriptions correctly limits a regular visitor to only their own rows, so this
-- couldn't be computed client-side even for the tipster being viewed — this SECURITY DEFINER
-- function exposes only a count per tipster, never row-level subscriber identity.
CREATE OR REPLACE FUNCTION public.tipster_subscriber_counts()
RETURNS TABLE(tipster_id UUID, subscriber_count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT ts.tipster_id, COUNT(DISTINCT ts.user_id)
  FROM public.tipster_subscriptions ts
  WHERE ts.status = 'active' AND ts.expires_at > now()
  GROUP BY ts.tipster_id;
$$;

GRANT EXECUTE ON FUNCTION public.tipster_subscriber_counts() TO anon, authenticated;
