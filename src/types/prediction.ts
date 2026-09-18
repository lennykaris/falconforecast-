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
  /** M-Pesa number tipsters register to receive their payout when they withdraw. */
  mpesaPhone?: string;
  /** A tipster's withdrawable earnings — credited automatically as subscribers pay, spent
   * down (server-side, via the withdraw RPC) whenever they cash out. Never self-editable;
   * see profiles.balance / "Users can update own basic profile" in supabase_schema.sql. */
  balance?: number;
  winRate?: number;
  totalTips?: number;
  /** Real settled counts behind winRate — win_rate alone doesn't say how many tips that
   * covers. All three (winRate, tipsWon, tipsLost) are computed by a DB trigger from actual
   * predictions, never self-reported. */
  tipsWon?: number;
  tipsLost?: number;
  subscribersCount?: number;
  /** Subscriber-submitted ratings — separate from winRate, which is objective/computed.
   * Captures things a settled-tip record can't: consistency, clarity of reasoning, etc. */
  avgRating?: number;
  reviewCount?: number;
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
  /** The league's country — 'Europe' for continental competitions (e.g. Champions League). */
  country?: string;
  countryFlag?: string;
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
  /** Head-to-head record between these two teams specifically — homeWins/awayWins are from
   * the perspective of whoever is home/away in *this* match, not necessarily every past
   * meeting's home side. */
  h2h: { homeWins: number; awayWins: number; draws: number; totalMeetings: number } | null;
  /** Last 5 finished results for each team (any opponent), most recent first — 'W'/'D'/'L'
   * from that team's own perspective regardless of which side they were on in each game. */
  homeForm: string[];
  awayForm: string[];
  /** The full match behind each homeForm/awayForm entry — same order, same length — so the
   * form badges can expand into an actual "previous matches and the scores they got" list
   * instead of just a bare W/D/L pill with no way to see what actually happened. */
  homeRecentMatches: RecentMatchResult[];
  awayRecentMatches: RecentMatchResult[];
}

export interface RecentMatchResult {
  id: string;
  opponent: string;
  opponentLogo?: string;
  /** Always this team's own score first, opponent's second — regardless of which side (home
   * or away) this team was actually on in that past match. */
  teamScore: number;
  opponentScore: number;
  result: 'W' | 'D' | 'L';
  competition: string;
  kickoff: string;
  /** Whether this team was playing at home in that past match (not the current match). */
  wasHome: boolean;
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


export interface TipsterReview {
  id: string;
  tipsterId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}
