import React, { useState } from 'react';
import { Share2, Copy, Check, X, MessageCircle, Send, ExternalLink, Flame } from 'lucide-react';
import type { Prediction } from '../types/prediction';

interface ShareTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: Prediction | null;
}

export const ShareTipModal: React.FC<ShareTipModalProps> = ({ isOpen, onClose, prediction }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !prediction) return null;

  const shareText = `🔥 FALCON FORECAST PICK: ${prediction.homeTeam} vs ${prediction.awayTeam}\n⚽ League: ${prediction.league}\n🎯 Prediction: ${prediction.tip}\n📊 Odds: ${prediction.odds.toFixed(2)}\n⭐ Confidence: ${prediction.confidence}%\n\nView expert tactical analysis on Falcon Forecast:`;
  const shareUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const shareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-[#111c30] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white">
        
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/10 text-[#00a8ff]">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Share Prediction</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Send this pick to friends & betting groups</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prediction Card Preview */}
        <div className="p-5 space-y-4">
          <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl shadow-inner border border-slate-700 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-sky-400">
              <span>{prediction.league}</span>
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" />
                {prediction.confidence}% Confidence
              </span>
            </div>

            <div className="text-base font-black italic tracking-wide">
              {prediction.homeTeam} vs {prediction.awayTeam}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-700/80 text-xs">
              <span className="text-slate-300">
                Tip: <strong className="text-white">{prediction.tip}</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-[#00a8ff] font-extrabold text-white">
                @{prediction.odds.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Social Share Buttons Grid */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={shareWhatsApp}
              className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={shareTelegram}
              className="p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <Send className="w-5 h-5" />
              <span>Telegram</span>
            </button>

            <button
              onClick={shareTwitter}
              className="p-3 bg-slate-900 dark:bg-slate-800 hover:bg-black text-white rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Twitter / X</span>
            </button>
          </div>

          {/* Copy Direct Link Button */}
          <button
            onClick={handleCopyLink}
            className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
              copied
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-[#00a8ff]'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Share Link & Pick Details</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
