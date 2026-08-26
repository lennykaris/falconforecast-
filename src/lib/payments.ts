import { supabase } from './supabase';

interface CollectParams {
  kind: 'tipster_subscription' | 'vip_subscription';
  tipsterId?: string;
  planId?: string;
  billingCycle?: 'weekly' | 'monthly';
  phone: string;
}

/** Kicks off a real M-Pesa STK push via our Pretium proxy. The response only means the
 * request was accepted and the prompt is (probably) on its way to the phone — never treat
 * this as payment confirmation. Poll or listen for the webhook-driven DB update instead. */
export async function startPretiumCollect(params: CollectParams): Promise<{ reference: string; amount: number }> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('You must be logged in to pay.');

  const res = await fetch('/api/pretium/collect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Failed to start payment');
  return data;
}

export type PaymentPollResult = 'COMPLETE' | 'FAILED' | 'TIMEOUT';

/** Polls our own `payments` row (RLS-scoped to the current user) for the outcome the Pretium
 * webhook writes once the user has approved or declined the M-Pesa prompt on their phone. */
export async function pollPaymentStatus(
  reference: string,
  { intervalMs = 3000, timeoutMs = 90000 }: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<PaymentPollResult> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const { data } = await supabase.from('payments').select('status').eq('reference', reference).maybeSingle();
    if (data?.status === 'COMPLETE') return 'COMPLETE';
    if (data?.status === 'FAILED') return 'FAILED';
    await new Promise(r => setTimeout(r, intervalMs));
  }
  return 'TIMEOUT';
}
