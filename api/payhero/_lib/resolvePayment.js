/**
 * Credits the platform's cut (20% of tipster subscription, or 100% of VIP subscription)
 * into the admin account's withdrawable profiles.balance.
 */
async function creditPlatformAdmin(supabase, amount) {
  if (!amount || amount <= 0) return;
  const { data: admin, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error || !admin) {
    console.error('creditPlatformAdmin: no admin profile found to credit', error);
    return;
  }
  const { error: creditErr } = await supabase.rpc('credit_tipster_balance', {
    p_tipster_id: admin.id,
    p_amount: amount,
  });
  if (creditErr) console.error('Failed to credit platform admin balance:', creditErr);
}

/**
 * Atomically claims a PENDING payment row by writing to it only if it's still PENDING.
 * Returns true if this claim won, preventing race conditions.
 */
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

/**
 * Applies the final outcome of a PENDING payment: marks it COMPLETE/FAILED,
 * and on successful collect, activates the subscription/plan and credits tipster/platform balance.
 */
export async function resolvePayment(supabase, payment, { success, receiptNumber, failureMessage }) {
  if (!success) {
    const claimed = await claimPayment(supabase, payment.id, {
      status: 'FAILED',
      failure_message: failureMessage || 'Payment failed',
      updated_at: new Date().toISOString(),
    });
    // Refund balance if this was a tipster withdrawal that failed
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
    // Tipster withdrawal succeeded
    await claimPayment(supabase, payment.id, {
      status: 'COMPLETE',
      receipt_number: receiptNumber || null,
      updated_at: new Date().toISOString(),
    });
    return;
  }

  // type === 'collect': grant entitlement FIRST while row is still PENDING
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
      console.warn(`Payment ${payment.id} was already resolved by another process — skipping payout to avoid duplicate.`);
      return;
    }

    // Credit tipster balance
    const { error: creditErr } = await supabase.rpc('credit_tipster_balance', {
      p_tipster_id: payment.tipster_id,
      p_amount: payment.tipster_net,
    });
    if (creditErr) {
      console.error(`Failed to credit balance for tipster ${payment.tipster_id} on payment ${payment.id}:`, creditErr);
    }

    // Credit platform 20% cut
    await creditPlatformAdmin(supabase, payment.platform_cut);
  } else if (payment.kind === 'vip_subscription') {
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
      return;
    }

    // VIP subscriptions 100% platform revenue
    await creditPlatformAdmin(supabase, payment.amount);
  } else {
    console.warn(`resolvePayment: unrecognized kind "${payment.kind}" for payment ${payment.id}`);
    await claimPayment(supabase, payment.id, {
      status: 'COMPLETE',
      receipt_number: receiptNumber || null,
      updated_at: new Date().toISOString(),
    });
  }
}
