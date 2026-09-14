const BASE_URL = 'https://api.sportsrc.org/v2/';

// SportSRC returns full league names — often with a season sponsor prefix that can change
// year to year (e.g. "Liga Portugal Betclic", "VriendenLoterij Eredivisie") — rather than the
// stable short codes football-data.org used, so each competition is matched by predicate +
// country instead of a single string. `standingId` is SportSRC's internal numeric league id,
// needed for the standings endpoint; SportSRC has no public "list leagues" endpoint to look
// these up, so they were extracted by decoding the base64 filename in each league's `logo`
// URL (which reads as `league:<id>:<hash>`) against a real API response and hardcoded here.
// Re-derive the same way if a competition's standings ever start 404ing.
const COMPETITIONS = [
  { code: 'PL', country: 'England', standingId: 17, match: (n) => n === 'Premier League' },
  { code: 'ELC', country: 'England', standingId: 18, match: (n) => n === 'Championship' },
  { code: 'DED', country: 'Netherlands', standingId: 37, match: (n) => n.includes('Eredivisie') && !/vrouwen/i.test(n) },
  { code: 'PPL', country: 'Portugal', standingId: 238, match: (n) => n.startsWith('Liga Portugal') && !n.includes('2') },
  { code: 'PD', country: 'Spain', standingId: 8, match: (n) => n === 'LaLiga' || n === 'La Liga' },
  { code: 'FL1', country: 'France', standingId: 34, match: (n) => n === 'Ligue 1' },
  { code: 'SA', country: 'Italy', standingId: 23, match: (n) => n === 'Serie A' },
  { code: 'BSA', country: 'Brazil', standingId: 325, match: (n) => n.startsWith('Brasileirão') && !n.includes('Série B') },
  // Supported here but not yet in src/pages/HomePage.tsx's LEAGUE_CODE_MAP — that was a real
  // football-data.org free-tier limitation that no longer applies under SportSRC; add them to
  // the frontend switcher whenever that's wanted.
  { code: 'BL1', country: 'Germany', standingId: 35, match: (n) => n === 'Bundesliga' },
  { code: 'CL', country: 'Europe', standingId: 7, match: (n) => n === 'UEFA Champions League' },
];

function findCompetition(leagueName, country) {
  return COMPETITIONS.find((c) => c.country === country && c.match(leagueName || ''));
}

function apiKey() {
  const key = process.env.SPORTSRC_API_KEY;
  if (!key) throw new Error('SPORTSRC_API_KEY is not configured on the server');
  return key;
}

async function sportsrcGet(params) {
  const url = new URL(BASE_URL);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { 'X-API-KEY': apiKey() } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) {
    throw new Error(data?.message || data?.error || `SportSRC error ${res.status}`);
  }
  return data;
}

/** Maps SportSRC's per-match status to the same status values football-data.org used, which
 * the frontend (HomePage, LandingPage, Navbar) already switches on — so nothing downstream
 * of /api/matches needed to change for this provider swap. SportSRC folds "half time" into
 * `status_detail` text rather than its own status value, hence the regex check. */
function mapStatus(status, statusDetail) {
  switch (status) {
    case 'notstarted': return 'SCHEDULED';
    case 'inprogress': return /half.?time/i.test(statusDetail || '') ? 'PAUSED' : 'IN_PLAY';
    case 'finished': return 'FINISHED';
    case 'postponed': return 'POSTPONED';
    case 'cancelled': return 'CANCELLED';
    case 'suspended': return 'SUSPENDED';
    default: return 'SCHEDULED';
  }
}

/** Fetches matches (any status — finished, live, upcoming) across a date range and maps them
 * to a compact shape, including real scores where available. Defaults to yesterday..+8 days
 * (a 9-day span) so a single call covers recent results, anything live right now, and upcoming
 * fixtures. Unlike football-data.org, SportSRC's `matches` endpoint takes a single `date`, not
 * a range, so the window is fetched as one call per day and merged. */
export async function fetchMatches({ dateFrom, dateTo } = {}) {
  const from = dateFrom || new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const to = dateTo || new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const dates = [];
  const fromMs = new Date(`${from}T00:00:00Z`).getTime();
  const toMs = new Date(`${to}T00:00:00Z`).getTime();
  for (let t = fromMs; t <= toMs; t += 24 * 60 * 60 * 1000) {
    dates.push(new Date(t).toISOString().slice(0, 10));
  }

  const days = await Promise.all(dates.map((date) =>
    sportsrcGet({ type: 'matches', sport: 'football', date }).catch((err) => {
      console.error(`SportSRC matches fetch failed for ${date}:`, err);
      return { data: [] };
    })
  ));

  const matches = [];
  for (const day of days) {
    for (const leagueBlock of day.data || []) {
      const competition = findCompetition(leagueBlock.league?.name, leagueBlock.league?.country);
      if (!competition) continue;
      for (const m of leagueBlock.matches || []) {
        const status = mapStatus(m.status, m.status_detail);
        const played = status === 'FINISHED' || status === 'IN_PLAY' || status === 'PAUSED';
        matches.push({
          id: String(m.id),
          league: leagueBlock.league?.name || competition.code,
          leagueCode: competition.code,
          homeTeam: m.teams?.home?.name || 'TBD',
          awayTeam: m.teams?.away?.name || 'TBD',
          homeTla: m.teams?.home?.code || undefined,
          awayTla: m.teams?.away?.code || undefined,
          kickoff: new Date(m.timestamp).toISOString(),
          status,
          // SportSRC reports 0-0 as a placeholder for matches that haven't kicked off yet —
          // only trust the score once the match has actually started.
          homeScore: played ? m.score?.current?.home ?? null : null,
          awayScore: played ? m.score?.current?.away ?? null : null,
          homeLogo: m.teams?.home?.badge || undefined,
          awayLogo: m.teams?.away?.badge || undefined,
        });
      }
    }
  }

  return matches.sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
}

/** Fetches the current league table for one of FalconForecast's internal competition codes
 * (e.g. 'PL', 'PD', 'SA' — see COMPETITIONS above, not a SportSRC-native id). */
export async function fetchStandings(competitionCode) {
  const competition = COMPETITIONS.find((c) => c.code === competitionCode);
  if (!competition) throw new Error(`Unknown competition code: ${competitionCode}`);

  const data = await sportsrcGet({ type: 'standing', league_id: competition.standingId });
  const table = data?.data?.table || [];

  return table.map((row) => ({
    position: row.position,
    team: row.team?.name || row.team?.short_name || 'Unknown',
    crest: row.team?.badge || undefined,
    played: row.stats?.played,
    won: row.stats?.wins,
    draw: row.stats?.draws,
    lost: row.stats?.losses,
    points: row.stats?.points,
    // SportSRC's standing endpoint doesn't include a recent-form strip — the frontend
    // already renders an empty-state when this is [].
    form: [],
  }));
}
