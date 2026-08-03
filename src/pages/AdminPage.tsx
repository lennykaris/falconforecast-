import React, { useState } from 'react';
import {
  ShieldCheck, Plus, Layers,
  Users, UserCheck, UserX, DollarSign,
  TrendingUp, Star, AlertCircle, BarChart3, ArrowUpRight, CheckCircle2
} from 'lucide-react';
import { usePredictions } from '../context/PredictionsContext';
import { useTipsters, PLATFORM_CUT_PCT } from '../context/TipstersContext';
import { AdminTable } from '../components/AdminTable';
import { AddPredictionModal } from '../components/AddPredictionModal';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types/prediction';

type AdminTab = 'predictions' | 'revenue' | 'tipsters' | 'users';

export const AdminPage: React.FC = () => {
  const { predictions } = usePredictions();
  const { tipsters, approveTipster, suspendTipster, subscriptions } = useTipsters();
  const { user, loginWithPreset } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('predictions');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Platform Metrics
  const totalPredictions = predictions.length;
  const freePreds = predictions.filter(p => p.tier === 'free').length;
  const vipPreds = predictions.filter(p => p.tier === 'vip').length;
  const wonPreds = predictions.filter(p => p.status === 'won').length;
  const winRate = totalPredictions > 0 ? Math.round((wonPreds / Math.max(totalPredictions, 1)) * 100) : 0;

  const activeTipsters = tipsters.filter(t => t.tipsterStatus === 'active');
  const pendingTipsters = tipsters.filter(t => t.tipsterStatus === 'pending');
  const totalSubscriptions = subscriptions.length;
  const platformRevenue = subscriptions.reduce((sum, s) => sum + (s.price || 0), 0);

  const allUsers: User[] = [
    { id: 'demo-1', name: 'Alex Rivera', email: 'free.user@falconforecast.com', role: 'user', plan: 'free' },
    { id: 'demo-2', name: 'Marcus Sterling', email: 'vip.pro@falconforecast.com', role: 'user', plan: 'monthly_vip' },
    { id: 'demo-3', name: 'Chief Tipster Admin', email: 'admin@falconforecast.com', role: 'admin', plan: 'annual_vip' },
    ...tipsters,
  ];

  // Per-tipster revenue breakdown for admin
  const tipsterRevenues = tipsters.map(t => {
    const mySubs = subscriptions.filter(s => s.tipsterId === t.id && s.status === 'active');
    const gross = mySubs.reduce((sum, s) => sum + (s.price || 0), 0);
    const cut = parseFloat((gross * PLATFORM_CUT_PCT).toFixed(2));
    const net = parseFloat((gross - cut).toFixed(2));
    return { tipster: t, gross, cut, net, count: mySubs.length };
  }).sort((a, b) => b.gross - a.gross);

  const totalGross = tipsterRevenues.reduce((s, r) => s + r.gross, 0);
  const totalPlatformCut = tipsterRevenues.reduce((s, r) => s + r.cut, 0);
  const totalTipsterNet = tipsterRevenues.reduce((s, r) => s + r.net, 0);

  const TABS: { key: AdminTab; label: string; icon: React.ElementType; count?: number }[] = [
    { key: 'predictions', label: 'Predictions CMS', icon: Layers, count: totalPredictions },
    { key: 'revenue', label: 'Revenue', icon: BarChart3, count: undefined },
    { key: 'tipsters', label: 'Tipsters', icon: Star, count: tipsters.length },
    { key: 'users', label: 'All Users', icon: Users, count: allUsers.length },
  ];

  const statusBadge = (status: string) => {
    if (status === 'active') return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    if (status === 'pending') return 'bg-amber-50 text-amber-700 border-amber-300';
    if (status === 'suspended') return 'bg-rose-50 text-rose-700 border-rose-300';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const roleBadge = (role: string) => {
    if (role === 'admin') return 'bg-purple-50 text-purple-700 border-purple-300';
    if (role === 'tipster') return 'bg-sky-50 text-[#0EA5E9] border-sky-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-24 pb-28 md:pb-10 space-y-8 bg-white min-h-screen">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[#0EA5E9] text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Super Admin Control Panel</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Platform Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Full CRUD over predictions, tipsters, users. Approve tipsters, set pricing, view revenue.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {user?.role !== 'admin' && (
            <button
              onClick={() => loginWithPreset('admin')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
            >
              Switch to Admin
            </button>
          )}
          {activeTab === 'predictions' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 bg-[#0EA5E9] hover:bg-sky-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Prediction</span>
            </button>
          )}
        </div>
      </div>

      {/* Platform Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Predictions</span>
            <Layers className="w-4 h-4 text-[#0EA5E9]" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{totalPredictions}</span>
          <p className="text-[10px] text-slate-400">{freePreds} Free · {vipPreds} VIP</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Win Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">{winRate}%</span>
          <p className="text-[10px] text-slate-400">{wonPreds} won of {totalPredictions}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Active Tipsters</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-300" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{activeTipsters.length}</span>
          {pendingTipsters.length > 0 && (
            <p className="text-[10px] text-amber-600 font-bold">⚠ {pendingTipsters.length} pending approval</p>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Platform Rev.</span>
            <DollarSign className="w-4 h-4 text-[#0EA5E9]" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#0EA5E9] font-mono">KSh {platformRevenue.toLocaleString()}</span>
          <p className="text-[10px] text-slate-400">{totalSubscriptions} active subscriptions</p>
        </div>
      </div>

      {/* Pending Tipster Approval Banner */}
      {pendingTipsters.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3.5 bg-amber-50 border border-amber-300 rounded-2xl">
          <div className="flex items-center space-x-2 text-amber-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs font-bold">
              {pendingTipsters.length} tipster application{pendingTipsters.length > 1 ? 's' : ''} awaiting your approval.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('tipsters')}
            className="text-[11px] font-bold text-amber-700 underline underline-offset-2"
          >
            Review now →
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-[#0EA5E9] text-[#0EA5E9]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-sky-50 text-[#0EA5E9]' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Predictions CMS */}
      {activeTab === 'predictions' && (
        <AdminTable onOpenAddModal={() => setIsAddModalOpen(true)} />
      )}

      {/* Tab: Platform Revenue & Sources */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-sky-50 border border-sky-200 rounded-2xl p-5">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#0EA5E9]" />
                Platform Revenue Overview
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                FalconForecast automatically collects a 20% platform cut on every tipster subscription payment.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="bg-white px-3 py-2 rounded-xl border border-sky-200 shadow-xs">
                <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Total Gross</span>
                <span className="text-lg font-black text-slate-900">KSh {totalGross.toLocaleString()}</span>
              </div>
              <div className="bg-white px-3 py-2 rounded-xl border border-emerald-200 shadow-xs">
                <span className="text-[10px] text-emerald-600 block uppercase font-sans font-bold">Platform Cut (20%)</span>
                <span className="text-lg font-black text-emerald-600">KSh {totalPlatformCut.toLocaleString()}</span>
              </div>
              <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">Tipsters Payout (80%)</span>
                <span className="text-lg font-black text-slate-700">KSh {totalTipsterNet.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Revenue Breakdown by Tipster Source</h4>
              <span className="text-[10px] font-mono text-slate-400">{tipsterRevenues.length} active revenue streams</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Tipster Source</th>
                    <th className="py-3.5 px-4 text-center">Active Subs</th>
                    <th className="py-3.5 px-4 text-center">Weekly / Monthly Price</th>
                    <th className="py-3.5 px-4 text-center">Gross Generated</th>
                    <th className="py-3.5 px-4 text-center">Platform Revenue (20%)</th>
                    <th className="py-3.5 px-4 text-right">Tipster Payout (80%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tipsterRevenues.map(({ tipster: t, gross, cut, net, count }) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=60'}
                            alt={t.name}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-semibold text-slate-900 flex items-center gap-1">
                              {t.name}
                              {t.verified && <CheckCircle2 className="w-3 h-3 text-[#0EA5E9]" />}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-mono">{t.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                        {count}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono text-slate-500 text-[11px]">
                        KSh {t.weeklyPrice || 500} / KSh {t.monthlyPrice || 1500}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                        KSh {gross.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600 bg-emerald-50/40">
                        KSh {cut.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700">
                        KSh {net.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Tipsters Management */}
      {activeTab === 'tipsters' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Approve or suspend tipster accounts. Update their subscription pricing. Changes sync to Supabase instantly.
          </p>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Tipster</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Win Rate</th>
                    <th className="py-3.5 px-4 text-center">Subscribers</th>
                    <th className="py-3.5 px-4 text-center">Weekly Price</th>
                    <th className="py-3.5 px-4 text-center">Monthly Price</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tipsters.map(t => {
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=60'}
                              alt={t.name}
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                            />
                            <div>
                              <span className="font-semibold text-slate-900">{t.name}</span>
                              <span className="block text-[10px] text-slate-400 font-mono">{t.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${statusBadge(t.tipsterStatus || 'none')}`}>
                            {t.tipsterStatus === 'active' ? '✅ Active' : t.tipsterStatus === 'pending' ? '⏳ Pending' : t.tipsterStatus === 'suspended' ? '🚫 Suspended' : '—'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono font-bold text-[#0EA5E9]">
                          {t.winRate || 75}%
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                          {t.subscribersCount || 0}
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono">
                          <span className="text-slate-500">${t.weeklyPrice || 9.99}</span>
                          <span className="text-[9px] text-slate-400 block">set by tipster</span>
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono">
                          <span className="text-slate-500">${t.monthlyPrice || 29.99}</span>
                          <span className="text-[9px] text-slate-400 block">set by tipster</span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {t.tipsterStatus === 'pending' && (
                              <button
                                onClick={() => approveTipster(t.id)}
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-300 text-[10px] font-bold flex items-center space-x-1"
                                title="Approve tipster"
                              >
                                <UserCheck className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                            )}
                            {t.tipsterStatus === 'active' && (
                              <button
                                onClick={() => suspendTipster(t.id)}
                                className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded border border-rose-300 text-[10px] font-bold flex items-center space-x-1"
                                title="Suspend tipster"
                              >
                                <UserX className="w-3 h-3" />
                                <span>Suspend</span>
                              </button>
                            )}
                            {t.tipsterStatus === 'suspended' && (
                              <button
                                onClick={() => approveTipster(t.id)}
                                className="px-2 py-1 bg-sky-50 text-[#0EA5E9] hover:bg-sky-100 rounded border border-sky-200 text-[10px] font-bold"
                                title="Reinstate tipster"
                              >
                                Reinstate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: All Users */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Overview of all registered users, their roles, plans, and subscription status.
          </p>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4 text-center">Role</th>
                    <th className="py-3.5 px-4 text-center">Plan</th>
                    <th className="py-3.5 px-4 text-center">Tipster Status</th>
                    <th className="py-3.5 px-4 text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0EA5E9] to-sky-700 flex items-center justify-center text-white font-extrabold text-xs">
                            {u.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{u.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border capitalize ${roleBadge(u.role)}`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border capitalize ${
                          u.plan !== 'free'
                            ? 'bg-sky-50 text-[#0EA5E9] border-sky-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {u.plan.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {u.tipsterStatus && u.tipsterStatus !== 'none' ? (
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${statusBadge(u.tipsterStatus)}`}>
                            {u.tipsterStatus}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-500 text-[10px]">
                        {u.subscribedAt ? new Date(u.subscribedAt).toLocaleDateString() : 'Aug 2026'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Prediction Modal */}
      <AddPredictionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
