import { getSupabaseAdmin, payheroQueryStatus } from './_lib/payhero.js';
import { resolvePayment } from './_lib/resolvePayment.js';

const MIN_AGE_MS = 5 * 60 * 1000;
const BATCH_SIZE = 20;

/**
 * Reconciliation cron job for PayHero payments whose callback never arrived.
 * Triggered by Vercel Cron or manual request with Bearer secret.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  const expectedSecret = process.env.PAYHERO_CRON_SECRET || process.env.CRON_SECRET || process.env.KENTAPAY_CRON_SECRET;
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

  const cutoff = new Date(Date.now() - MIN_AGE_MS).toISOString();
  const { data: pending, error } = await supabase
    .from('payments')
    .select('*')
    .eq('status', 'PENDING')
    .lt('created_at', cutoff)
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const results = [];
  for (const payment of pending || []) {
    try {
      const data = await payheroQueryStatus({ reference: payment.reference });
      const status = String(data?.status || '').toUpperCase();

      if (status === 'QUEUED') {
        results.push({ reference: payment.reference, action: 'left-pending', status });
        continue;
      }

      const isSuccess = status === 'SUCCESS' || data?.success === true;
      const receiptNumber = data?.provider_reference || data?.third_party_reference || null;
      const failureMessage = data?.failure_reason || data?.message || 'Payment failed';

      await resolvePayment(supabase, payment, {
        success: isSuccess,
        receiptNumber,
        failureMessage: isSuccess ? null : failureMessage,
      });

      results.push({ reference: payment.reference, action: isSuccess ? 'completed' : 'failed', status });
    } catch (err) {
      console.error(`PayHero query-status: failed to resolve ${payment.reference}:`, err);
      results.push({ reference: payment.reference, action: 'error', error: err instanceof Error ? err.message : String(err) });
    }
  }

  res.status(200).json({ checked: results.length, results });
}
