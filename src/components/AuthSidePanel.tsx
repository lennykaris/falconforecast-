import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export const AuthSidePanel: React.FC = () => {
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSettled(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative h-full flex items-center justify-center p-12 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-25"
          style={{ background: 'radial-gradient(circle, var(--brand) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 -left-24 w-80 h-80 rounded-full blur-3xl opacity-[0.14]"
          style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage: 'radial-gradient(var(--border-strong) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
            maskImage: 'radial-gradient(circle at 50% 40%, black, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 40%, black, transparent 75%)',
          }}
        />
      </div>

      <div className="relative w-full max-w-sm space-y-8">
        <div
          className="rounded-2xl p-5 bet-card space-y-4"
          style={{
            backgroundColor: 'var(--bg-surface)',
            transform: settled ? 'translateX(0)' : 'translateX(70px)',
            opacity: settled ? 1 : 0,
            transition: 'transform 700ms cubic-bezier(0.16,1,0.3,1), opacity 700ms cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
              style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand)' }}
            >
              Champions League &middot; VIP
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              94% Confidence
            </span>
          </div>
          <div>
            <div className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Real Madrid vs Bayern Munich</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Kickoff in 4h &middot; Bernab&eacute;u</div>
          </div>
          <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Tip</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Real Madrid to Qualify</span>
              <span className="text-xs font-bold font-mono" style={{ color: 'var(--brand)' }}>@ 2.10</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
            <span>Falcon Master AI</span>
            <span className="flex items-center gap-1 text-emerald-500">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black font-display leading-snug" style={{ color: 'var(--text-primary)' }}>
            Predictions that actually{' '}
            <span style={{ color: 'var(--brand)' }}>beat the bookmaker</span>.
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Confidence-scored tips, verified tipsters, and live odds comparison — all in one place.
          </p>
        </div>

        <div className="flex items-center gap-7 pt-1">
          <div>
            <div className="text-xl font-black font-mono" style={{ color: 'var(--text-primary)' }}>88%</div>
            <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Win rate</div>
          </div>
          <div>
            <div className="text-xl font-black font-mono" style={{ color: 'var(--text-primary)' }}>1,200+</div>
            <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Subscribers</div>
          </div>
          <div>
            <div className="text-xl font-black font-mono" style={{ color: 'var(--text-primary)' }}>5</div>
            <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Leagues</div>
          </div>
        </div>
      </div>
    </div>
  );
};
