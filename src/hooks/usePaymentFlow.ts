import { useRef, useState } from 'react';
import { startPaymentCollect, awaitPaymentResolution } from '../lib/payments';

interface PaymentFlowParams {
  kind: 'vip_subscription' | 'tipster_subscription';
  tipsterId?: string;
  planId?: string;
  billingCycle?: 'weekly' | 'monthly';
  phone: string;
}

export type PayState = 'idle' | 'pending' | 'success' | 'error';

/** The M-Pesa checkout state machine (submit -> startPaymentCollect -> await resolution ->
 * success/error), shared across checkout modals. */
export function usePaymentFlow() {
  const [payState, setPayState] = useState<PayState>('idle');
  const [payError, setPayError] = useState('');
  const sessionRef = useRef(0);

  const reset = () => {
    sessionRef.current++;
    setPayState('idle');
    setPayError('');
  };

  const submit = async (params: PaymentFlowParams): Promise<boolean> => {
    const mySession = ++sessionRef.current;
    setPayState('pending');
    setPayError('');

    try {
      const { reference } = await startPaymentCollect(params);
      const result = await awaitPaymentResolution(reference);
      if (sessionRef.current !== mySession) return false; // closed or restarted since — ignore

      if (result.status === 'COMPLETE') {
        setPayState('success');
        return true;
      }
      if (result.status === 'FAILED') {
        setPayState('error');
        setPayError(result.failureMessage || 'Payment failed or was declined on your phone. You can try again.');
        return false;
      }
      setPayState('error');
      setPayError('Still waiting for confirmation. Check your phone for the M-Pesa prompt, or try again.');
      return false;
    } catch (err) {
      if (sessionRef.current !== mySession) return false;
      setPayState('error');
      setPayError(err instanceof Error ? err.message : 'Failed to start payment.');
      return false;
    }
  };

  return { payState, payError, submit, reset };
}
