import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchTipsterReviews, submitTipsterReview } from '../lib/reviews';
import type { TipsterReview } from '../types/prediction';

interface TipsterReviewsSectionProps {
  tipsterId: string;
  /** Whether the current user has ever subscribed to this tipster — RLS enforces this
   * server-side regardless (see "Subscribers can review their tipster" in
   * supabase_schema.sql), this just decides whether to show the form at all. */
  canReview: boolean;
}

function StarRow({ rating, size = 'w-3 h-3' }: { rating: number; size?: string }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} className={`${size} ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
      ))}
    </span>
  );
}

export const TipsterReviewsSection: React.FC<TipsterReviewsSectionProps> = ({ tipsterId, canReview }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<TipsterReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTipsterReviews(tipsterId)
      .then(r => { if (!cancelled) setReviews(r); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tipsterId]);

  const myReview = user ? reviews.find(r => r.userId === user.id) : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setSubmitError('');
    setJustSubmitted(false);
    const { error } = await submitTipsterReview(tipsterId, user.id, user.name, rating, comment);
    setSubmitting(false);
    if (error) {
      setSubmitError(error);
      return;
    }
    setJustSubmitted(true);
    fetchTipsterReviews(tipsterId).then(setReviews).catch(() => {});
  };

  return (
    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Subscriber Reviews{reviews.length > 0 ? ` (${reviews.length})` : ''}
      </h4>

      {canReview && (
        <form onSubmit={handleSubmit} className="space-y-2 bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3 border border-slate-200 dark:border-slate-600">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button type="button" key={n} onClick={() => setRating(n)} className="p-0.5" aria-label={`${n} star`}>
                <Star className={`w-5 h-5 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={2}
            placeholder={myReview ? 'Update your review...' : 'Share your experience with this tipster (optional)'}
            className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-600 px-2.5 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0EA5E9]"
          />
          {submitError && <p className="text-[10px] text-rose-500 font-semibold">{submitError}</p>}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="text-[11px] font-bold text-white bg-[#0EA5E9] hover:bg-sky-600 px-3 py-1.5 rounded-lg disabled:opacity-50"
            >
              {submitting ? 'Saving...' : myReview ? 'Update Review' : 'Submit Review'}
            </button>
            {justSubmitted && <span className="text-[10px] text-emerald-600 font-bold">Saved!</span>}
          </div>
        </form>
      )}

      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
        {loading ? (
          <p className="text-[11px] text-slate-400">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-[11px] text-slate-400">No reviews yet — be the first once you've subscribed.</p>
        ) : (
          reviews.map(r => (
            <div key={r.id} className="text-xs border-b border-slate-100 dark:border-slate-700 pb-2 last:border-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-100">{r.userName}</span>
                <StarRow rating={r.rating} />
              </div>
              {r.comment && <p className="text-slate-500 dark:text-slate-400 mt-0.5">{r.comment}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
