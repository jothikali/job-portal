import { Download, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useState } from 'react';

/**
 * Inline Navbar button — shown in the top nav when the browser fires
 * beforeinstallprompt (Chrome/Edge/Android). Hidden on iOS (which uses
 * the apple-touch-icon + safari share sheet instead).
 */
export function InstallNavButton() {
  const { isInstallable, triggerInstall } = usePWAInstall();

  if (!isInstallable) return null;

  return (
    <button
      onClick={triggerInstall}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-600/30"
      title="Install Job Nest on your device"
    >
      <Download size={13} />
      <span className="hidden sm:inline">Install App</span>
    </button>
  );
}

/**
 * Bottom banner — a more prominent install nudge shown once per session
 * on mobile browsers that support the install prompt.
 */
export function InstallBottomBanner() {
  const { isInstallable, triggerInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[300] sm:left-auto sm:right-4 sm:w-[340px] animate-in slide-in-from-bottom-4 duration-400">
      <div className="bg-[#0F172A] rounded-2xl shadow-2xl shadow-black/40 border border-white/10 p-4 flex items-start gap-3">
        {/* App icon */}
        <div className="size-11 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
          <Smartphone size={22} className="text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-sm leading-tight">Add to Home Screen</p>
          <p className="text-slate-400 text-[11px] font-medium mt-0.5 leading-snug">
            Install Job Nest for faster access and offline support.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={triggerInstall}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all active:scale-95"
            >
              Install
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-2 text-slate-400 hover:text-white rounded-xl font-bold text-[11px] transition-colors"
            >
              Later
            </button>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-slate-500 hover:text-white transition-colors shrink-0 -mt-0.5"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
