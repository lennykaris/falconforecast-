import {
  normalizePhone,
  generateTransactionId,
  payheroInitiateStk,
  getSupabaseAdmin,
  getAuthenticatedUserId,
} from './_lib/payhero.js';

const PLATFORM_CUT_PCT = 0.20;

// Set to true or via env var when testing STK push live with minimal amount (KSh 5 or 15)
const TESTING_FORCE_LOW_PRICE = process.env.TESTING_FORCE_LOW_PRICE === 'true';

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

    // Fetch user profile for customer name
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .maybeSingle();

    let amount, platformCut = null, tipsterNet = null;

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
        res.status(403).json({ error: 'This tipster is not currently accepting new subscribers' });
        return;
      }

      amount = billingCycle === 'weekly'
        ? (tipster.weekly_price != null ? Number(tipster.weekly_price) : 500)
        : (tipster.monthly_price != null ? Number(tipster.monthly_price) : 1500);
      platformCut = parseFloat((amount * PLATFORM_CUT_PCT).toFixed(2));
      tipsterNet = parseFloat((amount - platformCut).toFixed(2));
    } else if (kind === 'vip_subscription') {
      amount = VIP_PLAN_PRICES[planId];
      if (!amount) {
        res.status(400).json({ error: 'Unknown plan' });
        return;
      }
    } else {
      res.status(400).json({ error: 'Unknown payment kind' });
      return;
    }

    if (TESTING_FORCE_LOW_PRICE) {
      amount = kind === 'tipster_subscription' ? 15 : 5;
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
      const ack = await payheroInitiateStk({
        amount,
        phone: normalizedPhone,
        transactionId,
        customerName: userProfile?.name || 'Falcon Forecast User',
      });

      const checkoutRequestId = ack?.CheckoutRequestID || ack?.reference;
      if (checkoutRequestId) {
        await supabase.from('payments').update({ cloud_packet_id: String(checkoutRequestId) }).eq('reference', transactionId);
      }
    } catch (stkErr) {
      console.error(`PayHero STK push request failed for ${transactionId}:`, stkErr);
      await supabase.from('payments').update({
        status: 'FAILED',
        failure_message: stkErr instanceof Error ? stkErr.message : 'STK Push failed to initiate',
      }).eq('reference', transactionId);
      throw stkErr;
    }

    res.status(200).json({ reference: transactionId, amount });
  } catch (err) {
    console.error('POST /api/payhero/collect failed:', err);
    res.status(502).json({ error: err instanceof Error ? err.message : 'We couldn\'t start your payment right now. Please try again in a moment.' });
  }
}
