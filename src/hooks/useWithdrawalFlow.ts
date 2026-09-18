import { useRef, useState } from 'react';
import { startWithdrawal, awaitPaymentResolution } from '../lib/payments';

export type WithdrawalState = 'idle' | 'pending' | 'success' | 'error';

/** The withdrawal state machine — same shape as usePaymentFlow's collect flow (submit ->
 * start -> await resolution -> success/error), but for a B2C payout instead of an STK
 * collect: no phone/amount to pass in (always the tipster's own saved mpesa_phone and full
 * balance, decided server-side), so it's simpler, but shares the same session-guard pattern
 * to stop a late result from a closed/abandoned withdrawal hijacking a fresh one. */
export function useWithdrawalFlow() {
  const [state, setState] = useState<WithdrawalState>('idle');
  const [error, setError] = useState('');
  const [amount, setAmount] = useState<number | null>(null);
  const sessionRef = useRef(0);

  const reset = () => {
    sessionRef.current++;
    setState('idle');
    setError('');
    setAmount(null);
  };

  const submit = async (requestedAmount: number): Promise<boolean> => {
    const mySession = ++sessionRef.current;
    setState('pending');
    setError('');

    try {
      const { reference, amount: withdrawnAmount } = await startWithdrawal(requestedAmount);
      setAmount(withdrawnAmount);
      const result = await awaitPaymentResolution(reference);
      if (sessionRef.current !== mySession) return false;

      if (result.status === 'COMPLETE') {
        setState('success');
        return true;
      }
      if (result.status === 'FAILED') {
        setState('error');
        setError(result.failureMessage || 'Withdrawal failed. Your balance has been restored — you can try again.');
        return false;
      }
      setState('error');
      setError('Still waiting for confirmation. Check your M-Pesa messages, or try again shortly.');
      return false;
    } catch (err) {
      if (sessionRef.current !== mySession) return false;
      setState('error');
      setError(err instanceof Error ? err.message : 'Failed to start withdrawal.');
      return false;
    }
  };

  return { state, error, amount, submit, reset };
}
