import { supabase } from './supabase';
import type { TipsterReview } from '../types/prediction';

const fromRow = (row: any): TipsterReview => ({
  id: row.id,
  tipsterId: row.tipster_id,
  userId: row.user_id,
  userName: row.user_name || 'Subscriber',
  rating: row.rating,
  comment: row.comment || undefined,
  createdAt: row.created_at,
});

/** All reviews for one tipster, most recent first. RLS lets anyone read these (public, like
 * comments) — the restriction is on who can write one, not who can see them. */
export async function fetchTipsterReviews(tipsterId: string): Promise<TipsterReview[]> {
  const { data, error } = await supabase
    .from('tipster_reviews')
    .select('*')
    .eq('tipster_id', tipsterId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(fromRow);
}

/** Submits or updates the current user's review for a tipster (one per subscriber — a second
 * submission replaces the first rather than adding a duplicate). RLS's "Subscribers can
 * review their tipster" policy independently enforces that the poster has actually
 * subscribed — this call fails for anyone who hasn't, regardless of what the UI allows. */
export async function submitTipsterReview(
  tipsterId: string,
  userId: string,
  userName: string,
  rating: number,
  comment: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('tipster_reviews').upsert(
    [{ tipster_id: tipsterId, user_id: userId, user_name: userName, rating, comment: comment || null, updated_at: new Date().toISOString() }],
    { onConflict: 'tipster_id,user_id' }
  );
  if (error) return { error: error.message };
  return { error: null };
}
