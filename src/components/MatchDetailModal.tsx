import React, { useEffect, useState } from 'react';
import { X, Loader2, ArrowRightLeft, MapPin } from 'lucide-react';
import type { MatchDetail, MatchIncident } from '../types/prediction';
import { fetchMatchDetail } from '../lib/matches';

interface MatchDetailModalProps {
  matchId: string | null;
  onClose: () => void;
}

// SportSRC recommends polling every 15-30s while a match is live — 20s splits the difference.
const POLL_MS = 20000;

function incidentLabel(inc: MatchIncident): string {
  switch (inc.type) {
    case 'goal':
      return `${inc.player || 'Goal'}${inc.assist ? ` (assist: ${inc.assist})` : ''}`;
    case 'card':
      return `${inc.cardType === 'red' ? 'Red card' : 'Yellow card'} — ${inc.player}`;
    case 'substitution':
      return `${inc.playerIn} on for ${inc.playerOut}`;
    default:
      return inc.text || inc.type;
  }
}

function IncidentIcon({ incident }: { incident: MatchIncident }) {
  if (incident.type === 'goal') return <span className="w-4 text-center flex-shrink-0">⚽</span>;
  if (incident.type === 'card') {
    return (
      <span
        className={`w-2.5 h-3.5 flex-shrink-0 rounded-sm ${incident.cardType === 'red' ? 'bg-rose-600' : 'bg-amber-400'}`}
      />
    );
  }
  if (incident.type === 'substitution') return <ArrowRightLeft className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />;
  return null;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ matchId, onClose }) => {
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;
    let currentStatus: string | undefined;

    const load = async () => {
      try {
        const data = await fetchMatchDetail(matchId);
        if (cancelled) return;
        setMatch(data);
        currentStatus = data.status;
        setError('');
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load match');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    setLoading(true);
    setMatch(null);
    setError('');
    load();

    const timer = setInterval(() => {
      if (currentStatus === 'IN_PLAY' || currentStatus === 'PAUSED') load();
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [matchId]);

  if (!matchId) return null;

  const isLive = match?.status === 'IN_PLAY' || match?.status === 'PAUSED';
  const timeline = match?.incidents.filter((i) => i.type !== 'period') || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-[#0f1827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {loading && !match ? (
          <div className="py-24 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#00a8ff]" />
          </div>
        ) : error && !match ? (
          <div className="py-24 text-center text-sm text-rose-500 px-6">{error}</div>
        ) : match ? (
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-1 pt-1">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                {match.league}
                {match.round ? ` • ${match.round}` : ''}
              </p>
              <div className="flex items-center justify-center gap-4 sm:gap-6 pt-2">
                <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                  {match.homeLogo && <img src={match.homeLogo} alt="" className="w-10 h-10 object-contain" />}
                  <span className="text-sm font-bold text-slate-900 dark:text-white text-center break-words">{match.homeTeam}</span>
                </div>
                <div className="flex flex-col items-center gap-1 px-2 flex-shrink-0">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {match.homeScore ?? '-'} - {match.awayScore ?? '-'}
                  </span>
                  {isLive ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {match.liveMinute != null ? `${match.liveMinute}'` : match.statusDetail}
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {match.statusDetail || match.status}
                    </span>
                  )}
                </div>
                <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                  {match.awayLogo && <img src={match.awayLogo} alt="" className="w-10 h-10 object-contain" />}
                  <span className="text-sm font-bold text-slate-900 dark:text-white text-center break-words">{match.awayTeam}</span>
                </div>
              </div>
              {(match.venue || match.referee) && (
                <p className="flex items-center justify-center gap-1 text-[11px] text-slate-400 pt-1">
                  <MapPin className="w-3 h-3" /> {[match.venue, match.referee].filter(Boolean).join(' • ')}
                </p>
              )}
            </div>

            {/* Live stats */}
            {match.stats.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Match Stats</h4>
                <div className="space-y-2.5">
                  {match.stats.map((stat) => {
                    const total = (stat.homeValue ?? 0) + (stat.awayValue ?? 0);
                    const homePct = total > 0 ? ((stat.homeValue ?? 0) / total) * 100 : 50;
                    return (
                      <div key={stat.key} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                          <span>{stat.home}</span>
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{stat.label}</span>
                          <span>{stat.away}</span>
                        </div>
                        <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <div className="bg-[#00a8ff]" style={{ width: `${homePct}%` }} />
                          <div className="bg-slate-300 dark:bg-slate-600" style={{ width: `${100 - homePct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Timeline */}
            {timeline.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Timeline</h4>
                <div className="space-y-2">
                  {timeline.map((inc, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs">
                      <span className="w-10 flex-shrink-0 font-mono font-bold text-slate-400">{inc.minuteDisplay}</span>
                      <IncidentIcon incident={inc} />
                      <span className="text-slate-700 dark:text-slate-200 truncate flex-1">{incidentLabel(inc)}</span>
                      <span className="text-[10px] font-bold uppercase text-slate-400 w-4 text-right flex-shrink-0">
                        {inc.team === 'home' ? 'H' : inc.team === 'away' ? 'A' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {match.stats.length === 0 && timeline.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-6">No live stats available for this match yet.</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
