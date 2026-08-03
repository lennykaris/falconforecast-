import React from 'react';
import { TrendingUp, Medal, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Tipster {
  rank: number;
  name: string;
  avatar: string;
  winRate: number;
  totalTips: number;
  yield: number;
  league: string;
}

const TOP_TIPSTERS: Tipster[] = [
  {
    rank: 1,
    name: 'Jordan K.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
    winRate: 78.4,
    totalTips: 312,
    yield: 18.2,
    league: 'UCL',
  },
  {
    rank: 2,
    name: 'Alex Mercer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80',
    winRate: 74.1,
    totalTips: 289,
    yield: 14.5,
    league: 'PL',
  },
  {
    rank: 3,
    name: 'Samuel T.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
    winRate: 71.9,
    totalTips: 204,
    yield: 12.8,
    league: 'La Liga',
  },
  {
    rank: 4,
    name: 'Priya V.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
    winRate: 69.3,
    totalTips: 178,
    yield: 11.1,
    league: 'Serie A',
  },
  {
    rank: 5,
    name: 'Mike R.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80',
    winRate: 67.7,
    totalTips: 156,
    yield: 9.4,
    league: 'Bundesliga',
  },
];

const rankColors = ['text-amber-500', 'text-slate-400', 'text-amber-700'];
const rankBgs = ['bg-amber-50 dark:bg-amber-950/30', 'bg-slate-50 dark:bg-slate-800/40', 'bg-amber-50/50 dark:bg-amber-950/20'];

export const TopTipsters: React.FC = () => {
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

      {/* Tipster List */}
      <div className="divide-y divide-sky-50 dark:divide-slate-800/50">
        {TOP_TIPSTERS.map((tipster) => {
          const isTopThree = tipster.rank <= 3;
          return (
            <div
              key={tipster.rank}
              className="flex items-center gap-3 px-4 py-3 hover:bg-sky-50/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
            >
              {/* Rank */}
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-extrabold ${
                isTopThree ? rankBgs[tipster.rank - 1] + ' ' + rankColors[tipster.rank - 1] : 'text-slate-400'
              }`}>
                {tipster.rank}
              </div>

              {/* Avatar */}
              <img
                src={tipster.avatar}
                alt={tipster.name}
                className={`w-8 h-8 rounded-full object-cover flex-shrink-0 ${isTopThree ? 'ring-2 ring-amber-400/60' : 'ring-1 ring-slate-200 dark:ring-slate-700'}`}
              />

              {/* Name & League */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#00a8ff] transition-colors">
                  {tipster.name}
                </p>
                <p className="text-[10px] text-slate-400">{tipster.totalTips} tips · {tipster.league}</p>
              </div>

              {/* Win Rate */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{tipster.winRate}%</p>
                <p className="text-[10px] text-slate-400">+{tipster.yield}% yield</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Win Rate Bar Visual for Top 3 */}
      <div className="px-4 py-3 border-t border-sky-100 dark:border-slate-800 space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Win Rate Comparison</p>
        {TOP_TIPSTERS.slice(0, 3).map((t) => (
          <div key={t.rank} className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 w-14 truncate">{t.name}</span>
            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00a8ff] to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${t.winRate}%` }}
              />
            </div>
            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 w-10 text-right">{t.winRate}%</span>
          </div>
        ))}
      </div>

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
