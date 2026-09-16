import React from 'react';
import { X, Wallet, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';
import { useWithdrawalFlow } from '../hooks/useWithdrawalFlow';
import { PaymentPendingView } from './PaymentPendingView';
import { Confetti } from './Confetti';

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
 * out a balance instead of paying for one. No phone/amount inputs: it always withdraws the
 * full available balance to whatever mpesa_phone the tipster already has on file. */
export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, balance, mpesaPhone, onSuccess }) => {
  const { state, error, amount, submit, reset } = useWithdrawalFlow();

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleWithdraw = async () => {
    const success = await submit();
    if (success) onSuccess();
  };

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
          <PaymentPendingView amountLabel={`KSh ${balance.toLocaleString()}`} onCancel={handleClose} />
        ) : (
          <div className="p-6 space-y-5">
            <div className="p-4 bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900 rounded-2xl text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Available Balance
              </span>
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                KSh {balance.toLocaleString()}
              </span>
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
              disabled={balance <= 0 || !mpesaPhone}
              className="w-full py-3.5 bg-[#0EA5E9] hover:bg-sky-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              Withdraw KSh {balance.toLocaleString()}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
