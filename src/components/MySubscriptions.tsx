import React from 'react';
import { Crown, CheckCircle2, Lock, Zap, CalendarDays, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUBSCRIPTION_PLANS } from '../data/predictions';
import { Link } from 'react-router-dom';

interface MySubscriptionsProps {
  onUpgrade?: (plan?: any) => void;
}

export const MySubscriptions: React.FC<MySubscriptionsProps> = ({ onUpgrade }) => {
  const { user, isLoggedIn, isVip } = useAuth();

  const planLabels: Record<string, { label: string; color: string; bg: string; border: string }> = {
    free: {
      label: 'Free Plan',
      color: 'text-slate-500 dark:text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-800/60',
      border: 'border-slate-200 dark:border-slate-700',
    },
    monthly_vip: {
      label: 'Pro Predictor',
      color: 'text-[#00a8ff]',
      bg: 'bg-sky-50 dark:bg-sky-950/40',
      border: 'border-sky-200 dark:border-sky-800/50',
    },
    annual_vip: {
      label: 'Champion VIP',
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800/50',
    },
  };

  const currentPlan = user?.plan ?? 'free';
  const planInfo = planLabels[currentPlan] ?? planLabels.free;

  // Calculate days remaining if VIP
  const daysRemaining = (() => {
    if (!user?.vipExpiresAt) return null;
    const diff = new Date(user.vipExpiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();

  const proFeatures = [
    'All VIP Predictions daily',
    '85%+ Confidence picks',
    'Tipster signal alerts',
    'Priority support',
  ];

  if (!isLoggedIn) {
    return (
      <div className="bg-white dark:bg-[#111c30] border border-sky-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#00a8ff] to-sky-400 px-4 py-3 flex items-center gap-2">
          <Crown className="w-4 h-4 text-white" />
          <h3 className="font-bold text-sm text-white tracking-wide">My Subscription</h3>
        </div>
        <div className="p-5 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Sign in to view your subscription and access VIP predictions.
          </p>
          <Link
            to="/login"
            className="w-full py-2.5 bg-[#00a8ff] hover:bg-[#0090e0] text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            Sign In <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/signup"
            className="w-full py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-lg transition-all hover:border-[#00a8ff] hover:text-[#00a8ff] flex items-center justify-center"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#111c30] border border-sky-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#00a8ff] to-sky-400 px-4 py-3 flex items-center gap-2">
        <Crown className="w-4 h-4 text-white" />
        <h3 className="font-bold text-sm text-white tracking-wide">My Subscription</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Current Plan Badge */}
        <div className={`flex items-center justify-between p-3 rounded-lg border ${planInfo.bg} ${planInfo.border}`}>
          <div className="flex items-center gap-2">
            {currentPlan === 'free' ? (
              <Zap className="w-4 h-4 text-slate-400" />
            ) : currentPlan === 'annual_vip' ? (
              <Crown className="w-4 h-4 text-amber-500" />
            ) : (
              <Crown className="w-4 h-4 text-[#00a8ff]" />
            )}
            <div>
              <p className={`text-xs font-extrabold ${planInfo.color}`}>{planInfo.label}</p>
              <p className="text-[10px] text-slate-400">{user?.email}</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${planInfo.bg} ${planInfo.color} ${planInfo.border}`}>
            {currentPlan === 'free' ? 'Active' : 'VIP'}
          </span>
        </div>

        {/* Days Remaining (for VIP users) */}
        {isVip && daysRemaining !== null && (
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-lg">
            <CalendarDays className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining on your plan
            </p>
          </div>
        )}

        {/* Free plan — show what they're missing */}
        {currentPlan === 'free' && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unlock with VIP:</p>
            {proFeatures.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-2 h-2 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-400">{f}</p>
              </div>
            ))}
          </div>
        )}

        {/* VIP plan — show features unlocked */}
        {isVip && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your benefits:</p>
            {proFeatures.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <p className="text-[11px] text-slate-700 dark:text-slate-300">{f}</p>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        {currentPlan === 'free' ? (
          <button
            onClick={() => onUpgrade && onUpgrade(SUBSCRIPTION_PLANS[1])}
            className="w-full py-2.5 bg-gradient-to-r from-[#00a8ff] to-sky-400 hover:from-[#0090e0] hover:to-sky-500 text-white font-bold text-xs rounded-lg transition-all shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5 active:scale-[0.99]"
          >
            <Crown className="w-3.5 h-3.5" /> Upgrade to VIP — KSh 1,500/mo
          </button>
        ) : (
          <Link
            to="/dashboard"
            className="w-full py-2 border border-sky-200 dark:border-sky-800/50 text-[#00a8ff] font-bold text-xs rounded-lg transition-all hover:bg-sky-50 dark:hover:bg-sky-950/40 flex items-center justify-center gap-1.5"
          >
            View Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};
