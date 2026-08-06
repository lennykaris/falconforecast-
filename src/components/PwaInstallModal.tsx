import React, { useState } from 'react';
import { Smartphone, Download, Share, PlusSquare, CheckCircle, X, Sparkles, ShieldCheck, Zap, Bell } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ isOpen, onClose }) => {
  const { isIOS, isNativePromptAvailable, promptInstall, isStandalone } = usePWAInstall();
  const [installedSuccess, setInstalledSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isNativePromptAvailable) {
      const success = await promptInstall();
      if (success) {
        setInstalledSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2500);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-[#111c30] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white">
        
        {/* Header banner */}
        <div className="bg-gradient-to-r from-[#00a8ff] via-sky-600 to-indigo-600 p-6 text-white text-center relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-16 h-16 mx-auto mb-3 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
            <Smartphone className="w-8 h-8 text-white animate-bounce" />
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
            Official Mobile App
          </span>
          <h3 className="text-xl font-black italic tracking-wide">Install Falcon Forecast</h3>
          <p className="text-xs text-sky-100 mt-1 max-w-xs mx-auto">
            Get instant match alerts, offline VIP prediction access, and zero-latency odds updates.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {installedSuccess ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-scaleUp" />
              <h4 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">App Installed Successfully!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Falcon Forecast is now added to your home screen. Launch it anytime for VIP tips!
              </p>
            </div>
          ) : isStandalone ? (
            <div className="py-6 text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-sky-500 mx-auto" />
              <h4 className="text-base font-bold">App Already Installed</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You are currently accessing Falcon Forecast in native standalone mode!
              </p>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Feature Highlights */}
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 flex flex-col items-center gap-1">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Instant Load</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 flex flex-col items-center gap-1">
                  <Bell className="w-4 h-4 text-[#00a8ff]" />
                  <span>Push Alerts</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Offline Sync</span>
                </div>
              </div>

              {/* Install Logic according to OS */}
              {isIOS ? (
                /* iOS Safari instructions */
                <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-xl p-4 space-y-3">
                  <div className="text-xs font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
                    <Share className="w-4 h-4 text-[#00a8ff]" />
                    <span>How to Install on iPhone / iPad (Safari)</span>
                  </div>
                  <ol className="text-xs text-slate-700 dark:text-slate-300 space-y-2 pl-5 list-decimal font-medium">
                    <li>Tap the <span className="font-bold text-[#00a8ff]">Share button</span> at the bottom of Safari.</li>
                    <li>Scroll down and select <span className="font-bold text-[#00a8ff]">Add to Home Screen</span> <PlusSquare className="inline w-3.5 h-3.5 ml-1 text-slate-700 dark:text-slate-300" />.</li>
                    <li>Tap <span className="font-bold text-[#00a8ff]">Add</span> in the top right corner.</li>
                  </ol>
                </div>
              ) : isNativePromptAvailable ? (
                /* Android / Chrome 1-Click Install */
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3.5 bg-[#00a8ff] hover:bg-[#0090e0] text-white text-sm font-extrabold rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Download className="w-4 h-4 stroke-[3]" />
                  <span>Install App Now (1-Click)</span>
                </button>
              ) : (
                /* Fallback browser instructions */
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                  <div className="font-bold text-slate-800 dark:text-slate-200">Installation Guide:</div>
                  <p>
                    Open your browser menu (3 dots) and tap <span className="font-bold text-[#00a8ff]">"Install App"</span> or <span className="font-bold text-[#00a8ff]">"Add to Home Screen"</span> to save Falcon Forecast to your device!
                  </p>
                </div>
              )}
            </>
          )}

          <div className="text-center pt-1">
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PwaInstallBanner: React.FC<{ onOpenModal: () => void }> = ({ onOpenModal }) => {
  const { isStandalone, isDismissed, dismiss } = usePWAInstall();

  if (isStandalone || isDismissed) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 animate-slideUp">
      <div className="bg-[#0f172a] text-white p-3.5 rounded-2xl shadow-2xl border border-sky-500/30 backdrop-blur-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00a8ff] to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1">
              Falcon Forecast App
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">PWA</span>
            </h4>
            <p className="text-[11px] text-slate-300 leading-tight">Install on home screen for live score alerts</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenModal}
            className="px-3 py-1.5 bg-[#00a8ff] hover:bg-[#0090e0] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm whitespace-nowrap"
          >
            <Download className="w-3 h-3" />
            <span>Install</span>
          </button>
          <button
            onClick={dismiss}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
