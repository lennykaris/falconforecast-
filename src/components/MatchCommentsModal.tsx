import React, { useState } from 'react';
import { MessageSquare, Send, ThumbsUp, X, User as UserIcon, Flame, ShieldAlert } from 'lucide-react';
import type { Prediction } from '../types/prediction';
import { useAuth } from '../context/AuthContext';

interface CommentItem {
  id: string;
  userName: string;
  userRole?: string;
  userBadge?: string;
  content: string;
  likes: number;
  timeAgo: string;
  isLiked?: boolean;
}

interface MatchCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: Prediction | null;
}

export const MatchCommentsModal: React.FC<MatchCommentsModalProps> = ({ isOpen, onClose, prediction }) => {
  const { user, isLoggedIn } = useAuth();
  const [newComment, setNewComment] = useState('');
  
  const [comments, setComments] = useState<Record<string, CommentItem[]>>({
    'pred-1': [
      {
        id: 'c1',
        userName: 'David tactical',
        userRole: 'tipster',
        userBadge: 'PRO TIPSTER',
        content: 'Arsenal have won 4 of their last 5 derby matches at home. Saka and Odegaard xG over the last 3 matches is at 2.45!',
        likes: 14,
        timeAgo: '15m ago',
      },
      {
        id: 'c2',
        userName: 'Marco B.',
        userRole: 'user',
        content: 'Agreed! Spurs missing 2 key central defenders due to suspensions. Over 2.5 goals is practically guaranteed.',
        likes: 8,
        timeAgo: '5m ago',
      },
    ],
    'pred-2': [
      {
        id: 'c3',
        userName: 'ElClasicoExpert',
        userRole: 'tipster',
        userBadge: 'VERIFIED',
        content: 'Real Madrid back line is vulnerable on quick counter attacks. Vinicius Jr is in peak form though!',
        likes: 19,
        timeAgo: '1h ago',
      },
    ],
  });

  if (!isOpen || !prediction) return null;

  const currentComments = comments[prediction.id] || [
    {
      id: `initial-${prediction.id}`,
      userName: 'Tactical Bot',
      userBadge: 'ANALYSIS',
      content: `Discussion thread for ${prediction.homeTeam} vs ${prediction.awayTeam}. Post your match insights and xG breakdown below!`,
      likes: 3,
      timeAgo: 'Just now',
    },
  ];

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const created: CommentItem = {
      id: `comment-${Date.now()}`,
      userName: user?.name || 'Anonymous Fan',
      userRole: user?.role || 'user',
      userBadge: user?.role === 'admin' ? 'ADMIN' : user?.role === 'tipster' ? 'TIPSTER' : undefined,
      content: newComment.trim(),
      likes: 1,
      timeAgo: 'Just now',
    };

    setComments(prev => ({
      ...prev,
      [prediction.id]: [created, ...(prev[prediction.id] || [])],
    }));

    setNewComment('');
  };

  const handleToggleLike = (commentId: string) => {
    setComments(prev => {
      const predId = prediction.id;
      const list = prev[predId] || [];
      const updated = list.map(c => {
        if (c.id === commentId) {
          const isLiked = !c.isLiked;
          return {
            ...c,
            isLiked,
            likes: isLiked ? c.likes + 1 : c.likes - 1,
          };
        }
        return c;
      });
      return { ...prev, [predId]: updated };
    });
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
          {currentComments.map(c => (
            <div key={c.id} className="pt-3 first:pt-0 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200">
                    {c.userName.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{c.userName}</span>
                  {c.userBadge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/15 text-[#00a8ff] font-extrabold uppercase tracking-wider">
                      {c.userBadge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">{c.timeAgo}</span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 pl-9 leading-relaxed">
                {c.content}
              </p>

              <div className="pl-9 flex items-center gap-3">
                <button
                  onClick={() => handleToggleLike(c.id)}
                  className={`text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                    c.isLiked ? 'text-[#00a8ff]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  <ThumbsUp className={`w-3 h-3 ${c.isLiked ? 'fill-[#00a8ff]' : ''}`} />
                  <span>{c.likes}</span>
                </button>
              </div>
            </div>
          ))}
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
                disabled={!newComment.trim()}
                className="px-3.5 py-2 bg-[#00a8ff] hover:bg-[#0090e0] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Post</span>
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
