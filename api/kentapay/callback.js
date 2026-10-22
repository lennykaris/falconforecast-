import { getSupabaseAdmin, verifyCallbackHash } from './_lib/kentapay.js';
import { resolvePayment } from './_lib/resolvePayment.js';

// Kentapay's ack shape for callbacks it should stop retrying (mirrors the exact format its
// own M-PESA B2C docs show as "Your Response to Final Callback").
const ACK_OK = { STATUS: '00', MESSAGE: 'Success' };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const body = req.body || {};

  // Not a transaction result we recognize — ack so Kentapay stops retrying, nothing to act
  // on. Checked for undefined/null explicitly, not falsy — Kentapay's success code can come
  // back as the number 0 as well as the string '00' (kentapay.js's own status checks already
  // guard against this same dual representation), and `!0` is true, so a plain `!body.status`
  // check here would silently discard a genuinely successful callback.
  if (body.status === undefined || body.status === null || !body.transactionID) {
    res.status(200).json(ACK_OK);
    return;
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error('Kentapay callback: Supabase admin client unavailable:', err);
    res.status(500).json({ error: 'Server not configured' });
    return;
  }

  try {
    const { data: payment, error: findErr } = await supabase
      .from('payments')
      .select('*')
      .eq('reference', body.transactionID)
      .maybeSingle();

    if (findErr) throw findErr; // transient DB error — let Kentapay retry

    if (!payment) {
      // Unrecognized reference — ack so Kentapay stops retrying, nothing to act on.
      console.warn('Kentapay callback: no payment found for transactionID', body.transactionID);
      res.status(200).json(ACK_OK);
      return;
    }

    if (payment.status !== 'PENDING') {
      // Already resolved — idempotent no-op (Kentapay doesn't guarantee exactly-once delivery).
      res.status(200).json(ACK_OK);
      return;
    }

    const hashOk = verifyCallbackHash({
      transactionId: body.transactionID,
      destinationAccountNo: body.destinationAccountNo,
      amount: body.amount,
      cloudPacketId: payment.cloud_packet_id,
      hash: body.HASH,
    });
    if (!hashOk) {
      // Ack so Kentapay stops retrying a request we won't ever accept, but never act on it —
      // and never leak which part of the check failed.
      console.warn('Kentapay callback: HASH verification failed for transactionID', body.transactionID);
      res.status(200).json(ACK_OK);
      return;
    }

    await resolvePayment(supabase, payment, {
      // Same numeric-vs-string success code as above.
      success: String(body.status) === '00',
      receiptNumber: body.billerResponse || null,
      failureMessage: body.statusDescription || body.billerResponse || 'Payment failed',
    });

    res.status(200).json(ACK_OK);
  } catch (err) {
    console.error('POST /api/kentapay/callback failed:', err);
    // The only path that returns non-2xx — a genuine unexpected error where we DO want a retry.
    res.status(500).json({ error: 'Internal error' });
  }
}
