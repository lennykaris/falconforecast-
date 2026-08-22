import { fetchStandings } from './_lib/footballData.js';

export default async function handler(req, res) {
  const code = (req.query || {}).competition;
  if (!code) {
    res.status(400).json({ standings: [], error: 'Missing competition query param' });
    return;
  }
  try {
    const standings = await fetchStandings(code);
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');
    res.status(200).json({ standings });
  } catch (err) {
    console.error('GET /api/standings failed:', err);
    res.status(502).json({ standings: [], error: err instanceof Error ? err.message : 'Failed to fetch standings' });
  }
}
