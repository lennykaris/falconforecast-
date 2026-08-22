import type { Match } from '../types/prediction';

/** Fetches real upcoming fixtures via the /api/matches proxy (keeps the football-data.org key server-side). */
export async function fetchUpcomingMatches(): Promise<Match[]> {
  const res = await fetch('/api/matches');
  const data = await res.json().catch(() => ({ matches: [] }));
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to load matches');
  }
  return data.matches || [];
}
