import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-[99] flex items-center gap-2 rounded-xl bg-amber-600 text-white px-3.5 py-2 text-xs font-semibold shadow-xl border border-amber-500/50 backdrop-blur-sm animate-bounce"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Offline Mode — Cached data is being used.</span>
    </div>
  );
};
