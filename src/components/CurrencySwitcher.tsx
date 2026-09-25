import React, { useState, useRef, useEffect } from 'react';
import { Coins, ChevronDown } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { CURRENCY_OPTIONS } from '../lib/currency';

/** Lets a visitor override the auto-detected display currency. Purely cosmetic — see
 * lib/currency.ts's top comment: every real M-Pesa charge stays in KES regardless of what's
 * selected here. */
export const CurrencySwitcher: React.FC = () => {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const current = CURRENCY_OPTIONS.find(c => c.code === currency) || CURRENCY_OPTIONS[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        title="Display currency (M-Pesa charges are always in KSh)"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#00a8ff] transition-all text-xs font-bold shadow-xs whitespace-nowrap"
      >
        <Coins className="w-3.5 h-3.5 text-[#00a8ff] flex-shrink-0" />
        <span className="hidden xl:inline">{current.code}</span>
        <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 leading-relaxed">
              Display only — M-Pesa payments always charge in KSh.
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {CURRENCY_OPTIONS.map(opt => (
              <button
                key={opt.code}
                onClick={() => { setCurrency(opt.code); setOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                  opt.code === currency
                    ? 'bg-sky-50 dark:bg-sky-950/40 text-[#00a8ff] font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{opt.label}</span>
                <span className="font-mono text-slate-400">{opt.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
