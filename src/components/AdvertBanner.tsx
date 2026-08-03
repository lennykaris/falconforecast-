import React, { useState } from 'react';
import { X, Megaphone, ExternalLink, ChevronRight } from 'lucide-react';

interface AdvertBannerProps {
  sticky?: boolean;
}

// Sample ad data — in production these would come from your ads API
const ADS = [
  {
    id: 1,
    brand: 'BetKing',
    tagline: 'Africa\'s #1 Sportsbook',
    cta: 'Get 200% Bonus',
    href: '#',
    badge: 'SPONSORED',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-500',
    textColor: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800/50',
    description: 'Deposit KSh 500 and get KSh 1,000 free on your first bet.',
  },
];

export const AdvertBanner: React.FC<AdvertBannerProps> = ({ sticky = true }) => {
  const [dismissed, setDismissed] = useState(false);
  const ad = ADS[0];

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
        className={`relative rounded-xl border overflow-hidden shadow-sm ${ad.bg} ${ad.border}`}
      >
        {/* Sponsored label */}
        <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
          <span className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase">
            {ad.badge}
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-300 hover:text-slate-500 transition-colors"
            title="Dismiss ad"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Ad content */}
        <div className="px-3 pb-3 space-y-2.5">
          {/* Brand header */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${ad.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <span className="text-white font-extrabold text-xs">B</span>
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900 dark:text-white">{ad.brand}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{ad.tagline}</p>
            </div>
          </div>

          {/* Description */}
          <p className={`text-[11px] font-semibold leading-relaxed ${ad.textColor}`}>
            {ad.description}
          </p>

          {/* CTA Button */}
          <a
            href={ad.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full py-2 bg-gradient-to-r ${ad.gradient} text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity shadow-sm`}
          >
            {ad.cta} <ChevronRight className="w-3.5 h-3.5" />
          </a>

          {/* T&C note */}
          <p className="text-[9px] text-slate-400 text-center leading-tight">
            18+ · T&Cs apply · Gamble responsibly
          </p>
        </div>

        {/* "Advertise with us" footer */}
        <div className="border-t border-amber-200/60 dark:border-amber-800/30 bg-white/50 dark:bg-slate-800/20 px-3 py-1.5 flex items-center justify-between">
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
