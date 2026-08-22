import React, { useState } from 'react';
import { Crown } from 'lucide-react';
import { usePredictions } from '../context/PredictionsContext';
import { PredictionCard } from '../components/PredictionCard';
import { LEAGUE_OPTIONS, SUBSCRIPTION_PLANS } from '../data/predictions';
import type { SubscriptionPlan } from '../types/prediction';

interface PremiumTipsPageProps {
  onOpenCheckout?: (plan?: SubscriptionPlan) => void;
}

export const PremiumTipsPage: React.FC<PremiumTipsPageProps> = ({ onOpenCheckout }) => {
  const { predictions } = usePredictions();
  const [selectedLeague, setSelectedLeague] = useState('All Leagues');

  const vipPredictions = predictions.filter(p => p.tier === 'vip');
  const filtered = vipPredictions.filter(
    p => selectedLeague === 'All Leagues' || p.league === selectedLeague
  );
  const popularPlan = SUBSCRIPTION_PLANS.find(p => p.popular) || SUBSCRIPTION_PLANS[1];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b1320] py-6 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#00a8ff] mb-1">
              <Crown className="w-3.5 h-3.5 fill-[#00a8ff]" />
              Verified Premium Picks
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Premium Tips
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed mt-0.5">
              High-confidence picks from our platform and verified tipsters. Free tips are unlocked
              by default — premium tips unlock with a platform VIP subscription or a subscription to
              that specific tipster.
            </p>
          </div>
        </div>

        {/* League filter */}
        <div className="flex flex-wrap gap-1.5">
          {LEAGUE_OPTIONS.map(league => (
            <button
              key={league}
              onClick={() => setSelectedLeague(league)}
              className={`px-3.5 py-2 rounded-lg text-[11px] font-semibold transition-all border ${
                selectedLeague === league
                  ? 'bg-[#00a8ff] text-white border-[#00a8ff]'
                  : 'bg-white dark:bg-[#111c30] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-[#00a8ff]'
              }`}
            >
              {league}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-400">No premium tips available right now — check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(prediction => (
              <PredictionCard
                key={prediction.id}
                prediction={prediction}
                onUnlockClick={() => onOpenCheckout && onOpenCheckout(popularPlan)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
