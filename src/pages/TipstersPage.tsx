import React, { useState } from 'react';
import { ShieldCheck, Crown, CheckCircle2, Zap, Star, UserCheck, Lock } from 'lucide-react';
import { useTipsters } from '../context/TipstersContext';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types/prediction';

export const TipstersPage: React.FC = () => {
  const { tipsters, subscribeToTipster, isSubscribedToTipster } = useTipsters();
  const { user, loginWithPreset } = useAuth();
  
  const [selectedTipster, setSelectedTipster] = useState<User | null>(null);
  const [subscriptionCycle, setSubscriptionCycle] = useState<'weekly' | 'monthly'>('monthly');
  const [successMessage, setSuccessMessage] = useState('');

  const activeTipsters = tipsters.filter(t => t.tipsterStatus === 'active' || t.verified);

  const handleSubscribe = (tipster: User) => {
    if (!user) {
      loginWithPreset('free');
      return;
    }
    const price = subscriptionCycle === 'weekly' ? (tipster.weeklyPrice || 9.99) : (tipster.monthlyPrice || 29.99);
    subscribeToTipster(user.id, user.name, tipster.id, subscriptionCycle, price);
    setSuccessMessage(`Successfully subscribed to ${tipster.name} on a ${subscriptionCycle} pass!`);
    setTimeout(() => setSuccessMessage(''), 4000);
    setSelectedTipster(null);
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-6 md:pt-24 pb-28 md:pb-12 space-y-8">
        
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[#0EA5E9] text-xs font-bold uppercase tracking-wider">
            <Crown className="w-4 h-4 fill-[#0EA5E9]" />
            <span>Verified Tipster Marketplace</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-slate-900">
            Subscribe to Expert Tipsters
          </h1>
          <p className="text-sm text-slate-600">
            Subscribe weekly or monthly directly to top verified sports analysts and receive their high-odds VIP predictions.
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-2xl text-center shadow-md animate-in fade-in">
            ✅ {successMessage}
          </div>
        )}

        {/* Tipsters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTipsters.map(tipster => {
            const subscribed = user ? isSubscribedToTipster(user.id, tipster.id) : false;

            return (
              <div
                key={tipster.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  {/* Avatar & Header */}
                  <div className="flex items-center space-x-4">
                    <img
                      src={tipster.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                      alt={tipster.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#0EA5E9]"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 className="text-lg font-black text-slate-900">{tipster.name}</h3>
                        {tipster.verified && (
                          <CheckCircle2 className="w-4 h-4 text-[#0EA5E9] fill-sky-100" />
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 block">
                        {tipster.subscribersCount || 100}+ Active Subscribers
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-600 leading-relaxed min-h-[48px]">
                    {tipster.bio || 'Professional football betting tipster delivering high win rate picks.'}
                  </p>

                  {/* Metrics Badges */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-2xl text-center space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Win Rate</span>
                      <span className="text-xl font-black text-[#0EA5E9] font-mono">{tipster.winRate || 85}%</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Tips</span>
                      <span className="text-xl font-black text-slate-900 font-mono">{tipster.totalTips || 150}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing & Subscribe Actions */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Weekly Pass: <strong className="text-slate-900 font-mono">${tipster.weeklyPrice || 9.99}/wk</strong></span>
                    <span>Monthly Pass: <strong className="text-[#0EA5E9] font-mono">${tipster.monthlyPrice || 29.99}/mo</strong></span>
                  </div>

                  {subscribed ? (
                    <div className="w-full py-3 bg-emerald-50 text-emerald-700 font-bold text-xs uppercase tracking-wider rounded-xl border border-emerald-300 text-center flex items-center justify-center space-x-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>Subscribed & VIP Unlocked</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedTipster(tipster)}
                      className="w-full py-3.5 bg-[#0EA5E9] hover:bg-sky-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Crown className="w-4 h-4 fill-white" />
                      <span>Subscribe to {tipster.name.split(' ')[0]}</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Subscribe Confirmation Modal */}
        {selectedTipster && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-6">
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-sky-50 text-[#0EA5E9] border border-sky-200 flex items-center justify-center mx-auto">
                  <Crown className="w-6 h-6 fill-[#0EA5E9]" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Subscribe to {selectedTipster.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Choose your billing pass cycle to unlock all predictions published by this tipster.
                </p>
              </div>

              {/* Cycle Toggle */}
              <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSubscriptionCycle('weekly')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                    subscriptionCycle === 'weekly'
                      ? 'bg-white text-[#0EA5E9] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Weekly Pass (${selectedTipster.weeklyPrice || 9.99})
                </button>

                <button
                  type="button"
                  onClick={() => setSubscriptionCycle('monthly')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                    subscriptionCycle === 'monthly'
                      ? 'bg-[#0EA5E9] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Monthly Pass (${selectedTipster.monthlyPrice || 29.99})
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleSubscribe(selectedTipster)}
                  className="w-full py-3.5 bg-[#0EA5E9] hover:bg-sky-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Confirm Subscription (${subscriptionCycle === 'weekly' ? selectedTipster.weeklyPrice : selectedTipster.monthlyPrice})</span>
                </button>

                <button
                  onClick={() => setSelectedTipster(null)}
                  className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
