import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTipsters } from '../context/TipstersContext';

/** No page anywhere previously showed a subscriber their own list of tipster subscriptions
 * and when each expires — only the tipster's own dashboard (their subscribers) and admin
 * (everyone's) had any such view. This is that view, for the person actually paying. */
export const MyTipsterSubscriptions: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const { subscriptions, tipsters } = useTipsters();

  if (!isLoggedIn || !user) return null;

  const mySubs = subscriptions
    .filter(s => s.userId === user.id)
    .map(s => ({
      ...s,
      tipster: tipsters.find(t => t.id === s.tipsterId),
      daysRemaining: Math.max(0, Math.ceil((new Date(s.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
    }))
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  if (mySubs.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#111c30] border border-sky-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-[#00a8ff] to-sky-400 px-4 py-3 flex items-center gap-2">
        <Star className="w-4 h-4 text-white fill-white" />
        <h3 className="font-bold text-sm text-white tracking-wide">My Tipster Subscriptions</h3>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {mySubs.map(s => {
          const isActive = s.status === 'active' && s.daysRemaining > 0;
          const urgent = isActive && s.daysRemaining <= 3;
          return (
            <div key={s.id} className="p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {s.tipster?.name || 'Tipster'}
                </p>
                <p className="text-[10px] text-slate-400 capitalize">{s.billingCycle} plan</p>
              </div>
              <div className="flex-shrink-0 text-right">
                {!isActive ? (
                  <span className="text-[10px] font-bold text-slate-400">Expired</span>
                ) : (
                  <span className={`flex items-center gap-1 text-[11px] font-bold ${
                    urgent ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <CalendarDays className="w-3 h-3" />
                    {s.daysRemaining === 0 ? 'Today' : `${s.daysRemaining}d left`}
                  </span>
                )}
                {(urgent || !isActive) && (
                  <Link
                    to={`/tipsters?subscribe=${s.tipsterId}`}
                    className="mt-1 flex items-center justify-end gap-0.5 text-[10px] font-bold text-[#00a8ff] hover:underline"
                  >
                    Renew <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
