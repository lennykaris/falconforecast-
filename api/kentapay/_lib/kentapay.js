import { createClient } from '@supabase/supabase-js';
import { createHmac, createHash } from 'crypto';

// Swap to Kentapay's production host once issued (they send it by email per their docs) —
// everything else (client id, service ids, etc.) is env-driven so this is the only thing
// that ever needs to change to go live.
const BASE_URL = process.env.KENTAPAY_BASE_URL || 'https://test-eclecticsgateway.ekenya.co.ke:8095';

// Service IDs from Kentapay's lookup table — override via env if their team assigns you
// different ones. Defaults are the documented test/sandbox values.
export const SERVICE_IDS = {
  checkout: process.env.KENTAPAY_CHECKOUT_SERVICE_ID || '5067',
  b2c: process.env.KENTAPAY_B2C_SERVICE_ID || '6125',
};

/** Normalizes any Kenyan mobile number format to the 254XXXXXXXXX shape Kentapay's docs use
 * everywhere (unlike Pretium, which wanted a leading-zero local format). Handles 07.../01...,
 * bare 9-digit (7.../1...), and already-prefixed 254.../+254... input. Returns null if the
 * input doesn't match anything valid — a validator that only accepts 07 silently locks out
 * real Kenyan customers on the 01 range. */
export function normalizePhone(input) {
  const digits = String(input || '').replace(/\D/g, '');
  if (/^254[71]\d{8}$/.test(digits)) return digits;
  if (/^0[71]\d{8}$/.test(digits)) return '254' + digits.slice(1);
  if (/^[71]\d{8}$/.test(digits)) return '254' + digits;
  return null;
}

/** Generates a Kentapay-safe transactionid: short, alphanumeric, sortable-ish, and unique
 * enough for our volume. Kentapay's own examples are plain alphanumeric strings (no dashes),
 * so a raw UUID is avoided here. */
export function generateTransactionId() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `FF${Date.now().toString(36).toUpperCase()}${rand}`;
}

let tokenCache = null; // { accessToken, hmacKey, expiresAt }

/** Fetches (and caches in-process) the access token + HMAC key from Kentapay's token
 * endpoint. Every other call needs both: the token as a Bearer header, the key to sign the
 * request body. Cached with a 30s safety margin before the reported expiry so a serverless
 * instance that stays warm doesn't get caught using an expired token mid-request. */
async function getAccessToken() {
  if (tokenCache && tokenCache.expiresAt > Date.now()) return tokenCache;

  const clientId = process.env.KENTAPAY_CLIENT_ID;
  const username = process.env.KENTAPAY_USERNAME;
  const password = process.env.KENTAPAY_PASSWORD;
  if (!clientId || !username || !password) {
    throw new Error('Kentapay credentials are not configured on the server');
  }

  const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
  const res = await fetch(`${BASE_URL}/ServiceLayer/v2/request/access-token?grant_type=client_credentials`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basicAuth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientid: clientId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.access_token) {
    throw new Error(data?.status || `Kentapay token request failed: ${res.status}`);
  }

  const expiresInMs = (Number(data.expires_in) || 55) * 60 * 1000;
  tokenCache = {
    accessToken: data.access_token,
    hmacKey: data.key,
    expiresAt: Date.now() + expiresInMs - 30_000,
  };
  return tokenCache;
}

function signRequest(bodyString, hmacKey) {
  return createHmac('sha512', hmacKey).update(bodyString).digest('hex');
}

/** Pulls the gateway's request identifier out of an acknowledgement response, whatever
 * casing it comes back in — Kentapay's own docs are inconsistent between `cloudPacketID`
 * (generic postRequest) and `CLOUDPACKETID` (checkout error samples). We need this value to
 * verify the callback's HASH later, so it must survive regardless of casing. */
export function extractCloudPacketId(ackResponse) {
  if (!ackResponse || typeof ackResponse !== 'object') return null;
  for (const key of Object.keys(ackResponse)) {
    if (key.toLowerCase() === 'cloudpacketid') return String(ackResponse[key]);
  }
  const original = ackResponse.ORIGINAL_RESPONSE;
  if (original && typeof original === 'object') {
    for (const key of Object.keys(original)) {
      if (key.toLowerCase() === 'cloudpacketid') return String(original[key]);
    }
  }
  return null;
}

