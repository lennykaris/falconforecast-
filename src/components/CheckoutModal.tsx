import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  CreditCard, 
  Lock, 
  Crown, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  Zap
} from 'lucide-react';
import type { SubscriptionPlan } from '../types/prediction';
import { useAuth } from '../context/AuthContext';

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
  const { subscribeToPlan } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card' | 'apple'>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('0712 345 678');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('888');
  const [nameOnCard, setNameOnCard] = useState('Alex Rivera');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      subscribeToPlan(selectedPlan.id);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        navigate('/dashboard');
      }, 1800);
    }, 1500);
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
            onClick={onClose}
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

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                    paymentMethod === 'mpesa'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span>M-Pesa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-sky-50 border-[#0EA5E9] text-[#0EA5E9]'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('apple')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                    paymentMethod === 'apple'
                      ? 'bg-sky-50 border-[#0EA5E9] text-[#0EA5E9]'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Apple Pay</span>
                </button>
              </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              {paymentMethod === 'mpesa' && (
                <div className="space-y-3 p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                      M-Pesa Phone Number
                    </label>
                    <input
                      type="text"
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
              )}

              {paymentMethod === 'card' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={nameOnCard}
                      onChange={e => setNameOnCard(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0EA5E9]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600">Card Number (Demo Mock)</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#0EA5E9]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-600">Expires</label>
                      <input
                        type="text"
                        required
                        value={expiry}
                        onChange={e => setExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#0EA5E9]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-600">CVC</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cvc}
                        onChange={e => setCvc(e.target.value)}
                        placeholder="123"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#0EA5E9]"
                      />
                    </div>
                  </div>
                </>
              )}

              {paymentMethod === 'apple' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                  <p className="text-xs text-slate-700 font-medium">
                    1-Click Apple Pay Authorization Active.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Clicking complete will authorize payment of {selectedPlan.price}.
                  </p>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-[#0EA5E9] hover:bg-sky-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Processing Secure Transaction...</span>
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
                <span>256-Bit SSL Encrypted Mock Simulation • Cancel Anytime</span>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
