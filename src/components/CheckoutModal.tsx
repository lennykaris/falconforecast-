import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Lock,
  Crown,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Smartphone,
} from 'lucide-react';
import type { SubscriptionPlan } from '../types/prediction';
import { useAuth } from '../context/AuthContext';
import { startKentapayCollect, pollPaymentStatus } from '../lib/payments';

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

  const [phoneNumber, setPhoneNumber] = useState('');
  const [payState, setPayState] = useState<'idle' | 'pending' | 'error'>('idle');
  const [payError, setPayError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // CheckoutModal stays mounted for the app's entire lifetime (isOpen just toggles whether it
  // renders), so closing it doesn't cancel an in-flight pollPaymentStatus call on its own — a
  // late result from an abandoned payment could otherwise fire success/navigate against
  // whatever the user has since reopened this modal for. Each close or new submit bumps this,
  // and a poll's result is only acted on if it's still the current session when it resolves.
  const sessionRef = useRef(0);

  if (!isOpen) return null;

  const handleClose = () => {
    sessionRef.current++;
    setPhoneNumber('');
    setPayState('idle');
    setPayError('');
    onClose();
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    const mySession = ++sessionRef.current;
    setPayState('pending');
    setPayError('');

    try {
      const { reference } = await startKentapayCollect({
        kind: 'vip_subscription',
        planId: selectedPlan.id,
        phone: phoneNumber,
      });

      const result = await pollPaymentStatus(reference);
      if (sessionRef.current !== mySession) return; // closed or restarted since — ignore

      if (result.status === 'COMPLETE') {
        await refetchUser();
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          handleClose();
          navigate('/dashboard');
        }, 1800);
      } else if (result.status === 'FAILED') {
        setPayState('error');
        setPayError(result.failureMessage || 'Payment failed or was declined on your phone. You can try again.');
      } else {
        setPayState('error');
        setPayError('Still waiting for confirmation. Check your phone for the M-Pesa prompt, or try again.');
      }
    } catch (err) {
      if (sessionRef.current !== mySession) return;
      setPayState('error');
      setPayError(err instanceof Error ? err.message : 'Failed to start payment.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">

        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-[#0EA5E9] fill-[#0EA5E9]" />
            <h3 className="text-base font-bold text-slate-900">
              Activate VIP Subscription
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {isSuccess ? (
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
                    disabled={payState === 'pending'}
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500 disabled:opacity-60"
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
                  disabled={payState === 'pending' || !phoneNumber.trim()}
                  className="w-full py-3.5 bg-[#0EA5E9] hover:bg-sky-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  {payState === 'pending' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Check your phone for the M-Pesa prompt...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay {selectedPlan.price} & Unlock VIP</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0EA5E9]" />
                <span>Paid securely via M-Pesa • Cancel Anytime</span>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
