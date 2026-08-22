import type { User } from '../types/prediction';

export const ALL_LEAGUES = [
  'Premier League',
  'La Liga',
  'Serie A',
  'Bundesliga',
  'Champions League',
  'Europa League',
  'Ligue 1',
  'Eredivisie',
];

export const ALL_MARKETS = [
  'Accumulators',
  'Over 2.5',
  'BTTS',
  'Asian Handicap',
  'Draw No Bet',
  'Correct Score',
  'First Goal Scorer',
  'In-Play / Live',
];

/** Real tipsters are loaded from Supabase `profiles` at runtime (see TipstersContext). Starts empty so
 * a freshly-deployed or emptied platform never shows placeholder tipsters as if they were real ones. */
export const INITIAL_TIPSTERS: User[] = [];

