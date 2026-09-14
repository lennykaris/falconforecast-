import { fetchMatches } from './_lib/sportsrc.js';

export default async function handler(req, res) {
  try {
    const { dateFrom, dateTo } = req.query || {};
    const matches = await fetchMatches({ dateFrom, dateTo });
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
    res.status(200).json({ matches });
  } catch (err) {
    console.error('GET /api/matches failed:', err);
    res.status(502).json({ matches: [], error: err instanceof Error ? err.message : 'Failed to fetch matches' });
  }
}
