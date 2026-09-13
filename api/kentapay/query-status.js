import { getSupabaseAdmin, kentapayQueryStatus } from './_lib/kentapay.js';
import { resolvePayment } from './_lib/resolvePayment.js';

// How long a payment must have been PENDING before we bother querying it — Kentapay's own
// docs recommend waiting ~5 minutes after the original request for the status to settle.
const MIN_AGE_MS = 5 * 60 * 1000;
const BATCH_SIZE = 20;

/** Reconciliation fallback for payments whose callback never arrived (registered callback
 * URL misconfigured, a dropped webhook, etc.). Not user-facing — call it from a Vercel Cron
 * job (see vercel.json) or trigger manually, authenticated with KENTAPAY_CRON_SECRET rather
 * than a user session. */
export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  const expectedSecret = process.env.KENTAPAY_CRON_SECRET;
  const providedSecret = req.headers['x-cron-secret'] || req.query?.secret;
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
      const data = await kentapayQueryStatus({ transactionId: payment.reference });
      const status = data?.status;

      // 16 = pending on provider, 96/99 = gateway-side failure unrelated to the transaction
      // itself — per Kentapay's guidance, leave these PENDING rather than reversing/crediting.
      if (status === '16' || status === '96' || status === '99') {
        results.push({ reference: payment.reference, action: 'left-pending', status });
        continue;
      }

      await resolvePayment(supabase, payment, {
        success: status === '00',
        receiptNumber: data?.billerResponse || null,
        failureMessage: data?.statusDescription || 'Payment failed',
      });
      results.push({ reference: payment.reference, action: status === '00' ? 'completed' : 'failed', status });
    } catch (err) {
      console.error(`Kentapay query-status: failed to resolve ${payment.reference}:`, err);
      results.push({ reference: payment.reference, action: 'error', error: err instanceof Error ? err.message : String(err) });
    }
  }

  res.status(200).json({ checked: results.length, results });
}
