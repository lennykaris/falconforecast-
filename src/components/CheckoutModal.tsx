import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Lock,
  Crown,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Zap,
} from 'lucide-react';
import type { SubscriptionPlan } from '../types/prediction';
import { useAuth } from '../context/AuthContext';
import { usePaymentFlow } from '../hooks/usePaymentFlow';
import { PaymentPendingView } from './PaymentPendingView';
import { Confetti } from './Confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: SubscriptionPlan;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
}) => {
  const { refetchUser } = useAuth();
  const navigate = useNavigate();
  const { payState, payError, submit, reset } = usePaymentFlow();

  const [phoneNumber, setPhoneNumber] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    setPhoneNumber('');
    onClose();
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    const success = await submit({ kind: 'vip_subscription', planId: selectedPlan.id, phone: phoneNumber });
    if (success) {
      await refetchUser();
      setTimeout(() => {
        reset();
        setPhoneNumber('');
        onClose();
        navigate('/dashboard');
      }, 2200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      {payState === 'success' && <Confetti />}
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">

        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-[#0EA5E9] fill-[#0EA5E9]" />
            <h3 className="text-base font-bold text-slate-900">
              Activate VIP Subscription
            </h3>
          </div>
          {payState !== 'pending' && (
            <button
              onClick={handleClose}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        {payState === 'success' ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-sky-50 border-2 border-sky-300 text-[#0EA5E9] rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-extrabold text-slate-900">
              VIP Membership Activated!
            </h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              You now have full unlocked access to all high-confidence predictions, value accumulators, and tactical breakdowns.
            </p>
            <p className="text-[11px] text-[#0EA5E9] font-mono animate-pulse">
              Redirecting to your Subscriber Dashboard...
            </p>
          </div>
        ) : payState === 'pending' ? (
          <PaymentPendingView amountLabel={`${selectedPlan.price} ${selectedPlan.period}`} onCancel={handleClose} />
        ) : (
          <div className="p-6 space-y-6">

            {/* Plan Summary Box */}
            <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Selected Plan
                </span>
                <h4 className="font-bold text-slate-900 text-sm">{selectedPlan.name}</h4>
                <p className="text-[11px] text-[#0EA5E9] font-medium">{selectedPlan.description.substring(0, 50)}...</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {selectedPlan.price}
                </span>
                <span className="text-xs text-slate-500 block">{selectedPlan.period}</span>
              </div>
            </div>

            {/* M-Pesa Checkout Form */}
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div className="space-y-3 p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" /> M-Pesa Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="07XX XXX XXX"
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-emerald-700">
                  An STK push prompt will be sent to your phone for payment of <strong className="font-bold">{selectedPlan.price}</strong>.
                </p>
              </div>

              {payError && (
                <p className="text-xs font-semibold text-rose-500">{payError}</p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!phoneNumber.trim()}
                  className="w-full py-3.5 bg-[#0EA5E9] hover:bg-sky-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  <Lock className="w-4 h-4" />
                  <span>Pay {selectedPlan.price} & Unlock VIP</span>
                </button>
              </div>

              {/* Trust signals — a payments modal is exactly where a first-time buyer's
                  guard is up highest; make the "is this legit" answer visible right where
                  they're about to hand over their PIN, not buried in a footer somewhere. */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="flex flex-col items-center gap-1 text-center">
                  <ShieldCheck className="w-4 h-4 text-[#0EA5E9]" />
                  <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">Secure M-Pesa Checkout</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <Zap className="w-4 h-4 text-[#0EA5E9]" />
                  <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">Instant Activation</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <Lock className="w-4 h-4 text-[#0EA5E9]" />
                  <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">Cancel Anytime</span>
                </div>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
