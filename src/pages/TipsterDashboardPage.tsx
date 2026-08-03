import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star, DollarSign, Users, TrendingUp, Settings,
  ArrowRight, CheckCircle, Clock, Lock, Edit3,
  Check, X, ShieldCheck, BarChart3, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTipsters } from '../context/TipstersContext';
import { PLATFORM_CUT_PCT } from '../context/TipstersContext';

export const TipsterDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { tipsters, getMySubscriptions, getTipsterRevenue, updateOwnPricing } = useTipsters();

  const [editingPrices, setEditingPrices] = useState(false);
  const [newWeekly, setNewWeekly] = useState<number>(0);
  const [newMonthly, setNewMonthly] = useState<number>(0);

  // Find the logged-in tipster's profile in context
  const myProfile = tipsters.find(t => t.id === user?.id) ?? user;
  const myId = user?.id || '';

  const mySubscriptions = getMySubscriptions(myId);
  const revenue = getTipsterRevenue(myId);
  const platformPct = Math.round(PLATFORM_CUT_PCT * 100);
  const tipsterPct = 100 - platformPct;

  // Separate active vs expired
  const activeSubscribers = mySubscriptions.filter(s => s.status === 'active');
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

  // Guard: must be logged in and be a tipster
  if (!user || (user.role !== 'tipster' && user.role !== 'admin')) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-32 pb-28 text-center">
        <Lock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">Tipster Access Only</h2>
        <p className="text-sm text-slate-500 mb-6">
          This dashboard is only accessible to verified tipsters.
          Apply to become a tipster from the Tipsters marketplace page.
        </p>
        <Link
          to="/tipsters"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0EA5E9] text-white font-bold rounded-xl text-sm shadow-md hover:bg-sky-600 transition-colors"
        >
          View Tipsters Marketplace <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-24 pb-28 md:pb-12 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>Tipster Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            Welcome, {myProfile?.name?.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Your personal revenue centre. You keep <span className="font-bold text-emerald-600">{tipsterPct}%</span> of every subscription; the platform takes {platformPct}%.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {myProfile?.tipsterStatus === 'active' ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-full">
              <CheckCircle className="w-3.5 h-3.5" /> Verified Active
            </span>
          ) : myProfile?.tipsterStatus === 'pending' ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5" /> Pending Approval
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-300 px-3 py-1.5 rounded-full">
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

      {/* Revenue Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0EA5E9] to-sky-700 text-white shadow-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Gross Revenue</span>
            <DollarSign className="w-4 h-4 opacity-70" />
          </div>
          <span className="text-3xl font-black font-mono">${revenue.gross.toFixed(2)}</span>
          <p className="text-[10px] opacity-70">Total collected from subscribers</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Your Earnings</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-3xl font-black font-mono text-emerald-600">${revenue.net.toFixed(2)}</span>
          <p className="text-[10px] text-slate-400">After {platformPct}% platform cut deducted</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Platform Cut</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-black font-mono text-amber-500">${revenue.platformCut.toFixed(2)}</span>
          <p className="text-[10px] text-slate-400">{platformPct}% retained by FalconForecast</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Subscribers</span>
            <Users className="w-4 h-4 text-[#0EA5E9]" />
          </div>
          <span className="text-3xl font-black font-mono text-slate-900">{activeSubscribers.length}</span>
          <p className="text-[10px] text-slate-400">{expiredSubscribers.length} expired / cancelled</p>
        </div>
      </div>

      {/* Two columns: Pricing + Subscribers */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* Pricing Settings — tipster sets their own */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">My Pricing</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Only you can change these. Admin cannot override.</p>
            </div>
            {!editingPrices ? (
              <button
                onClick={handleStartEdit}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-[#0EA5E9] hover:border-sky-300 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-1">
                <button
                  onClick={() => handleSavePrices(updateOwnPricing)}
                  className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-300 hover:bg-emerald-100 transition-colors"
                  title="Save"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingPrices(false)}
                  className="p-2 bg-slate-100 text-slate-500 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">Weekly Pass</label>
              {editingPrices ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={newWeekly}
                    onChange={e => setNewWeekly(parseFloat(e.target.value))}
                    className="w-full pl-7 pr-3 py-2.5 border border-sky-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-2xl font-black text-slate-900 font-mono">${myProfile?.weeklyPrice?.toFixed(2) || '9.99'}</span>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-600 font-bold block">You earn: ${((myProfile?.weeklyPrice || 9.99) * (1 - PLATFORM_CUT_PCT)).toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400">Platform: ${((myProfile?.weeklyPrice || 9.99) * PLATFORM_CUT_PCT).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">Monthly Pass</label>
              {editingPrices ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={newMonthly}
                    onChange={e => setNewMonthly(parseFloat(e.target.value))}
                    className="w-full pl-7 pr-3 py-2.5 border border-sky-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-2xl font-black text-slate-900 font-mono">${myProfile?.monthlyPrice?.toFixed(2) || '29.99'}</span>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-600 font-bold block">You earn: ${((myProfile?.monthlyPrice || 29.99) * (1 - PLATFORM_CUT_PCT)).toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400">Platform: ${((myProfile?.monthlyPrice || 29.99) * PLATFORM_CUT_PCT).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Performance stats */}
          <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-3">
            <div className="text-center">
              <span className="text-xl font-black text-[#0EA5E9] font-mono">{myProfile?.winRate || 75}%</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Win Rate</p>
            </div>
            <div className="text-center">
              <span className="text-xl font-black text-slate-900 font-mono">{myProfile?.totalTips || 0}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Total Tips</p>
            </div>
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">My Subscribers</h2>
              <p className="text-[10px] text-slate-400">Users who have paid for your tips</p>
            </div>
            <span className="text-xs font-bold text-[#0EA5E9] bg-sky-50 border border-sky-200 rounded-full px-2.5 py-1 font-mono">
              {activeSubscribers.length} active
            </span>
          </div>

          {mySubscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <Users className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-sm font-bold text-slate-400">No subscribers yet</p>
              <p className="text-xs text-slate-400 mt-1">Share your profile to attract subscribers!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Subscriber</th>
                    <th className="py-3 px-4 text-center">Plan</th>
                    <th className="py-3 px-4 text-center">Paid</th>
                    <th className="py-3 px-4 text-center">Your Cut</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {mySubscriptions.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0EA5E9] to-sky-700 flex items-center justify-center text-white font-extrabold text-[10px]">
                            {s.userName?.charAt(0) || '?'}
                          </div>
                          <span className="font-semibold text-slate-800">{s.userName || 'Anonymous'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border capitalize ${
                          s.billingCycle === 'monthly'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-sky-50 text-[#0EA5E9] border-sky-200'
                        }`}>
                          {s.billingCycle}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                        ${s.price.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600">
                        ${(s.tipsterNet ?? (s.price * (1 - PLATFORM_CUT_PCT))).toFixed(2)}
                        <span className="text-slate-300 font-normal"> / </span>
                        <span className="text-[9px] text-amber-500">-${(s.platformCut ?? (s.price * PLATFORM_CUT_PCT)).toFixed(2)}</span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                          s.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {s.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-500 text-[10px]">
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
      <div className="rounded-2xl border border-sky-200 bg-sky-50 px-6 py-4">
        <div className="flex items-start gap-3">
          <BarChart3 className="w-5 h-5 text-[#0EA5E9] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-slate-800">How the revenue split works</p>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Every time a user subscribes to your tips, the payment is automatically split:
              <strong className="text-emerald-600"> {tipsterPct}% goes to you</strong> and
              <strong className="text-amber-600"> {platformPct}% is retained by FalconForecast</strong> to cover infrastructure, payment processing, and platform services.
              The split is calculated at the time of each payment and shown in the subscriber table above.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
