const BASE_URL = 'https://api.football-data.org/v4';

// football-data.org free tier only covers these competitions (TIER_ONE access).
const SUPPORTED_COMPETITIONS = ['PL', 'ELC', 'DED', 'PPL', 'PD', 'FL1', 'SA', 'BSA'];

/** Fetches upcoming scheduled matches from football-data.org and maps them to a compact shape. */
export async function fetchUpcomingMatches({ days = 10 } = {}) {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    throw new Error('FOOTBALL_DATA_API_KEY is not configured on the server');
  }

  const dateFrom = new Date().toISOString().slice(0, 10);
  const dateTo = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const url = `${BASE_URL}/matches?status=SCHEDULED&dateFrom=${dateFrom}&dateTo=${dateTo}`;
  const res = await fetch(url, { headers: { 'X-Auth-Token': apiKey } });

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
      homeTeam: m.homeTeam?.name || m.homeTeam?.shortName || 'TBD',
      awayTeam: m.awayTeam?.name || m.awayTeam?.shortName || 'TBD',
      kickoff: m.utcDate,
      homeLogo: m.homeTeam?.crest || undefined,
      awayLogo: m.awayTeam?.crest || undefined,
    }))
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());

  return matches;
}
