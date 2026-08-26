import { randomUUID } from 'crypto';
import { getSupabaseAdmin, pretiumDisburse, normalizePhone } from './_lib/pretium.js';

/** Pretium has no signing secret — this token in the callback_url query string (set when we
 * initiate the collect/disburse call) is our only way to verify a request actually came from
 * Pretium and not something guessing our webhook URL. */
function isAuthorized(req) {
  const token = req.query?.token;
  return !!token && token === process.env.PRETIUM_WEBHOOK_SECRET;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  // Per Pretium's guidance: return 200 for anything we don't recognize or can't authorize,
  // so it stops retrying. Only a genuine transient error further down should return 5xx.
  if (!isAuthorized(req)) {
    console.warn('Pretium webhook: rejected request with missing/invalid token');
    res.status(200).json({ ok: true });
    return;
  }

  const body = req.body || {};

  // The "asset release" (crypto onramp) shape has no `status` field and is unrelated to us —
  // Pretium can post it to the same URL if onramp is ever enabled on the account.
  if (!body.status) {
    res.status(200).json({ ok: true });
    return;
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error('Pretium webhook: Supabase admin client unavailable:', err);
    res.status(500).json({ error: 'Server not configured' });
    return;
  }

  try {
    const { data: payment, error: findErr } = await supabase
      .from('payments')
      .select('*')
      .eq('reference', body.transaction_code)
      .maybeSingle();

    if (findErr) throw findErr; // transient DB error — let Pretium retry

    if (!payment) {
      // Unrecognized reference — ack so Pretium stops retrying, nothing to act on.
      console.warn('Pretium webhook: no payment found for reference', body.transaction_code);
      res.status(200).json({ ok: true });
      return;
    }

    if (payment.status !== 'PENDING') {
      // Already resolved — idempotent no-op (Pretium doesn't guarantee exactly-once delivery).
      res.status(200).json({ ok: true });
      return;
    }

    if (body.status === 'FAILED') {
      await supabase.from('payments').update({
        status: 'FAILED',
        failure_message: body.message || 'Payment failed',
        updated_at: new Date().toISOString(),
      }).eq('id', payment.id);
      res.status(200).json({ ok: true });
      return;
    }

    if (body.status !== 'COMPLETE') {
      // Unrecognized status value — ack and ignore rather than guess.
      res.status(200).json({ ok: true });
      return;
    }

    await supabase.from('payments').update({
      status: 'COMPLETE',
      receipt_number: body.receipt_number || null,
      updated_at: new Date().toISOString(),
    }).eq('id', payment.id);

    if (payment.type === 'disburse') {
      // A tipster payout landed successfully — nothing further to do.
      res.status(200).json({ ok: true });
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
        const payoutReference = randomUUID();
        const origin = `https://${req.headers.host}`;
        const callbackUrl = `${origin}/api/pretium/webhook?token=${process.env.PRETIUM_WEBHOOK_SECRET}`;

        await supabase.from('payments').insert([{
          reference: payoutReference,
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
          await pretiumDisburse({
            amount: payment.tipster_net,
            phone: payoutPhone,
            reference: payoutReference,
            callbackUrl,
            description: 'Falcon Forecast tipster payout',
          });
        } catch (disburseErr) {
          console.error('Automatic tipster payout failed to submit:', disburseErr);
          await supabase.from('payments').update({
            status: 'FAILED',
            failure_message: disburseErr instanceof Error ? disburseErr.message : 'Disburse request failed',
          }).eq('reference', payoutReference);
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

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('POST /api/pretium/webhook failed:', err);
    // The only path that returns non-2xx — a genuine unexpected error where we DO want a retry.
    res.status(500).json({ error: 'Internal error' });
  }
}
