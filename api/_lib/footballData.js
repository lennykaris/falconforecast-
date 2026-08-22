const BASE_URL = 'https://api.football-data.org/v4';

// football-data.org free tier only covers these competitions (TIER_ONE access).
const SUPPORTED_COMPETITIONS = ['PL', 'ELC', 'DED', 'PPL', 'PD', 'FL1', 'SA', 'BSA'];

function authHeaders() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    throw new Error('FOOTBALL_DATA_API_KEY is not configured on the server');
  }
  return { 'X-Auth-Token': apiKey };
}

/** Fetches matches (any status — finished, live, upcoming) across a date range and maps them
 * to a compact shape, including real scores where available. Defaults to yesterday..+8 days
 * (a 9-day span) so a single call covers recent results, anything live right now, and upcoming
 * fixtures — football-data.org rejects any range over 10 days. */
export async function fetchMatches({ dateFrom, dateTo } = {}) {
  const from = dateFrom || new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const to = dateTo || new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const url = `${BASE_URL}/matches?dateFrom=${from}&dateTo=${to}`;
  const res = await fetch(url, { headers: authHeaders() });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`football-data.org error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const matches = (data.matches || [])
    .filter((m) => SUPPORTED_COMPETITIONS.includes(m.competition?.code))
    .map((m) => ({
      id: String(m.id),
      league: m.competition?.name || 'Football',
      leagueCode: m.competition?.code,
      homeTeam: m.homeTeam?.name || m.homeTeam?.shortName || 'TBD',
      awayTeam: m.awayTeam?.name || m.awayTeam?.shortName || 'TBD',
      homeTla: m.homeTeam?.tla || undefined,
      awayTla: m.awayTeam?.tla || undefined,
      kickoff: m.utcDate,
      status: m.status,
      homeScore: m.score?.fullTime?.home ?? null,
      awayScore: m.score?.fullTime?.away ?? null,
      homeLogo: m.homeTeam?.crest || undefined,
      awayLogo: m.awayTeam?.crest || undefined,
    }))
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());

  return matches;
}

/** Fetches only genuinely upcoming fixtures (used when posting a tip — you can't post odds on
 * a finished game). Kept separate from fetchMatches so tip-posting flows never see stale results. */
export async function fetchUpcomingMatches({ days = 10 } = {}) {
  const all = await fetchMatches({
    dateFrom: new Date().toISOString().slice(0, 10),
    dateTo: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });
  return all.filter((m) => m.status === 'SCHEDULED' || m.status === 'TIMED');
}

/** Fetches the current league table for one competition (e.g. 'PL', 'PD', 'SA'). Not every
 * competition FalconForecast lists is on the free tier — callers should handle a thrown error
 * as "standings unavailable for this competition" rather than a hard failure. */
export async function fetchStandings(competitionCode) {
  const url = `${BASE_URL}/competitions/${competitionCode}/standings`;
  const res = await fetch(url, { headers: authHeaders() });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`football-data.org error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const totalTable = (data.standings || []).find((s) => s.type === 'TOTAL')?.table || [];

  return totalTable.map((row) => ({
    position: row.position,
    team: row.team?.name || row.team?.shortName || 'Unknown',
    crest: row.team?.crest || undefined,
    played: row.playedGames,
    won: row.won,
    draw: row.draw,
    lost: row.lost,
    points: row.points,
    form: Array.isArray(row.form) ? row.form : (row.form ? String(row.form).split(',') : []),
  }));
}
