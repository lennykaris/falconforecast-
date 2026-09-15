import { fetchStandings, fetchStandingsByMatchId } from './_lib/sportsrc.js';

export default async function handler(req, res) {
  const { competition, matchId } = req.query || {};
  if (!competition && !matchId) {
    res.status(400).json({ standings: [], error: 'Missing competition or matchId query param' });
    return;
  }
  try {
    // matchId covers any league at all (see fetchStandingsByMatchId); competition is the
    // older, curated-only path — kept since existing callers (the popular-leagues switcher)
    // already use it and it needs no match id on hand.
    const standings = matchId ? await fetchStandingsByMatchId(matchId) : await fetchStandings(competition);
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');
    res.status(200).json({ standings });
  } catch (err) {
    console.error('GET /api/standings failed:', err);
    res.status(502).json({ standings: [], error: err instanceof Error ? err.message : 'Failed to fetch standings' });
  }
}
