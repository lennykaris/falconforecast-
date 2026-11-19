import React, { useState } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { PredictionCard } from '../components/PredictionCard';
import { LEAGUE_OPTIONS } from '../data/predictions';
import type { SubscriptionPlan } from '../types/prediction';
import { usePlatformPricing } from '../context/PlatformPricingContext';

interface FreeTipsPageProps {
  onOpenCheckout: (plan: SubscriptionPlan) => void;
}

export const FreeTipsPage: React.FC<FreeTipsPageProps> = ({ onOpenCheckout }) => {
  const { plans } = usePlatformPricing();
  const { predictions, error: predictionsError } = usePredictions();
  const [selectedLeague, setSelectedLeague] = useState('All Leagues');
  const [searchQuery, setSearchQuery] = useState('');

  const historyStart = Date.now() - 3 * 24 * 60 * 60 * 1000;
  const freePredictions = predictions.filter(
    p => p.tier === 'free' && new Date(p.kickoff).getTime() >= historyStart
  );

  const filteredPredictions = freePredictions.filter(p => {
    const matchesLeague = selectedLeague === 'All Leagues' || p.league === selectedLeague;
    const matchesSearch =
      p.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tip.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLeague && matchesSearch;
  });

  const popularPlan = plans.find(p => p.popular) || plans[1];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-6 md:pt-24 pb-28 md:pb-12 space-y-8">

        {/* Header */}
        <div className="space-y-1.5">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: 'var(--brand)' }}
          >
            Updated daily · 09:00 GMT
          </p>
          <h1 className="text-3xl sm:text-4xl font-black font-display" style={{ color: 'var(--text-primary)' }}>
            Daily Free Tips
          </h1>
        </div>

        {predictionsError && (
          <p role="alert" className="text-xs font-semibold text-rose-600 dark:text-rose-400">
            Could not load predictions: {predictionsError}
          </p>
        )}

        {/* Filters */}
        <div
          className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bet-card"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search team or tip type…"
            className="input-field flex-1 max-w-xs rounded-lg px-4 py-2.5 text-xs"
          />

          <div className="flex flex-wrap gap-1.5">
            {LEAGUE_OPTIONS.map(league => (
              <button
                key={league}
                onClick={() => setSelectedLeague(league)}
                className="px-3.5 py-2 rounded-lg text-[11px] font-semibold transition-all border"
                style={
                  selectedLeague === league
                    ? { backgroundColor: 'var(--brand)', color: '#020617', borderColor: 'var(--brand)' }
                    : { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }
                }
              >
                {league}
              </button>
            ))}
          </div>
        </div>

        {/* Meta bar */}
        <div
          className="flex items-center justify-between pb-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {filteredPredictions.length} tip{filteredPredictions.length !== 1 ? 's' : ''}
            {(searchQuery || selectedLeague !== 'All Leagues') ? ' matching filter' : ' available today'}
          </span>
          {(searchQuery || selectedLeague !== 'All Leagues') && (
            <button
              onClick={() => { setSelectedLeague('All Leagues'); setSearchQuery(''); }}
              className="text-xs font-semibold underline underline-offset-2"
              style={{ color: 'var(--brand)' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Grid */}
        {filteredPredictions.length === 0 ? (
          <div
            className="py-20 text-center rounded-2xl bet-card"
          >
            <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
              No tips found.
            </p>
            <button
              onClick={() => { setSelectedLeague('All Leagues'); setSearchQuery(''); }}
              className="text-xs font-semibold underline"
              style={{ color: 'var(--brand)' }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPredictions.map(prediction => (
              <PredictionCard key={prediction.id} prediction={prediction} />
            ))}
          </div>
        )}

        {/* VIP upsell */}
        <div
          className="rounded-2xl p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bet-card"
          style={{ borderColor: 'rgba(56,189,248,0.2)' }}
        >
          <div className="space-y-1">
            <h3 className="text-sm font-bold font-display" style={{ color: 'var(--text-primary)' }}>
              Want Higher Odds & Accumulators?
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              VIP unlocks 90%+ confidence picks, Asian handicap lines, and same-day alerts.
            </p>
          </div>
          <button
            onClick={() => onOpenCheckout(popularPlan)}
            className="flex-shrink-0 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 rounded-lg transition-all hover:brightness-110"
            style={{ backgroundColor: 'var(--brand)' }}
          >
            Upgrade to VIP
          </button>
        </div>

      </div>
    </div>
  );
};
