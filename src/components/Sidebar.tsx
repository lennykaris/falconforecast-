import React from 'react';
import { Trophy, Star, ChevronRight, Mail } from 'lucide-react';

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
    { id: 'Favorites', label: 'All Leagues', icon: Star },
  ];

  return (
    <aside className="w-full lg:w-56 flex-shrink-0">
      <div className="bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-md p-3 flex flex-col justify-between">
        <div>
          <div className="mb-2 px-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Popular Leagues</h3>
          </div>

          <nav className="space-y-0.5">
            {leagues.map(({ id, label, icon: Icon }) => {
              const isActive = activeLeague === id;
              return (
                <button
                  key={id}
                  onClick={() => onSelectLeague && onSelectLeague(id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-l-2 border-[#00a8ff]'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
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

        {/* "All Leagues" already lives in the nav list above — this used to duplicate it with
            a second button to the same destination. Repurposed as a "can't find your league"
            escape hatch instead of a dead duplicate. */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3">
          <a
            href="mailto:info@FalconForecast.com?subject=League%20request"
            className="w-full py-2 px-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-[#00a8ff] dark:hover:text-sky-400 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            Can't find your league?
          </a>
        </div>
      </div>
    </aside>
  );
};
