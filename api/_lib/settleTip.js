/** Determines whether a tip won, lost, or pushed (void) against the real final score of the
 * match it was placed on. Only understands the fixed set of markets in
 * src/data/predictions.ts's MARKET_OPTIONS — tipsters and admins can only pick from that list
 * (not free text) specifically so every tip is settleable this way. Returns null for a market
 * this doesn't recognize (e.g. a legacy free-text tip from before that restriction existed),
 * which the caller should leave for manual settlement rather than guessing.
 *
 * Asian Handicap here is always applied to the home team (the option is a single fixed
 * "Asian Handicap -1.0" with no team selector yet) — a real limitation, not an oversight;
 * extend this if that market ever gets a team/line picker. */
export function settleTip(tip, homeScore, awayScore) {
  if (homeScore == null || awayScore == null) return null;
  const totalGoals = homeScore + awayScore;

  switch (tip) {
    case 'Over 2.5 Goals':
      return totalGoals > 2.5 ? 'won' : 'lost';
    case 'Home Win (1X2)':
      return homeScore > awayScore ? 'won' : 'lost';
    case 'Away Win (1X2)':
      return awayScore > homeScore ? 'won' : 'lost';
    case 'Both Teams to Score (BTTS)':
      return homeScore > 0 && awayScore > 0 ? 'won' : 'lost';
    case 'Asian Handicap -1.0': {
      const adjustedHome = homeScore - 1;
      if (adjustedHome > awayScore) return 'won';
      if (adjustedHome === awayScore) return 'void'; // push — stake returned, not a loss
      return 'lost';
    }
    default:
      return null;
  }
}
