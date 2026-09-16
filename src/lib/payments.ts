import { supabase } from './supabase';

interface CollectParams {
  kind: 'tipster_subscription' | 'vip_subscription';
  tipsterId?: string;
  planId?: string;
  billingCycle?: 'weekly' | 'monthly';
  phone: string;
}

/** Kicks off a real M-Pesa STK push via our Kentapay proxy. The response only means the
 * request was accepted and the prompt is (probably) on its way to the phone — never treat
 * this as payment confirmation. Poll or listen for the callback-driven DB update instead. */
export async function startKentapayCollect(params: CollectParams): Promise<{ reference: string; amount: number }> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('You must be logged in to pay.');

  const res = await fetch('/api/kentapay/collect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Failed to start payment');
  return data;
}

/** Kicks off a real M-Pesa B2C payout of a tipster's full withdrawable balance (see
 * api/kentapay/withdraw.js — always the whole balance, no amount to pass). Same "accepted,
 * not yet confirmed" caveat as startKentapayCollect — the actual outcome still comes from
 * the same `payments` row via awaitPaymentResolution below. */
export async function startWithdrawal(): Promise<{ reference: string; amount: number }> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('You must be logged in to withdraw.');

  const res = await fetch('/api/kentapay/withdraw', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Failed to start withdrawal');
  return data;
}

export type PaymentPollResult = 'COMPLETE' | 'FAILED' | 'TIMEOUT';

export interface PaymentPollOutcome {
  status: PaymentPollResult;
  /** The real reason from Kentapay's callback (e.g. "Request cancelled by user") — only set
   * when status is 'FAILED'. Falls back to a generic message in the UI when this is empty,
   * which happens for older rows or callbacks that didn't include a description. */
  failureMessage?: string;
}

/** Polls our own `payments` row (RLS-scoped to the current user) for the outcome Kentapay's
 * callback writes once the user has approved or declined the M-Pesa prompt on their phone. */
export async function pollPaymentStatus(
  reference: string,
  { intervalMs = 3000, timeoutMs = 90000 }: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<PaymentPollOutcome> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const { data } = await supabase.from('payments').select('status, failure_message').eq('reference', reference).maybeSingle();
    if (data?.status === 'COMPLETE') return { status: 'COMPLETE' };
    if (data?.status === 'FAILED') return { status: 'FAILED', failureMessage: data.failure_message || undefined };
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
