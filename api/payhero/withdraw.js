import {
  normalizePhone,
  generateTransactionId,
  payheroWithdraw,
  getSupabaseAdmin,
  getAuthenticatedUserId,
} from './_lib/payhero.js';

const MIN_WITHDRAWAL = 10;

/**
 * Lets a tipster withdraw their accumulated balance via PayHero M-Pesa B2C.
 */
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
    const amount = Math.round(requestedAmount);

    // Atomically claim balance
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
      const ack = await payheroWithdraw({ amount, phone: normalizedPhone, transactionId });
      const ref = ack?.reference || ack?.transaction_id || ack?.CheckoutRequestID;
      if (ref) {
        await supabase.from('payments').update({ cloud_packet_id: String(ref) }).eq('reference', transactionId);
      }
    } catch (disburseErr) {
      const reason = disburseErr instanceof Error ? disburseErr.message : 'Disburse request failed';
      console.error('PayHero withdrawal request failed:', disburseErr);
      await supabase.from('payments').update({
        status: 'FAILED',
        failure_message: reason,
      }).eq('reference', transactionId);
      await supabase.rpc('credit_tipster_balance', { p_tipster_id: userId, p_amount: amount });
      res.status(502).json({ error: `Failed to submit withdrawal (${reason}) — your balance has been restored.` });
      return;
    }

    res.status(200).json({ reference: transactionId, amount });
  } catch (err) {
    console.error('POST /api/payhero/withdraw failed:', err);
    res.status(502).json({ error: err instanceof Error ? err.message : 'Failed to process withdrawal' });
  }
}
