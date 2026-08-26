import { randomUUID } from 'crypto';
import { normalizePhone, pretiumCollect, getSupabaseAdmin, getAuthenticatedUserId } from './_lib/pretium.js';

const PLATFORM_CUT_PCT = 0.20;

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

    let amount, platformCut = null, tipsterNet = null, description;

    if (kind === 'tipster_subscription') {
      if (!tipsterId || !billingCycle) {
        res.status(400).json({ error: 'Missing tipster or billing cycle' });
        return;
      }
      const { data: tipster, error: tErr } = await supabase
        .from('profiles')
        .select('weekly_price, monthly_price, name, role')
        .eq('id', tipsterId)
        .maybeSingle();
      if (tErr || !tipster || tipster.role !== 'tipster') {
        res.status(404).json({ error: 'Tipster not found' });
        return;
      }
      amount = billingCycle === 'weekly' ? Number(tipster.weekly_price || 500) : Number(tipster.monthly_price || 1500);
      platformCut = parseFloat((amount * PLATFORM_CUT_PCT).toFixed(2));
      tipsterNet = parseFloat((amount - platformCut).toFixed(2));
      description = `Falcon Forecast - ${tipster.name} subscription`;
    } else if (kind === 'vip_subscription') {
      amount = VIP_PLAN_PRICES[planId];
      if (!amount) {
        res.status(400).json({ error: 'Unknown plan' });
        return;
      }
      description = 'Falcon Forecast - VIP subscription';
    } else {
      res.status(400).json({ error: 'Unknown payment kind' });
      return;
    }

    const reference = randomUUID();
    const origin = `https://${req.headers.host}`;
    const callbackUrl = `${origin}/api/pretium/webhook?token=${process.env.PRETIUM_WEBHOOK_SECRET}`;

    const { error: insertErr } = await supabase.from('payments').insert([{
      reference,
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

    await pretiumCollect({ amount, phone: normalizedPhone, reference, callbackUrl, description });

    res.status(200).json({ reference, amount });
  } catch (err) {
    console.error('POST /api/pretium/collect failed:', err);
    res.status(502).json({ error: err instanceof Error ? err.message : 'Failed to start payment' });
  }
}
