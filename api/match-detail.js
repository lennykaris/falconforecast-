import { fetchMatchDetail } from './_lib/sportsrc.js';

export default async function handler(req, res) {
  const id = (req.query || {}).id;
  if (!id) {
    res.status(400).json({ error: 'Missing id query param' });
    return;
  }
  try {
    const match = await fetchMatchDetail(id);
    // Short cache — live matches want fresh stats, but this still saves duplicate origin
    // calls from multiple viewers polling the same match within a few seconds of each other.
    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=45');
    res.status(200).json({ match });
  } catch (err) {
    console.error('GET /api/match-detail failed:', err);
    res.status(502).json({ match: null, error: err instanceof Error ? err.message : 'Failed to fetch match detail' });
  }
}
