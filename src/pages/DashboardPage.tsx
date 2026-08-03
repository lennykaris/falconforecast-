import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePredictions } from '../context/PredictionsContext';
import { PredictionCard } from '../components/PredictionCard';
import type { SubscriptionPlan } from '../types/prediction';
import { SUBSCRIPTION_PLANS } from '../data/predictions';

interface DashboardPageProps {
  onOpenCheckout: (plan: SubscriptionPlan) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenCheckout }) => {
  const { user, isLoggedIn, isVip, loginWithPreset } = useAuth();
  const { predictions } = usePredictions();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const vipPredictions = predictions.filter(p => p.tier === 'vip');
  const popularPlan = SUBSCRIPTION_PLANS.find(p => p.popular) || SUBSCRIPTION_PLANS[1];

  if (!isLoggedIn || !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-5"
        style={{ backgroundColor: 'var(--bg-base)' }}
      >
        <div className="max-w-sm w-full text-center space-y-6">
          <div>
            <h1 className="text-2xl font-black font-display" style={{ color: 'var(--text-primary)' }}>
              Subscriber Dashboard
            </h1>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              Log in to access your picks and subscription details.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => loginWithPreset('vip')}
              className="w-full py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 rounded-xl transition-all hover:brightness-110"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              Demo VIP Login
            </button>
            <button
              onClick={() => loginWithPreset('free')}
              className="w-full py-3.5 text-xs font-semibold rounded-xl border transition-colors"
              style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}
            >
              Demo Free Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-6 md:pt-24 pb-28 md:pb-12 space-y-10">

        {/* Header */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black font-display" style={{ color: 'var(--text-primary)' }}>
                {user.name}
              </h1>
              {isVip && (
                <span
                  className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border font-mono"
                  style={{ color: 'var(--brand)', borderColor: 'var(--brand)' }}
                >
                  VIP
                </span>
              )}
            </div>
            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              {user.email}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border transition-colors"
              style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}
            >
              Billing
            </button>
            {!isVip && (
              <button
                onClick={() => onOpenCheckout(popularPlan)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-950 rounded-lg transition-all hover:brightness-110"
                style={{ backgroundColor: 'var(--brand)' }}
              >
                Upgrade VIP
              </button>
            )}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bet-card space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Active Plan
            </p>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold capitalize font-display" style={{ color: 'var(--text-primary)' }}>
                {user.plan.replace(/_/g, ' ')}
              </h3>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded border"
                style={isVip
                  ? { color: 'var(--brand)', borderColor: 'var(--brand)' }
                  : { color: 'var(--text-muted)', borderColor: 'var(--border)' }
                }
              >
                {isVip ? 'Active' : 'Free'}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {isVip ? 'Renews automatically.' : 'Upgrade to unlock 90%+ confidence picks.'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bet-card space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Monthly Yield
            </p>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono" style={{ color: 'var(--brand)' }}>
                +18.4u
              </span>
              <span className="text-xs font-bold" style={{ color: 'var(--brand)' }}>88% rate</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              14 Wins / 2 Losses on high-confidence picks
            </p>
          </div>

          <div className="p-6 rounded-2xl bet-card space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              VIP Notifications
            </p>
            <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Instant Match Alerts
            </h4>
            <span
              className="text-xs font-semibold text-emerald-500 flex items-center gap-1"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active & Enabled
            </span>
          </div>
        </div>

        {/* VIP Predictions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black font-display" style={{ color: 'var(--text-primary)' }}>
                VIP Picks
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {isVip
                  ? 'High-confidence picks unlocked for your subscription.'
                  : 'Subscribe to VIP to unlock all predictions.'}
              </p>
            </div>
            {!isVip && (
              <button
                onClick={() => onOpenCheckout(popularPlan)}
                className="text-xs font-semibold underline underline-offset-2"
                style={{ color: 'var(--brand)' }}
              >
                Unlock all ({vipPredictions.length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {vipPredictions.map(prediction => (
              <PredictionCard
                key={prediction.id}
                prediction={prediction}
                onUnlockClick={() => onOpenCheckout(popularPlan)}
              />
            ))}
          </div>
        </div>

        {/* Billing Modal */}
        {paymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm">
            <div
              className="w-full max-w-sm rounded-2xl p-7 space-y-5 text-center bet-card shadow-2xl"
            >
              <h3 className="text-base font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                Manage Billing
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Demo placeholder — in production, this opens your Stripe Customer Portal to update card details, view invoices, and manage your subscription.
              </p>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="w-full py-3 text-xs font-bold rounded-xl border transition-colors"
                style={{ color: 'var(--text-primary)', borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
