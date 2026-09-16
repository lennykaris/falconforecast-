// No Kentapay B2C imports here anymore — subscription payouts now credit a withdrawable
// balance instead of disbursing automatically; the actual B2C call happens in
// api/kentapay/withdraw.js when the tipster chooses to withdraw.

/** Atomically claims a PENDING payment row by writing to it only if it's still PENDING at
 * write time, returning whether this call actually won the claim. Guards against two
 * near-simultaneous resolutions of the same payment — e.g. a redelivered callback (Kentapay
 * doesn't guarantee exactly-once delivery) racing the reconciliation cron — both passing a
 * plain read-then-branch check before either has written anything. Without this, both callers
 * could proceed into subscription creation and credit a tipster's balance twice for one
 * collected payment. */
async function claimPayment(supabase, paymentId, fields) {
  const { data, error } = await supabase
    .from('payments')
    .update(fields)
    .eq('id', paymentId)
    .eq('status', 'PENDING')
    .select()
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

/** Applies the final outcome of a PENDING payment: marks it COMPLETE/FAILED, and on a
 * successful collect, activates whatever was being paid for (tipster subscription or VIP
 * plan) — a subscription's payment also credits the tipster's withdrawable balance, see
 * below. Shared between the callback handler (pushed by Kentapay) and the query-status
 * reconciliation job (pulled by us), so both routes credit a transaction exactly the same
 * way regardless of which one resolves it first.
 *
 * Caller must have already confirmed `payment.status === 'PENDING'` (a fast-path optimization
 * to skip obviously-already-resolved rows) and, for a pushed callback, verified the HASH —
 * this function does neither, but does re-verify PENDING atomically via claimPayment before
 * actually crediting anything, since the caller's own check can be stale by the time this
 * runs. */
export async function resolvePayment(supabase, payment, { success, receiptNumber, failureMessage }) {
  if (!success) {
    const claimed = await claimPayment(supabase, payment.id, {
      status: 'FAILED',
      failure_message: failureMessage || 'Payment failed',
      updated_at: new Date().toISOString(),
    });
    // A withdrawal that fails after the tipster's balance was already deducted (see
    // api/kentapay/withdraw.js) must give that amount back, or it simply vanishes — neither
    // paid out nor available to withdraw again.
    if (claimed && payment.type === 'disburse' && payment.kind === 'tipster_payout' && payment.tipster_id) {
      const { error: refundErr } = await supabase.rpc('credit_tipster_balance', {
        p_tipster_id: payment.tipster_id,
        p_amount: payment.amount,
      });
      if (refundErr) console.error(`Failed to refund balance for failed withdrawal ${payment.id}:`, refundErr);
    }
    return;
  }

  if (payment.type === 'disburse') {
    // A tipster payout — no further entitlement to grant, safe to just claim COMPLETE.
    await claimPayment(supabase, payment.id, {
      status: 'COMPLETE',
      receipt_number: receiptNumber || null,
      updated_at: new Date().toISOString(),
    });
    return;
  }

  // type === 'collect': grant the entitlement FIRST, while the row is still PENDING. If
  // anything below throws, the payment stays PENDING (never wrongly marked COMPLETE with
  // nothing actually granted) and can be retried by a redelivered callback or the
  // reconciliation cron.
  if (payment.kind === 'tipster_subscription') {
    const days = payment.billing_cycle === 'weekly' ? 7 : 30;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    const { data: newSub, error: subErr } = await supabase
      .from('tipster_subscriptions')
      .insert([{
        user_id: payment.user_id,
        tipster_id: payment.tipster_id,
        billing_cycle: payment.billing_cycle,
        status: 'active',
        price: payment.amount,
        platform_cut: payment.platform_cut,
        tipster_net: payment.tipster_net,
        expires_at: expiresAt,
      }])
      .select()
      .single();
    if (subErr) throw subErr;

    const claimed = await claimPayment(supabase, payment.id, {
      status: 'COMPLETE',
      receipt_number: receiptNumber || null,
      subscription_id: newSub.id,
      updated_at: new Date().toISOString(),
    });
    if (!claimed) {
      // Another process already resolved this payment between our initial read and now —
      // we've created a spare subscription row (the customer keeps it, a harmless extra
      // access period) but must NOT also fire a duplicate automatic payout below.
      console.warn(`Payment ${payment.id} was already resolved by another process — skipping payout to avoid a duplicate.`);
      return;
    }

    // Credit the tipster's withdrawable balance instead of disbursing immediately — this used
    // to fire an automatic M-Pesa B2C payout the instant a subscription was paid for, which
    // meant a tipster with no mpesa_phone on file simply lost that payout with no recovery
    // path ("needs manual payout", per the removed comment here — there was no such manual
    // path anywhere in the app). Now it accumulates in profiles.balance regardless, and the
    // tipster withdraws on their own schedule via the Withdraw button on their dashboard
    // (api/kentapay/withdraw.js) whenever they like, phone on file or not yet.
    //
    // Uses an RPC (a single atomic `balance = balance + amount` UPDATE) rather than a
    // read-then-write from here — two subscriptions completing for the same tipster at
    // nearly the same time would otherwise race and one credit could get lost.
    const { error: creditErr } = await supabase.rpc('credit_tipster_balance', {
      p_tipster_id: payment.tipster_id,
      p_amount: payment.tipster_net,
    });
    if (creditErr) {
      console.error(`Failed to credit balance for tipster ${payment.tipster_id} on payment ${payment.id}:`, creditErr);
    }
  } else if (payment.kind === 'vip_subscription') {
    // 'weekly_pass' used to fall through to 'monthly_vip' here, mislabeling a 7-day purchase
    // as a monthly plan — profiles.plan's CHECK constraint now allows 'weekly_pass' directly
    // (see supabase_schema.sql), so it's stored as what it actually is.
    const planType = payment.plan_id === 'annual_vip' ? 'annual_vip'
      : payment.plan_id === 'weekly_pass' ? 'weekly_pass'
      : 'monthly_vip';
    const days = planType === 'annual_vip' ? 365 : planType === 'weekly_pass' ? 7 : 30;

    const { error: profErr } = await supabase.from('profiles').update({
      plan: planType,
      subscribed_at: new Date().toISOString(),
      vip_expires_at: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
    }).eq('id', payment.user_id);
    if (profErr) throw profErr;

    const claimed = await claimPayment(supabase, payment.id, {
      status: 'COMPLETE',
      receipt_number: receiptNumber || null,
      updated_at: new Date().toISOString(),
    });
    if (!claimed) {
      console.warn(`Payment ${payment.id} was already resolved by another process.`);
    }
  } else {
    // Unknown kind — still claim COMPLETE so the row doesn't stay PENDING forever, but leave
    // a clear trail since nothing was actually granted.
    console.warn(`resolvePayment: unrecognized kind "${payment.kind}" for payment ${payment.id} — marking COMPLETE with nothing granted.`);
    await claimPayment(supabase, payment.id, {
      status: 'COMPLETE',
      receipt_number: receiptNumber || null,
      updated_at: new Date().toISOString(),
    });
  }
}
