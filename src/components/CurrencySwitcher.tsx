import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Coins, ChevronDown } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { CURRENCY_OPTIONS } from '../lib/currency';

/** Lets a visitor override the auto-detected display currency. Purely cosmetic — see
 * lib/currency.ts's top comment: every real M-Pesa charge stays in KES regardless of what's
 * selected here. */
export const CurrencySwitcher: React.FC = () => {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!ref.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const current = CURRENCY_OPTIONS.find(c => c.code === currency) || CURRENCY_OPTIONS[0];
  const toggleMenu = () => {
    if (!open) {
      const bounds = buttonRef.current?.getBoundingClientRect();
      if (bounds) {
        const menuHeight = 320;
        const top = bounds.bottom + menuHeight + 6 <= window.innerHeight
          ? bounds.bottom + 6
          : Math.max(8, bounds.top - menuHeight - 6);
        setMenuPosition({
          top,
          right: Math.max(8, window.innerWidth - bounds.right),
        });
      }
    }
    setOpen(value => !value);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Display currency (M-Pesa charges are always in KSh)"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#00a8ff] transition-all text-xs font-bold shadow-xs whitespace-nowrap"
      >
        <Coins className="w-3.5 h-3.5 text-[#00a8ff] flex-shrink-0" />
        <span className="hidden xl:inline">{current.code}</span>
        <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && menuPosition && createPortal(
        <div
          ref={menuRef}
          role="menu"
          style={{ top: menuPosition.top, right: menuPosition.right }}
          className="fixed w-56 bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-[100]"
        >
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
                role="menuitemradio"
                aria-checked={opt.code === currency}
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
        </div>,
        document.body
      )}
    </div>
  );
};
