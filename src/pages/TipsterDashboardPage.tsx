import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star, DollarSign, Users, TrendingUp, Settings,
  ArrowRight, CheckCircle, Clock, Lock, Edit3,
  Check, X, ShieldCheck, BarChart3, Zap, Calendar, Smartphone, Search, Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTipsters, isSubscriptionActive } from '../context/TipstersContext';
import { PLATFORM_CUT_PCT } from '../context/TipstersContext';
import { usePredictions } from '../context/PredictionsContext';
import { fetchUpcomingMatches } from '../lib/matches';
import type { Match } from '../types/prediction';
import { PostOddsModal } from '../components/PostOddsModal';
import { WithdrawModal } from '../components/WithdrawModal';

export const TipsterDashboardPage: React.FC = () => {
  const { user, isTipster, isAdmin, refetchUser } = useAuth();
  // Suspension only ever flips tipster_status (role stays 'tipster') — checking role alone
  // let a suspended tipster keep full dashboard access: posting new odds, editing prices,
  // and collecting subscriber revenue exactly as before being cut off.
  const hasAccess = isAdmin || (isTipster && user?.tipsterStatus !== 'suspended');
  const { tipsters, getMySubscriptions, getTipsterRevenue, updateOwnPricing, updateMpesaPhone } = useTipsters();
  const { predictions, updatePrediction } = usePredictions();

  const [editingPrices, setEditingPrices] = useState(false);
  const [newWeekly, setNewWeekly] = useState<number>(0);
  const [newMonthly, setNewMonthly] = useState<number>(0);

  const [editingPhone, setEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [phoneSaved, setPhoneSaved] = useState(false);

  const [matches, setMatches] = useState<Match[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [oddsMatch, setOddsMatch] = useState<Match | null>(null);
  const [settleError, setSettleError] = useState('');
  const [matchSearch, setMatchSearch] = useState('');
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  // updatePrediction writes to Supabase before touching local state — this just surfaces a
  // rejected write (RLS mismatch, stale/foreign prediction id) instead of it silently
  // reverting once the predictions cache TTL expires.
  const handleSettle = async (id: string, status: 'won' | 'lost' | 'void') => {
    setSettleError('');
    const { error } = await updatePrediction(id, { status });
    if (error) setSettleError(error.message);
  };

  useEffect(() => {
    if (!user || !hasAccess) return;
    fetchUpcomingMatches()
      .then(setMatches)
      .catch(e => setMatchesError(e instanceof Error ? e.message : 'Failed to load matches'))
      .finally(() => setMatchesLoading(false));
  }, [user]);

  // Find the logged-in tipster's profile in context
  const myProfile = tipsters.find(t => t.id === user?.id) ?? user;
  const myId = user?.id || '';

  const mySubscriptions = getMySubscriptions(myId);
  const revenue = getTipsterRevenue(myId);
  const myPendingTips = predictions.filter(p => p.tipsterId === myId && (p.status || 'pending') === 'pending');
  const platformPct = Math.round(PLATFORM_CUT_PCT * 100);
  const tipsterPct = 100 - platformPct;

  // Separate active vs expired
  const activeSubscribers = mySubscriptions.filter(isSubscriptionActive);
  const expiredSubscribers = mySubscriptions.filter(s => s.status !== 'active');

  const handleStartEdit = () => {
    setNewWeekly(myProfile?.weeklyPrice || 9.99);
    setNewMonthly(myProfile?.monthlyPrice || 29.99);
    setEditingPrices(true);
  };

  const handleSavePrices = (updateOwnPricingFn: (id: string, w: number, m: number) => void) => {
    updateOwnPricingFn(myId, newWeekly, newMonthly);
    setEditingPrices(false);
  };

  const handleStartEditPhone = () => {
    setNewPhone(user?.mpesaPhone || '');
    setEditingPhone(true);
  };

  const handleSavePhone = () => {
    updateMpesaPhone(myId, newPhone.trim());
    setEditingPhone(false);
    setPhoneSaved(true);
    setTimeout(() => setPhoneSaved(false), 3000);
  };

  // Guard: must be logged in and be a tipster
  if (!user || !hasAccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-32 pb-28 text-center">
        <Lock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-200 mb-2">Tipster Access Only</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          This dashboard is only accessible to verified tipsters.
          Apply to become a tipster to publish your own tips.
        </p>
        <Link
          to="/apply-tipster"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0EA5E9] text-white font-bold rounded-xl text-sm shadow-md hover:bg-sky-600 dark:hover:bg-sky-500 transition-colors"
        >
          Apply to Become a Tipster <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-24 pb-28 md:pb-12 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>Tipster Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Welcome, {myProfile?.name?.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Your personal revenue centre. You keep <span className="font-bold text-emerald-600 dark:text-emerald-400">{tipsterPct}%</span> of every subscription; the platform takes {platformPct}%.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {myProfile?.tipsterStatus === 'active' ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 px-3 py-1.5 rounded-full">
              <CheckCircle className="w-3.5 h-3.5" /> Verified Active
            </span>
          ) : myProfile?.tipsterStatus === 'pending' ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 px-3 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5" /> Pending Approval
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Suspended
            </span>
          )}
          <Link
            to="/tipsters"
            className="flex items-center gap-1 text-xs font-bold text-[#0EA5E9] hover:underline"
          >
            View public profile <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Withdrawable Balance — the real, spendable money, separate from the Revenue Cards
          below which are a snapshot of currently-active subscriptions, not what's actually
          available to cash out. Subscription payments credit this balance automatically
          (see resolvePayment.js); withdrawing it is the only thing that spends it down. */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" /> Withdrawable Balance
          </span>
          <span className="text-3xl font-black font-mono block mt-1">KSh {(user?.balance ?? 0).toLocaleString()}</span>
          <p className="text-[10px] opacity-70 mt-0.5">Credited automatically as subscribers pay — cash out anytime</p>
        </div>
        <button
          onClick={() => setWithdrawOpen(true)}
          disabled={(user?.balance ?? 0) <= 0}
          className="px-5 py-3 bg-white text-emerald-700 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-shrink-0"
        >
          <Wallet className="w-4 h-4" /> Withdraw
        </button>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0EA5E9] to-sky-700 text-white shadow-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Gross Revenue</span>
            <DollarSign className="w-4 h-4 opacity-70" />
          </div>
          <span className="text-3xl font-black font-mono">KSh {revenue.gross.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
          <p className="text-[10px] opacity-70">Total collected from subscribers</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111c30] border border-emerald-200 dark:border-emerald-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Your Earnings</span>
            <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">KSh {revenue.net.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">After {platformPct}% platform cut deducted</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Platform Cut</span>
            <Zap className="w-4 h-4 text-amber-400 dark:text-amber-500" />
          </div>
          <span className="text-3xl font-black font-mono text-amber-500 dark:text-amber-400">KSh {revenue.platformCut.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">{platformPct}% retained by FalconForecast</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Subscribers</span>
            <Users className="w-4 h-4 text-[#0EA5E9]" />
          </div>
          <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">{activeSubscribers.length}</span>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">{expiredSubscribers.length} expired / cancelled</p>
        </div>
      </div>

      {/* Upcoming Games — post odds directly on real fixtures */}
      <div className="bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0EA5E9] flex-shrink-0" />
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Upcoming Games</h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Real fixtures — post your odds on any of them</p>
            </div>
          </div>
          {/* Fixtures span the next 10 days across every league — a flat scroll made finding
              one specific match tedious, so search narrows it by team or competition. */}
          <div className="relative sm:w-64 flex-shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={matchSearch}
              onChange={e => setMatchSearch(e.target.value)}
              placeholder="Search team or league..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#0EA5E9]"
            />
          </div>
        </div>

        {(() => {
          const search = matchSearch.trim().toLowerCase();
          const filteredMatches = search
            ? matches.filter(m => `${m.league} ${m.homeTeam} ${m.awayTeam}`.toLowerCase().includes(search))
            : matches;

          if (matchesLoading) {
            return <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">Loading fixtures...</div>;
          }
          if (matchesError) {
            return <div className="py-12 text-center text-xs text-rose-500 dark:text-rose-400">{matchesError}</div>;
          }
          if (matches.length === 0) {
            return <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">No upcoming fixtures in the next 10 days.</div>;
          }
          if (filteredMatches.length === 0) {
            return <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">No fixtures matching "{matchSearch.trim()}".</div>;
          }

          return (
          <div className="divide-y divide-slate-50 dark:divide-slate-800/40 max-h-96 overflow-y-auto">
            {filteredMatches.map(m => (
              <div key={m.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                    {m.league} · {new Date(m.kickoff).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{m.homeTeam} vs {m.awayTeam}</p>
                </div>
                <button
                  onClick={() => setOddsMatch(m)}
                  className="px-3 py-1.5 bg-[#0EA5E9] hover:bg-sky-600 dark:hover:bg-sky-500 text-white text-[11px] font-bold rounded-lg transition-colors flex-shrink-0"
                >
                  Post Odds
                </button>
              </div>
            ))}
          </div>
          );
        })()}
      </div>

      <PostOddsModal match={oddsMatch} onClose={() => setOddsMatch(null)} />

      <WithdrawModal
        isOpen={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        balance={user?.balance ?? 0}
        mpesaPhone={user?.mpesaPhone}
        onSuccess={refetchUser}
      />

      {/* Settle Your Tips — mark your own pending picks won/lost/void */}
      {myPendingTips.length > 0 && (
        <div className="bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/60">
            <h2 className="text-base font-black text-slate-900 dark:text-white">Settle Your Tips</h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Mark the outcome once the match has finished</p>
            {settleError && <p className="text-[10px] font-semibold text-rose-500 dark:text-rose-400 mt-1">{settleError}</p>}
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800/40">
            {myPendingTips.map(p => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{p.league}</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{p.homeTeam} vs {p.awayTeam} — <span className="text-[#0EA5E9]">{p.tip}</span></p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleSettle(p.id, 'won')}
                    className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold"
                  >
                    ✅ Won
                  </button>
                  <button
                    onClick={() => handleSettle(p.id, 'lost')}
                    className="px-2 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded border border-rose-300 dark:border-rose-800 text-[10px] font-bold"
                  >
                    ❌ Lost
                  </button>
                  <button
                    onClick={() => handleSettle(p.id, 'void')}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded border border-slate-300 dark:border-slate-700 text-[10px] font-bold"
                  >
                    ⚪ Void
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two columns: Pricing + Subscribers */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* Pricing Settings — tipster sets their own */}
        <div className="md:col-span-1 bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">My Pricing</h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Only you can change these. Admin cannot override.</p>
            </div>
            {!editingPrices ? (
              <button
                onClick={handleStartEdit}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#0EA5E9] hover:border-sky-300 dark:hover:border-sky-600 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-1">
                <button
                  onClick={() => handleSavePrices(updateOwnPricing)}
                  className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                  title="Save"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingPrices(false)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1.5">Weekly Pass (KSh)</label>
              {editingPrices ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-xs">KSh</span>
                  <input
                    type="number"
                    step="50"
                    min="100"
                    value={newWeekly}
                    onChange={e => setNewWeekly(parseFloat(e.target.value))}
                    className="w-full pl-12 pr-3 py-2.5 border border-sky-300 dark:border-sky-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xl font-black text-slate-900 dark:text-white font-mono">KSh {myProfile?.weeklyPrice || 500}</span>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">You earn: KSh {Math.round((myProfile?.weeklyPrice || 500) * (1 - PLATFORM_CUT_PCT))}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">Platform: KSh {Math.round((myProfile?.weeklyPrice || 500) * PLATFORM_CUT_PCT)}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1.5">Monthly Pass (KSh)</label>
              {editingPrices ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-xs">KSh</span>
                  <input
                    type="number"
                    step="100"
                    min="200"
                    value={newMonthly}
                    onChange={e => setNewMonthly(parseFloat(e.target.value))}
                    className="w-full pl-12 pr-3 py-2.5 border border-sky-300 dark:border-sky-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xl font-black text-slate-900 dark:text-white font-mono">KSh {myProfile?.monthlyPrice || 1500}</span>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">You earn: KSh {Math.round((myProfile?.monthlyPrice || 1500) * (1 - PLATFORM_CUT_PCT))}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">Platform: KSh {Math.round((myProfile?.monthlyPrice || 1500) * PLATFORM_CUT_PCT)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* M-Pesa Payout Number — where automatic subscriber payouts land */}
          <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Smartphone className="w-3 h-3" /> M-Pesa Payout Number
            </label>
            {editingPhone ? (
              <div className="flex gap-1.5">
                <input
                  type="tel"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  placeholder="0712345678"
                  className="flex-1 px-3 py-2.5 border border-sky-300 dark:border-sky-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
                />
                <button
                  onClick={handleSavePhone}
                  className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingPhone(false)}
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartEditPhone}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-600 transition-colors text-left"
              >
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {user?.mpesaPhone || 'Not set — add to receive automatic payouts'}
                </span>
                <Edit3 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              </button>
            )}
            {phoneSaved && (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Saved — future subscriber payments will pay out here automatically.</p>
            )}
          </div>

          {/* Performance stats — win_rate/tips_won/tips_lost/total_tips are all computed by a
              DB trigger from real settled predictions, never self-reported. */}
          <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 grid grid-cols-3 gap-3">
            <div className="text-center">
              <span className="text-xl font-black text-[#0EA5E9] font-mono">{myProfile?.winRate ?? 0}%</span>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Win Rate</p>
            </div>
            <div className="text-center">
              <span className="text-xl font-black font-mono">
                <span className="text-emerald-600 dark:text-emerald-400">{myProfile?.tipsWon ?? 0}W</span>
                <span className="text-slate-300 dark:text-slate-600"> - </span>
                <span className="text-rose-500 dark:text-rose-400">{myProfile?.tipsLost ?? 0}L</span>
              </span>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Record</p>
            </div>
            <div className="text-center">
              <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{myProfile?.totalTips ?? 0}</span>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Total Tips</p>
            </div>
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="md:col-span-2 bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">My Subscribers</h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Users who have paid for your tips</p>
            </div>
            <span className="text-xs font-bold text-[#0EA5E9] bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-full px-2.5 py-1 font-mono">
              {activeSubscribers.length} active
            </span>
          </div>

          {mySubscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <Users className="w-10 h-10 text-slate-200 dark:text-slate-700 mb-3" />
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500">No subscribers yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Share your profile to attract subscribers!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800/60">
                  <tr>
                    <th className="py-3 px-4 text-left">Subscriber</th>
                    <th className="py-3 px-4 text-center">Plan</th>
                    <th className="py-3 px-4 text-center">Paid</th>
                    <th className="py-3 px-4 text-center">Your Cut</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                  {mySubscriptions.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0EA5E9] to-sky-700 flex items-center justify-center text-white font-extrabold text-[10px]">
                            {s.userName?.charAt(0) || '?'}
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{s.userName || 'Anonymous'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border capitalize ${
                          s.billingCycle === 'monthly'
                            ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                            : 'bg-sky-50 dark:bg-sky-950/40 text-[#0EA5E9] border-sky-200 dark:border-sky-800'
                        }`}>
                          {s.billingCycle}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        KSh {s.price}
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        KSh {(s.tipsterNet ?? (s.price * (1 - PLATFORM_CUT_PCT))).toFixed(0)}
                        <span className="text-slate-300 dark:text-slate-600 font-normal"> / </span>
                        <span className="text-[9px] text-amber-500 dark:text-amber-400">-KSh {(s.platformCut ?? (s.price * PLATFORM_CUT_PCT)).toFixed(0)}</span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                          isSubscriptionActive(s)
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                        }`}>
                          {isSubscriptionActive(s) ? 'active' : s.status === 'active' ? 'expired' : s.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-500 dark:text-slate-400 text-[10px]">
                        {new Date(s.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Revenue Split Info Banner */}
      <div className="rounded-2xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 px-6 py-4">
        <div className="flex items-start gap-3">
          <BarChart3 className="w-5 h-5 text-[#0EA5E9] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">How the revenue split works</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Every time a user subscribes to your tips, the payment is automatically split:
              <strong className="text-emerald-600 dark:text-emerald-400"> {tipsterPct}% goes to you</strong> and
              <strong className="text-amber-600 dark:text-amber-400"> {platformPct}% is retained by FalconForecast</strong> to cover infrastructure, payment processing, and platform services.
              The split is calculated at the time of each payment and shown in the subscriber table above.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
