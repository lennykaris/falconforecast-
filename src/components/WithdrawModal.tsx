import React, { useState, useEffect } from 'react';
import { X, Wallet, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';
import { useWithdrawalFlow } from '../hooks/useWithdrawalFlow';
import { PaymentPendingView } from './PaymentPendingView';
import { Confetti } from './Confetti';

// Mirrors api/kentapay/withdraw.js's own MIN_WITHDRAWAL — Safaricom's B2C payout has a
// documented KES 10 minimum. Checked here too so an amount that's obviously too small never
// even reaches the server.
const MIN_WITHDRAWAL = 10;

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  mpesaPhone?: string;
  /** Called after a successful withdrawal so the caller can refetch the real balance rather
   * than trust a locally-decremented guess. */
  onSuccess: () => void;
}

/** The tipster-side counterpart to CheckoutModal — same pending/success shape (full-body
 * pending screen instead of just a spinning button, confetti on success), but for cashing
 * out a chosen amount of a balance instead of paying for one. No phone input: it always pays
 * out to whatever mpesa_phone the tipster already has on file. */
export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, balance, mpesaPhone, onSuccess }) => {
  const { state, error, amount, submit, reset } = useWithdrawalFlow();
  // Defaults to the full balance (the previous always-withdraw-everything behavior) but
  // editable — a tipster may want to leave some balance in for a future larger payout, or
  // just withdraw part of it.
  const [amountInput, setAmountInput] = useState(() => String(balance));
  // Snapshotted the instant Withdraw is clicked — `balance` itself is a live value from
  // AuthContext that changes as soon as the claim RPC deducts it server-side (then the
  // profiles Realtime subscription pushes that into this still-open modal), which is exactly
  // why the pending screen used to show "KSh 0" instead of the real amount.
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);

  // This component stays mounted between opens (the parent always renders <WithdrawModal
  // isOpen={...} />, just toggling the prop), so the useState initializer above only ever
  // runs once — without this, reopening later with a different real balance would still show
  // whatever amount was left over from the first time it was ever opened. Must run before the
  // early return below so this hook's call order never changes across renders.
  useEffect(() => {
    if (isOpen) setAmountInput(String(balance));
  }, [isOpen, balance]);

  if (!isOpen) return null;

  const parsedAmount = parseFloat(amountInput);
  const amountValid = Number.isFinite(parsedAmount) && parsedAmount >= MIN_WITHDRAWAL && parsedAmount <= balance;

  const handleClose = () => {
    reset();
    setPendingAmount(null);
    onClose();
  };

  const handleWithdraw = async () => {
    if (!amountValid) return;
    setPendingAmount(parsedAmount);
    const success = await submit(parsedAmount);
    if (success) onSuccess();
  };

  // The hook's own `amount` (echoed back from the server once startWithdrawal resolves) is
  // authoritative once available; the snapshot only covers the brief gap before that.
  const displayAmount = amount ?? pendingAmount ?? parsedAmount ?? balance;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      {state === 'success' && <Confetti />}
      <div className="relative w-full max-w-sm bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#0EA5E9]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Withdraw Balance</h3>
          </div>
          {state !== 'pending' && (
            <button onClick={handleClose} className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {state === 'success' ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-sky-50 dark:bg-sky-950/40 border-2 border-sky-300 dark:border-sky-700 text-[#0EA5E9] rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              KSh {(amount ?? 0).toLocaleString()} Sent!
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
              Your payout is on its way to {mpesaPhone || 'your M-Pesa number'}.
            </p>
            <button
              onClick={handleClose}
              className="w-full py-3 bg-[#0EA5E9] hover:bg-sky-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all"
            >
              Done
            </button>
          </div>
        ) : state === 'pending' ? (
          <PaymentPendingView amountLabel={`KSh ${displayAmount.toLocaleString()}`} onCancel={handleClose} mode="payout" />
        ) : (
          <div className="p-6 space-y-5">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Available Balance
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                KSh {balance.toLocaleString()}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Amount to Withdraw
                </label>
                <button
                  onClick={() => setAmountInput(String(balance))}
                  className="text-[10px] font-bold text-[#0EA5E9] hover:underline"
                >
                  Max
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-sm">KSh</span>
                <input
                  type="number"
                  min={MIN_WITHDRAWAL}
                  max={balance}
                  step="1"
                  value={amountInput}
                  onChange={e => setAmountInput(e.target.value)}
                  className="w-full pl-12 pr-3.5 py-3 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-black text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#0EA5E9]"
                />
              </div>
              {amountInput.trim() !== '' && !amountValid && (
                <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                  {parsedAmount > balance
                    ? `You only have KSh ${balance.toLocaleString()} available`
                    : `Minimum withdrawal is KSh ${MIN_WITHDRAWAL}`}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 px-1">
              <Smartphone className="w-3.5 h-3.5 flex-shrink-0 text-[#0EA5E9]" />
              {mpesaPhone
                ? <span>Sent to <strong className="font-bold text-slate-800 dark:text-slate-200">{mpesaPhone}</strong></span>
                : <span className="text-amber-600 dark:text-amber-400 font-semibold">No M-Pesa number on file — add one under My Pricing first.</span>}
            </div>

            {error && (
              <p className="flex items-start gap-1.5 text-xs font-semibold text-rose-500">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {error}
              </p>
            )}

            <button
              onClick={handleWithdraw}
              disabled={!amountValid || !mpesaPhone}
              className="w-full py-3.5 bg-[#0EA5E9] hover:bg-sky-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              Withdraw {amountValid ? `KSh ${parsedAmount.toLocaleString()}` : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
