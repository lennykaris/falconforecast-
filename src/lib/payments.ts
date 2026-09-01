import { supabase } from './supabase';

interface CollectParams {
  kind: 'tipster_subscription' | 'vip_subscription';
  tipsterId?: string;
  planId?: string;
  billingCycle?: 'weekly' | 'monthly';
  phone: string;
}

/** Kicks off a real M-Pesa STK push via our payment provider proxy. The response only means
 * the request was accepted and the prompt is (probably) on its way to the phone — never treat
 * this as payment confirmation. Poll or listen for the webhook-driven DB update instead.
 *
 * TEMPORARY: mid-migration from Pretium to PayHero — api/payhero/collect.js doesn't exist
 * yet, so this fails fast with an honest message instead of hitting a deleted endpoint. */
export async function startPretiumCollect(params: CollectParams): Promise<{ reference: string; amount: number }> {
  void params;
  throw new Error('Payments are being upgraded to a new provider — check back shortly.');
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
