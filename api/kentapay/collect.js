import {
  normalizePhone,
  generateTransactionId,
  kentapayCheckout,
  extractCloudPacketId,
  getSupabaseAdmin,
  getAuthenticatedUserId,
} from './_lib/kentapay.js';

const PLATFORM_CUT_PCT = 0.20;

// ⚠️ TEMPORARY TESTING OVERRIDE — forces every checkout (VIP or tipster subscription) to a
// small fixed price regardless of the real one, so live payment-flow testing on PRODUCTION
// doesn't require spending real money at full price. This is live on production right now:
// any real customer checking out while this is `true` pays the forced price, not the real
// one. Flip back to `false` once production STK-push testing is done.
const TESTING_FORCE_LOW_PRICE = true;

// Server-side source of truth for VIP plan prices — matches src/data/predictions.ts.
// Never trust a client-supplied amount for anything that moves real money.
const VIP_PLAN_PRICES = {
  weekly_pass: 500,
  monthly_vip: 1500,
  annual_vip: 9999,
};

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

    const { kind, tipsterId, planId, billingCycle, phone } = req.body || {};

    if (!phone || !kind) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      res.status(400).json({ error: 'Enter a valid Kenyan phone number (e.g. 0712345678)' });
      return;
    }

    let amount, platformCut = null, tipsterNet = null, narration, accountReference;

    if (kind === 'tipster_subscription') {
      if (!tipsterId || !billingCycle) {
        res.status(400).json({ error: 'Missing tipster or billing cycle' });
        return;
      }
      const { data: tipster, error: tErr } = await supabase
        .from('profiles')
        .select('weekly_price, monthly_price, name, role, tipster_status')
        .eq('id', tipsterId)
        .maybeSingle();
      if (tErr || !tipster || tipster.role !== 'tipster') {
        res.status(404).json({ error: 'Tipster not found' });
        return;
      }
      if (tipster.tipster_status !== 'active') {
        // role stays 'tipster' when suspended (only tipster_status flips) — checking role
        // alone let a suspended tipster keep receiving new paid subscriptions and automatic
        // payouts after being cut off.
        res.status(403).json({ error: 'This tipster is not currently accepting new subscribers' });
        return;
      }
      // != null, not `||` — a tipster who deliberately set a price of exactly 0 (e.g. a
      // promotional free tier) was having that overridden by the 500/1500 fallback below,
      // silently overcharging their subscribers.
      amount = billingCycle === 'weekly'
        ? (tipster.weekly_price != null ? Number(tipster.weekly_price) : 500)
        : (tipster.monthly_price != null ? Number(tipster.monthly_price) : 1500);
      platformCut = parseFloat((amount * PLATFORM_CUT_PCT).toFixed(2));
      tipsterNet = parseFloat((amount - platformCut).toFixed(2));
      narration = `Falcon Forecast - ${tipster.name} subscription`;
      accountReference = 'FFTIPSTER';
    } else if (kind === 'vip_subscription') {
      amount = VIP_PLAN_PRICES[planId];
      if (!amount) {
        res.status(400).json({ error: 'Unknown plan' });
        return;
      }
      narration = 'Falcon Forecast - VIP subscription';
      accountReference = 'FFVIP';
    } else {
      res.status(400).json({ error: 'Unknown payment kind' });
      return;
    }

    if (TESTING_FORCE_LOW_PRICE) {
      // Tipster subscriptions are forced to KSh 50 instead of 5 — Safaricom's B2C payout has
      // a documented KES 10 minimum, so the 80% net share of a KSh 5 test (KSh 4) would
      // always fail that step regardless of credentials. 50 keeps the net share (KSh 40)
      // comfortably clear of that floor while still being cheap to test with.
      amount = kind === 'tipster_subscription' ? 50 : 5;
      if (kind === 'tipster_subscription') {
        platformCut = parseFloat((amount * PLATFORM_CUT_PCT).toFixed(2));
        tipsterNet = parseFloat((amount - platformCut).toFixed(2));
      }
    }

    const transactionId = generateTransactionId();

    const { error: insertErr } = await supabase.from('payments').insert([{
      reference: transactionId,
      type: 'collect',
      kind,
      user_id: userId,
      tipster_id: tipsterId || null,
      billing_cycle: kind === 'tipster_subscription' ? billingCycle : null,
      plan_id: kind === 'vip_subscription' ? planId : null,
      amount,
      platform_cut: platformCut,
      tipster_net: tipsterNet,
      phone: normalizedPhone,
      status: 'PENDING',
    }]);
    if (insertErr) throw insertErr;

    try {
      const ack = await kentapayCheckout({
        amount,
        phone: normalizedPhone,
        transactionId,
        accountReference,
        narration,
      });

      const cloudPacketId = extractCloudPacketId(ack);
      if (cloudPacketId) {
        await supabase.from('payments').update({ cloud_packet_id: cloudPacketId }).eq('reference', transactionId);
      } else {
        // Not fatal — we can still fall back to the Query Status API for this transaction —
        // but the callback's HASH can't be verified without it, so it's worth knowing about.
        console.warn(`Kentapay collect: no cloudPacketID in acknowledgement for ${transactionId}`);
      }
    } catch (checkoutErr) {
      // The payments row above was already inserted as PENDING before this call — without
      // this, a checkout failure (timeout, auth failure, network error) left it orphaned
      // PENDING forever instead of FAILED, since the outer catch below never touches it.
      console.error(`Kentapay checkout request failed for ${transactionId}:`, checkoutErr);
      await supabase.from('payments').update({
        status: 'FAILED',
        failure_message: checkoutErr instanceof Error ? checkoutErr.message : 'Checkout request failed',
      }).eq('reference', transactionId);
      throw checkoutErr;
    }

    res.status(200).json({ reference: transactionId, amount });
  } catch (err) {
    console.error('POST /api/kentapay/collect failed:', err);
    // ⚠️ TEMPORARILY showing the real technical error again (not the friendly generic one)
    // while actively debugging the production connectivity switch — there are no real
    // customers on the site yet, so nothing is exposed to anyone but us. Restore the generic
    // "try again in a moment" message once this is confirmed working end-to-end.
    res.status(502).json({ error: err instanceof Error ? err.message : 'Failed to start payment' });
  }
}
