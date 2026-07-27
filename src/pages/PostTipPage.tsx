import React, { useState } from 'react';
import { Search, Eye, CheckCircle2, Lock } from 'lucide-react';


export const PostTipPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [searchMatch, setSearchMatch] = useState('');
  const [selectedMatch, setSelectedMatch] = useState({
    id: 'm1',
    league: 'Premier League',
    teams: 'Arsenal vs Liverpool',
    time: 'Today, 20:00',
  });

  const [market, setMarket] = useState('Over 2.5 Goals');
  const [odds, setOdds] = useState<string>('1.85');
  const [isFree, setIsFree] = useState(true);
  const [rationale, setRationale] = useState(
    'Selecting a high-scoring market based on recent offensive form and key defensive injuries...'
  );
  const [published, setPublished] = useState(false);

  const matchesOptions = [
    {
      id: 'm1',
      league: 'Premier League',
      teams: 'Arsenal vs Liverpool',
      time: 'Today, 20:00',
    },
    {
      id: 'm2',
      league: 'La Liga',
      teams: 'Real Madrid vs Barcelona',
      time: 'Tomorrow, 21:00',
    },
    {
      id: 'm3',
      league: 'Serie A',
      teams: 'Inter Milan vs Juventus',
      time: 'Sun, 18:00',
    },
  ];

  const filteredMatches = matchesOptions.filter(
    m =>
      m.teams.toLowerCase().includes(searchMatch.toLowerCase()) ||
      m.league.toLowerCase().includes(searchMatch.toLowerCase())
  );

  const handlePublish = () => {
    setPublished(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b1320] py-6 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">

        {/* Center Main Wizard Area */}
        <main className="flex-1 space-y-6">
          
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Post a New Tip
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Share your insights with the FieldForecasts community.
            </p>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="flex items-center justify-between max-w-xl mx-auto bg-white dark:bg-[#111c30] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center ${
                  currentStep >= 1
                    ? 'bg-[#00a8ff] text-white'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                }`}
              >
                1
              </span>
              <span className={`text-xs font-bold ${currentStep === 1 ? 'text-[#00a8ff]' : 'text-slate-500'}`}>
                Match
              </span>
            </div>

            <div className="h-0.5 flex-1 mx-4 bg-slate-200 dark:bg-slate-700" />

            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center ${
                  currentStep >= 2
                    ? 'bg-[#00a8ff] text-white'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                }`}
              >
                2
              </span>
              <span className={`text-xs font-bold ${currentStep === 2 ? 'text-[#00a8ff]' : 'text-slate-500'}`}>
                Market
              </span>
            </div>

            <div className="h-0.5 flex-1 mx-4 bg-slate-200 dark:bg-slate-700" />

            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center ${
                  currentStep >= 3
                    ? 'bg-[#00a8ff] text-white'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                }`}
              >
                3
              </span>
              <span className={`text-xs font-bold ${currentStep === 3 ? 'text-[#00a8ff]' : 'text-slate-500'}`}>
                Details
              </span>
            </div>
          </div>

          {published ? (
            <div className="bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-4 shadow-sm animate-fadein">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tip Published Successfully!</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Your prediction for {selectedMatch.teams} has been submitted and is now live on FieldForecasts.
              </p>
              <button
                onClick={() => {
                  setPublished(false);
                  setCurrentStep(1);
                }}
                className="px-6 py-2.5 bg-[#00a8ff] text-white text-xs font-bold rounded-lg hover:bg-[#0090e0] transition-colors"
              >
                Post Another Tip
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
              
              {/* STEP 1: SELECT MATCH */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Select Match</h3>

                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search teams, leagues, or tournaments..."
                      value={searchMatch}
                      onChange={e => setSearchMatch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs input-field"
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Popular Upcoming
                    </p>
                    {filteredMatches.map(m => (
                      <label
                        key={m.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedMatch.id === m.id
                            ? 'border-[#00a8ff] bg-blue-50/50 dark:bg-sky-950/40'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="matchSelect"
                          checked={selectedMatch.id === m.id}
                          onChange={() => setSelectedMatch(m)}
                          className="accent-[#00a8ff]"
                        />
                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold">
                            {m.league} • {m.time}
                          </p>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{m.teams}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-2 bg-[#00a8ff] hover:bg-[#0090e0] text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: SELECT MARKET & ODDS */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Select Market & Odds</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                        Market Type:
                      </label>
                      <select
                        value={market}
                        onChange={e => setMarket(e.target.value)}
                        className="w-full input-field text-xs font-semibold"
                      >
                        <option value="Over 2.5 Goals">Over 2.5 Goals</option>
                        <option value="Home Win (1X2)">Home Win (1X2)</option>
                        <option value="Away Win (1X2)">Away Win (1X2)</option>
                        <option value="Both Teams to Score (BTTS)">Both Teams to Score (BTTS)</option>
                        <option value="Asian Handicap -1.0">Asian Handicap -1.0</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                        Odds:
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={odds}
                        onChange={e => setOdds(e.target.value)}
                        className="w-full input-field text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-2 bg-[#00a8ff] hover:bg-[#0090e0] text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DETAILS & RATIONALE */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tip Details</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                        Tip Access:
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                          <input
                            type="radio"
                            checked={isFree}
                            onChange={() => setIsFree(true)}
                            className="accent-[#00a8ff]"
                          />
                          Free Tip
                        </label>
                        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                          <input
                            type="radio"
                            checked={!isFree}
                            onChange={() => setIsFree(false)}
                            className="accent-[#00a8ff]"
                          />
                          Premium Tip (Subscribers Only)
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                        Detailed Rationale / Analysis:
                      </label>
                      <textarea
                        rows={4}
                        value={rationale}
                        onChange={e => setRationale(e.target.value)}
                        className="w-full input-field text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePublish}
                      className="px-6 py-2 bg-[#00a8ff] hover:bg-[#0090e0] text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Publish Tip
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </main>

        {/* RIGHT COLUMN: Real-Time Live Preview Card */}
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-4">
          <div className="bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              <Eye className="w-4 h-4 text-[#00a8ff]" /> Live Preview
            </div>

            {/* Tip Preview Card Container */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/40">
              {/* User Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-[#00a8ff] text-white font-extrabold text-xs flex items-center justify-center">
                    EX
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">ExpertPro</h5>
                    <p className="text-[10px] text-emerald-500 font-bold">📈 Yield: +12.4%</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isFree
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800'
                      : 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950 dark:border-amber-800'
                  }`}
                >
                  {isFree ? 'Free Tip' : 'Premium Tip'}
                </span>
              </div>

              {/* Match Header */}
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">{selectedMatch.league}</p>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {selectedMatch.teams}
                </h4>
              </div>

              {/* Market Box */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-white dark:bg-[#111c30] rounded-lg border border-slate-200 dark:border-slate-700/80">
                <div>
                  <p className="text-[10px] text-slate-400">Market</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{market}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">Odds</p>
                  <p className="text-xs font-bold text-[#00a8ff] font-mono">{odds}</p>
                </div>
              </div>

              {/* Rationale text */}
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed italic border-l-2 border-[#00a8ff] pl-2">
                "{rationale}"
              </p>

              {/* Button */}
              <button className="w-full py-2 bg-[#00a8ff] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1">
                {!isFree && <Lock className="w-3 h-3" />}
                {isFree ? 'View Tip' : 'Unlock Tip'}
              </button>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};
