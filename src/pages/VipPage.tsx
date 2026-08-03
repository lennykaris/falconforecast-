import React, { useState } from 'react';
import { PricingCard } from '../components/PricingCard';
import { SUBSCRIPTION_PLANS } from '../data/predictions';
import type { SubscriptionPlan } from '../types/prediction';
import { useAuth } from '../context/AuthContext';

interface VipPageProps {
  onOpenCheckout: (plan: SubscriptionPlan) => void;
}

export const VipPage: React.FC<VipPageProps> = ({ onOpenCheckout }) => {
  const { user } = useAuth();
  const [stakePerBet, setStakePerBet] = useState<number>(500);
  const [betsPerWeek, setBetsPerWeek] = useState<number>(10);

  const monthlyWagered = stakePerBet * betsPerWeek * 4;
  const estimatedMonthlyProfit = Math.round(monthlyWagered * 0.348);

  const featureMatrix = [
    { feature: 'Daily Free Predictions', free: true, pro: true, champion: true },
    { feature: '85%+ Confidence VIP Picks', free: false, pro: true, champion: true },
    { feature: 'Tactical & Form Deep Analyses', free: false, pro: true, champion: true },
    { feature: 'High-Odds Value Accumulators', free: false, pro: true, champion: true },
    { feature: 'Instant App & Email VIP Alerts', free: false, pro: true, champion: true },
    { feature: 'Bankroll & ROI Calculator', free: false, pro: true, champion: true },
    { feature: '1-on-1 Staking Strategy Advice', free: false, pro: false, champion: true },
    { feature: 'Early-Bird Line Movement Alerts', free: false, pro: false, champion: true },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-6 md:pt-24 pb-28 md:pb-12 space-y-16">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: 'var(--brand)' }}
          >
            Subscriber Access
          </p>
          <h1
            className="text-4xl sm:text-6xl font-black tracking-tight font-display"
            style={{ color: 'var(--text-primary)' }}
          >
            VIP PASS
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Highest confidence picks, tactical breakdowns, and value accumulators engineered to outperform bookmaker margins.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {SUBSCRIPTION_PLANS.map(plan => {
            const isCurrent = user?.plan === plan.id;
            return (
              <PricingCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={isCurrent}
                onSelectPlan={onOpenCheckout}
              />
            );
          })}
        </div>

        {/* ROI Calculator */}
        <div className="bet-card rounded-2xl p-8 sm:p-12 space-y-8">
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-display" style={{ color: 'var(--text-primary)' }}>
                ROI Simulator
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Estimate your potential monthly returns
              </p>
            </div>
            <span
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
              style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}
            >
              Based on +34.8% historical yield
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Sliders */}
            <div className="space-y-7">
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span style={{ color: 'var(--text-secondary)' }}>Avg. Stake Per Bet</span>
                  <span className="font-mono" style={{ color: 'var(--brand)' }}>KSh {stakePerBet.toLocaleString()}</span>
                </div>
                <input
                  type="range" min="100" max="5000" step="100"
                  value={stakePerBet}
                  onChange={e => setStakePerBet(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-muted)' }}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span style={{ color: 'var(--text-secondary)' }}>Bets Per Week</span>
                  <span className="font-mono" style={{ color: 'var(--brand)' }}>{betsPerWeek}</span>
                </div>
                <input
                  type="range" min="3" max="35" step="1"
                  value={betsPerWeek}
                  onChange={e => setBetsPerWeek(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-muted)' }}
                />
              </div>
            </div>

            {/* Result */}
            <div
              className="rounded-2xl p-8 text-center space-y-2"
              style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Est. Monthly Profit
              </p>
              <p
                className="text-4xl sm:text-5xl font-black font-mono"
                style={{ color: 'var(--brand)' }}
              >
                +KSh {estimatedMonthlyProfit.toLocaleString()}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                On KSh {monthlyWagered.toLocaleString()} wagered at 34.8% ROI
              </p>
            </div>
          </div>
        </div>

        {/* Feature Matrix */}
        <div className="space-y-6">
          <h2 className="text-xl font-black font-display" style={{ color: 'var(--text-primary)' }}>
            Plan Comparison
          </h2>

          <div className="bet-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
                    <th className="py-4 px-5 text-left font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Feature
                    </th>
                    <th className="py-4 px-5 text-center font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Free
                    </th>
                    <th className="py-4 px-5 text-center font-bold uppercase tracking-wider" style={{ color: 'var(--brand)' }}>
                      Pro
                    </th>
                    <th className="py-4 px-5 text-center font-bold uppercase tracking-wider" style={{ color: 'var(--brand)' }}>
                      Champion
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {featureMatrix.map((row, idx) => (
                    <tr
                      key={idx}
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <td className="py-3.5 px-5 font-medium" style={{ color: 'var(--text-primary)' }}>
                        {row.feature}
                      </td>
                      {[row.free, row.pro, row.champion].map((val, i) => (
                        <td key={i} className="py-3.5 px-5 text-center">
                          {val ? (
                            <span className="font-bold text-sm" style={{ color: 'var(--brand)' }}>✓</span>
                          ) : (
                            <span className="text-sm" style={{ color: 'var(--border)' }}>—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
