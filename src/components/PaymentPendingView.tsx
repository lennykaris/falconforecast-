import React from 'react';
import { Smartphone, X } from 'lucide-react';

interface PaymentPendingViewProps {
  amountLabel: string;
  onCancel: () => void;
}

/** The full "waiting for M-Pesa" screen — replaces the whole checkout form while a payment is
 * pending, instead of only the submit button showing a spinner while the form (phone input,
 * pay button) sits there looking interactive. Nothing to fill in anymore at this point; the
 * only real action left is waiting for the phone, or bailing out. */
export const PaymentPendingView: React.FC<PaymentPendingViewProps> = ({ amountLabel, onCancel }) => {
  return (
    <div className="p-8 text-center space-y-5">
      <div className="relative w-20 h-20 mx-auto">
        <span className="absolute inset-0 rounded-full bg-sky-400/30 animate-ping" />
        <div className="relative w-20 h-20 rounded-full bg-sky-50 dark:bg-sky-950/40 border-2 border-sky-300 dark:border-sky-700 flex items-center justify-center">
          <Smartphone className="w-8 h-8 text-[#0EA5E9]" />
        </div>
      </div>

      <div className="space-y-1.5">
        <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
          Check your phone
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
          An M-Pesa prompt for <strong className="font-bold text-slate-700 dark:text-slate-200">{amountLabel}</strong> was sent to your phone.
          Enter your PIN to complete it.
        </p>
      </div>

      <div className="flex items-center justify-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

      <button
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      >
        <X className="w-3 h-3" /> Cancel and go back
      </button>

      {/* Realtime + polling should always resolve this, but if M-Pesa itself is slow or a
          network glitch stalls both, the user needs a way out that isn't just "keep staring
          at this screen." */}
      <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-1">
        Taking a while?{' '}
        <a href="mailto:info@FalconForecast.com?subject=Payment%20stuck" className="font-semibold text-slate-500 dark:text-slate-400 hover:text-[#0EA5E9] underline">
          Contact support
        </a>
      </p>
    </div>
  );
};
