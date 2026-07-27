import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, PlusCircle, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar: React.FC<{ onOpenCheckout?: () => void }> = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const tickerMatches = [
    { time: "67'", teams: "ARS 2 - 1 TOT", live: true },
    { time: "23'", teams: "RMA 0 - 0 FCB", live: true },
    { time: "HT", teams: "MUN 1 - 0 CHE", live: false },
    { time: "89'", teams: "MCI 3 - 1 LIV", live: true },
    { time: "45'", teams: "ATM 1 - 1 BAR", live: true },
    { time: "FT", teams: "INT 2 - 0 JUV", live: false },
    { time: "12'", teams: "BVB 1 - 0 BAY", live: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#dbeafe] dark:bg-[#111c30] border-b border-blue-200/80 dark:border-slate-800 shadow-xs transition-colors">
      {/* ─── MAIN BRANDING & NAV BAR ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-[#00a8ff] flex items-center justify-center text-white font-extrabold text-lg shadow-sm font-sans">
                F
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white font-sans">
                Field<span className="text-[#00a8ff]">Forecasts</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isActive('/') ? 'text-[#00a8ff] bg-white dark:bg-sky-950/60 shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:text-[#00a8ff]'
                }`}
              >
                Football
              </Link>
              <Link
                to="/premier-league"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isActive('/premier-league') ? 'text-[#00a8ff] bg-white dark:bg-sky-950/60 shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:text-[#00a8ff]'
                }`}
              >
                Premier League
              </Link>
              <Link
                to="/la-liga"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isActive('/la-liga') ? 'text-[#00a8ff] bg-white dark:bg-sky-950/60 shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:text-[#00a8ff]'
                }`}
              >
                La Liga
              </Link>
              <Link
                to="/champions-league"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isActive('/champions-league') ? 'text-[#00a8ff] bg-white dark:bg-sky-950/60 shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:text-[#00a8ff]'
                }`}
              >
                Champions League
              </Link>
              <Link
                to="/live-scores"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isActive('/live-scores') ? 'text-[#00a8ff] bg-white dark:bg-sky-950/60 shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:text-[#00a8ff]'
                }`}
              >
                Live Scores
              </Link>
              <Link
                to="/odds-comparison"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isActive('/odds-comparison') ? 'text-[#00a8ff] bg-white dark:bg-sky-950/60 shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:text-[#00a8ff]'
                }`}
              >
                Odds Comparison
              </Link>
              <Link
                to="/premium-tips"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isActive('/premium-tips') ? 'text-[#00a8ff] bg-white dark:bg-sky-950/60 shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:text-[#00a8ff]'
                }`}
              >
                Premium Tips
              </Link>
            </nav>
          </div>

          {/* Search box & Action CTAs */}
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block w-44 xl:w-56">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search teams, league"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#00a8ff]"
              />
            </div>

            <Link
              to="/post-tip"
              className="px-4 py-2 bg-[#00a8ff] hover:bg-[#0090e0] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post Tips</span>
            </Link>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#00a8ff] text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{user?.name?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs text-slate-500 hover:text-red-500 font-medium px-2 py-1"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#00a8ff] text-xs font-bold rounded-lg transition-colors"
              >
                Login
              </Link>
            )}

            {/* Interactive Theme Switch Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#00a8ff] transition-all text-xs font-bold shadow-xs"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── LIVE SCORES TICKER SUB-BAR (Dark Navy Ticker) ─── */}
      <div className="bg-[#0f172a] text-slate-300 py-1.5 px-4 overflow-hidden border-t border-slate-800 text-xs font-mono select-none">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap">
          {tickerMatches.concat(tickerMatches).map((match, i) => (
            <div key={i} className="flex items-center gap-2 flex-shrink-0 hover:text-white transition-colors cursor-pointer">
              {match.live && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
              <span className="text-emerald-400 font-bold">{match.time}</span>
              <span className="font-semibold">{match.teams}</span>
              <span className="text-slate-600">|</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
};
