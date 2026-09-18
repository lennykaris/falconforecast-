import React, { useEffect, useMemo, useState } from 'react';
import { Search, Calendar, Trophy, Clock } from 'lucide-react';
import { fetchUpcomingMatches } from '../lib/matches';
import type { Match } from '../types/prediction';

const markets = ['Match Result', 'Over/Under 2.5', 'Both Teams to Score', 'Asian Handicap'];

/** Was a fully hardcoded demo — 3 fake matches (Man City vs Arsenal, Real Madrid vs Barca,
 * Bayern vs PSG), colored-circle "logos", and fake odds attributed to bookmakers that don't
 * even operate in Kenya (Bet365, Pinnacle, William Hill). Now wired to the same real upcoming
 * fixtures (real teams, real logos, real leagues) the rest of the site uses. Real odds from
 * real Kenyan bookmakers (Betika, SportPesa, Odibets, ...) need a paid odds-data API this
 * project doesn't have yet — showing invented numbers under those real company names would
 * look like an actual quote from them, so that column is an honest "coming soon" state
 * instead, per explicit product decision, rather than fabricated figures. */
export const OddsComparisonPage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeLeague, setActiveLeague] = useState<string>('All');
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [activeMarket, setActiveMarket] = useState('Match Result');
  const [searchQuery, setSearchQuery] = useState('');
  const [leagueSearch, setLeagueSearch] = useState('');

  useEffect(() => {
    fetchUpcomingMatches()
      .then(data => {
        const sorted = [...data].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
        setMatches(sorted);
        if (sorted.length > 0) setActiveMatchId(sorted[0].id);
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load matches'))
      .finally(() => setLoading(false));
  }, []);

  // Every league with an upcoming fixture, sorted alphabetically — 'All' always first.
  const leagues = useMemo(() => {
    const set = new Set(matches.map(m => m.league));
    return ['All', ...Array.from(set).sort()];
  }, [matches]);

  const leagueSearchLower = leagueSearch.trim().toLowerCase();
  const visibleLeagues = leagueSearchLower
    ? leagues.filter(lg => lg === 'All' || lg.toLowerCase().includes(leagueSearchLower))
    : leagues;

  const search = searchQuery.trim().toLowerCase();
  const visibleMatches = matches.filter(m => {
    const leagueOk = activeLeague === 'All' || m.league === activeLeague;
    const searchOk = !search || `${m.homeTeam} ${m.awayTeam} ${m.league}`.toLowerCase().includes(search);
    return leagueOk && searchOk;
  });

  // Keep the selected match valid whenever the league/search filter changes it out of view.
  useEffect(() => {
    if (visibleMatches.length === 0) return;
    if (!visibleMatches.some(m => m.id === activeMatchId)) {
      setActiveMatchId(visibleMatches[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLeague, searchQuery, matches]);

  const currentMatch = visibleMatches.find(m => m.id === activeMatchId) || null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b1320] py-6 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">

        {/* League Sidebar */}
        <aside className="w-full lg:w-56 flex-shrink-0">
          <div className="bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Leagues</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-3">Every league with an upcoming fixture</p>
            <div className="relative mb-2">
              <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={leagueSearch}
                onChange={e => setLeagueSearch(e.target.value)}
                placeholder="Search leagues..."
                className="w-full pl-7 pr-2.5 py-1.5 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00a8ff]"
              />
            </div>
            <nav className="space-y-1 max-h-[70vh] overflow-y-auto">
              {visibleLeagues.length === 0 ? (
                <p className="text-[11px] text-slate-400 text-center py-3">No leagues matching "{leagueSearch.trim()}"</p>
              ) : visibleLeagues.map(lg => (
                <button
                  key={lg}
                  onClick={() => setActiveLeague(lg)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all ${
                    activeLeague === lg
                      ? 'bg-blue-50 dark:bg-sky-900/30 text-[#00a8ff] border border-blue-100 dark:border-sky-800/40'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Trophy className={`w-3.5 h-3.5 flex-shrink-0 ${activeLeague === lg ? 'text-[#00a8ff]' : 'text-slate-400'}`} />
                  <span className="truncate">{lg}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Area */}
        <main className="flex-1 min-w-0 space-y-6">

          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Odds Comparison
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real upcoming fixtures — live bookmaker odds integration coming soon.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search team or league..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111c30] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00a8ff]"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading fixtures...</div>
          ) : error ? (
            <div className="py-16 text-center text-xs text-rose-500">{error}</div>
          ) : visibleMatches.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No upcoming fixtures {activeLeague !== 'All' ? `in ${activeLeague}` : ''}{search ? ` matching "${searchQuery.trim()}"` : ''}.
            </div>
          ) : (
            <>
              {/* Quick Match Switcher */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {visibleMatches.slice(0, 20).map(m => (
                  <button
                    key={m.id}
                    onClick={() => setActiveMatchId(m.id)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                      activeMatchId === m.id
                        ? 'bg-[#00a8ff] text-white border-[#00a8ff] shadow-xs'
                        : 'bg-white dark:bg-[#111c30] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-[#00a8ff]'
                    }`}
                  >
                    {m.homeTla || m.homeTeam.slice(0, 3).toUpperCase()} vs {m.awayTla || m.awayTeam.slice(0, 3).toUpperCase()}
                  </button>
                ))}
              </div>

              {currentMatch && (
                <>
                  {/* Match Banner Card — real team logos, real league, real kickoff time */}
                  <div className="bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <Calendar className="w-4 h-4 text-[#00a8ff]" />
                        {new Date(currentMatch.kickoff).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-sky-950 text-[#00a8ff] border border-blue-200 dark:border-sky-800">
                        {currentMatch.league}
                      </span>
                    </div>

                    <div className="py-4 flex items-center justify-center gap-8">
                      <div className="flex-1 flex items-center justify-end gap-3 min-w-0">
                        <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white truncate">
                          {currentMatch.homeTeam}
                        </span>
                        {currentMatch.homeLogo ? (
                          <img src={currentMatch.homeLogo} alt="" className="w-10 h-10 object-contain flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-sky-950 flex items-center justify-center font-bold text-[#00a8ff] text-xs flex-shrink-0">
                            {currentMatch.homeTla || currentMatch.homeTeam.slice(0, 3).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <span className="text-sm font-extrabold text-slate-400 flex-shrink-0">VS</span>

                      <div className="flex-1 flex items-center gap-3 min-w-0">
                        {currentMatch.awayLogo ? (
                          <img src={currentMatch.awayLogo} alt="" className="w-10 h-10 object-contain flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center font-bold text-red-500 text-xs flex-shrink-0">
                            {currentMatch.awayTla || currentMatch.awayTeam.slice(0, 3).toUpperCase()}
                          </div>
                        )}
                        <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white truncate">
                          {currentMatch.awayTeam}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Market Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {markets.map(m => (
                      <button
                        key={m}
                        onClick={() => setActiveMarket(m)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                          activeMarket === m
                            ? 'bg-[#00a8ff] text-white shadow-sm'
                            : 'bg-white dark:bg-[#111c30] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-[#00a8ff]'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  {/* Odds — honestly "coming soon" rather than fabricated numbers under real
                      bookmaker names. */}
                  <div className="bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                    <div className="py-16 px-6 flex flex-col items-center justify-center text-center gap-2">
                      <Clock className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        Live odds for {activeMarket} coming soon
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">
                        Real-time prices from Kenyan bookmakers (Betika, SportPesa, Odibets, and others)
                        will appear here once a live odds feed is connected.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </main>

      </div>
    </div>
  );
};
