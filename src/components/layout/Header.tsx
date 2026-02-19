'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatDisplayDate, getGreeting, getTodayDate } from '@/lib/utils';
import { getLastSynced, subscribeLastSynced } from '@/lib/swr-config';

function useLastSynced() {
  const [ts, setTs] = useState(getLastSynced);
  useEffect(() => subscribeLastSynced(() => setTs(getLastSynced())), []);
  return ts;
}

function formatAgo(ts: number): string {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 10) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  return `${mins}m ago`;
}

export default function Header() {
  const today = getTodayDate();
  const displayDate = formatDisplayDate(today);
  const greeting = getGreeting();
  const lastSynced = useLastSynced();
  const [ago, setAgo] = useState('');

  const refresh = useCallback(() => setAgo(formatAgo(lastSynced)), [lastSynced]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 10000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <header className="flex items-center justify-between">
      <h1 className="text-lg font-medium text-[var(--text-primary)]">
        {greeting}, Josef.
      </h1>
      <div className="flex items-center gap-3">
        {ago && (
          <span className="text-xs text-[var(--text-tertiary)]">
            Synced {ago}
          </span>
        )}
        <span className="text-sm text-[var(--text-secondary)]">{displayDate}</span>
      </div>
    </header>
  );
}
