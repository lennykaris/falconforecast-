import { fetchUpcomingMatches } from './_lib/footballData.js';

export default async function handler(req, res) {
  try {
    const matches = await fetchUpcomingMatches({ days: 10 });
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json({ matches });
  } catch (err) {
    console.error('GET /api/matches failed:', err);
    res.status(502).json({ matches: [], error: err instanceof Error ? err.message : 'Failed to fetch matches' });
  }
}
