import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SlidersHorizontal, Shield, Trophy, Info } from 'lucide-react';

import { MySubscriptions } from '../components/MySubscriptions';
import { TopTipsters } from '../components/TopTipsters';
import { AdvertBanner } from '../components/AdvertBanner';
import { Sidebar } from '../components/Sidebar';
import { MatchDetailModal } from '../components/MatchDetailModal';
import { fetchMatches, fetchStandings } from '../lib/matches';
import type { Match, StandingRow } from '../types/prediction';

interface HomePageProps {
  onOpenCheckout?: (plan?: any) => void;
}

/** Leagues shown in this switcher, mapped to our internal competition codes (see
 * api/_lib/sportsrc.js). Champions League and Bundesliga used to be absent here — a real
 * football-data.org free-tier limitation — but SportSRC has no such gating, so both are
 * live now. */
const LEAGUE_CODE_MAP: Record<string, string> = {
  'Premier League': 'PL',
  'La Liga': 'PD',
  'Champions League': 'CL',
  'Serie A': 'SA',
  'Bundesliga': 'BL1',
};

const statusLabel = (m: Match) => {
  switch (m.status) {
    case 'IN_PLAY': return 'Live';
    case 'PAUSED': return 'HT';
    case 'FINISHED': return 'FT';
    case 'POSTPONED': return 'Postponed';
    case 'SUSPENDED': return 'Suspended';
    case 'CANCELLED': return 'Cancelled';
    default:
      try {
        return new Intl.DateTimeFormat('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(m.kickoff));
      } catch {
        return m.kickoff;
      }
  }
};

const isLiveStatus = (m: Match) => m.status === 'IN_PLAY' || m.status === 'PAUSED';

export const HomePage: React.FC<HomePageProps> = ({ onOpenCheckout }) => {
  const location = useLocation();
  const [selectedLeague, setSelectedLeague] = useState('Premier League');

  const [matches, setMatches] = useState<Match[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [matchesError, setMatchesError] = useState<string | null>(null);

  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [standingsLoading, setStandingsLoading] = useState(false);
  const [standingsError, setStandingsError] = useState<string | null>(null);

  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  // Sync selectedLeague with URL route if user came from Navbar
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('la-liga')) {
      setSelectedLeague('La Liga');
    } else if (path.includes('champions-league')) {
      setSelectedLeague('Champions League');
    } else if (path.includes('serie-a')) {
      setSelectedLeague('Serie A');
    } else if (path.includes('bundesliga')) {
      setSelectedLeague('Bundesliga');
    } else if (path.includes('premier-league')) {
      setSelectedLeague('Premier League');
    }
  }, [location.pathname]);

  useEffect(() => {
    fetchMatches()
      .then(setMatches)
      .catch(e => setMatchesError(e instanceof Error ? e.message : 'Failed to load matches'))
      .finally(() => setMatchesLoading(false));
  }, []);

  useEffect(() => {
    const code = LEAGUE_CODE_MAP[selectedLeague];
    if (!code) {
      setStandings([]);
      return;
    }
    setStandingsLoading(true);
    setStandingsError(null);
    fetchStandings(code)
      .then(setStandings)
      .catch(e => setStandingsError(e instanceof Error ? e.message : 'Failed to load standings'))
      .finally(() => setStandingsLoading(false));
  }, [selectedLeague]);

  // Group real matches by league for the "Favorites" (all leagues) view, or filter to one league
  const leagueGroups = (() => {
    const byLeague = new Map<string, Match[]>();
    for (const m of matches) {
      const label = Object.keys(LEAGUE_CODE_MAP).find(k => LEAGUE_CODE_MAP[k] === m.leagueCode);
      if (!label) continue;
      if (selectedLeague !== 'Favorites' && label !== selectedLeague) continue;
      if (!byLeague.has(label)) byLeague.set(label, []);
      byLeague.get(label)!.push(m);
    }
    return Array.from(byLeague.entries()).map(([league, leagueMatches]) => ({
      league,
      matches: leagueMatches.slice(0, 8),
      hasLive: leagueMatches.some(isLiveStatus),
    }));
  })();

  const selectedLeagueUnsupported = selectedLeague !== 'Favorites' && !LEAGUE_CODE_MAP[selectedLeague];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b1320] py-6 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">

        {/* LEFT COLUMN: League Sidebar (hidden on mobile) */}
        <div className="hidden lg:block">
          <Sidebar
            activeLeague={selectedLeague}
            onSelectLeague={setSelectedLeague}
          />
        </div>

        {/* CENTER COLUMN: Live Matches & League Standings */}
        <main className="flex-1 min-w-0 space-y-6">

          {/* Header Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Trophy className="w-6 h-6 text-[#00a8ff]" />
                {selectedLeague} Matches &amp; Teams
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real fixtures, results, and league standings.
              </p>
            </div>

            <button className="p-2 bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:border-[#00a8ff]">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile League Tabs (only shown on mobile, sidebar handles it on desktop) */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {['Premier League', 'La Liga', 'Champions League', 'Serie A', 'Bundesliga'].map(league => (
              <button
                key={league}
                onClick={() => setSelectedLeague(league)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                  selectedLeague === league
                    ? 'bg-[#00a8ff] text-white border-[#00a8ff] shadow-sm'
                    : 'bg-white dark:bg-[#111c30] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#00a8ff] hover:text-[#00a8ff]'
                }`}
              >
                {league}
              </button>
            ))}
          </div>

          {/* Mobile Advert Card (shown at top of matches on mobile screens) */}
          <div className="lg:hidden mb-4">
            <AdvertBanner sticky={false} />
          </div>

          {/* Unsupported league notice — shown if a league in the switcher has no entry in
              LEAGUE_CODE_MAP yet */}
          {selectedLeagueUnsupported && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20">
              <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Live fixtures for {selectedLeague} aren't available on our current data plan yet — check back soon,
                or browse tips for this competition posted directly by our tipsters.
              </p>
            </div>
          )}

          {/* Matches List grouped by League */}
          {!selectedLeagueUnsupported && (
            <div className="space-y-6">
              {matchesLoading ? (
                <div className="py-16 text-center text-xs text-slate-400">Loading matches...</div>
              ) : matchesError ? (
                <div className="py-16 text-center text-xs text-rose-500">{matchesError}</div>
              ) : leagueGroups.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400">No matches found for this league right now.</div>
              ) : (
                leagueGroups.map(group => (
                  <div
                    key={group.league}
                    className="bg-white dark:bg-[#111c30] border border-sky-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm"
                  >
                    {/* League Card Header */}
                    <div className="bg-sky-50 dark:bg-slate-800/50 px-4 py-3 border-b border-sky-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#00a8ff]" />
                        <h2 className="font-bold text-sm text-slate-900 dark:text-white">{group.league}</h2>
                      </div>
                      {group.hasLive && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                        </span>
                      )}
                    </div>

                    {/* Matches Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-sky-100 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold bg-sky-50/60 dark:bg-slate-900/30">
                            <th className="py-2.5 px-4 w-20">Status</th>
                            <th className="py-2.5 px-4">Match</th>
                            <th className="py-2.5 px-4 w-16 text-center">Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sky-100 dark:divide-slate-800/40">
                          {group.matches.map(match => (
                            <tr
                              key={match.id}
                              onClick={() => setSelectedMatchId(match.id)}
                              className="hover:bg-sky-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                            >
                              <td className={`py-3 px-4 font-bold font-mono ${isLiveStatus(match) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                {statusLabel(match)}
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                                <div className="space-y-1">
                                  <div>{match.homeTeam}</div>
                                  <div>{match.awayTeam}</div>
                                </div>
                              </td>
                              <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white font-mono text-center">
                                {match.homeScore != null && match.awayScore != null ? (
                                  <div className="space-y-1">
                                    <div>{match.homeScore}</div>
                                    <div>{match.awayScore}</div>
                                  </div>
                                ) : (
                                  <span className="text-slate-300 dark:text-slate-600">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* LEAGUE TEAMS & STANDINGS WIDGET */}
          {!selectedLeagueUnsupported && selectedLeague !== 'Favorites' && (
            <div className="bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm space-y-3 p-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#00a8ff]" />
                  {selectedLeague} Teams & Standings
                </h3>
              </div>

              {standingsLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading standings...</div>
              ) : standingsError ? (
                <div className="py-8 text-center text-xs text-rose-500">{standingsError}</div>
              ) : standings.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No standings available yet this season.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-slate-500 dark:text-slate-400 font-semibold bg-sky-50 dark:bg-slate-900/40 border-b border-sky-100 dark:border-slate-800">
                        <th className="py-2 px-3 w-10 text-center">#</th>
                        <th className="py-2 px-3">Team</th>
                        <th className="py-2 px-2 text-center">P</th>
                        <th className="py-2 px-2 text-center">W</th>
                        <th className="py-2 px-2 text-center">D</th>
                        <th className="py-2 px-2 text-center">L</th>
                        <th className="py-2 px-3 text-center font-bold">PTS</th>
                        <th className="py-2 px-3 text-center">Form</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-100 dark:divide-slate-800/40">
                      {standings.map(t => (
                        <tr key={t.position} className="hover:bg-sky-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-500">{t.position}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{t.team}</td>
                          <td className="py-2.5 px-2 text-center font-mono">{t.played}</td>
                          <td className="py-2.5 px-2 text-center font-mono text-emerald-600">{t.won}</td>
                          <td className="py-2.5 px-2 text-center font-mono text-amber-600">{t.draw}</td>
                          <td className="py-2.5 px-2 text-center font-mono text-red-500">{t.lost}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-extrabold text-slate-900 dark:text-white">{t.points}</td>
                          <td className="py-2.5 px-3 text-center">
                            {t.form.length === 0 ? (
                              <span className="text-slate-300 dark:text-slate-600">—</span>
                            ) : (
                              <div className="flex items-center justify-center gap-1">
                                {t.form.map((res, i) => (
                                  <span
                                    key={i}
                                    className={`w-4 h-4 rounded text-[9px] font-mono font-bold flex items-center justify-center text-white ${
                                      res === 'W' ? 'bg-emerald-500' : res === 'D' ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                  >
                                    {res}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </main>

        {/* RIGHT COLUMN: Sticky Ad + Subscriptions + Top Tipsters */}
        <aside className="w-full lg:w-80 flex-shrink-0">
          <div className="sticky top-24 space-y-4">
            <div className="hidden lg:block">
              <AdvertBanner sticky={false} />
            </div>
            <MySubscriptions onUpgrade={onOpenCheckout} />
            <TopTipsters />
          </div>
        </aside>

      </div>

      <MatchDetailModal matchId={selectedMatchId} onClose={() => setSelectedMatchId(null)} />
    </div>
  );
};
