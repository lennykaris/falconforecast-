import {
  normalizePhone,
  generateTransactionId,
  kentapayB2C,
  extractCloudPacketId,
  getSupabaseAdmin,
  getAuthenticatedUserId,
} from './_lib/kentapay.js';

/** Lets a tipster cash out their accumulated balance (see resolvePayment.js — subscription
 * payments credit `profiles.balance` instead of disbursing instantly) via a real M-Pesa B2C
 * payout, on their own schedule. Always withdraws the full available balance — a single-click
 * action, no amount field, no partial-withdrawal bookkeeping to get wrong. */
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

    const amount = balance;

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
      console.error('Withdrawal B2C request failed to submit:', disburseErr);
      await supabase.from('payments').update({
        status: 'FAILED',
        failure_message: disburseErr instanceof Error ? disburseErr.message : 'Disburse request failed',
      }).eq('reference', transactionId);
      await supabase.rpc('credit_tipster_balance', { p_tipster_id: userId, p_amount: amount });
      res.status(502).json({ error: 'Failed to submit withdrawal — your balance has been restored.' });
      return;
    }

    res.status(200).json({ reference: transactionId, amount });
  } catch (err) {
    console.error('POST /api/kentapay/withdraw failed:', err);
    res.status(502).json({ error: err instanceof Error ? err.message : 'Failed to process withdrawal' });
  }
}
