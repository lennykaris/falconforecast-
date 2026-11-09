import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, ShieldCheck, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePaymentFlow } from '../hooks/usePaymentFlow';
import { PaymentPendingView } from '../components/PaymentPendingView';

export const TipsterApplyPage: React.FC = () => {
  const { user, isLoggedIn, isTipster, isAdmin } = useAuth();
  const { payState, payError, submit, reset } = usePaymentFlow();

  const [bio, setBio] = useState('');
  const [weeklyPrice, setWeeklyPrice] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="max-w-sm w-full text-center space-y-6">
          <div>
            <h1 className="text-2xl font-black font-display" style={{ color: 'var(--text-primary)' }}>Become a Tipster</h1>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Log in to apply.</p>
          </div>
          <Link
            to="/login"
            className="block w-full py-3.5 text-xs font-bold uppercase tracking-wider text-center text-slate-950 rounded-xl transition-all hover:brightness-110"
            style={{ backgroundColor: 'var(--brand)' }}
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (isAdmin || isTipster) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="max-w-sm w-full text-center space-y-5">
          <ShieldCheck className="w-10 h-10 mx-auto" style={{ color: 'var(--brand)' }} />
          <h1 className="text-xl font-black font-display" style={{ color: 'var(--text-primary)' }}>
            You're already a tipster
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Manage your tips and pricing from your tipster panel.
          </p>
          <Link
            to="/tipster-dashboard"
            className="block w-full py-3.5 text-xs font-bold uppercase tracking-wider text-center text-slate-950 rounded-xl transition-all hover:brightness-110"
            style={{ backgroundColor: 'var(--brand)' }}
          >
            Go to Tipster Panel
          </Link>
        </div>
      </div>
    );
  }

  if (user.tipsterStatus === 'pending' || submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="max-w-sm w-full text-center space-y-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'rgba(245,158,11,0.14)' }}>
            <Clock className="w-6 h-6" style={{ color: '#d97706' }} />
          </div>
          <div>
            <h1 className="text-xl font-black font-display" style={{ color: 'var(--text-primary)' }}>
              Application pending
            </h1>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              Your tipster application is awaiting admin review. We'll unlock your tipster panel as soon as it's approved.
            </p>
          </div>
          <Link
            to="/profile"
            className="block w-full py-3.5 text-xs font-semibold text-center rounded-xl border transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  if (payState === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="max-w-sm w-full rounded-2xl bet-card">
          <PaymentPendingView amountLabel="KSh 500" onCancel={reset} />
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submit({
      kind: 'tipster_application',
      phone,
      bio: bio.trim(),
      weeklyPrice: Number(weeklyPrice),
      monthlyPrice: Number(monthlyPrice),
    });
    if (success) setSubmitted(true);
  };

  const perks = [
    'Publish free and VIP predictions to the whole platform',
    'Set your own weekly & monthly subscription pricing',
    'Keep 80% of every subscription — Falcon Forecast takes 20%',
    'Build a public track record with win-rate stats',
    'Pay a KSh 500 application fee by M-Pesa',
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="max-w-lg mx-auto px-5 pt-8 md:pt-20 pb-28 md:pb-16 space-y-6">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--brand)' }}>
            Tipster application
          </p>
          <h1 className="text-2xl font-black font-display" style={{ color: 'var(--text-primary)' }}>
            Become a Tipster
          </h1>
        </div>

        <ul className="space-y-2">
          {perks.map(perk => (
            <li key={perk} className="flex items-start gap-2.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-500" />
              {perk}
            </li>
          ))}
        </ul>

        <form onSubmit={handleSubmit} className="rounded-2xl p-6 bet-card space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest block" style={{ color: 'var(--text-secondary)' }}>
              M-Pesa Phone Number
            </label>
            <input
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="0712345678"
              className="input-field w-full rounded-xl px-4 py-3 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest block" style={{ color: 'var(--text-secondary)' }}>
              Bio
            </label>
            <textarea
              required
              rows={4}
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={2000}
              placeholder="Tell subscribers about your expertise — leagues you follow, your approach to analysis, track record..."
              className="input-field w-full rounded-xl px-4 py-3 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest block" style={{ color: 'var(--text-secondary)' }}>
                Weekly Price (KSh)
              </label>
              <input
                type="number"
                min={100}
                required
                value={weeklyPrice}
                onChange={e => setWeeklyPrice(e.target.value)}
                placeholder="Set your weekly price"
                className="input-field w-full rounded-xl px-4 py-3 text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest block" style={{ color: 'var(--text-secondary)' }}>
                Monthly Price (KSh)
              </label>
              <input
                type="number"
                min={200}
                required
                value={monthlyPrice}
                onChange={e => setMonthlyPrice(e.target.value)}
                placeholder="Set your monthly price"
                className="input-field w-full rounded-xl px-4 py-3 text-xs font-mono"
              />
            </div>
          </div>

          {payError && (
            <p className="text-center text-xs font-semibold text-rose-500">{payError}</p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 rounded-xl transition-all hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--brand)' }}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Pay KSh 500 & Apply
          </button>
          <p className="text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>
            An M-Pesa prompt will be sent to your phone. Your application is submitted after payment is confirmed, then reviewed by an admin.
          </p>
        </form>
      </div>
    </div>
  );
};
