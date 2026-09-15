import React from 'react';
import { TrendingUp, Medal, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTipsters } from '../context/TipstersContext';

const rankColors = ['text-amber-500', 'text-slate-400', 'text-amber-700'];
const rankBgs = ['bg-amber-50 dark:bg-amber-950/30', 'bg-slate-50 dark:bg-slate-800/40', 'bg-amber-50/50 dark:bg-amber-950/20'];

export const TopTipsters: React.FC = () => {
  const { tipsters } = useTipsters();

  const topTipsters = [...tipsters]
    .filter(t => t.tipsterStatus === 'active')
    .sort((a, b) => (b.winRate || 0) - (a.winRate || 0))
    .slice(0, 5);

  return (
    <div className="bg-white dark:bg-[#111c30] border border-sky-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-sky-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Medal className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Top Tipsters</h3>
        </div>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
          By Win Rate
        </span>
      </div>

      {topTipsters.length === 0 ? (
        <div className="py-8 px-4 text-center space-y-2">
          <Users className="w-8 h-8 text-slate-200 mx-auto" />
          <p className="text-xs text-slate-400">No active tipsters yet.</p>
        </div>
      ) : (
        <>
          {/* Tipster List */}
          <div className="divide-y divide-sky-50 dark:divide-slate-800/50">
            {topTipsters.map((tipster, i) => {
              const rank = i + 1;
              const isTopThree = rank <= 3;
              return (
                <Link
                  to="/tipsters"
                  key={tipster.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-sky-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Rank */}
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-extrabold ${
                    isTopThree ? rankBgs[rank - 1] + ' ' + rankColors[rank - 1] : 'text-slate-400'
                  }`}>
                    {rank}
                  </div>

                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-[#00a8ff] to-sky-700 flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0 ${isTopThree ? 'ring-2 ring-amber-400/60' : 'ring-1 ring-slate-200 dark:ring-slate-700'}`}>
                    {tipster.name?.charAt(0) || '?'}
                  </div>

                  {/* Name & League */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#00a8ff] transition-colors">
                      {tipster.name}
                    </p>
                    <p className="text-[10px] text-slate-400">{tipster.totalTips || 0} tips</p>
                  </div>

                  {/* Win Rate */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{tipster.winRate || 0}%</p>
                    <p className="text-[10px] text-slate-400">{tipster.subscribersCount || 0} subs</p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Win Rate Bar Visual for Top 3 */}
          <div className="px-4 py-3 border-t border-sky-100 dark:border-slate-800 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Win Rate Comparison</p>
            {topTipsters.slice(0, 3).map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 w-14 truncate">{t.name}</span>
                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00a8ff] to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${t.winRate || 0}%` }}
                  />
                </div>
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 w-10 text-right">{t.winRate || 0}%</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CTA */}
      <div className="px-4 pb-4">
        <Link
          to="/tipsters"
          className="w-full py-2 border border-sky-200 dark:border-sky-800/50 text-[#00a8ff] font-bold text-xs rounded-lg hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-all flex items-center justify-center gap-1.5"
        >
          <TrendingUp className="w-3.5 h-3.5" /> View All Tipsters
        </Link>
      </div>
    </div>
  );
};
