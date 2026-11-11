import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X, CheckCircle2 } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'floating' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled && !justInstalled) {
    return null;
  }

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 4000);
    }
  };

  if (justInstalled) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Installed Successfully
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'banner') {
      return (
        <div className={`flex items-center justify-between gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-900 dark:text-amber-200 ${className}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold leading-tight">Install SSN Portal App</p>
              <p className="text-[11px] opacity-80 truncate">Instant access, offline caching & faster load</p>
            </div>
          </div>
          <button
            onClick={handleInstall}
            className="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Install
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={handleInstall}
        className={`inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 active:scale-95 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-150 cursor-pointer ${className}`}
        title="Install Sankardev Shiksha Niketan App on this device"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20 px-3 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all cursor-pointer ${className}`}
          title="Install on iPhone / iPad"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl relative text-left">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/logo.png"
                  alt="SSN Logo"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://smartschool.asomweb.com/ssn/logo.png';
                  }}
                  className="w-10 h-10 object-contain rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Install SSN Gohpur
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sankardev Shiksha Niketan Portal
                  </p>
                </div>
              </div>

              <div className="space-y-3 my-4 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                    1
                  </span>
                  <p className="pt-0.5">
                    Tap the <strong className="text-slate-900 dark:text-white inline-flex items-center gap-1">Share <Share2 className="w-3.5 h-3.5 inline text-blue-500" /></strong> icon at the bottom of Safari.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                    2
                  </span>
                  <p className="pt-0.5">
                    Scroll down and select <strong className="text-slate-900 dark:text-white inline-flex items-center gap-1">Add to Home Screen <PlusSquare className="w-3.5 h-3.5 inline text-slate-700 dark:text-slate-300" /></strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                    3
                  </span>
                  <p className="pt-0.5">
                    Tap <strong className="text-slate-900 dark:text-white">Add</strong> in the top right corner to install.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 text-xs font-semibold hover:opacity-90 transition cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
