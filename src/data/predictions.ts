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
    description: 'Falcon Forecast\'s platform-wide VIP — unlocks official picks from our admin team plus every tipster\'s VIP picks.',
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
    description: 'Our most popular platform-wide VIP tier — official admin-posted picks plus every tipster\'s VIP picks, paid to Falcon Forecast directly.',
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
    description: 'Maximum value, all year — Falcon Forecast\'s full platform-wide VIP: admin-posted picks plus every tipster\'s VIP picks.',
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

/** These standard markets are auto-settled by api/_lib/settleTip.js. Custom selections are
 * also allowed in tip forms, but remain pending for manual settlement unless that API learns
 * how to evaluate their market rules. */
export const MARKET_OPTIONS = [
  'Over 2.5 Goals',
  'Home Win (1X2)',
  'Away Win (1X2)',
  'Both Teams to Score (BTTS)',
  'Asian Handicap -1.0',
];

export const CUSTOM_MARKET_OPTION = 'Custom prediction';

export const LEAGUE_OPTIONS = [
  'All Leagues',
  'Premier League',
  'Champions League',
  'La Liga',
  'Serie A',
  'Bundesliga'
];
