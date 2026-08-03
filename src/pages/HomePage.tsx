import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SlidersHorizontal, Shield, Trophy } from 'lucide-react';

import { MySubscriptions } from '../components/MySubscriptions';
import { TopTipsters } from '../components/TopTipsters';
import { AdvertBanner } from '../components/AdvertBanner';
import { Sidebar } from '../components/Sidebar';

interface HomePageProps {
  onOpenCheckout?: (plan?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenCheckout }) => {
  const location = useLocation();
  const [selectedLeague, setSelectedLeague] = useState('Premier League');

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

  const leagueTeamsMap: Record<string, { rank: number; team: string; played: number; won: number; draw: number; lost: number; points: number; form: string[] }[]> = {
    'Premier League': [
      { rank: 1, team: 'Arsenal', played: 28, won: 20, draw: 5, lost: 3, points: 65, form: ['W', 'W', 'W', 'D', 'W'] },
      { rank: 2, team: 'Manchester City', played: 28, won: 19, draw: 6, lost: 3, points: 63, form: ['W', 'W', 'D', 'W', 'W'] },
      { rank: 3, team: 'Liverpool', played: 28, won: 18, draw: 7, lost: 3, points: 61, form: ['W', 'D', 'W', 'W', 'L'] },
      { rank: 4, team: 'Aston Villa', played: 28, won: 16, draw: 5, lost: 7, points: 53, form: ['L', 'W', 'W', 'W', 'D'] },
      { rank: 5, team: 'Tottenham Hotspur', played: 28, won: 15, draw: 5, lost: 8, points: 50, form: ['W', 'L', 'W', 'L', 'W'] },
      { rank: 6, team: 'Manchester United', played: 28, won: 14, draw: 5, lost: 9, points: 47, form: ['W', 'W', 'L', 'L', 'W'] },
      { rank: 7, team: 'Newcastle United', played: 28, won: 13, draw: 4, lost: 11, points: 43, form: ['D', 'W', 'L', 'W', 'W'] },
      { rank: 8, team: 'Chelsea', played: 28, won: 11, draw: 6, lost: 11, points: 39, form: ['W', 'D', 'L', 'W', 'D'] },
    ],
    'La Liga': [
      { rank: 1, team: 'Real Madrid', played: 28, won: 21, draw: 6, lost: 1, points: 69, form: ['W', 'W', 'D', 'W', 'W'] },
      { rank: 2, team: 'FC Barcelona', played: 28, won: 18, draw: 7, lost: 3, points: 61, form: ['W', 'D', 'W', 'W', 'W'] },
      { rank: 3, team: 'Girona', played: 28, won: 19, draw: 2, lost: 7, points: 59, form: ['L', 'W', 'L', 'W', 'L'] },
      { rank: 4, team: 'Atletico Madrid', played: 28, won: 17, draw: 4, lost: 7, points: 55, form: ['L', 'W', 'D', 'W', 'L'] },
      { rank: 5, team: 'Athletic Bilbao', played: 28, won: 14, draw: 8, lost: 6, points: 50, form: ['W', 'D', 'W', 'L', 'W'] },
      { rank: 6, team: 'Real Sociedad', played: 28, won: 11, draw: 10, lost: 7, points: 43, form: ['W', 'L', 'L', 'W', 'L'] },
      { rank: 7, team: 'Real Betis', played: 28, won: 10, draw: 12, lost: 6, points: 42, form: ['L', 'L', 'W', 'D', 'W'] },
      { rank: 8, team: 'Sevilla', played: 28, won: 7, draw: 10, lost: 11, points: 31, form: ['D', 'W', 'D', 'L', 'W'] },
    ],
    'Champions League': [
      { rank: 1, team: 'Real Madrid', played: 8, won: 7, draw: 1, lost: 0, points: 22, form: ['W', 'W', 'W', 'W', 'D'] },
      { rank: 2, team: 'Manchester City', played: 8, won: 7, draw: 1, lost: 0, points: 22, form: ['W', 'W', 'W', 'D', 'W'] },
      { rank: 3, team: 'Bayern Munich', played: 8, won: 6, draw: 1, lost: 1, points: 19, form: ['W', 'W', 'L', 'W', 'W'] },
      { rank: 4, team: 'Arsenal', played: 8, won: 5, draw: 2, lost: 1, points: 17, form: ['W', 'D', 'W', 'W', 'L'] },
      { rank: 5, team: 'Paris Saint-Germain', played: 8, won: 4, draw: 3, lost: 1, points: 15, form: ['D', 'W', 'W', 'L', 'W'] },
      { rank: 6, team: 'Inter Milan', played: 8, won: 4, draw: 3, lost: 1, points: 15, form: ['W', 'D', 'L', 'W', 'W'] },
      { rank: 7, team: 'Borussia Dortmund', played: 8, won: 4, draw: 2, lost: 2, points: 14, form: ['W', 'L', 'W', 'D', 'W'] },
      { rank: 8, team: 'FC Barcelona', played: 8, won: 4, draw: 1, lost: 3, points: 13, form: ['L', 'W', 'W', 'L', 'W'] },
    ],
    'Serie A': [
      { rank: 1, team: 'Inter Milan', played: 28, won: 24, draw: 3, lost: 1, points: 75, form: ['W', 'W', 'W', 'W', 'W'] },
      { rank: 2, team: 'AC Milan', played: 28, won: 18, draw: 5, lost: 5, points: 59, form: ['W', 'W', 'D', 'W', 'L'] },
      { rank: 3, team: 'Juventus', played: 28, won: 17, draw: 7, lost: 4, points: 58, form: ['D', 'L', 'W', 'D', 'L'] },
      { rank: 4, team: 'Bologna', played: 28, won: 14, draw: 9, lost: 5, points: 51, form: ['L', 'W', 'W', 'W', 'W'] },
      { rank: 5, team: 'AS Roma', played: 28, won: 14, draw: 6, lost: 8, points: 48, form: ['W', 'W', 'W', 'D', 'W'] },
      { rank: 6, team: 'Atalanta', played: 28, won: 14, draw: 5, lost: 9, points: 47, form: ['D', 'L', 'L', 'D', 'W'] },
      { rank: 7, team: 'Napoli', played: 28, won: 12, draw: 8, lost: 8, points: 44, form: ['D', 'W', 'W', 'D', 'L'] },
      { rank: 8, team: 'Lazio', played: 28, won: 12, draw: 4, lost: 12, points: 40, form: ['L', 'L', 'L', 'W', 'L'] },
    ],
    'Bundesliga': [
      { rank: 1, team: 'Bayer Leverkusen', played: 25, won: 21, draw: 4, lost: 0, points: 67, form: ['W', 'W', 'W', 'W', 'W'] },
      { rank: 2, team: 'Bayern Munich', played: 25, won: 18, draw: 3, lost: 4, points: 57, form: ['W', 'D', 'W', 'L', 'W'] },
      { rank: 3, team: 'VfB Stuttgart', played: 25, won: 17, draw: 2, lost: 6, points: 53, form: ['W', 'W', 'D', 'W', 'W'] },
      { rank: 4, team: 'Borussia Dortmund', played: 25, won: 13, draw: 8, lost: 4, points: 47, form: ['W', 'W', 'L', 'D', 'W'] },
      { rank: 5, team: 'RB Leipzig', played: 25, won: 14, draw: 4, lost: 7, points: 46, form: ['W', 'W', 'L', 'W', 'L'] },
      { rank: 6, team: 'Eintracht Frankfurt', played: 25, won: 10, draw: 10, lost: 5, points: 40, form: ['W', 'W', 'D', 'D', 'L'] },
    ],
  };

  const allLeaguesMatchesData = [
    {
      league: 'Premier League',
      isLive: true,
      matches: [
        {
          id: 'pl-1',
          time: "67'",
          homeTeam: 'Arsenal',
          awayTeam: 'Tottenham Hotspur',
          homeScore: 2,
          awayScore: 1,
          odds: { home: 1.45, draw: 4.20, away: 6.50 },
        },
        {
          id: 'pl-2',
          time: 'HT',
          homeTeam: 'Manchester United',
          awayTeam: 'Chelsea',
          homeScore: 1,
          awayScore: 0,
          odds: { home: 2.10, draw: 3.40, away: 3.50 },
        },
        {
          id: 'pl-3',
          time: '20:00',
          homeTeam: 'Manchester City',
          awayTeam: 'Liverpool',
          homeScore: 0,
          awayScore: 0,
          odds: { home: 1.95, draw: 3.60, away: 3.80 },
        },
        {
          id: 'pl-4',
          time: 'Tomorrow',
          homeTeam: 'Aston Villa',
          awayTeam: 'Newcastle United',
          homeScore: 0,
          awayScore: 0,
          odds: { home: 2.25, draw: 3.30, away: 3.10 },
        },
      ],
    },
    {
      league: 'La Liga',
      isLive: true,
      matches: [
        {
          id: 'll-1',
          time: "23'",
          homeTeam: 'Real Madrid',
          awayTeam: 'FC Barcelona',
          homeScore: 0,
          awayScore: 0,
          odds: { home: 2.60, draw: 3.20, away: 2.75 },
        },
        {
          id: 'll-2',
          time: "78'",
          homeTeam: 'Atletico Madrid',
          awayTeam: 'Sevilla',
          homeScore: 2,
          awayScore: 0,
          odds: { home: 1.65, draw: 3.80, away: 5.20 },
        },
        {
          id: 'll-3',
          time: '21:00',
          homeTeam: 'Real Sociedad',
          awayTeam: 'Athletic Bilbao',
          homeScore: 0,
          awayScore: 0,
          odds: { home: 2.30, draw: 3.10, away: 3.20 },
        },
      ],
    },
    {
      league: 'Champions League',
      isLive: true,
      matches: [
        {
          id: 'ucl-1',
          time: "42'",
          homeTeam: 'Bayern Munich',
          awayTeam: 'Paris Saint-Germain',
          homeScore: 1,
          awayScore: 1,
          odds: { home: 2.05, draw: 3.50, away: 3.40 },
        },
        {
          id: 'ucl-2',
          time: 'Tomorrow',
          homeTeam: 'Inter Milan',
          awayTeam: 'Borussia Dortmund',
          homeScore: 0,
          awayScore: 0,
          odds: { home: 1.85, draw: 3.60, away: 4.10 },
        },
        {
          id: 'ucl-3',
          time: 'Tomorrow',
          homeTeam: 'Real Madrid',
          awayTeam: 'Arsenal',
          homeScore: 0,
          awayScore: 0,
          odds: { home: 2.10, draw: 3.40, away: 3.20 },
        },
      ],
    },
    {
      league: 'Serie A',
      isLive: false,
      matches: [
        {
          id: 'sa-1',
          time: '19:45',
          homeTeam: 'AC Milan',
          awayTeam: 'AS Roma',
          homeScore: 0,
          awayScore: 0,
          odds: { home: 2.15, draw: 3.25, away: 3.40 },
        },
        {
          id: 'sa-2',
          time: 'Tomorrow',
          homeTeam: 'Napoli',
          awayTeam: 'Lazio',
          homeScore: 0,
          awayScore: 0,
          odds: { home: 1.90, draw: 3.40, away: 4.00 },
        },
        {
          id: 'sa-3',
          time: 'Tomorrow',
          homeTeam: 'Inter Milan',
          awayTeam: 'Juventus',
          homeScore: 0,
          awayScore: 0,
          odds: { home: 1.80, draw: 3.50, away: 4.20 },
        },
      ],
    },
    {
      league: 'Bundesliga',
      isLive: false,
      matches: [
        {
          id: 'bl-1',
          time: '18:30',
          homeTeam: 'Bayer Leverkusen',
          awayTeam: 'RB Leipzig',
          homeScore: 0,
          awayScore: 0,
          odds: { home: 1.90, draw: 3.75, away: 3.60 },
        },
        {
          id: 'bl-2',
          time: 'Tomorrow',
          homeTeam: 'Eintracht Frankfurt',
          awayTeam: 'VfB Stuttgart',
          homeScore: 0,
          awayScore: 0,
          odds: { home: 2.40, draw: 3.40, away: 2.80 },
        },
      ],
    },
  ];

  // Filter matches by selected league
  const displayedGroups = selectedLeague === 'Favorites'
    ? allLeaguesMatchesData
    : allLeaguesMatchesData.filter(g => g.league.toLowerCase() === selectedLeague.toLowerCase());

  const currentTeamsList = leagueTeamsMap[selectedLeague] || leagueTeamsMap['Premier League'];


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
                Real-time scores, odds comparison, and league standings.
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

          {/* Matches List grouped by League */}
          <div className="space-y-6">
            {(displayedGroups.length > 0 ? displayedGroups : allLeaguesMatchesData).map(group => (
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
                  {group.isLive && (
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
                        <th className="py-2.5 px-4 w-16">Time</th>
                        <th className="py-2.5 px-4">Match</th>
                        <th className="py-2.5 px-4 w-16 text-center">Score</th>
                        <th className="py-2.5 px-2 w-20 text-center">1</th>
                        <th className="py-2.5 px-2 w-20 text-center">X</th>
                        <th className="py-2.5 px-2 w-20 text-center">2</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-100 dark:divide-slate-800/40">
                      {group.matches.map(match => (
                        <tr
                          key={match.id}
                          className="hover:bg-sky-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Time */}
                          <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            {match.time}
                          </td>

                          {/* Teams */}
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            <div className="space-y-1">
                              <div>{match.homeTeam}</div>
                              <div>{match.awayTeam}</div>
                            </div>
                          </td>

                          {/* Scores */}
                          <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white font-mono text-center">
                            <div className="space-y-1">
                              <div>{match.homeScore}</div>
                              <div>{match.awayScore}</div>
                            </div>
                          </td>

                          {/* Odds 1 — display only */}
                          <td className="py-3 px-2">
                            <span className="w-full odds-btn block text-center">
                              {match.odds.home.toFixed(2)}
                            </span>
                          </td>

                          {/* Odds X — display only */}
                          <td className="py-3 px-2">
                            <span className="w-full odds-btn block text-center">
                              {match.odds.draw.toFixed(2)}
                            </span>
                          </td>

                          {/* Odds 2 — display only */}
                          <td className="py-3 px-2">
                            <span className="w-full odds-btn block text-center">
                              {match.odds.away.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* LEAGUE TEAMS & STANDINGS WIDGET */}
          <div className="bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm space-y-3 p-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#00a8ff]" />
                {selectedLeague} Teams & Standings
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">Season 2024/25</span>
            </div>

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
                  {currentTeamsList.map(t => (
                    <tr key={t.team} className="hover:bg-sky-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-500">{t.rank}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{t.team}</td>
                      <td className="py-2.5 px-2 text-center font-mono">{t.played}</td>
                      <td className="py-2.5 px-2 text-center font-mono text-emerald-600">{t.won}</td>
                      <td className="py-2.5 px-2 text-center font-mono text-amber-600">{t.draw}</td>
                      <td className="py-2.5 px-2 text-center font-mono text-red-500">{t.lost}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-extrabold text-slate-900 dark:text-white">{t.points}</td>
                      <td className="py-2.5 px-3 text-center">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>

        {/* RIGHT COLUMN: Sticky Ad + Subscriptions + Top Tipsters */}
        <aside className="w-full lg:w-80 flex-shrink-0">
          <div className="sticky top-24 space-y-4">
            <AdvertBanner sticky={false} />
            <MySubscriptions onUpgrade={onOpenCheckout} />
            <TopTipsters />
          </div>
        </aside>

      </div>
    </div>
  );
};
