export interface Prediction {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  kickoff: string; // ISO string
  tip: string;
  odds: number;
  confidence: number; // 0 - 100
  tier: 'free' | 'vip';
  category?: string;
  isPlatformTip?: boolean;
  homeLogo?: string;
  awayLogo?: string;
  analysis?: string;
  status?: 'pending' | 'won' | 'lost' | 'void';
  result?: string;
  tipsterId?: string;
  tipsterName?: string;
  tipsterAvatar?: string;
}


export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'tipster' | 'admin';
  plan: 'free' | 'monthly_vip' | 'annual_vip';
  tipsterStatus?: 'none' | 'pending' | 'active' | 'suspended';
  bio?: string;
  avatarUrl?: string;
  weeklyPrice?: number;
  monthlyPrice?: number;
  winRate?: number;
  totalTips?: number;
  subscribersCount?: number;
  verified?: boolean;
  subscribedTipsterIds?: string[];
  subscribedAt?: string;
  vipExpiresAt?: string;
  /** Leagues this tipster specialises in, e.g. ['Premier League', 'Champions League'] */
  leagues?: string[];
  /** Primary market types, e.g. ['BTTS', 'Over 2.5', 'Accumulators'] */
  markets?: string[];
}

export interface TipsterSubscription {
  id: string;
  userId: string;
  userName: string;
  tipsterId: string;
  billingCycle: 'weekly' | 'monthly';
  status: 'active' | 'cancelled' | 'expired';
  price: number;
  platformCut: number;
  tipsterNet: number;
  expiresAt: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  rawPrice: number;
  description: string;
  features: string[];
  popular?: boolean;
  savings?: string;
}

