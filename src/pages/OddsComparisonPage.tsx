import React, { useState } from 'react';
import { Search, Calendar, Star, TrendingUp, ExternalLink } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';

export const OddsComparisonPage: React.FC = () => {
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [activeMarket, setActiveMarket] = useState('Match Result');
  const [searchQuery, setSearchQuery] = useState('');

  const featuredMatches = [
    {
      date: 'Sat, 14 Oct • 15:00 UTC',
      homeTeam: 'Manchester City',
      awayTeam: 'Arsenal',
      homeCode: 'MCI',
      awayCode: 'ARS',
      status: 'UPCOMING',
      bestOdds: { home: 2.10, draw: 3.65, away: 3.40, payout: '98.2%' },
      bookmakers: [
        { name: 'Bet365', homeOdds: 2.10, drawOdds: 3.60, awayOdds: 3.30 },
        { name: 'Pinnacle', homeOdds: 2.08, drawOdds: 3.65, awayOdds: 3.40 },
        { name: 'William Hill', homeOdds: 2.05, drawOdds: 3.50, awayOdds: 3.25 },
        { name: 'Unibet', homeOdds: 2.07, drawOdds: 3.55, awayOdds: 3.35 },
        { name: '888sport', homeOdds: 2.06, drawOdds: 3.58, awayOdds: 3.30 },
      ],
    },
    {
      date: 'Sun, 15 Oct • 20:00 UTC',
      homeTeam: 'Real Madrid',
      awayTeam: 'FC Barcelona',
      homeCode: 'RMA',
      awayCode: 'BAR',
      status: 'EL CLÁSICO',
      bestOdds: { home: 2.60, draw: 3.40, away: 2.75, payout: '98.6%' },
      bookmakers: [
        { name: 'Pinnacle', homeOdds: 2.60, drawOdds: 3.40, awayOdds: 2.75 },
        { name: 'Bet365', homeOdds: 2.55, drawOdds: 3.35, awayOdds: 2.70 },
        { name: 'Unibet', homeOdds: 2.58, drawOdds: 3.38, awayOdds: 2.72 },
        { name: 'Betway', homeOdds: 2.50, drawOdds: 3.30, awayOdds: 2.68 },
      ],
    },
    {
      date: 'Tue, 17 Oct • 20:00 UTC',
      homeTeam: 'Bayern Munich',
      awayTeam: 'PSG',
      homeCode: 'BAY',
      awayCode: 'PSG',
      status: 'CHAMPIONS LEAGUE',
      bestOdds: { home: 2.05, draw: 3.70, away: 3.50, payout: '97.9%' },
      bookmakers: [
        { name: 'Bet365', homeOdds: 2.05, drawOdds: 3.70, awayOdds: 3.45 },
        { name: 'William Hill', homeOdds: 2.00, drawOdds: 3.60, awayOdds: 3.50 },
        { name: 'Pinnacle', homeOdds: 2.04, drawOdds: 3.68, awayOdds: 3.48 },
      ],
    },
  ];

  const markets = ['Match Result', 'Over/Under 2.5', 'Both Teams to Score', 'Asian Handicap'];

  const currentMatch = featuredMatches[activeMatchIndex];

  return (
    <div className="min-h-screen bg-[#f0f4f8] dark:bg-[#0b1320] py-6 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Area */}
        <main className="flex-1 space-y-6">
          
          {/* Header & Match Selector Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Odds Comparison
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compare real-time odds across leading licensed bookmakers.
              </p>
            </div>

            {/* Quick Match Switcher */}
            <div className="flex gap-2 bg-white dark:bg-[#111c30] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              {featuredMatches.map((m, idx) => (
                <button
                  key={m.homeCode}
                  onClick={() => setActiveMatchIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeMatchIndex === idx
                      ? 'bg-[#00a8ff] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#00a8ff]'
                  }`}
                >
                  {m.homeCode} vs {m.awayCode}
                </button>
              ))}
            </div>
          </div>

          {/* Match Banner Card */}
          <div className="bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Calendar className="w-4 h-4 text-[#00a8ff]" /> {currentMatch.date}
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-sky-950 text-[#00a8ff] border border-blue-200 dark:border-sky-800">
                {currentMatch.status}
              </span>
            </div>

            <div className="py-4 flex items-center justify-center gap-8">
              <div className="flex items-center gap-3">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {currentMatch.homeTeam}
                </span>
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-sky-950 flex items-center justify-center font-bold text-[#00a8ff] text-sm">
                  {currentMatch.homeCode}
                </div>
              </div>

              <span className="text-sm font-extrabold text-slate-400">VS</span>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center font-bold text-red-500 text-sm">
                  {currentMatch.awayCode}
                </div>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {currentMatch.awayTeam}
                </span>
              </div>
            </div>
          </div>

          {/* Market Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
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

          {/* Comparison Table */}
          <div className="bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#00a8ff] text-white font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">BOOKMAKER</th>
                    <th className="py-3 px-4 text-center">1 (Home)</th>
                    <th className="py-3 px-4 text-center">X (Draw)</th>
                    <th className="py-3 px-4 text-center">2 (Away)</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  
                  {/* BEST MARKET ODDS ROW */}
                  <tr className="bg-blue-50/70 dark:bg-sky-950/40 font-bold border-b-2 border-[#00a8ff]/40">
                    <td className="py-3.5 px-4 text-[#00a8ff] flex items-center gap-1.5 font-extrabold">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      BEST MARKET ODDS
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-900 dark:text-white font-mono font-extrabold text-sm">
                      {currentMatch.bestOdds.home.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-900 dark:text-white font-mono font-extrabold text-sm">
                      {currentMatch.bestOdds.draw.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-900 dark:text-white font-mono font-extrabold text-sm">
                      {currentMatch.bestOdds.away.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                      <span className="flex items-center justify-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> {currentMatch.bestOdds.payout} Payout
                      </span>
                    </td>
                  </tr>

                  {/* BOOKMAKER ROWS */}
                  {currentMatch.bookmakers.map(bk => (
                    <tr
                      key={bk.name}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {bk.name}
                      </td>
                      
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block w-20 py-1.5 px-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white">
                          {bk.homeOdds.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block w-20 py-1.5 px-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white">
                          {bk.drawOdds.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block w-20 py-1.5 px-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white">
                          {bk.awayOdds.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button className="py-1.5 px-4 bg-[#00a8ff] hover:bg-[#0090e0] text-white font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1 shadow-xs">
                          Bet Now <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          </div>

        </main>

      </div>
    </div>
  );
};
