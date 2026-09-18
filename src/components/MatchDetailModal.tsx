import React, { useEffect, useState } from 'react';
import { X, Loader2, ArrowRightLeft, MapPin, ChevronDown } from 'lucide-react';
import type { MatchDetail, MatchIncident, RecentMatchResult } from '../types/prediction';
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

function FormBadges({ form }: { form: string[] }) {
  if (form.length === 0) return <span className="text-[10px] text-slate-400">No recent matches</span>;
  return (
    <div className="flex items-center gap-1">
      {form.map((result, i) => (
        <span
          key={i}
          // Draws used to share bg-slate-400 — at 16px it reads as a duller green rather than
          // a genuinely distinct color, and didn't match the amber used for draws in the
          // standings table elsewhere on the site. Amber now used consistently for D everywhere.
          className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white ${
            result === 'W' ? 'bg-emerald-500' : result === 'L' ? 'bg-red-500' : 'bg-amber-500'
          }`}
        >
          {result}
        </span>
      ))}
    </div>
  );
}

/** The actual previous matches behind a team's W/D/L form pills — opponent, score, competition,
 * date — so "recent form" is more than a bare letter with no way to see what really happened.
 * Collapsed by default (this modal is already fairly dense); toggled per side. */
function RecentMatchesList({ matches }: { matches: RecentMatchResult[] }) {
  if (matches.length === 0) return <p className="text-[10px] text-slate-400 py-2">No recent matches found.</p>;
  return (
    <div className="space-y-1.5 pt-1">
      {matches.map((m) => (
        <div key={m.id} className="flex items-center gap-2 text-[11px] py-1">
          <span
            className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-black text-white ${
              m.result === 'W' ? 'bg-emerald-500' : m.result === 'L' ? 'bg-red-500' : 'bg-amber-500'
            }`}
          >
            {m.result}
          </span>
          {m.opponentLogo && <img src={m.opponentLogo} alt="" className="w-4 h-4 object-contain flex-shrink-0" />}
          <span className="flex-1 min-w-0 truncate text-slate-700 dark:text-slate-200">
            {m.wasHome ? 'vs' : '@'} {m.opponent}
          </span>
          <span className="font-mono font-bold text-slate-900 dark:text-white flex-shrink-0">
            {m.teamScore}-{m.opponentScore}
          </span>
          <span className="text-slate-400 dark:text-slate-500 flex-shrink-0 w-14 text-right truncate" title={m.competition}>
            {m.kickoff ? new Date(m.kickoff).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}
          </span>
        </div>
      ))}
    </div>
  );
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
  const [expandedSide, setExpandedSide] = useState<'home' | 'away' | null>(null);

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
    setExpandedSide(null);
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

            {/* Head-to-head & form — matters most before a match has even kicked off (no live
                stats exist yet), but left visible regardless of status since it's still
                useful context. */}
            {(match.h2h || match.homeForm.length > 0 || match.awayForm.length > 0) && (
              <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Head-to-Head &amp; Form
                </h4>

                {match.h2h && match.h2h.totalMeetings > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                      <span>{match.h2h.homeWins} wins</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        {match.h2h.totalMeetings} meetings · {match.h2h.draws} draws
                      </span>
                      <span>{match.h2h.awayWins} wins</span>
                    </div>
                    <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <div className="bg-[#00a8ff]" style={{ width: `${(match.h2h.homeWins / match.h2h.totalMeetings) * 100}%` }} />
                      <div className="bg-slate-300 dark:bg-slate-600" style={{ width: `${(match.h2h.draws / match.h2h.totalMeetings) * 100}%` }} />
                      <div className="bg-slate-500" style={{ width: `${(match.h2h.awayWins / match.h2h.totalMeetings) * 100}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between gap-4 pt-1">
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => setExpandedSide(expandedSide === 'home' ? null : 'home')}
                      disabled={match.homeForm.length === 0}
                      className="flex flex-col items-start gap-1 w-full disabled:cursor-default group"
                    >
                      <span className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                        {match.homeTeam} — last 5
                        {match.homeForm.length > 0 && (
                          <ChevronDown className={`w-3 h-3 transition-transform ${expandedSide === 'home' ? 'rotate-180' : ''} group-hover:text-[#00a8ff]`} />
                        )}
                      </span>
                      <FormBadges form={match.homeForm} />
                    </button>
                    {expandedSide === 'home' && <RecentMatchesList matches={match.homeRecentMatches} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => setExpandedSide(expandedSide === 'away' ? null : 'away')}
                      disabled={match.awayForm.length === 0}
                      className="flex flex-col items-end gap-1 w-full disabled:cursor-default group"
                    >
                      <span className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                        {match.awayForm.length > 0 && (
                          <ChevronDown className={`w-3 h-3 transition-transform ${expandedSide === 'away' ? 'rotate-180' : ''} group-hover:text-[#00a8ff]`} />
                        )}
                        {match.awayTeam} — last 5
                      </span>
                      <FormBadges form={match.awayForm} />
                    </button>
                    {expandedSide === 'away' && <RecentMatchesList matches={match.awayRecentMatches} />}
                  </div>
                </div>
              </div>
            )}

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

            {match.stats.length === 0 && timeline.length === 0 && !match.h2h && match.homeForm.length === 0 && match.awayForm.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-6">No stats available for this match yet.</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
