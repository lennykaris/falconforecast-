import React, { useState, useEffect } from 'react';
import { X, Megaphone, ExternalLink, ChevronRight, Pause, Play } from 'lucide-react';

interface AdvertBannerProps {
  sticky?: boolean;
}

const ADS = [
  {
    id: 1,
    brand: 'BetKing',
    initial: 'B',
    tagline: 'Africa\'s #1 Sportsbook',
    cta: 'Get 200% Bonus',
    href: '#',
    badge: 'SPONSORED',
    gradient: 'from-amber-500 to-orange-500',
    textColor: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50/90 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800/50',
    description: 'Deposit KSh 500 and get KSh 1,000 free on your first bet.',
  },
  {
    id: 2,
    brand: 'SportyBet',
    initial: 'S',
    tagline: 'Fastest Cashouts & Highest Odds',
    cta: 'Claim KSh 1,500 Gift',
    href: '#',
    badge: 'FEATURED SPONSOR',
    gradient: 'from-red-500 to-rose-600',
    textColor: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50/90 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800/50',
    description: 'Instant payouts with zero fees & instant accumulator boosts up to 1000%.',
  },
  {
    id: 3,
    brand: '1xBet',
    initial: '1X',
    tagline: '1,000+ Markets & Live Streaming',
    cta: 'Register & Win Big',
    href: '#',
    badge: 'OFFICIAL PARTNER',
    gradient: 'from-sky-500 to-blue-600',
    textColor: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50/90 dark:bg-sky-950/40',
    border: 'border-sky-200 dark:border-sky-800/50',
    description: 'Watch live matches for free and enjoy top market odds worldwide.',
  },
  {
    id: 4,
    brand: 'SofaAnalytics',
    initial: 'SA',
    tagline: 'Pro xG Heatmaps & Live Stats',
    cta: 'Try Pro 7 Days Free',
    href: '#',
    badge: 'DATA PARTNER',
    gradient: 'from-emerald-500 to-teal-600',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50/90 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    description: 'Track real-time momentum graphs & expected goals for all live games.',
  },
];

export const AdvertBanner: React.FC<AdvertBannerProps> = ({ sticky = true }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Auto-rotate every 3 seconds (3000ms) unless paused or dismissed
  useEffect(() => {
    if (dismissed || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % ADS.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [dismissed, isPaused]);

  const ad = ADS[currentIndex];

  if (dismissed) {
    return (
      <div className="bg-white dark:bg-[#111c30] border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
        <Megaphone className="w-5 h-5 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <p className="text-[10px] text-slate-400 font-medium">Advertise here</p>
        <p className="text-[10px] text-slate-300 dark:text-slate-600">
          Reach 50K+ active sports fans
        </p>
        <a
          href="mailto:ads@falconforecast.com"
          className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#00a8ff] hover:underline"
        >
          Contact us <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  return (
    <div className={sticky ? 'sticky top-24' : ''}>
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className={`relative rounded-xl border overflow-hidden shadow-sm transition-all duration-500 ${ad.bg} ${ad.border}`}
      >
        {/* Top Header: Badge, Dot Indicators & Dismiss button */}
        <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase">
              {ad.badge}
            </span>
            {isPaused && (
              <span className="flex items-center gap-0.5 text-[8px] font-bold text-amber-500 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.2 rounded">
                <Pause className="w-2 h-2" /> Paused
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Carousel Dot Indicators */}
            <div className="flex items-center gap-1">
              {ADS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-4 bg-[#00a8ff]'
                      : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                  }`}
                  title={`Go to ad ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setDismissed(true)}
              className="text-slate-300 hover:text-slate-500 transition-colors p-0.5"
              title="Dismiss ad"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ad content with transition effect */}
        <div key={ad.id} className="px-3 pb-3 space-y-2.5 animate-fadeIn">
          {/* Brand header */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${ad.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <span className="text-white font-extrabold text-xs font-mono">{ad.initial}</span>
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900 dark:text-white">{ad.brand}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{ad.tagline}</p>
            </div>
          </div>

          {/* Description */}
          <p className={`text-[11px] font-semibold leading-relaxed min-h-[32px] ${ad.textColor}`}>
            {ad.description}
          </p>

          {/* CTA Button */}
          <a
            href={ad.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full py-2 bg-gradient-to-r ${ad.gradient} text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity shadow-sm active:scale-[0.99]`}
          >
            {ad.cta} <ChevronRight className="w-3.5 h-3.5" />
          </a>

          {/* T&C note */}
          <p className="text-[9px] text-slate-400 text-center leading-tight">
            18+ · T&Cs apply · Gamble responsibly
          </p>
        </div>

        {/* Footer: "Advertise with us" */}
        <div className="border-t border-slate-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-800/20 px-3 py-1.5 flex items-center justify-between">
          <p className="text-[9px] text-slate-400">Want to advertise here?</p>
          <a
            href="mailto:ads@falconforecast.com"
            className="text-[9px] font-bold text-[#00a8ff] hover:underline flex items-center gap-0.5"
          >
            Contact us <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
