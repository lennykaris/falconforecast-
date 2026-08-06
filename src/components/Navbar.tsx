import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, PlusCircle, User, Sun, Moon, Home, Trophy, TrendingUp, Star, Users, ShieldCheck, LayoutDashboard, Newspaper } from 'lucide-react';
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

  const mobileTabs = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/premier-league', label: 'Leagues', icon: Trophy },
    { to: '/odds-comparison', label: 'Odds', icon: TrendingUp },
    { to: '/premium-tips', label: 'Tips', icon: Star },
    { to: '/news', label: 'News', icon: Newspaper },
  ];

  return (
    <>
      {/* ─── DESKTOP & TABLET TOP HEADER BAR ─── */}
      <header className="sticky top-0 z-50 bg-white dark:bg-[#111c30] border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo & Main Nav */}
            <div className="flex items-center gap-4 xl:gap-8 min-w-0">
              <Link to="/" className="flex items-center gap-1 group select-none flex-shrink-0">
                <span className="font-black italic text-xl tracking-wider uppercase font-sans whitespace-nowrap">
                  <span className="text-[#00a8ff]">FALCON</span>
                  <span className="text-slate-900 dark:text-white ml-1.5">FORECAST</span>
                </span>
              </Link>

              <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 flex-shrink-0">
                <Link
                  to="/"
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    isActive('/') ? 'text-[#00a8ff] bg-white dark:bg-sky-950/60 shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:text-[#00a8ff]'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/odds-comparison"
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    isActive('/odds-comparison') ? 'text-[#00a8ff] bg-white dark:bg-sky-950/60 shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:text-[#00a8ff]'
                  }`}
                >
                  Odds Comparison
                </Link>
                <Link
                  to="/premium-tips"
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    isActive('/premium-tips') ? 'text-[#00a8ff] bg-white dark:bg-sky-950/60 shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:text-[#00a8ff]'
                  }`}
                >
                  VIP Tips
                </Link>
                <Link
                  to="/tipsters"
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    isActive('/tipsters') ? 'text-[#00a8ff] bg-white dark:bg-sky-950/60 shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:text-[#00a8ff]'
                  }`}
                >
                  Tipsters
                </Link>
                <Link
                  to="/news"
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    isActive('/news') ? 'text-[#00a8ff] bg-white dark:bg-sky-950/60 shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:text-[#00a8ff]'
                  }`}
                >
                  News
                </Link>
                <Link
                  to="/about"
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    isActive('/about') ? 'text-[#00a8ff] bg-white dark:bg-sky-950/60 shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:text-[#00a8ff]'
                  }`}
                >
                  About Us
                </Link>
                {isLoggedIn && user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 whitespace-nowrap ${
                      isActive('/admin') ? 'text-[#00a8ff] bg-white dark:bg-sky-950/60 shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:text-[#00a8ff]'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </Link>
                )}
              </nav>
            </div>

            {/* Search box & Action CTAs */}
            <div className="flex items-center gap-2 xl:gap-3 flex-shrink-0">
              <div className="relative hidden md:block w-36 lg:w-44 xl:w-52">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#00a8ff]"
                />
              </div>

              <Link
                to="/post-tip"
                className="hidden sm:flex px-3.5 py-2 bg-[#00a8ff] hover:bg-[#0090e0] text-white text-xs font-bold rounded-lg transition-colors items-center gap-1.5 shadow-sm whitespace-nowrap"
              >
                <PlusCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Post Tips</span>
              </Link>

              {isLoggedIn ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Tipster Dashboard quick link */}
                  {user?.role === 'tipster' && (
                    <Link
                      to="/tipster-dashboard"
                      className="px-3 py-2 border border-amber-300 bg-amber-50 text-amber-700 hover:border-amber-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>My Panel</span>
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    className="px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#00a8ff] text-xs font-bold rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{user?.name?.split(' ')[0]}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-xs text-slate-500 hover:text-red-500 font-medium px-2 py-1 whitespace-nowrap"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-3.5 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#00a8ff] text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                >
                  Login
                </Link>
              )}



              {/* Interactive Theme Switch Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#00a8ff] transition-all text-xs font-bold shadow-xs whitespace-nowrap"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'light' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-400 flex-shrink-0" />
                    <span className="hidden sm:inline">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-sky-400 fill-sky-400 flex-shrink-0" />
                    <span className="hidden sm:inline">Dark</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ─── LIVE SCORES TICKER SUB-BAR (Auto-scrolling marquee) ─── */}
        <div className="bg-[#0f172a] text-slate-300 py-1.5 overflow-hidden border-t border-slate-800 text-xs font-mono select-none">
          <div className="animate-ticker">
            {tickerMatches.concat(tickerMatches).map((match, i) => (
              <div key={i} className="flex items-center gap-2 flex-shrink-0 px-4 hover:text-white transition-colors cursor-pointer">
                {match.live && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                <span className="text-emerald-400 font-bold">{match.time}</span>
                <span className="font-semibold">{match.teams}</span>
                <span className="text-slate-600 px-2">|</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ─── MOBILE DYNAMIC ISLAND BOTTOM NAVBAR (< md) ─── */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div
          className="rounded-full shadow-2xl border border-blue-200/80 dark:border-slate-700/80 px-3 py-2 flex items-center justify-around backdrop-blur-xl"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.94)' : 'rgba(15, 23, 42, 0.94)',
          }}
        >
          {mobileTabs.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all ${
                  active
                    ? 'text-[#00a8ff] font-extrabold scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-[#00a8ff]'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                <span className="text-[10px] font-semibold mt-0.5 tracking-tight whitespace-nowrap">
                  {label}
                </span>
              </Link>
            );
          })}



          {/* Quick theme toggle on mobile dynamic island */}
          <button
            onClick={toggleTheme}
            className="flex flex-col items-center justify-center py-1 px-2.5 text-slate-500 dark:text-slate-400 hover:text-[#00a8ff]"
            title="Toggle Theme"
          >
            {theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500 fill-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-sky-400 fill-sky-400" />
            )}
            <span className="text-[9px] font-semibold mt-0.5 tracking-tight">
              {theme === 'light' ? 'Light' : 'Dark'}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};