/** Sends an STK push to collect money from a phone via M-PESA Checkout. Like every other
 * Kentapay endpoint, the response is only an acknowledgement — never treat it as payment
 * confirmation. The real outcome arrives later via the callback. */
export async function kentapayCheckout({ amount, phone, transactionId, accountReference, narration }) {
  const { accessToken, hmacKey } = await getAccessToken();
  const body = {
    amount: String(Math.round(amount)),
    clientid: process.env.KENTAPAY_CLIENT_ID,
    serviceid: SERVICE_IDS.checkout,
    accountno: phone,
    msisdn: phone,
    transactionid: transactionId,
    currencycode: 'KES',
    narration,
    accountreference: accountReference.slice(0, 10),
  };
  const bodyString = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}/ServiceLayer/v2/onlinecheckout/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      signature: signRequest(bodyString, hmacKey),
    },
    body: bodyString,
  });
  const data = await res.json().catch(() => ({}));
  const status = data?.STATUS ?? data?.status;
  if (!res.ok || (status !== '00' && status !== 0)) {
    throw new Error(data?.STATUSDESCRIPTION || data?.MESSAGE || `Kentapay checkout failed: ${res.status}`);
  }
  return data;
}

/** Sends money out to a phone via M-PESA B2C (used for automatic tipster payouts). Same
 * generic postRequest endpoint every non-checkout Kentapay service uses. */
export async function kentapayB2C({ amount, phone, transactionId }) {
  const { accessToken, hmacKey } = await getAccessToken();
  const body = {
    clientid: process.env.KENTAPAY_CLIENT_ID,
    serviceid: SERVICE_IDS.b2c,
    transactionid: transactionId,
    msisdn: phone,
    accountno: phone,
    amount: String(Math.round(amount)),
    currencycode: 'KES',
    timestamp: new Date().toISOString(),
  };
  const bodyString = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}/ServiceLayer/v2/request/postRequest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      signature: signRequest(bodyString, hmacKey),
    },
    body: bodyString,
  });
  const data = await res.json().catch(() => ({}));
  const status = data?.status ?? data?.STATUS;
  if (!res.ok || (status !== '00' && status !== 0)) {
    throw new Error(data?.statusDescription || data?.STATUSDESCRIPTION || `Kentapay B2C failed: ${res.status}`);
  }
  return data;
}

/** Checks the current status of a previously-submitted transaction. Useful as a fallback
 * when a callback never arrives — Kentapay's own docs recommend waiting ~5 minutes after
 * the original request before calling this. Unlike the callback, this is a direct
 * Bearer-authenticated pull, so there's no HASH to verify. */
export async function kentapayQueryStatus({ transactionId }) {
  const { accessToken } = await getAccessToken();
  const res = await fetch(`${BASE_URL}/ServiceLayer/v2/transaction/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ clientid: process.env.KENTAPAY_CLIENT_ID, transactionid: transactionId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.statusDescription || `Kentapay query-status failed: ${res.status}`);
  return data;
}

/** Verifies a callback's HASH per Kentapay's spec: SHA-256(transactionID + destinationAccountNo
 * + amount + cloudPacketID), all values exactly as sent/received, concatenated with no
 * separator. `cloudPacketId` must be whatever we stored from the original acknowledgement —
 * it is never present in the callback payload itself. */
export function verifyCallbackHash({ transactionId, destinationAccountNo, amount, cloudPacketId, hash }) {
  if (!hash || !cloudPacketId) return false;
  const data = `${transactionId}${destinationAccountNo}${amount}${cloudPacketId}`;
  const computed = createHash('sha256').update(data).digest('hex');
  return computed === String(hash);
}

/** A Supabase client authenticated with the service role key, which bypasses RLS entirely.
 * Required for the callback handler (no user session) and any write to `payments`, which has
 * no client-writable RLS policy on purpose. */
export function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('VITE_SUPABASE_URL is not configured on the server');
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured on the server');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

/** Verifies the caller's Supabase access token (sent as `Authorization: Bearer <token>`) and
 * returns the authenticated user id. Payment-initiating endpoints must never trust a
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
