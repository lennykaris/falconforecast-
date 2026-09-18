import {
  normalizePhone,
  generateTransactionId,
  kentapayB2C,
  extractCloudPacketId,
  getSupabaseAdmin,
  getAuthenticatedUserId,
} from './_lib/kentapay.js';

// Safaricom's B2C payout has a documented KES 10 minimum — anything below that is rejected
// on their end regardless of what Kentapay does with it, so it's rejected here first with a
// real explanation instead of a confusing Kentapay-side failure later.
const MIN_WITHDRAWAL = 10;

/** Lets a tipster cash out some or all of their accumulated balance (see resolvePayment.js —
 * subscription payments credit `profiles.balance` instead of disbursing instantly) via a real
 * M-Pesa B2C payout, on their own schedule. The client-supplied amount is never trusted
 * outright — claim_tipster_balance's atomic `balance >= p_amount` check below is what
 * actually enforces it can't exceed the real balance, not this validation. */
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

    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('role, balance, mpesa_phone')
      .eq('id', userId)
      .maybeSingle();
    if (pErr) throw pErr;
    if (!profile || (profile.role !== 'tipster' && profile.role !== 'admin')) {
      res.status(403).json({ error: 'Only tipsters can withdraw' });
      return;
    }

    const balance = Number(profile.balance || 0);
    if (balance <= 0) {
      res.status(400).json({ error: 'Nothing to withdraw yet' });
      return;
    }

    const normalizedPhone = profile.mpesa_phone ? normalizePhone(profile.mpesa_phone) : null;
    if (!normalizedPhone) {
      res.status(400).json({ error: 'Add your M-Pesa payout number first, under My Pricing.' });
      return;
    }

    // Requested amount defaults to the full balance (the old always-withdraw-everything
    // behavior) when the client omits it, so nothing else calling this endpoint breaks.
    const requestedAmount = req.body?.amount != null ? Number(req.body.amount) : balance;
    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      res.status(400).json({ error: 'Enter a valid amount to withdraw' });
      return;
    }
    if (requestedAmount < MIN_WITHDRAWAL) {
      res.status(400).json({ error: `Minimum withdrawal is KSh ${MIN_WITHDRAWAL}` });
      return;
    }
    if (requestedAmount > balance) {
      res.status(400).json({ error: `You only have KSh ${balance.toLocaleString()} available` });
      return;
    }
    // Round to the nearest shilling — Kentapay's B2C body sends amount as a whole-number
    // string (see kentapayB2C), so a fractional request would be silently truncated there
    // anyway; doing it here keeps the claimed/inserted/sent amount all consistent.
    const amount = Math.round(requestedAmount);

    // Atomic `balance = balance - amount WHERE balance >= amount` — a single UPDATE statement,
    // not a read-then-write from here, so two withdrawal clicks in quick succession (a
    // double-tap, or a retried request) can't both succeed against the same balance.
    const { data: claimed, error: claimErr } = await supabase.rpc('claim_tipster_balance', {
      p_tipster_id: userId,
      p_amount: amount,
    });
    if (claimErr) throw claimErr;
    if (!claimed) {
      res.status(409).json({ error: 'Your balance just changed — please try again.' });
      return;
    }

    const transactionId = generateTransactionId();

    const { error: insertErr } = await supabase.from('payments').insert([{
      reference: transactionId,
      type: 'disburse',
      kind: 'tipster_payout',
      tipster_id: userId,
      amount,
      phone: normalizedPhone,
      status: 'PENDING',
    }]);
    if (insertErr) throw insertErr;

    try {
      const ack = await kentapayB2C({ amount, phone: normalizedPhone, transactionId });
      const cloudPacketId = extractCloudPacketId(ack);
      if (cloudPacketId) {
        await supabase.from('payments').update({ cloud_packet_id: cloudPacketId }).eq('reference', transactionId);
      } else {
        console.warn(`Kentapay withdraw: no cloudPacketID in acknowledgement for ${transactionId}`);
      }
    } catch (disburseErr) {
      // The claim already deducted the balance — give it back, since nothing was actually
      // paid out.
      const reason = disburseErr instanceof Error ? disburseErr.message : 'Disburse request failed';
      console.error('Withdrawal B2C request failed to submit:', disburseErr);
      await supabase.from('payments').update({
        status: 'FAILED',
        failure_message: reason,
      }).eq('reference', transactionId);
      await supabase.rpc('credit_tipster_balance', { p_tipster_id: userId, p_amount: amount });
      // Surfaces the real Kentapay error (e.g. a bad B2C service id, an auth failure, a
      // sandbox-specific rejection) instead of a generic message — this endpoint isn't
      // exposing anything a legitimate withdrawing tipster shouldn't already be able to see
      // about their own attempted payout, and a vague message here was actively unhelpful
      // for diagnosing why real withdrawals were failing.
      res.status(502).json({ error: `Failed to submit withdrawal (${reason}) — your balance has been restored.` });
      return;
    }

    res.status(200).json({ reference: transactionId, amount });
  } catch (err) {
    console.error('POST /api/kentapay/withdraw failed:', err);
    res.status(502).json({ error: err instanceof Error ? err.message : 'Failed to process withdrawal' });
  }
}
