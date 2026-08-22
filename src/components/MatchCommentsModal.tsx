import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, ThumbsUp, X, Flame, ShieldAlert } from 'lucide-react';
import type { Prediction } from '../types/prediction';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface CommentItem {
  id: string;
  userId: string;
  userName: string;
  userRole?: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

interface MatchCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: Prediction | null;
}

const timeAgo = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const badgeFor = (role?: string) => {
  if (role === 'admin') return 'ADMIN';
  if (role === 'tipster') return 'TIPSTER';
  return undefined;
};

export const MatchCommentsModal: React.FC<MatchCommentsModalProps> = ({ isOpen, onClose, prediction }) => {
  const { user, isLoggedIn } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!isOpen || !prediction) return;

    let cancelled = false;
    setLoading(true);

    async function load() {
      const { data: commentRows, error } = await supabase
        .from('comments')
        .select('*')
        .eq('prediction_id', prediction!.id)
        .order('created_at', { ascending: false });

      if (error || !commentRows) {
        if (!cancelled) setLoading(false);
        return;
      }

      const commentIds = commentRows.map((c: any) => c.id);
      const { data: likeRows } = commentIds.length
        ? await supabase.from('comment_likes').select('comment_id, user_id').in('comment_id', commentIds)
        : { data: [] as any[] };

      if (cancelled) return;

      const likesByComment = new Map<string, number>();
      const likedByMe = new Set<string>();
      (likeRows || []).forEach((l: any) => {
        likesByComment.set(l.comment_id, (likesByComment.get(l.comment_id) || 0) + 1);
        if (user && l.user_id === user.id) likedByMe.add(l.comment_id);
      });

      setComments(commentRows.map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        userName: c.user_name,
        userRole: c.user_role,
        content: c.content,
        createdAt: c.created_at,
        likes: likesByComment.get(c.id) || 0,
        isLiked: likedByMe.has(c.id),
      })));
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [isOpen, prediction?.id, user?.id]);

  if (!isOpen || !prediction) return null;

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setPosting(true);
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        prediction_id: prediction.id,
        user_id: user.id,
        user_name: user.name,
        user_role: user.role,
        content: newComment.trim(),
      }])
      .select()
      .single();
    setPosting(false);

    if (error || !data) return;

    setComments(prev => [{
      id: data.id,
      userId: data.user_id,
      userName: data.user_name,
      userRole: data.user_role,
      content: data.content,
      createdAt: data.created_at,
      likes: 0,
      isLiked: false,
    }, ...prev]);
    setNewComment('');
  };

  const handleToggleLike = async (comment: CommentItem) => {
    if (!user) return;
    const wasLiked = comment.isLiked;

    setComments(prev => prev.map(c => c.id === comment.id
      ? { ...c, isLiked: !wasLiked, likes: wasLiked ? c.likes - 1 : c.likes + 1 }
      : c
    ));

    if (wasLiked) {
      await supabase.from('comment_likes').delete().eq('comment_id', comment.id).eq('user_id', user.id);
    } else {
      await supabase.from('comment_likes').insert([{ comment_id: comment.id, user_id: user.id }]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#111c30] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white flex flex-col max-h-[85vh]">

        {/* Modal Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-[#00a8ff]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{prediction.homeTeam} vs {prediction.awayTeam}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-[#00a8ff] font-extrabold uppercase">
                  {prediction.league}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Match Discussion & Tactical Community Feed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prediction Context Bar */}
        <div className="bg-sky-500/5 px-4 py-2.5 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
          <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Pick: <strong className="text-[#00a8ff]">{prediction.tip}</strong></span>
          </div>
          <div className="font-bold text-slate-900 dark:text-white">
            Odds: <span className="text-emerald-500">{prediction.odds.toFixed(2)}</span>
          </div>
        </div>

        {/* Comments Feed List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3.5 divide-y divide-slate-100 dark:divide-slate-800/50">
          {loading ? (
            <p className="text-xs text-slate-400 text-center py-6">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              No comments yet. Be the first to share your take on {prediction.homeTeam} vs {prediction.awayTeam}.
            </p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="pt-3 first:pt-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200">
                      {c.userName.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{c.userName}</span>
                    {badgeFor(c.userRole) && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/15 text-[#00a8ff] font-extrabold uppercase tracking-wider">
                        {badgeFor(c.userRole)}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">{timeAgo(c.createdAt)}</span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 pl-9 leading-relaxed">
                  {c.content}
                </p>

                <div className="pl-9 flex items-center gap-3">
                  <button
                    onClick={() => handleToggleLike(c)}
                    disabled={!isLoggedIn}
                    className={`text-[11px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-50 ${
                      c.isLiked ? 'text-[#00a8ff]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                  >
                    <ThumbsUp className={`w-3 h-3 ${c.isLiked ? 'fill-[#00a8ff]' : ''}`} />
                    <span>{c.likes}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Post Comment Input Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800">
          {isLoggedIn ? (
            <form onSubmit={handlePostComment} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Write your match opinion or xG analysis..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#00a8ff]"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || posting}
                className="px-3.5 py-2 bg-[#00a8ff] hover:bg-[#0090e0] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{posting ? 'Posting...' : 'Post'}</span>
              </button>
            </form>
          ) : (
            <div className="text-center py-1 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>Please <strong>Login</strong> to post match comments and join the discussion.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
