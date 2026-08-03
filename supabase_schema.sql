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

-- Hardened Profiles Policies
DROP POLICY IF EXISTS "Public profiles viewable" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own basic profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Anyone can view Active Tipster profiles; users can view their own profile; admins view all
CREATE POLICY "Public tipsters and own profile viewable" 
  ON public.profiles FOR SELECT 
  USING (
    role = 'tipster' OR 
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Users can update bio/name/prices, but CANNOT self-grant role = 'admin'
CREATE POLICY "Users can update own basic profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM public.profiles WHERE id = auth.uid()) -- prevents role tampering
  );

-- Admins have full update rights over any profile (approve tipsters, ban users, change roles)
CREATE POLICY "Admins can update any profile" 
  ON public.profiles FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
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
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Allow authenticated users to create subscriptions (INSERT)
DROP POLICY IF EXISTS "Users insert own subscriptions" ON public.tipster_subscriptions;
CREATE POLICY "Users insert own subscriptions"
  ON public.tipster_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow admins or tipsters to cancel/expire subscriptions (UPDATE)
DROP POLICY IF EXISTS "Cancel subscription" ON public.tipster_subscriptions;
CREATE POLICY "Cancel subscription"
  ON public.tipster_subscriptions FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = tipster_id
         OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

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
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.plan IN ('monthly_vip', 'annual_vip'))
    )
  );

-- Active tipsters and admins can publish predictions
CREATE POLICY "Tipsters and admins insert predictions" 
  ON public.predictions FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND (profiles.role IN ('tipster', 'admin'))
    )
  );

-- Tipsters can update own predictions; Admins can update any prediction
CREATE POLICY "Tipsters update own predictions, admins update any" 
  ON public.predictions FOR UPDATE 
  USING (
    tipster_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Tipsters can delete own predictions; Admins can delete any prediction
CREATE POLICY "Tipsters delete own predictions, admins delete any" 
  ON public.predictions FOR DELETE 
  USING (
    tipster_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_predictions_tipster ON public.predictions(tipster_id);
CREATE INDEX IF NOT EXISTS idx_predictions_tier_created ON public.predictions(tier, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_tipster_status ON public.profiles(tipster_status);
CREATE INDEX IF NOT EXISTS idx_tipster_subs_user ON public.tipster_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_tipster_subs_tipster ON public.tipster_subscriptions(tipster_id);
