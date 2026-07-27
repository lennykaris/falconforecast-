import React from 'react';
import { Lock } from 'lucide-react';

interface FeaturedTipsterProps {
  onUnlock?: () => void;
}

export const FeaturedTipster: React.FC<FeaturedTipsterProps> = ({ onUnlock }) => {
  return (
    <div className="bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Featured Tipster
        </h4>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-sky-950 text-[#00a8ff] border border-blue-200 dark:border-sky-800">
          Pro
        </span>
      </div>

      <div className="flex items-center gap-3">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
          alt="Alex Mercer"
          className="w-10 h-10 rounded-full object-cover border-2 border-[#00a8ff]"
        />
        <div>
          <h5 className="text-xs font-bold text-slate-900 dark:text-white">Alex Mercer</h5>
          <p className="text-[11px] font-bold text-emerald-500">+14.5% Yield</p>
        </div>
      </div>

      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60 space-y-1">
        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
          ARS vs TOT: Arsenal to win (1X2)
        </p>
        <p className="text-[10px] text-slate-400">
          High confidence selection based on home form & defensive setup.
        </p>
      </div>

      <button
        onClick={onUnlock}
        className="w-full py-2 bg-[#00a8ff] hover:bg-[#0090e0] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
      >
        <Lock className="w-3.5 h-3.5" /> Unlock Tip
      </button>
    </div>
  );
};
