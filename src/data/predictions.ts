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
    // ⚠️ TEMPORARY TESTING PRICE — matches TESTING_FORCE_LOW_PRICE in api/kentapay/collect.js,
    // which is what actually enforces this server-side regardless of what's shown here. Real
    // price is KSh 1,500. Revert both together once production checkout is confirmed working.
    price: 'KSh 5',
    rawPrice: 5,
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
