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
  /** The real SportSRC match id this tip was placed on (see api/_lib/sportsrc.js) — lets the
   * platform auto-settle the outcome against the real final score (api/settle-predictions.js)
   * and lets the UI open the same live match-detail view (score, stats, incidents) used on
   * /matches. Predictions posted before this existed have no match_id and stay manually
   * settled only. */
  matchId?: string;
}


export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'tipster' | 'admin';
  plan: 'free' | 'weekly_pass' | 'monthly_vip' | 'annual_vip';
  tipsterStatus?: 'none' | 'pending' | 'active' | 'suspended';
  bio?: string;
  avatarUrl?: string;
  weeklyPrice?: number;
  monthlyPrice?: number;
  /** M-Pesa number tipsters register to receive their automatic payout share. */
  mpesaPhone?: string;
  winRate?: number;
  totalTips?: number;
  /** Real settled counts behind winRate — win_rate alone doesn't say how many tips that
   * covers. All three (winRate, tipsWon, tipsLost) are computed by a DB trigger from actual
   * predictions, never self-reported. */
  tipsWon?: number;
  tipsLost?: number;
  subscribersCount?: number;
  verified?: boolean;
  subscribedTipsterIds?: string[];
  subscribedAt?: string;
  vipExpiresAt?: string;
  /** When this profile row was created — i.e. when the user actually signed up, distinct from
   * subscribedAt (which is specifically when they bought VIP). */
  createdAt?: string;
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

export interface Match {
  id: string;
  league: string;
  leagueCode?: string;
  homeTeam: string;
  awayTeam: string;
  homeTla?: string;
  awayTla?: string;
  kickoff: string; // ISO string
  status?: string; // SCHEDULED | TIMED | IN_PLAY | PAUSED | FINISHED | POSTPONED | ...
  homeScore?: number | null;
  awayScore?: number | null;
  homeLogo?: string;
  awayLogo?: string;
}

export interface StandingRow {
  position: number;
  team: string;
  crest?: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  form: string[];
}

export interface MatchStat {
  key: string;
  label: string;
  home: string | number;
  away: string | number;
  homeValue: number | null;
  awayValue: number | null;
}

export interface MatchIncident {
  type: 'goal' | 'card' | 'substitution' | 'period' | string;
  minute: number;
  minuteDisplay: string;
  team: 'home' | 'away' | null;
  player?: string;
  assist?: string | null;
  cardType?: 'yellow' | 'red' | string;
  playerIn?: string;
  playerOut?: string;
  text?: string;
}

export interface MatchDetail {
  id: string;
  league: string;
  round?: string;
  status: string;
  statusDetail?: string;
  liveMinute: number | null;
  kickoff: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  homeScore: number | null;
  awayScore: number | null;
  venue?: string | null;
  referee?: string | null;
  homeManager?: string;
  awayManager?: string;
  stats: MatchStat[];
  incidents: MatchIncident[];
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

