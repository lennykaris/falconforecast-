import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://api.xwift.africa';

/** Normalizes any Kenyan mobile number format Pretium's guide calls out to the
 * 0XXXXXXXXX shape it expects. Returns null if the input doesn't match anything valid.
 * Handles 07.../01... (already local), 7.../1... (9 digits, no leading zero), and
 * 2547.../2541... (with country code) — a validator that only accepts 07 silently
 * locks out real Kenyan customers on the 01 range. */
export function normalizePhone(input) {
  const digits = String(input || '').replace(/\D/g, '');
  if (/^254[71]\d{8}$/.test(digits)) return '0' + digits.slice(3);
  if (/^[71]\d{8}$/.test(digits)) return '0' + digits;
  if (/^0[71]\d{8}$/.test(digits)) return digits;
  return null;
}

function pretiumHeaders() {
  const apiKey = process.env.PRETIUM_API_KEY;
  if (!apiKey) throw new Error('PRETIUM_API_KEY is not configured on the server');
  return { 'x-api-key': apiKey, 'Content-Type': 'application/json' };
}

/** Sends an STK push to collect money from a phone. The 200 response only means the
 * request was accepted — never treat it as payment confirmation. The real outcome
 * arrives later via the webhook. */
export async function pretiumCollect({ amount, phone, reference, callbackUrl, description }) {
  const res = await fetch(`${BASE_URL}/kes/collect`, {
    method: 'POST',
    headers: pretiumHeaders(),
    body: JSON.stringify({
      amount: Math.round(amount),
      shortcode: phone,
      mobile_network: 'Safaricom',
      reference,
      callback_url: callbackUrl,
      description,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Pretium collect failed: ${res.status}`);
  return data;
}

/** Sends money out to a phone. The recipient gets exactly `amount` in full — Pretium's
 * disbursement fee is additive, charged on top, debited from our wallet separately. */
export async function pretiumDisburse({ amount, phone, reference, callbackUrl, description }) {
  const res = await fetch(`${BASE_URL}/kes/disburse`, {
    method: 'POST',
    headers: pretiumHeaders(),
    body: JSON.stringify({
      amount: Math.round(amount),
      shortcode: phone,
      mobile_network: 'Safaricom',
      type: 'MOBILE',
      reference,
      callback_url: callbackUrl,
      description,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Pretium disburse failed: ${res.status}`);
  return data;
}

/** Internal cost-accounting only. Pretium doesn't expose this tier table via any endpoint —
 * it's transcribed from their integration guide and needs reconfirming with Pretium if used
 * for real margin reporting. Never applied to amounts actually sent (disbursement fees are
 * additive — the recipient always gets the full requested amount regardless of this table). */
export function disburseFeeFor(amountKes) {
  const tiers = [
    [100, 1], [500, 8], [1000, 12], [1500, 20], [2500, 22], [3500, 25], [5000, 27],
    [7500, 30], [10000, 35], [15000, 37], [20000, 40], [25000, 43], [30000, 45],
    [35000, 50], [40000, 60], [45000, 70], [50000, 80], [70000, 100],
  ];
  for (const [ceiling, fee] of tiers) {
    if (amountKes <= ceiling) return fee;
  }
  return 150;
}

/** A Supabase client authenticated with the service role key, which bypasses RLS entirely.
 * Required for the webhook handler (no user session) and any write to `payments`, which has
 * no client-writable RLS policy on purpose. */
export function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('VITE_SUPABASE_URL is not configured on the server');
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured on the server');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

/** Verifies the caller's Supabase access token (sent as `Authorization: Bearer <token>`)
 * and returns the authenticated user id. Payment-initiating endpoints must never trust a
 * client-supplied user id directly — that would let anyone attribute a purchase (and the
 * automatic payout it triggers) to an account that isn't theirs. */
export async function getAuthenticatedUserId(req, supabaseAdmin) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user.id;
}
