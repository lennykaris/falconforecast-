import React from 'react';
import { Crown, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePredictions } from '../context/PredictionsContext';

/** A slim, dismissible-by-navigation upsell strip shown site-wide while browsing free tips.
 * Before this the only upsell moment was clicking on an already-locked card — anyone who
 * never clicked a VIP card never saw a reason to upgrade. Surfaces a live count of today's
 * locked VIP tips instead of a generic "go VIP" message, for actual urgency. Hidden entirely
 * for VIP/admin users, since it has nothing to offer them. */
export const VipUpsellBanner: React.FC<{ onOpenCheckout?: () => void }> = ({ onOpenCheckout }) => {
  const { isVip } = useAuth();
  const { predictions } = usePredictions();

  if (isVip) return null;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const vipTipsToday = predictions.filter(p => {
    const isPlatformTip = !p.tipsterId || p.isPlatformTip;
    return p.tier === 'vip' && isPlatformTip && new Date(p.kickoff) >= todayStart;
  }).length;

  if (vipTipsToday === 0) return null;

  return (
    <button
      onClick={onOpenCheckout}
      className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-xs font-bold py-2 px-4 flex items-center justify-center gap-2 hover:brightness-105 transition-all"
    >
      <Crown className="w-3.5 h-3.5 fill-white" />
      <span>
        {vipTipsToday} VIP {vipTipsToday === 1 ? 'tip is' : 'tips are'} locked today — unlock full access
      </span>
      <ArrowRight className="w-3.5 h-3.5" />
    </button>
  );
};
