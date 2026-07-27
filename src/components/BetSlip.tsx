import React from 'react';
import { ShoppingBag, Trash2, CheckCircle2 } from 'lucide-react';
import { useBetSlip } from '../context/BetSlipContext';

export const BetSlip: React.FC = () => {
  const {
    selections,
    stake,
    setStake,
    removeSelection,
    clearSlip,
    totalOdds,
    potentialPayout,
    placedSuccess,
    placeBet,
  } = useBetSlip();

  return (
    <div className="bg-white dark:bg-[#111c30] border border-sky-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-[#00a8ff] text-white px-4 py-3 flex items-center justify-between">
        <h3 className="font-bold text-sm tracking-wide">Bet Slip</h3>
        <span className="w-6 h-6 rounded-full bg-white/20 text-white font-bold text-xs flex items-center justify-center">
          {selections.length}
        </span>
      </div>

      <div className="p-4 min-h-[260px] flex flex-col justify-between">
        {placedSuccess ? (
          <div className="py-8 text-center animate-fadein space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Bet Placed Successfully!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Good luck! You can track live results on the home screen.
            </p>
          </div>
        ) : selections.length === 0 ? (
          /* Empty State */
          <div className="py-10 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-sky-50 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700 flex items-center justify-center text-sky-300 dark:text-slate-400">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] leading-relaxed">
              Your bet slip is empty.<br />Click on odds to add selections.
            </p>
          </div>
        ) : (
          /* Active Selections State */
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-sky-100 dark:border-slate-800">
              <span>Selections ({selections.length})</span>
              <button
                onClick={clearSlip}
                className="text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {selections.map(sel => (
                <div
                  key={sel.id}
                  className="p-3 bg-sky-50 dark:bg-slate-800/60 rounded-lg border border-sky-200 dark:border-slate-700/60 flex items-start justify-between gap-2"
                >
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-400 font-medium">{sel.matchTitle}</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Pick: {sel.selection}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#00a8ff] bg-blue-50 dark:bg-sky-950/80 px-2 py-0.5 rounded border border-blue-200 dark:border-sky-800">
                      {sel.odds.toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeSelection(sel.id)}
                      className="text-slate-400 hover:text-red-500 text-xs p-1"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Stake and Payout Summary */}
            <div className="pt-3 border-t border-sky-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Stake ($):</span>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={stake}
                  onChange={e => setStake(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-24 text-right input-field font-bold text-xs py-1 px-2"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Total Odds:</span>
                <span className="text-slate-900 dark:text-white font-mono">{totalOdds.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                <span>Est. Payout:</span>
                <span className="font-mono">${potentialPayout.toFixed(2)}</span>
              </div>

              <button
                onClick={placeBet}
                className="w-full py-2.5 bg-[#00a8ff] hover:bg-[#0090e0] text-white font-bold text-xs rounded-lg transition-all shadow-md shadow-sky-500/20 active:scale-[0.99]"
              >
                Place Bet (${stake})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
