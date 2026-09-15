import type { Prediction, SubscriptionPlan } from '../types/prediction';

/** Real predictions are loaded from Supabase at runtime (see PredictionsContext). This starts empty
 * so a freshly-deployed or emptied platform never shows placeholder tips as if they were real ones. */
export const INITIAL_PREDICTIONS: Prediction[] = [];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'weekly_pass',
    name: '7-Day VIP Pass',
    price: 'KSh 500',
    rawPrice: 500,
    period: '/week',
    description: 'Perfect for testing our high-converting VIP picks for a single match week.',
    features: [
      'Access to all VIP Predictions',
      'Daily 85%+ Confidence Picks',
      'Detailed Tactical & xG Analyses',
      'Instant Email & App Alerts',
      'Cancel Anytime'
    ]
  },
  {
    id: 'monthly_vip',
    name: 'Pro Predictor',
    price: 'KSh 1,500',
    rawPrice: 1500,
    period: '/month',
    description: 'Our most popular tier for serious sports bettors aiming for consistent monthly ROI.',
    features: [
      'Everything in 7-Day Pass',
      'Exclusive High-Odds VIP Value Accumulators',
      'Subscriber ROI & Bankroll Tracker',
      'Direct Instant VIP Alerts Access',
      'Priority 24/7 VIP Support',
      'Save 30% vs Weekly Rate'
    ],
    popular: true
  },
  {
    id: 'annual_vip',
    name: 'Champion VIP',
    price: 'KSh 9,999',
    rawPrice: 9999,
    period: '/year',
    description: 'Maximum value for long-term investors. Get all predictions across all major leagues.',
    features: [
      'Everything in Pro Predictor',
      'Full Season Coverage (All Competitions)',
      '1-on-1 Staking Strategy Advice',
      'Early-Bird Line Movement Alerts',
      'Exclusive End-of-Season Cash Contests',
      'Best Value - Save over 45%'
    ],
    savings: 'Save KSh 8,000/year'
  }
];

/** Every market a tip can be posted under — platform tips (PostTipPage) and tipster tips
 * (PostOddsModal) both use this same fixed list now, instead of tipsters typing free text.
 * Fixed to exactly these strings because api/_lib/settleTip.js pattern-matches on them to
 * auto-settle a prediction against the real final score; adding a new option here means also
 * adding a case for it there, or it'll just sit unsettled forever needing a manual override. */
export const MARKET_OPTIONS = [
  'Over 2.5 Goals',
  'Home Win (1X2)',
  'Away Win (1X2)',
  'Both Teams to Score (BTTS)',
  'Asian Handicap -1.0',
];

export const LEAGUE_OPTIONS = [
  'All Leagues',
  'Premier League',
  'Champions League',
  'La Liga',
  'Serie A',
  'Bundesliga'
];
