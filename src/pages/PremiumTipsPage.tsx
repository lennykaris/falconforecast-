import React from 'react';
import { SlidersHorizontal, ArrowUpDown, ShieldCheck, Lock } from 'lucide-react';


interface PremiumTipsPageProps {
  onOpenCheckout?: (plan?: any) => void;
}

export const PremiumTipsPage: React.FC<PremiumTipsPageProps> = ({ onOpenCheckout }) => {
  const tipsters = [
    {
      id: 't1',
      name: 'Alex Mercer',
      specialty: 'Premier League Specialist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
      badgeType: 'VERIFIED',
      winRate: '68.4%',
      yieldVal: '+12.5%',
      activeTipsCount: '2 Tips',
      unlockedTip: {
        match: 'Arsenal vs Chelsea',
        time: '14:30 GMT',
        selection: 'Arsenal -1.5 AH',
        odds: 1.95,
      },
      lockedTipsCount: 1,
      buttonLabel: 'Unlock Tips - $19.99/mo',
    },
    {
      id: 't2',
      name: 'Elena Rostova',
      specialty: 'La Liga & Champions League Specialist',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
      badgeType: 'VERIFIED',
      winRate: '72.1%',
      yieldVal: '+18.2%',
      activeTipsCount: '1 Tip',
      highlightBadge: 'Won last 5 tips in a row',
      lockedTipsCount: 1,
      buttonLabel: 'Buy Single Tip - $4.99',
    },
    {
      id: 't3',
      name: 'Marco Rossi',
      specialty: 'Serie A & Tactical Form Model',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
      badgeType: 'VERIFIED',
      winRate: '65.8%',
      yieldVal: '+9.4%',
      activeTipsCount: '2 Tips',
      unlockedTip: {
        match: 'Inter Milan vs Juventus',
        time: '19:45 GMT',
        selection: 'Under 2.5 Total Goals',
        odds: 1.80,
      },
      lockedTipsCount: 1,
      buttonLabel: 'Unlock Tips - $19.99/mo',
    },
    {
      id: 't4',
      name: 'David Silva',
      specialty: 'Bundesliga High-Odds Accumulators',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      isVerified: false,
      badgeType: 'STANDARD',
      winRate: '59.0%',
      yieldVal: '+5.1%',
      activeTipsCount: '0 Tips',
      emptyMessage: 'No active tips available at the moment. Check back later.',
      buttonLabel: 'Subscribe for Updates',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b1320] py-6 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">

        {/* Main Content Area */}
        <main className="flex-1 space-y-6">
          
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Verified Expert Football Tips
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed mt-0.5">
                Access exclusive insights from top-performing football tipsters. Strict verification ensures complete transparency in ROI and yield.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:border-[#00a8ff]">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filter
              </button>
              <button className="px-3 py-1.5 bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:border-[#00a8ff]">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort By ROI
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            {tipsters.map(t => (
              <div
                key={t.id}
                className="bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#00a8ff] transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {t.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">{t.specialty}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1 ${
                      t.isVerified
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}
                  >
                    {t.isVerified && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
                    {t.badgeType}
                  </span>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800/80 text-center">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">WIN RATE</p>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white font-mono">
                      {t.winRate}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">YIELD</p>
                    <p className="text-xs font-extrabold text-emerald-500 font-mono">
                      {t.yieldVal}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">ACTIVE</p>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white font-mono">
                      {t.activeTipsCount}
                    </p>
                  </div>
                </div>

                {/* Tip Content / Locked Content */}
                <div className="space-y-2.5 min-h-[140px] flex flex-col justify-center">
                  {t.unlockedTip && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {t.unlockedTip.match}
                        </p>
                        <p className="text-[11px] font-semibold text-slate-500">
                          {t.unlockedTip.selection}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400">{t.unlockedTip.time}</p>
                        <span className="text-xs font-mono font-bold text-[#00a8ff]">
                          {t.unlockedTip.odds.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {t.lockedTipsCount && (
                    <div className="relative p-4 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 text-center backdrop-blur-md overflow-hidden">
                      <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center space-y-1">
                        <Lock className="w-5 h-5 text-[#00a8ff]" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Premium Tip Locked
                        </span>
                      </div>
                      <p className="text-xs text-transparent">Match prediction text blurred out</p>
                    </div>
                  )}

                  {t.highlightBadge && (
                    <div className="p-2 bg-blue-50 dark:bg-sky-950/60 text-[#00a8ff] text-[11px] font-bold rounded-lg text-center border border-blue-100 dark:border-sky-800">
                      📈 {t.highlightBadge}
                    </div>
                  )}

                  {t.emptyMessage && (
                    <div className="py-6 text-center text-xs text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                      {t.emptyMessage}
                    </div>
                  )}
                </div>

                {/* Bottom Action Button */}
                <button
                  onClick={() => onOpenCheckout && onOpenCheckout()}
                  className="w-full py-2.5 bg-[#00a8ff] hover:bg-[#0090e0] text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                >
                  {t.buttonLabel}
                </button>
              </div>
            ))}
          </div>

        </main>

      </div>
    </div>
  );
};
