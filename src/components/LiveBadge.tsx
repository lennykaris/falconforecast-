import React from 'react';

/** The pulsing "Live" pill shown next to leagues/countries/matches with an in-progress game.
 * Was three near-identical inline markups scattered across HomePage.tsx — pulled out once
 * a UI audit flagged the drift between them. `size` trims padding/text for the more cramped
 * nested-country-card context vs the roomier standalone league header. */
export const LiveBadge: React.FC<{ size?: 'sm' | 'xs' }> = ({ size = 'sm' }) => (
  <span
    className={`rounded-full font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 ${
      size === 'xs' ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-0.5 text-[10px]'
    }`}
  >
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
  </span>
);
