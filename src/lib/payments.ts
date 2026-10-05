import { supabase } from './supabase';

interface CollectParams {
  kind: 'tipster_subscription' | 'vip_subscription';
  tipsterId?: string;
  planId?: string;
  billingCycle?: 'weekly' | 'monthly';
  phone: string;
}

/** Kicks off a real M-Pesa STK push via our PayHero proxy. The response only means the
 * request was accepted and the prompt is on its way to the phone. Poll or listen
 * for the callback-driven DB update. */
export async function startPaymentCollect(params: CollectParams): Promise<{ reference: string; amount: number }> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('You must be logged in to pay.');

  const res = await fetch('/api/payhero/collect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Failed to start payment');
  return data;
}

// Backwards compatibility alias
export const startKentapayCollect = startPaymentCollect;

/** Kicks off a real M-Pesa B2C payout of a chosen amount from a tipster's withdrawable
 * balance (see api/payhero/withdraw.js). The server re-validates against the real balance. */
export async function startWithdrawal(amount: number): Promise<{ reference: string; amount: number }> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('You must be logged in to withdraw.');

  const res = await fetch('/api/payhero/withdraw', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ amount }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Failed to start withdrawal');
  return data;
}

export type PaymentPollResult = 'COMPLETE' | 'FAILED' | 'TIMEOUT';

export interface PaymentPollOutcome {
  status: PaymentPollResult;
  /** The real reason from PayHero's callback (e.g. "Request cancelled by user") — only set
   * when status is 'FAILED'. Falls back to a generic message in the UI when this is empty. */
  failureMessage?: string;
}

/** Actively asks our server to check this one payment's real status with PayHero directly
 * (api/payhero/check-status.js), instead of only waiting for PayHero's push callback. */
async function checkPaymentStatusNow(reference: string): Promise<{ status: string; failureMessage?: string } | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return null;

    const res = await fetch('/api/payhero/check-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reference }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Polls our own `payments` row for the outcome, and actively re-checks with PayHero
 * every `activeCheckEveryMs` so genuine outcomes resolve promptly. */
export async function pollPaymentStatus(
  reference: string,
  { intervalMs = 3000, timeoutMs = 90000, activeCheckEveryMs = 15000 }: { intervalMs?: number; timeoutMs?: number; activeCheckEveryMs?: number } = {}
): Promise<PaymentPollOutcome> {
  const start = Date.now();
  let lastActiveCheck = 0;
  while (Date.now() - start < timeoutMs) {
    const { data } = await supabase.from('payments').select('status, failure_message').eq('reference', reference).maybeSingle();
    if (data?.status === 'COMPLETE') return { status: 'COMPLETE' };
    if (data?.status === 'FAILED') return { status: 'FAILED', failureMessage: data.failure_message || undefined };

    const elapsed = Date.now() - start;
    if (elapsed - lastActiveCheck >= activeCheckEveryMs) {
      lastActiveCheck = elapsed;
      const checked = await checkPaymentStatusNow(reference);
      if (checked?.status === 'COMPLETE') return { status: 'COMPLETE' };
      if (checked?.status === 'FAILED') return { status: 'FAILED', failureMessage: checked.failureMessage || undefined };
    }

    await new Promise(r => setTimeout(r, intervalMs));
  }
  return { status: 'TIMEOUT' };
}

/** Subscribes to Supabase Realtime for one payment row, calling `onResolved` the instant
 * Kentapay's callback (or the reconciliation cron) writes COMPLETE/FAILED to it — near-instant
 * vs pollPaymentStatus's up-to-3s polling interval. Requires the `payments` table to be added
 * to the `supabase_realtime` publication (see supabase_schema.sql) — RLS's own "Users view own
 * payments" policy already scopes this to rows the current user is allowed to see, same as
 * the regular select. Returns an unsubscribe function. */
function watchPaymentStatus(
  reference: string,
  onResolved: (outcome: { status: 'COMPLETE' | 'FAILED'; failureMessage?: string }) => void
): () => void {
  const channel = supabase
    .channel(`payment-${reference}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'payments', filter: `reference=eq.${reference}` },
      (payload) => {
        const row = payload.new as { status?: string; failure_message?: string };
        if (row.status === 'COMPLETE') onResolved({ status: 'COMPLETE' });
        else if (row.status === 'FAILED') onResolved({ status: 'FAILED', failureMessage: row.failure_message || undefined });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/** The real wait for a payment outcome — races Realtime (near-instant once it fires) against
 * the existing poll (the guaranteed-correct fallback within the same timeout, in case Realtime
 * isn't enabled on the table or the socket drops mid-wait). Whichever resolves first wins;
 * the other is torn down immediately after. Never hangs past `timeoutMs` regardless of which
 * path is working. */
export async function awaitPaymentResolution(
  reference: string,
  opts: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<PaymentPollOutcome> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (outcome: PaymentPollOutcome) => {
      if (settled) return;
      settled = true;
      unsubscribe();
      resolve(outcome);
    };

    const unsubscribe = watchPaymentStatus(reference, finish);
    pollPaymentStatus(reference, opts).then(finish);
  });
}
