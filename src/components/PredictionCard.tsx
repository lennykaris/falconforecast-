import React, { useState } from 'react';
import type { Prediction } from '../types/prediction';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Share2 } from 'lucide-react';
import { MatchCommentsModal } from './MatchCommentsModal';
import { ShareTipModal } from './ShareTipModal';

interface PredictionCardProps {
  prediction: Prediction;
  onUnlockClick?: () => void;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, onUnlockClick }) => {
  const { isVip } = useAuth();
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const isLocked = prediction.tier === 'vip' && !isVip;

  const formatKickoff = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }).format(new Date(dateString));
    } catch { return dateString; }
  };

  return (
    <>
      <div
        className="relative rounded-2xl bet-card overflow-hidden flex flex-col"
        style={prediction.tier === 'vip' ? { borderColor: 'rgba(56,189,248,0.25)' } : {}}
      >
        {/* Card header strip */}
        <div
          className="px-4 py-3 flex items-center justify-between flex-shrink-0 bet-header"
        >
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-bold uppercase tracking-widest font-display"
              style={{ color: 'var(--text-primary)' }}
            >
              {prediction.league}
            </span>
            {prediction.category && (
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                · {prediction.category}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-mono"
              style={{ color: 'var(--text-muted)' }}
            >
              {formatKickoff(prediction.kickoff)}
            </span>
            <span
              className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border"
              style={
                prediction.tier === 'vip'
                  ? { color: 'var(--brand)', borderColor: 'var(--brand)', backgroundColor: 'rgba(56,189,248,0.08)' }
                  : { color: 'var(--text-muted)', borderColor: 'var(--border)' }
              }
            >
              {prediction.tier === 'vip' ? 'VIP' : 'Free'}
            </span>
          </div>
        </div>

        {/* Match body */}
        <div className="p-5 flex flex-col flex-1 space-y-4">

          {/* Teams */}
          <div className="grid grid-cols-11 items-center">
            <div className="col-span-5">
              <p className="text-xs font-black font-display leading-tight" style={{ color: 'var(--text-primary)' }}>
                {prediction.homeTeam}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Home</p>
            </div>
            <div className="col-span-1 text-center text-[10px] font-bold font-mono" style={{ color: 'var(--text-muted)' }}>
              VS
            </div>
            <div className="col-span-5 text-right">
              <p className="text-xs font-black font-display leading-tight" style={{ color: 'var(--text-primary)' }}>
                {prediction.awayTeam}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Away</p>
            </div>
          </div>

          {/* Pick + Odds */}
          <div
            className="rounded-xl px-4 py-3.5 flex items-center justify-between bet-odds-box"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                Selection
              </p>
              <p className="text-sm font-bold font-display" style={{ color: 'var(--brand)' }}>
                {prediction.tip}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                Odds
              </p>
              <p
                className="text-base font-black font-mono px-2.5 py-0.5 rounded border"
                style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              >
                @{prediction.odds.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Win Probability bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span style={{ color: 'var(--text-secondary)' }}>Win Probability</span>
              <span className="font-mono font-bold" style={{ color: 'var(--brand)' }}>
                {prediction.confidence}%
              </span>
            </div>
            <div
              className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--bg-muted)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${prediction.confidence}%`,
                  background: 'linear-gradient(to right, var(--brand-dark), var(--brand))',
                }}
              />
            </div>
          </div>

          {/* Analysis toggle & Phase 4 Community Action Bar */}
          <div className="border-t pt-3 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            {prediction.analysis && !isLocked ? (
              <button
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="text-[11px] font-semibold transition-colors"
                style={{ color: showAnalysis ? 'var(--brand)' : 'var(--text-muted)' }}
              >
                {showAnalysis ? 'Hide' : 'Show'} match rationale
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCommentsOpen(true)}
                className="px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all flex items-center gap-1 hover:border-[#00a8ff]"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                title="Match Discussion Thread"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#00a8ff]" />
                <span>Discuss</span>
              </button>

              <button
                onClick={() => setIsShareOpen(true)}
                className="p-1 rounded-lg border text-[11px] font-bold transition-all hover:border-[#00a8ff]"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                title="Share Pick Card"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {showAnalysis && prediction.analysis && !isLocked && (
            <p
              className="mt-1 text-xs leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              {prediction.analysis}
            </p>
          )}
        </div>

        {/* LOCKED OVERLAY */}
        {isLocked && (
          <div
            className="absolute inset-0 top-10 flex flex-col items-center justify-center text-center p-8 space-y-4 backdrop-blur-sm"
            style={{ backgroundColor: 'var(--bg-surface)', opacity: 0.97 }}
          >
            <div
              className="w-10 h-10 rounded-xl border flex items-center justify-center text-sm font-bold font-mono"
              style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}
            >
              VIP
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                VIP Selection
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Estimated{' '}
                <span style={{ color: 'var(--brand)' }} className="font-bold font-mono">
                  {prediction.confidence}%
                </span>{' '}
                win probability
              </p>
            </div>

            <button
              onClick={onUnlockClick}
              className="px-5 py-2.5 text-xs font-bold text-slate-950 rounded-lg transition-all hover:brightness-110"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              Unlock VIP
            </button>
          </div>
        )}
      </div>

      {/* Community Drawers */}
      <MatchCommentsModal
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        prediction={prediction}
      />

      <ShareTipModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        prediction={prediction}
      />
    </>
  );
};
