import React, { useState } from 'react';
import {
  Crown, CheckCircle2, Star, UserCheck, Lock,
  Filter, Trophy, Zap, X, TrendingUp
} from 'lucide-react';
import { useTipsters } from '../context/TipstersContext';
import { useAuth } from '../context/AuthContext';
import { ALL_LEAGUES, ALL_MARKETS } from '../data/tipsters';
import type { User } from '../types/prediction';

export const TipstersPage: React.FC = () => {
  const { tipsters, subscribeToTipster, isSubscribedToTipster } = useTipsters();
  const { user } = useAuth();

  const [selectedTipster, setSelectedTipster] = useState<User | null>(null);
  const [subscriptionCycle, setSubscriptionCycle] = useState<'weekly' | 'monthly'>('monthly');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters
  const [activeLeague, setActiveLeague] = useState<string>('All');
  const [activeMarket, setActiveMarket] = useState<string>('All');

  const activeTipsters = tipsters.filter(t => t.tipsterStatus === 'active' || t.verified);

  const filtered = activeTipsters.filter(t => {
    const leagueOk = activeLeague === 'All' || (t.leagues || []).includes(activeLeague);
    const marketOk = activeMarket === 'All' || (t.markets || []).includes(activeMarket);
    return leagueOk && marketOk;
  });

  const handleSubscribe = (tipster: User) => {
    if (!user) return;
    const price = subscriptionCycle === 'weekly'
      ? (tipster.weeklyPrice || 9.99)
      : (tipster.monthlyPrice || 29.99);
    subscribeToTipster(user.id, user.name, tipster.id, subscriptionCycle, price);
    setSuccessMessage(`✅ Subscribed to ${tipster.name} — ${subscriptionCycle} pass activated!`);
    setTimeout(() => setSuccessMessage(''), 4000);
    setSelectedTipster(null);
  };

  const clearFilters = () => { setActiveLeague('All'); setActiveMarket('All'); };
  const hasFilters = activeLeague !== 'All' || activeMarket !== 'All';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1827]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-24 pb-28 md:pb-12 space-y-8">

        {/* ── Hero Header ── */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[#0EA5E9] text-xs font-bold uppercase tracking-wider">
            <Crown className="w-4 h-4 fill-[#0EA5E9]" />
            <span>Verified Tipster Marketplace</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Subscribe to Expert Tipsters
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Browse verified football analysts by league and market type. Subscribe directly to unlock their VIP predictions.
          </p>
        </div>

        {/* ── Success Toast ── */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-2xl text-center shadow-md">
            {successMessage}
          </div>
        )}

        {/* ── Filter Bar ── */}
        <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Filter className="w-3.5 h-3.5 text-[#0EA5E9]" />
              Filter Tipsters
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-[10px] font-bold text-rose-500 hover:text-rose-700"
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>

          {/* League filter chips */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
              <Trophy className="w-3 h-3" /> League
            </p>
            <div className="flex flex-wrap gap-2">
              {['All', ...ALL_LEAGUES].map(lg => (
                <button
                  key={lg}
                  onClick={() => setActiveLeague(lg)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                    activeLeague === lg
                      ? 'bg-[#0EA5E9] text-white border-[#0EA5E9]'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-[#0EA5E9] hover:text-[#0EA5E9]'
                  }`}
                >
                  {lg}
                </button>
              ))}
            </div>
          </div>

          {/* Market filter chips */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Market Type
            </p>
            <div className="flex flex-wrap gap-2">
              {['All', ...ALL_MARKETS].map(mk => (
                <button
                  key={mk}
                  onClick={() => setActiveMarket(mk)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                    activeMarket === mk
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-amber-400 hover:text-amber-600'
                  }`}
                >
                  {mk}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Results count ── */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing <strong>{filtered.length}</strong> of {activeTipsters.length} active tipsters
            {hasFilters && <span className="text-[#0EA5E9]"> (filtered)</span>}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            Sorted by win rate
          </div>
        </div>

        {/* ── Tipster Cards Grid ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 space-y-2">
            <Star className="w-10 h-10 text-slate-200 mx-auto" />
            <p className="text-sm font-bold text-slate-400">No tipsters match these filters</p>
            <button onClick={clearFilters} className="text-xs text-[#0EA5E9] underline underline-offset-2">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...filtered]
              .sort((a, b) => (b.winRate || 0) - (a.winRate || 0))
              .map(tipster => {
                const subscribed = user ? isSubscribedToTipster(user.id, tipster.id) : false;
                return (
                  <div
                    key={tipster.id}
                    className="group bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-4">
                      {/* Avatar & Name */}
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={tipster.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                            alt={tipster.name}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#0EA5E9]"
                          />
                          {tipster.verified && (
                            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0EA5E9] rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white">{tipster.name}</h3>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {tipster.subscribersCount?.toLocaleString() || 0} subscribers
                          </span>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {tipster.bio}
                      </p>

                      {/* League Tags */}
                      {tipster.leagues && tipster.leagues.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {tipster.leagues.map(lg => (
                            <button
                              key={lg}
                              onClick={() => setActiveLeague(lg)}
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-sky-950/40 text-[#0EA5E9] border border-sky-200 dark:border-sky-800 hover:bg-sky-100 transition-colors"
                            >
                              {lg}
                            </button>
                          ))}
                          {tipster.markets && tipster.markets.map(mk => (
                            <button
                              key={mk}
                              onClick={() => setActiveMarket(mk)}
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
                            >
                              {mk}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900 rounded-2xl text-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Win Rate</span>
                          <span className="text-xl font-black text-[#0EA5E9] font-mono">{tipster.winRate}%</span>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-2xl text-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Tips</span>
                          <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{tipster.totalTips}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Weekly</p>
                          <p className="text-base font-black text-slate-900 dark:text-white font-mono">KSh {tipster.weeklyPrice}<span className="text-[10px] text-slate-400">/wk</span></p>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-600" />
                        <div className="text-center">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Monthly</p>
                          <p className="text-base font-black text-[#0EA5E9] font-mono">KSh {tipster.monthlyPrice}<span className="text-[10px] text-slate-400">/mo</span></p>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-600" />
                        <div className="text-center">
                          <p className="text-[9px] font-bold text-emerald-500 uppercase">Save</p>
                          <p className="text-xs font-black text-emerald-600">
                            {Math.round(100 - ((tipster.monthlyPrice || 1500) / ((tipster.weeklyPrice || 500) * 4.3)) * 100)}%
                          </p>
                        </div>
                      </div>

                      {subscribed ? (
                        <div className="w-full py-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider rounded-xl border border-emerald-300 dark:border-emerald-700 text-center flex items-center justify-center space-x-1.5">
                          <UserCheck className="w-4 h-4" />
                          <span>Subscribed — VIP Unlocked</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (!user) { window.location.href = '/login'; return; }
                            setSelectedTipster(tipster);
                          }}
                          className="w-full py-3.5 bg-[#0EA5E9] hover:bg-sky-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all hover:shadow-lg flex items-center justify-center space-x-1.5"
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
        )}

        {/* ── Subscribe Modal ── */}
        {selectedTipster && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5">
              <button
                onClick={() => setSelectedTipster(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-2">
                <img
                  src={selectedTipster.avatarUrl}
                  alt={selectedTipster.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#0EA5E9] mx-auto"
                />
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Subscribe to {selectedTipster.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Choose your billing cycle to unlock all of this tipster's VIP predictions.
                </p>
              </div>

              {/* Cycle Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSubscriptionCycle('weekly')}
                  className={`p-4 rounded-2xl border-2 text-center transition-all ${
                    subscriptionCycle === 'weekly'
                      ? 'border-[#0EA5E9] bg-sky-50 dark:bg-sky-950/40'
                      : 'border-slate-200 dark:border-slate-600 hover:border-sky-300'
                  }`}
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Weekly</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    KSh {selectedTipster.weeklyPrice}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">per week</p>
                </button>
                <button
                  onClick={() => setSubscriptionCycle('monthly')}
                  className={`p-4 rounded-2xl border-2 text-center transition-all relative overflow-hidden ${
                    subscriptionCycle === 'monthly'
                      ? 'border-[#0EA5E9] bg-sky-50 dark:bg-sky-950/40'
                      : 'border-slate-200 dark:border-slate-600 hover:border-sky-300'
                  }`}
                >
                  <span className="absolute top-2 right-2 text-[9px] font-black text-white bg-emerald-500 px-1.5 py-0.5 rounded-full">
                    BEST VALUE
                  </span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Monthly</p>
                  <p className="text-2xl font-black text-[#0EA5E9] font-mono">
                    KSh {selectedTipster.monthlyPrice}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">per month</p>
                </button>
              </div>

              {/* Summary */}
              <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3 text-xs space-y-1 border border-slate-200 dark:border-slate-600">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold">
                    KSh {subscriptionCycle === 'weekly' ? selectedTipster.weeklyPrice : selectedTipster.monthlyPrice}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tipster earns</span>
                  <span className="font-mono text-emerald-600 font-bold">
                    KSh {((subscriptionCycle === 'weekly' ? selectedTipster.weeklyPrice! : selectedTipster.monthlyPrice!) * 0.8).toFixed(0)} (80%)
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Platform fee</span>
                  <span className="font-mono">
                    KSh {((subscriptionCycle === 'weekly' ? selectedTipster.weeklyPrice! : selectedTipster.monthlyPrice!) * 0.2).toFixed(0)} (20%)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleSubscribe(selectedTipster)}
                  className="w-full py-3.5 bg-[#0EA5E9] hover:bg-sky-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    Confirm — KSh {subscriptionCycle === 'weekly' ? selectedTipster.weeklyPrice : selectedTipster.monthlyPrice}/{subscriptionCycle === 'weekly' ? 'wk' : 'mo'}
                  </span>
                </button>
                <button
                  onClick={() => setSelectedTipster(null)}
                  className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-700"
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
