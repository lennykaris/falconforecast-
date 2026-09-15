import React from 'react';

/** Grey pulsing placeholder block. Layout-shift-free stand-ins for match/standings tables
 * while real data loads, instead of a centered "Loading..." string that pops the whole layout
 * once data lands. */
export const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded ${className}`} />
);

/** Mimics one LeagueCard's fixture table — a header bar plus a few skeleton rows. */
export const MatchesSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="space-y-6">
    {[0, 1].map(card => (
      <div
        key={card}
        className="bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm"
      >
        <div className="bg-sky-50/60 dark:bg-slate-800/50 px-4 py-3 border-b border-sky-100 dark:border-slate-800 flex items-center gap-2">
          <SkeletonBlock className="w-2 h-2 rounded-full" />
          <SkeletonBlock className="h-3.5 w-36" />
        </div>
        <div className="divide-y divide-sky-100 dark:divide-slate-800/40">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <SkeletonBlock className="h-3 w-10" />
              <div className="flex-1 space-y-1.5">
                <SkeletonBlock className="h-3 w-2/5" />
                <SkeletonBlock className="h-3 w-1/3" />
              </div>
              <SkeletonBlock className="h-3 w-6" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

/** Mimics the standings table — header row plus a handful of skeleton team rows. */
export const StandingsSkeleton: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
  <div className="space-y-2 py-1">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-1 py-1.5">
        <SkeletonBlock className="h-3 w-4" />
        <SkeletonBlock className="h-3 flex-1 max-w-[40%]" />
        <SkeletonBlock className="h-3 w-6" />
        <SkeletonBlock className="h-3 w-6" />
        <SkeletonBlock className="h-3 w-6" />
        <SkeletonBlock className="h-3 w-8" />
      </div>
    ))}
  </div>
);
