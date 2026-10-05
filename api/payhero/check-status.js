import { getSupabaseAdmin, getAuthenticatedUserId, payheroQueryStatus } from './_lib/payhero.js';
import { resolvePayment } from './_lib/resolvePayment.js';

const MIN_CHECK_AGE_MS = 10 * 1000;

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
      res.status(200).json({ status: 'PENDING' });
      return;
    }

    const data = await payheroQueryStatus({ reference: payment.reference });
    const status = String(data?.status || '').toUpperCase();

    if (status === 'QUEUED') {
      res.status(200).json({ status: 'PENDING' });
      return;
    }

    const isSuccess = status === 'SUCCESS' || data?.success === true;
    const receiptNumber = data?.provider_reference || data?.third_party_reference || null;
    const failureMessage = data?.failure_reason || data?.message || 'Payment failed';

    await resolvePayment(supabase, payment, {
      success: isSuccess,
      receiptNumber,
      failureMessage: isSuccess ? null : failureMessage,
    });

    res.status(200).json({
      status: isSuccess ? 'COMPLETE' : 'FAILED',
      failureMessage: isSuccess ? null : failureMessage,
    });
  } catch (err) {
    console.error('POST /api/payhero/check-status failed:', err);
    res.status(502).json({ error: 'Could not check payment status right now' });
  }
}
