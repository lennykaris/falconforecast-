import { createClient } from '@supabase/supabase-js';
import { fetchMatchDetail } from './_lib/sportsrc.js';
import { settleTip } from './_lib/settleTip.js';

const BATCH_SIZE = 25;

function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('VITE_SUPABASE_URL is not configured on the server');
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured on the server');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

/** Auto-settles predictions once their match has finished: pulls the real final score from
 * SportSRC and marks the tip won/lost/void by comparing it against the market the tip was
 * placed on (api/_lib/settleTip.js). Updating `status` fires the recompute_tipster_win_rate
 * trigger in supabase_schema.sql, which is what actually keeps profiles.win_rate honest —
 * this endpoint is the only thing that ever settles a prediction automatically; a tipster or
 * admin manually marking one won/lost is still possible (kept as a fallback for legacy
 * free-text tips and any market this doesn't recognize) but no longer the only way a
 * prediction with a real match_id gets resolved.
 *
 * Not user-facing — call it from a Vercel Cron job (see vercel.json) or trigger manually,
 * authenticated with CRON_SECRET rather than a user session (same shared secret Vercel Cron
 * itself sends automatically — see api/kentapay/query-status.js for the identical pattern). */
export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  const expectedSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization || '';
  const bearerSecret = authHeader.replace(/^Bearer\s+/i, '');
  const providedSecret = req.headers['x-cron-secret'] || req.query?.secret || bearerSecret;
  if (!expectedSecret || providedSecret !== expectedSecret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    res.status(503).json({ error: err instanceof Error ? err.message : 'Server not configured' });
    return;
  }

  const { data: pending, error } = await supabase
    .from('predictions')
    .select('id, tip, match_id')
    .eq('status', 'pending')
    .not('match_id', 'is', null)
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const results = [];
  for (const prediction of pending || []) {
    try {
      const match = await fetchMatchDetail(prediction.match_id);

      if (match.status !== 'FINISHED') {
        results.push({ id: prediction.id, action: 'not-finished' });
        continue;
      }

      const outcome = settleTip(prediction.tip, match.homeScore, match.awayScore);
      if (!outcome) {
        // A market settleTip doesn't recognize (e.g. a legacy free-text tip) — leave pending
        // for manual settlement rather than guessing.
        results.push({ id: prediction.id, action: 'unrecognized-market' });
        continue;
      }

      const { error: updateErr } = await supabase
        .from('predictions')
        .update({ status: outcome, result: match.homeScore + '-' + match.awayScore })
        .eq('id', prediction.id)
        .eq('status', 'pending'); // only settle once, even if this batch is somehow re-run
      if (updateErr) throw updateErr;

      results.push({ id: prediction.id, action: 'settled', outcome, score: `${match.homeScore}-${match.awayScore}` });
    } catch (err) {
      console.error(`settle-predictions: failed to settle ${prediction.id}:`, err);
      results.push({ id: prediction.id, action: 'error', error: err instanceof Error ? err.message : String(err) });
    }
  }

  res.status(200).json({ checked: results.length, results });
}
