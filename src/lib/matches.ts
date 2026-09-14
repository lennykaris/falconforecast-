import type { Match, MatchDetail, StandingRow } from '../types/prediction';

/** Fetches only genuinely upcoming fixtures — used when posting a tip, since you can't post
 * odds on a match that's already finished. */
export async function fetchUpcomingMatches(): Promise<Match[]> {
  const res = await fetch('/api/matches');
  const data = await res.json().catch(() => ({ matches: [] }));
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to load matches');
  }
  const matches: Match[] = data.matches || [];
  return matches.filter(m => m.status === 'SCHEDULED' || m.status === 'TIMED');
}

/** Fetches matches across a date range regardless of status (finished, live, upcoming) — used
 * for the real-time scores view on the matches page. Defaults to yesterday..+10 days server-side. */
export async function fetchMatches(params?: { dateFrom?: string; dateTo?: string }): Promise<Match[]> {
  const qs = new URLSearchParams();
  if (params?.dateFrom) qs.set('dateFrom', params.dateFrom);
  if (params?.dateTo) qs.set('dateTo', params.dateTo);
  const res = await fetch(`/api/matches${qs.toString() ? `?${qs}` : ''}`);
  const data = await res.json().catch(() => ({ matches: [] }));
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to load matches');
  }
  return data.matches || [];
}

/** Fetches the current league table for one of our internal competition codes (e.g. 'PL'). */
export async function fetchStandings(competitionCode: string): Promise<StandingRow[]> {
  const res = await fetch(`/api/standings?competition=${encodeURIComponent(competitionCode)}`);
  const data = await res.json().catch(() => ({ standings: [] }));
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to load standings');
  }
  return data.standings || [];
}

/** Fetches one match's full detail — live stats (possession, shots, corners, cards, fouls...)
 * and the incidents timeline (goals, cards, subs) — for the match detail modal. */
export async function fetchMatchDetail(id: string): Promise<MatchDetail> {
  const res = await fetch(`/api/match-detail?id=${encodeURIComponent(id)}`);
  const data = await res.json().catch(() => ({ match: null }));
  if (!res.ok || !data.match) {
    throw new Error(data?.error || 'Failed to load match detail');
  }
  return data.match;
}
