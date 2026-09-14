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
