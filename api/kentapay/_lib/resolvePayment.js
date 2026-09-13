import { normalizePhone, generateTransactionId, kentapayB2C, extractCloudPacketId } from './kentapay.js';

/** Applies the final outcome of a PENDING payment: marks it COMPLETE/FAILED, and on a
 * successful collect, activates whatever was being paid for (tipster subscription or VIP
 * plan) and fires the automatic tipster payout. Shared between the callback handler (pushed
 * by Kentapay) and the query-status reconciliation job (pulled by us), so both routes credit
 * a transaction exactly the same way regardless of which one resolves it first.
 *
 * Caller must have already confirmed `payment.status === 'PENDING'` (idempotency) and, for a
 * pushed callback, verified the HASH — this function does neither. */
export async function resolvePayment(supabase, payment, { success, receiptNumber, failureMessage }) {
  if (!success) {
    await supabase.from('payments').update({
      status: 'FAILED',
      failure_message: failureMessage || 'Payment failed',
      updated_at: new Date().toISOString(),
    }).eq('id', payment.id);
    return;
  }

  await supabase.from('payments').update({
    status: 'COMPLETE',
    receipt_number: receiptNumber || null,
    updated_at: new Date().toISOString(),
  }).eq('id', payment.id);

  if (payment.type === 'disburse') {
    // A tipster payout landed successfully — nothing further to do.
    return;
  }

  // type === 'collect': activate/renew what was being paid for.
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

    await supabase.from('payments').update({ subscription_id: newSub.id }).eq('id', payment.id);

    // Automatic payout: send the tipster their net share right away.
    const { data: tipster } = await supabase
      .from('profiles')
      .select('mpesa_phone')
      .eq('id', payment.tipster_id)
      .maybeSingle();

    const payoutPhone = tipster?.mpesa_phone ? normalizePhone(tipster.mpesa_phone) : null;

    if (payoutPhone && Number(payment.tipster_net) > 0) {
      const payoutTransactionId = generateTransactionId();

      await supabase.from('payments').insert([{
        reference: payoutTransactionId,
        type: 'disburse',
        kind: 'tipster_payout',
        tipster_id: payment.tipster_id,
        subscription_id: newSub.id,
        related_payment_id: payment.id,
        amount: payment.tipster_net,
        phone: payoutPhone,
        status: 'PENDING',
      }]);

      try {
        const ack = await kentapayB2C({
          amount: payment.tipster_net,
          phone: payoutPhone,
          transactionId: payoutTransactionId,
        });
        const cloudPacketId = extractCloudPacketId(ack);
        if (cloudPacketId) {
          await supabase.from('payments').update({ cloud_packet_id: cloudPacketId }).eq('reference', payoutTransactionId);
        }
      } catch (disburseErr) {
        console.error('Automatic tipster payout failed to submit:', disburseErr);
        await supabase.from('payments').update({
          status: 'FAILED',
          failure_message: disburseErr instanceof Error ? disburseErr.message : 'Disburse request failed',
        }).eq('reference', payoutTransactionId);
      }
    } else {
      console.warn(`Tipster ${payment.tipster_id} has no mpesa_phone on file — skipping automatic payout for subscription ${newSub.id}. Needs manual payout.`);
    }
  } else if (payment.kind === 'vip_subscription') {
    const planType = payment.plan_id === 'annual_vip' ? 'annual_vip' : 'monthly_vip';
    const days = planType === 'annual_vip' ? 365 : (payment.plan_id === 'weekly_pass' ? 7 : 30);
    await supabase.from('profiles').update({
      plan: planType,
      subscribed_at: new Date().toISOString(),
      vip_expires_at: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
    }).eq('id', payment.user_id);
  }
}
