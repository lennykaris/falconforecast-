import {
  normalizePhone,
  generateTransactionId,
  kentapayCheckout,
  extractCloudPacketId,
  extractCheckoutRequestId,
  getSupabaseAdmin,
  getAuthenticatedUserId,
} from './_lib/kentapay.js';

const PLATFORM_CUT_PCT = 0.20;

// Server-side source of truth for VIP plan prices — matches src/data/predictions.ts.
// Never trust a client-supplied amount for anything that moves real money.
const VIP_PLAN_PRICES = {
  weekly_pass: 500,
  monthly_vip: 1500,
  annual_vip: 9999,
};
const TIPSTER_APPLICATION_FEE = 500;

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

    const {
      kind,
      tipsterId,
      planId,
      billingCycle,
      phone,
      bio,
      weeklyPrice,
      monthlyPrice,
    } = req.body || {};

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
    let applicationBio = null, applicationWeeklyPrice = null, applicationMonthlyPrice = null;

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
      if (billingCycle !== 'weekly' && billingCycle !== 'monthly') {
        res.status(400).json({ error: 'Choose a valid billing cycle' });
        return;
      }
      const configuredPrice = billingCycle === 'weekly' ? tipster.weekly_price : tipster.monthly_price;
      amount = Number(configuredPrice);
      if (configuredPrice == null || !Number.isFinite(amount) || amount <= 0) {
        res.status(400).json({ error: 'This tipster has not set a price for that billing cycle' });
        return;
      }
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
    } else if (kind === 'tipster_application') {
      applicationBio = typeof bio === 'string' ? bio.trim() : '';
      applicationWeeklyPrice = Number(weeklyPrice);
      applicationMonthlyPrice = Number(monthlyPrice);
      if (!applicationBio || applicationBio.length > 2000) {
        res.status(400).json({ error: 'Enter a bio of up to 2,000 characters' });
        return;
      }
      if (!Number.isInteger(applicationWeeklyPrice) || applicationWeeklyPrice < 100
        || !Number.isInteger(applicationMonthlyPrice) || applicationMonthlyPrice < 200) {
        res.status(400).json({ error: 'Weekly price must be at least KSh 100 and monthly price at least KSh 200' });
        return;
      }

      const { data: applicant, error: applicantErr } = await supabase
        .from('profiles')
        .select('role, tipster_status')
        .eq('id', userId)
        .maybeSingle();
      if (applicantErr) throw applicantErr;
      if (!applicant || applicant.role !== 'user') {
        res.status(403).json({ error: 'Only regular user accounts can apply to become a tipster' });
        return;
      }
      if (applicant.tipster_status !== 'none') {
        res.status(409).json({ error: 'You already have a tipster application or account' });
        return;
      }

      const { data: pendingApplication, error: pendingErr } = await supabase
        .from('payments')
        .select('id')
        .eq('user_id', userId)
        .eq('kind', 'tipster_application')
        .eq('status', 'PENDING')
        .limit(1)
        .maybeSingle();
      if (pendingErr) throw pendingErr;
      if (pendingApplication) {
        res.status(409).json({ error: 'Your application payment is still processing. Please wait for confirmation before trying again.' });
        return;
      }

      amount = TIPSTER_APPLICATION_FEE;
      narration = 'Falcon Forecast - tipster application';
      accountReference = 'FFTIPAPP';
    } else {
      res.status(400).json({ error: 'Unknown payment kind' });
      return;
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
      application_bio: applicationBio,
      application_weekly_price: applicationWeeklyPrice,
      application_monthly_price: applicationMonthlyPrice,
      amount,
      platform_cut: platformCut,
      tipster_net: tipsterNet,
      phone: normalizedPhone,
      status: 'PENDING',
    }]);
    if (insertErr?.code === '23505' && kind === 'tipster_application') {
      res.status(409).json({ error: 'Your application payment is already processing. Please wait for confirmation before trying again.' });
      return;
    }
    if (insertErr) throw insertErr;

    try {
      const ack = await kentapayCheckout({
        amount,
        phone: normalizedPhone,
        transactionId,
        accountReference,
        narration,
      });

      // A successful onlinecheckout/request acknowledgement never actually includes a
      // cloudPacketID per Kentapay's own docs (only their error samples have one) — it
      // carries ORIGINAL_RESPONSE.CheckoutRequestID instead, which the callback's HASH
      // verification uses in cloudPacketID's place for this payment type. Still tried first
      // in case Kentapay ever does include one, since extractCloudPacketId costs nothing.
      const identifier = extractCloudPacketId(ack) || extractCheckoutRequestId(ack);
      if (identifier) {
        await supabase.from('payments').update({ cloud_packet_id: identifier }).eq('reference', transactionId);
      } else {
        // Not fatal — we can still fall back to the Query Status API for this transaction —
        // but the callback's HASH can't be verified without it, so it's worth knowing about.
        console.warn(`Kentapay collect: no cloudPacketID or CheckoutRequestID in acknowledgement for ${transactionId}. Raw ack: ${JSON.stringify(ack)}`);
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
    // A customer never needs to see a raw technical error ("fetch failed", a bare Kentapay
    // status code, a Java stack trace) — just that something went wrong and to try again. The
    // real detail is already logged above for us to actually diagnose (and was — this is what
    // surfaced the IndexOutOfBoundsException now reported to Kentapay).
    res.status(502).json({ error: 'We couldn\'t start your payment right now. Please try again in a moment.' });
  }
}
