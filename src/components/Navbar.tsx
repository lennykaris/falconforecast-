import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, PlusCircle, User, Sun, Moon, Home, Trophy, TrendingUp, Star, ShieldCheck, LayoutDashboard, Newspaper, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fetchMatches } from '../lib/matches';
import { CurrencySwitcher } from './CurrencySwitcher';
import type { Match } from '../types/prediction';

const tickerTimeLabel = (m: Match) => {
  switch (m.status) {
    case 'IN_PLAY': return 'Live';
    case 'PAUSED': return 'HT';
    case 'FINISHED': return 'FT';
    default: return '';
  }
};

export const Navbar: React.FC<{ onOpenCheckout?: () => void }> = () => {

  const { isLoggedIn, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [tickerMatches, setTickerMatches] = useState<{ time: string; teams: string; live: boolean }[]>([]);

  const isActive = (path: string) => location.pathname === path;

  // The search input used to sit permanently in the header at a fixed w-36..w-52 width from
  // "md" upward, which was the single biggest reason the right side crowded out the primary
  // nav on normal laptop screens -- and it wasn't even wired to anything yet. Collapsing it to
  // an icon that reveals a small overlay on click means it costs ~0 layout width until used.
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    fetchMatches()
      .then(matches => {
        const withScores = matches
          .filter(m => (m.status === 'FINISHED' || m.status === 'IN_PLAY' || m.status === 'PAUSED') && m.homeScore != null && m.awayScore != null)
          .slice(0, 10)
          .map(m => ({
            time: tickerTimeLabel(m),
            teams: `${m.homeTla || m.homeTeam.slice(0, 3).toUpperCase()} ${m.homeScore} - ${m.awayScore} ${m.awayTla || m.awayTeam.slice(0, 3).toUpperCase()}`,
            live: m.status === 'IN_PLAY' || m.status === 'PAUSED',
          }));
        setTickerMatches(withScores);
      })
      .catch(() => setTickerMatches([]));
  }, []);

  const mobileTabs = [
    { to: '/matches', label: 'Home', icon: Home },
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

              {/* flex-shrink-0 here used to mean the full link list (Home/Odds/VIP/Tipsters/
                  News/About + Admin) never shrank — on narrower "lg" widths, especially once a
                  tipster's extra "Post Tips" button ate into the right-hand side, the links
                  simply overflowed the shrinking wrapper next to it and visually spilled into
                  the search box. overflow-x-auto lets the strip scroll instead of spilling. */}
              <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 overflow-x-auto scrollbar-hide min-w-0">
                <Link
                  to="/matches"
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    isActive('/matches') ? 'text-[#00a8ff] bg-white dark:bg-sky-950/60 shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:text-[#00a8ff]'
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

            {/* Search box & Action CTAs — was flex-shrink-0 with no overflow fallback at all,
                unlike the left nav (which got exactly this fix already). Once a tipster's
                extra "My Panel" button showed up, this side had nowhere to go but overflow
                the page. overflow-x-auto is the same safety net; the real fix is making each
                button collapse to icon-only at narrow widths below, so it rarely needs to
                actually scroll. */}
            <div className="flex items-center gap-2 xl:gap-3 flex-shrink-0 overflow-x-auto scrollbar-hide">
              <div className="relative hidden md:block" ref={searchRef}>
                <button
                  onClick={() => setSearchOpen(v => !v)}
                  title="Search teams"
                  className="p-2 rounded-lg border border-slate-300/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-[#00a8ff] hover:text-[#00a8ff] transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
                {searchOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-56 sm:w-64 z-50">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search teams..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xl focus:outline-none focus:border-[#00a8ff]"
                    />
                  </div>
                )}
              </div>

              {/* This whole row (Post Tips, My Panel, Profile, Logout, Currency, Theme) used
                  to switch to full text as early as the "sm" breakpoint (640px) — fine for a
                  phone-width check, but the primary nav on the left needs far more room than
                  that at realistic laptop widths (1024-1279px), which is exactly the range
                  that was pushing links off into an invisible scroll. Pushed to "xl" (1280px)
                  so icon-only stays the default across ordinary laptop screens, freeing space
                  for the nav links that actually matter more. */}
              {isLoggedIn && (user?.role === 'tipster' || user?.role === 'admin') && (
                <Link
                  to="/post-tip"
                  title="Post Tips"
                  className="flex px-2.5 xl:px-3.5 py-2 bg-[#00a8ff] hover:bg-[#0090e0] text-white text-xs font-bold rounded-lg transition-colors items-center gap-1.5 shadow-sm whitespace-nowrap"
                >
                  <PlusCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden xl:inline">Post Tips</span>
                </Link>
              )}

              {isLoggedIn ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Tipster Dashboard quick link — previously always full icon+text with no
                      responsive collapse at all, unlike every other button here, which is
                      exactly what made this the button that pushed a tipster's navbar into
                      overflow (on both narrow desktop AND every phone, since this whole header
                      renders at every screen size, not just desktop). */}
                  {user?.role === 'tipster' && (
                    <Link
                      to="/tipster-dashboard"
                      title="My Panel"
                      className="px-2.5 xl:px-3 py-2 border border-amber-300 bg-amber-50 text-amber-700 hover:border-amber-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="hidden xl:inline">My Panel</span>
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    title={user?.name?.split(' ')[0]}
                    className="px-2.5 xl:px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#00a8ff] text-xs font-bold rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                  >
                    <User className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="hidden xl:inline">{user?.name?.split(' ')[0]}</span>
                  </Link>
                  <button
                    onClick={logout}
                    title="Logout"
                    className="text-xs text-slate-500 hover:text-red-500 font-medium px-2 py-1 whitespace-nowrap"
                  >
                    <span className="hidden xl:inline">Logout</span>
                    <LogOut className="w-3.5 h-3.5 xl:hidden" />
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



              <CurrencySwitcher />

              {/* Interactive Theme Switch Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#00a8ff] transition-all text-xs font-bold shadow-xs whitespace-nowrap"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'light' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-400 flex-shrink-0" />
                    <span className="hidden xl:inline">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-sky-400 fill-sky-400 flex-shrink-0" />
                    <span className="hidden xl:inline">Dark</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ─── LIVE SCORES TICKER SUB-BAR (Auto-scrolling marquee) ─── */}
        {tickerMatches.length > 0 && (
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
        )}
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
