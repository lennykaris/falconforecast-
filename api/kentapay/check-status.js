import { getSupabaseAdmin, getAuthenticatedUserId, kentapayQueryStatus } from './_lib/kentapay.js';
import { resolvePayment } from './_lib/resolvePayment.js';

// Kentapay's push callback isn't reliable in practice (see api/kentapay/callback.js — it
// depends on a cloudPacketID that doesn't always come back, and the callback itself doesn't
// always arrive at all), and the reconciliation cron only runs once a day — Vercel's Hobby
// plan caps cron jobs to once per day, so there's no tightening that schedule without
// upgrading. This endpoint lets the frontend actively ask Kentapay for the real status of
// ONE specific payment while the user is still waiting, instead of a PENDING row only ever
// getting resolved by a push that may never come. See src/lib/payments.ts's pollPaymentStatus.
const MIN_CHECK_AGE_MS = 15 * 1000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    res.status(503).json({ error: err instanceof Error ? err.message : 'Payments are not configured yet' });
    return;
  }

  try {
    const userId = await getAuthenticatedUserId(req, supabase);
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { reference } = req.body || {};
    if (!reference) {
      res.status(400).json({ error: 'Missing reference' });
      return;
    }

    const { data: payment, error: findErr } = await supabase
      .from('payments')
      .select('*')
      .eq('reference', reference)
      .maybeSingle();
    if (findErr) throw findErr;
    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    // Ownership check — never let one user force a Kentapay lookup (and thus resolve/credit)
    // on another user's payment. A collect belongs to the paying user; a disburse belongs to
    // the withdrawing tipster. Admins can check any payment — same visibility they already
    // have over the full `payments` table in the admin dashboard.
    const isAdmin = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle()
      .then(({ data }) => data?.role === 'admin');
    const owns = payment.user_id === userId || payment.tipster_id === userId;
    if (!owns && !isAdmin) {
      res.status(403).json({ error: 'Not your payment' });
      return;
    }

    if (payment.status !== 'PENDING') {
      res.status(200).json({ status: payment.status, failureMessage: payment.failure_message || null });
      return;
    }

    if (Date.now() - new Date(payment.created_at).getTime() < MIN_CHECK_AGE_MS) {
      // Too soon to mean anything — M-Pesa hasn't had a realistic chance to settle yet.
      res.status(200).json({ status: 'PENDING' });
      return;
    }

    const data = await kentapayQueryStatus({ transactionId: payment.reference });
    const status = String(data?.status);

    // 16 = pending on provider, 96/99 = gateway-side hiccup unrelated to this transaction
    // itself — same guidance the reconciliation cron (query-status.js) already follows:
    // leave PENDING rather than wrongly resolving it either way.
    if (status === '16' || status === '96' || status === '99') {
      res.status(200).json({ status: 'PENDING' });
      return;
    }

    await resolvePayment(supabase, payment, {
      success: status === '00',
      receiptNumber: data?.billerResponse || null,
      failureMessage: data?.statusDescription || 'Payment failed',
    });

    res.status(200).json({
      status: status === '00' ? 'COMPLETE' : 'FAILED',
      failureMessage: status === '00' ? null : (data?.statusDescription || 'Payment failed'),
    });
  } catch (err) {
    console.error('POST /api/kentapay/check-status failed:', err);
    // Never surface a raw Kentapay error here — the caller's own poll/timeout handling
    // already has a sensible fallback; this endpoint failing just means the next poll tick
    // (or the nightly cron) gets another chance.
    res.status(502).json({ error: 'Could not check payment status right now' });
  }
}
