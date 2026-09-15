import React, { useState } from 'react';
import { X, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePredictions } from '../context/PredictionsContext';
import { MARKET_OPTIONS } from '../data/predictions';
import type { Match } from '../types/prediction';

interface PostOddsModalProps {
  match: Match | null;
  onClose: () => void;
}

/** Lets a tipster post odds/a tip directly on a real upcoming fixture from their dashboard. */
export const PostOddsModal: React.FC<PostOddsModalProps> = ({ match, onClose }) => {
  const { user, isAdmin } = useAuth();
  const { addPrediction } = usePredictions();

  const [tip, setTip] = useState(MARKET_OPTIONS[0]);
  const [odds, setOdds] = useState('1.85');
  const [confidence, setConfidence] = useState(80);
  const [isFree, setIsFree] = useState(true);
  const [analysis, setAnalysis] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!match) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tip) return;

    setSubmitting(true);
    setSubmitError(null);

    const { error } = await addPrediction({
      matchId: match.id,
      league: match.league,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      kickoff: match.kickoff,
      homeLogo: match.homeLogo,
      awayLogo: match.awayLogo,
      tip,
      odds: parseFloat(odds) || 0,
      confidence,
      tier: isFree ? 'free' : 'vip',
      analysis: analysis || undefined,
      // Admin posts are platform tips with no owner (tipster_id null) — an admin's own id
      // here made the pick permanently unsubscribable, since the RLS subscription-EXISTS
      // check could then never match any tipster_subscriptions row.
      tipsterId: isAdmin ? undefined : user?.id,
      tipsterName: isAdmin ? 'Falcon Forecast Platform' : user?.name,
      isPlatformTip: isAdmin,
      status: 'pending',
    });

    setSubmitting(false);
    if (error) {
      setSubmitError(error.message);
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-sm font-black text-slate-900">Post Odds</h3>
            <p className="text-[11px] text-slate-400">{match.league} · {match.homeTeam} vs {match.awayTeam}</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Market</label>
            <select
              required
              value={tip}
              onChange={e => setTip(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0EA5E9]"
            >
              {MARKET_OPTIONS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400">
              Fixed markets only — this is what lets the platform automatically check the
              result and settle your tip once the match finishes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Odds</label>
              <input
                type="number"
                step="0.01"
                min="1.01"
                required
                value={odds}
                onChange={e => setOdds(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0EA5E9]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex justify-between">
                <span>Confidence</span>
                <span className="text-[#0EA5E9] font-mono">{confidence}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={confidence}
                onChange={e => setConfidence(Number(e.target.value))}
                className="w-full accent-[#0EA5E9] mt-3"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Tip Access</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input type="radio" checked={isFree} onChange={() => setIsFree(true)} className="accent-[#0EA5E9]" />
                Free Tip
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input type="radio" checked={!isFree} onChange={() => setIsFree(false)} className="accent-[#0EA5E9]" />
                Premium (Subscribers Only)
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Rationale (optional)</label>
            <textarea
              rows={3}
              value={analysis}
              onChange={e => setAnalysis(e.target.value)}
              placeholder="Why this pick..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0EA5E9]"
            />
          </div>

          {submitError && <p className="text-xs font-semibold text-rose-500">{submitError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#0EA5E9] hover:bg-sky-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>{submitting ? 'Publishing...' : 'Publish Odds'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
