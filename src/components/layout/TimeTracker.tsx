'use client';

import { useEffect, useState } from 'react';
import { useDailyLog } from '@/lib/hooks/useDailyLog';
import { formatTime, getElapsedHours } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';

export default function TimeTracker() {
  const { dailyLog, isLoading } = useDailyLog();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </Card>
    );
  }

  const dayStatus = dailyLog?.dayStatus;
  const currentTime = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (dayStatus === 'Timed Out' || dayStatus === 'Complete') {
    return (
      <Card>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--text-secondary)]">
            Timed In: <span className="text-[var(--text-primary)]">{dailyLog?.timeInSentAt ? formatTime(dailyLog.timeInSentAt) : '—'}</span>
          </span>
          <span className="text-[var(--border)]">|</span>
          <span className="text-[var(--text-secondary)]">
            Timed Out: <span className="text-[var(--text-primary)]">{dailyLog?.timeOutSentAt ? formatTime(dailyLog.timeOutSentAt) : '—'}</span>
          </span>
          <span className="text-[var(--border)]">|</span>
          <span className="text-[var(--text-secondary)]">
            Total: <span className="text-[var(--text-primary)] font-medium">{dailyLog?.totalHours ?? '—'}h</span>
          </span>
        </div>
      </Card>
    );
  }

  if (dayStatus === 'Timed In' && dailyLog?.timeInSentAt) {
    return (
      <Card>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--text-secondary)]">
            Timed In: <span className="text-[var(--text-primary)]">{formatTime(dailyLog.timeInSentAt)}</span>
          </span>
          <span className="text-[var(--border)]">|</span>
          <span className="text-[var(--text-secondary)]">
            Current: <span className="text-[var(--text-primary)]">{currentTime}</span>
          </span>
          <span className="text-[var(--border)]">|</span>
          <span className="text-[var(--text-secondary)]">
            Elapsed: <span className="text-[var(--text-primary)] font-medium">{getElapsedHours(dailyLog.timeInSentAt)}</span>
          </span>
        </div>
      </Card>
    );
  }

  // Not Started or null
  return (
    <Card>
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--text-secondary)]">
          Timed In: <span className="text-[var(--text-muted)]">—</span>
        </span>
        <span className="text-[var(--border)]">|</span>
        <span className="text-[var(--text-secondary)]">
          Current: <span className="text-[var(--text-primary)]">{currentTime}</span>
        </span>
        <span className="text-[var(--border)]">|</span>
        <span className="text-[var(--text-secondary)]">
          Elapsed: <span className="text-[var(--text-muted)]">—</span>
        </span>
      </div>
    </Card>
  );
}
