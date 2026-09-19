import React from 'react';
import type { SubscriptionPlan } from '../types/prediction';
import { ConvertedPrice } from './ConvertedPrice';

interface PricingCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  onSelectPlan: (plan: SubscriptionPlan) => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan, isCurrentPlan, onSelectPlan }) => {
  return (
    <div
      className="relative rounded-2xl p-7 sm:p-8 flex flex-col justify-between bet-card transition-all"
      style={plan.popular ? { borderColor: 'var(--brand)', boxShadow: '0 0 0 1px var(--brand), 0 20px 40px -10px rgba(56,189,248,0.15)' } : {}}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span
            className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-950 rounded-full font-display"
            style={{ backgroundColor: 'var(--brand)' }}
          >
            Most Popular
          </span>
        </div>
      )}

      <div className="space-y-6">
        {/* Plan name + savings */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold font-display" style={{ color: 'var(--text-primary)' }}>
              {plan.name}
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {plan.description}
            </p>
          </div>
          {plan.savings && (
            <span
              className="text-[10px] font-bold px-2 py-1 rounded border font-mono flex-shrink-0 ml-3"
              style={{ color: 'var(--brand)', borderColor: 'var(--brand)', backgroundColor: 'rgba(56,189,248,0.08)' }}
            >
              {plan.savings}
            </span>
          )}
        </div>

        {/* Price */}
        <div
          className="pb-6 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-baseline gap-1">
            <span
              className="text-4xl sm:text-5xl font-black font-mono"
              style={{ color: 'var(--text-primary)' }}
            >
              {plan.price}
            </span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {plan.period}
            </span>
          </div>
          {/* Display-only conversion for context — the actual M-Pesa charge is always the KSh
              amount above. */}
          <ConvertedPrice kes={plan.rawPrice} className="text-[11px] mt-0.5 block" style={{ color: 'var(--text-muted)' }} />
        </div>

        {/* Features */}
        <ul className="space-y-3">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span
                className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: 'var(--brand)' }}
              />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="mt-8">
        {isCurrentPlan ? (
          <div
            className="w-full py-3 text-xs font-bold text-center rounded-xl border font-display"
            style={{ color: 'var(--brand)', borderColor: 'var(--brand)' }}
          >
            Active Plan
          </div>
        ) : (
          <button
            onClick={() => onSelectPlan(plan)}
            className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 transition-all hover:brightness-110 font-display"
            style={{ backgroundColor: 'var(--brand)' }}
          >
            Subscribe Now
          </button>
        )}
      </div>
    </div>
  );
};
