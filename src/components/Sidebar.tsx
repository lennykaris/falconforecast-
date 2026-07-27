import React from 'react';
import { Trophy, Star, ChevronRight } from 'lucide-react';

interface SidebarProps {
  activeLeague?: string;
  onSelectLeague?: (league: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeLeague = 'Premier League', onSelectLeague }) => {
  const leagues = [
    { id: 'Premier League', label: 'Premier League', icon: Trophy },
    { id: 'La Liga', label: 'La Liga', icon: Trophy },
    { id: 'Champions League', label: 'Champions League', icon: Trophy },
    { id: 'Serie A', label: 'Serie A', icon: Trophy },
    { id: 'Bundesliga', label: 'Bundesliga', icon: Trophy },
    { id: 'Favorites', label: 'Favorites', icon: Star },
  ];

  return (
    <aside className="w-full lg:w-56 flex-shrink-0">
      <div className="bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[500px]">
        <div>
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Leagues</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Football Competitions</p>
          </div>

          <nav className="space-y-1">
            {leagues.map(({ id, label, icon: Icon }) => {
              const isActive = activeLeague === id;
              return (
                <button
                  key={id}
                  onClick={() => onSelectLeague && onSelectLeague(id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-sky-900/30 text-[#00a8ff] dark:text-sky-400 border border-blue-100 dark:border-sky-800/40 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#00a8ff]' : 'text-slate-400'}`} />
                    <span>{label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#00a8ff]" />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
          <button className="w-full py-2 px-3 text-xs font-bold text-[#00a8ff] dark:text-sky-400 border border-[#00a8ff]/40 dark:border-sky-500/40 rounded-lg hover:bg-blue-50 dark:hover:bg-sky-950/40 transition-colors">
            View All Leagues
          </button>
        </div>
      </div>
    </aside>
  );
};
