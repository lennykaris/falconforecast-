import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.PAYHERO_BASE_URL || 'https://backend.payhero.co.ke';
const REQUEST_TIMEOUT_MS = 15000;

/**
 * Returns the Basic Auth header value for PayHero.
 * Accepts either:
 * - PAYHERO_AUTH_TOKEN (the Basic token directly from PayHero Dashboard -> API Keys)
 * - PAYHERO_API_USERNAME and PAYHERO_API_PASSWORD (which will be base64-encoded)
 */
export function getPayHeroAuthHeader() {
  const token = process.env.PAYHERO_AUTH_TOKEN;
  if (token) {
    return token.startsWith('Basic ') ? token : `Basic ${token.trim()}`;
  }

  const username = process.env.PAYHERO_API_USERNAME;
  const password = process.env.PAYHERO_API_PASSWORD;
  if (username && password) {
    const encoded = Buffer.from(`${username.trim()}:${password.trim()}`).toString('base64');
    return `Basic ${encoded}`;
  }

  throw new Error('PayHero credentials are not configured on the server (set PAYHERO_AUTH_TOKEN or PAYHERO_API_USERNAME/PAYHERO_API_PASSWORD)');
}

/**
 * Normalizes Kenyan mobile numbers to the 07XXXXXXXX / 01XXXXXXXX format
 * expected by PayHero. Also handles +254 / 254 prefixes.
 */
export function normalizePhone(input) {
  const digits = String(input || '').replace(/\D/g, '');
  if (/^254[71]\d{8}$/.test(digits)) return '0' + digits.slice(3);
  if (/^0[71]\d{8}$/.test(digits)) return digits;
  if (/^[71]\d{8}$/.test(digits)) return '0' + digits;
  return null;
}

/**
 * Generates a unique transaction reference for Falcon Forecast payments.
 */
export function generateTransactionId() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `FF${Date.now().toString(36).toUpperCase()}${rand}`;
}

async function fetchWithTimeout(url, options, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`PayHero request timed out after ${timeoutMs / 1000}s`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Initiates an M-Pesa STK Push payment via PayHero.
 * Endpoint: POST /api/v2/payments
 */
export async function payheroInitiateStk({ amount, phone, transactionId, customerName, callbackUrl }) {
  const authHeader = getPayHeroAuthHeader();
  const channelId = Number(process.env.PAYHERO_CHANNEL_ID);
  if (!channelId || isNaN(channelId)) {
    throw new Error('PAYHERO_CHANNEL_ID is not configured or invalid on the server');
  }

  const payload = {
    amount: Math.round(amount),
    phone_number: phone,
    channel_id: channelId,
    provider: 'm-pesa',
    external_reference: transactionId,
    customer_name: customerName || 'Falcon Forecast User',
  };

  const finalCallbackUrl = callbackUrl || process.env.PAYHERO_CALLBACK_URL;
  if (finalCallbackUrl) {
    payload.callback_url = finalCallbackUrl;
  }

  const res = await fetchWithTimeout(`${BASE_URL}/api/v2/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || (data?.success !== true && data?.status !== 'QUEUED')) {
    const errorMsg = data?.error_message || data?.message || data?.error || `PayHero payment request failed (${res.status})`;
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Disburses funds to an M-Pesa phone number (tipster withdrawal) via PayHero.
 * Endpoint: POST /api/v2/withdraw
 */
export async function payheroWithdraw({ amount, phone, transactionId, callbackUrl }) {
  const authHeader = getPayHeroAuthHeader();

  const payload = {
    amount: Math.round(amount),
    phone_number: phone,
    channel: 'mpesa',
    network_code: '63902',
    external_reference: transactionId,
  };

  const finalCallbackUrl = callbackUrl || process.env.PAYHERO_CALLBACK_URL;
  if (finalCallbackUrl) {
    payload.callback_url = finalCallbackUrl;
  }

  const res = await fetchWithTimeout(`${BASE_URL}/api/v2/withdraw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || (data?.success === false)) {
    const errorMsg = data?.message || data?.error_message || data?.error || `PayHero withdrawal request failed (${res.status})`;
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Queries the status of a transaction from PayHero.
 * Endpoint: GET /api/v2/transaction-status?reference=...
 */
export async function payheroQueryStatus({ reference }) {
  const authHeader = getPayHeroAuthHeader();
  const url = `${BASE_URL}/api/v2/transaction-status?reference=${encodeURIComponent(reference)}`;

  const res = await fetchWithTimeout(url, {
    method: 'GET',
    headers: {
      Authorization: authHeader,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data?.error_message || data?.message || `PayHero query-status failed (${res.status})`;
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Returns a Supabase client with the service role key to bypass RLS.
 */
export function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('VITE_SUPABASE_URL is not configured on the server');
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured on the server');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

/**
 * Validates the caller's Supabase access token and returns their user ID.
 */
export async function getAuthenticatedUserId(req, supabaseAdmin) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user.id;
}
