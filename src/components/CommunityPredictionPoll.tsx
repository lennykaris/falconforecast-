import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

type VoteSelection = 'home' | 'draw' | 'away';

interface CommunityPredictionPollProps {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  matchStatus: string;
}

const options: VoteSelection[] = ['home', 'draw', 'away'];

export const CommunityPredictionPoll: React.FC<CommunityPredictionPollProps> = ({
  matchId,
  homeTeam,
  awayTeam,
  matchStatus,
}) => {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Record<VoteSelection, number>>({ home: 0, draw: 0, away: 0 });
  const [mySelection, setMySelection] = useState<VoteSelection | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const totalVotes = counts.home + counts.draw + counts.away;
  const closed = ['IN_PLAY', 'PAUSED', 'FINISHED', 'POSTPONED', 'CANCELLED'].includes(matchStatus);

  useEffect(() => {
    let active = true;

    const loadVotes = async () => {
      const { data, error: countError } = await supabase.rpc('community_prediction_counts', {
        p_match_id: matchId,
      });

      if (!active) return;
      if (countError) {
        console.error('Failed to load community prediction counts:', countError.message);
        setError('Community predictions are unavailable right now.');
        setLoading(false);
        return;
      }

      const nextCounts: Record<VoteSelection, number> = { home: 0, draw: 0, away: 0 };
      for (const row of data || []) {
        if (options.includes(row.selection as VoteSelection)) {
          nextCounts[row.selection as VoteSelection] = Number(row.vote_count);
        }
      }
      setCounts(nextCounts);

      if (user) {
        const { data: ownVote, error: ownVoteError } = await supabase
          .from('community_prediction_votes')
          .select('selection')
          .eq('match_id', matchId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (!active) return;
        if (ownVoteError) {
          console.error('Failed to load your community prediction:', ownVoteError.message);
        }
        const ownSelection = ownVote?.selection as VoteSelection | undefined;
        setMySelection(ownSelection && options.includes(ownSelection) ? ownSelection : null);
      } else {
        setMySelection(null);
      }

      setError('');
      setLoading(false);
    };

    setLoading(true);
    loadVotes();
    const refresh = window.setInterval(loadVotes, 30000);
    return () => {
      active = false;
      window.clearInterval(refresh);
    };
  }, [matchId, user?.id]);

  const submitVote = async (selection: VoteSelection) => {
    if (!user || closed || submitting) return;
    setSubmitting(true);
    setError('');

    const { error: saveError } = await supabase
      .from('community_prediction_votes')
      .upsert({
        match_id: matchId,
        user_id: user.id,
        selection,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'match_id,user_id' });

    if (saveError) {
      console.error('Failed to save community prediction:', saveError.message);
      setError('Your prediction could not be saved. Please try again.');
    } else {
      setMySelection(selection);
      const { data, error: countError } = await supabase.rpc('community_prediction_counts', {
        p_match_id: matchId,
      });
      if (!countError) {
        const nextCounts: Record<VoteSelection, number> = { home: 0, draw: 0, away: 0 };
        for (const row of data || []) {
          if (options.includes(row.selection as VoteSelection)) {
            nextCounts[row.selection as VoteSelection] = Number(row.vote_count);
          }
        }
        setCounts(nextCounts);
      }
    }

    setSubmitting(false);
  };

  const labels: Record<VoteSelection, string> = {
    home: homeTeam,
    draw: 'Draw',
    away: awayTeam,
  };

  return (
    <section className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800" aria-labelledby="community-poll-title">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h4 id="community-poll-title" className="text-xs font-bold text-slate-900 dark:text-white">Community prediction</h4>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">How do fans think this match will end?</p>
        </div>
        <span className="flex-shrink-0 text-[10px] font-mono text-slate-500 dark:text-slate-400">
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {options.map(selection => {
          const percentage = totalVotes ? Math.round((counts[selection] / totalVotes) * 100) : 0;
          return (
            <button
              key={selection}
              type="button"
              disabled={!user || closed || loading || submitting || !!error}
              onClick={() => submitVote(selection)}
              aria-pressed={mySelection === selection}
              className={`min-h-12 rounded-md border px-2 py-2 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
                mySelection === selection
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40'
                  : 'border-slate-200 bg-white hover:border-sky-400 dark:border-slate-700 dark:bg-slate-900/40'
              }`}
            >
              <span className="block truncate text-[11px] font-semibold text-slate-800 dark:text-slate-100">{labels[selection]}</span>
              <span className="mt-0.5 block font-mono text-[10px] text-slate-500 dark:text-slate-400">
                {loading ? '...' : `${percentage}%`}
              </span>
              <span className="mt-1 block h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <span className="block h-full bg-sky-500 transition-[width]" style={{ width: `${percentage}%` }} />
              </span>
            </button>
          );
        })}
      </div>

      {error ? (
        <p role="status" className="text-[11px] text-rose-600 dark:text-rose-400">{error}</p>
      ) : closed ? (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">Voting is closed for this match.</p>
      ) : user ? (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {submitting ? 'Saving your prediction...' : 'Select a result to vote. You can change your vote before kickoff.'}
        </p>
      ) : (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          <Link to="/login" className="font-semibold text-sky-700 underline dark:text-sky-400">Sign in</Link> to add your prediction.
        </p>
      )}
    </section>
  );
};