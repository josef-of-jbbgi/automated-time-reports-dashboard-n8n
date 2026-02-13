'use client';

import { formatDisplayDate, getGreeting, getTodayDate } from '@/lib/utils';

export default function Header() {
  const today = getTodayDate();
  const displayDate = formatDisplayDate(today);
  const greeting = getGreeting();

  return (
    <header className="flex items-center justify-between">
      <h1 className="text-lg font-medium text-[var(--text-primary)]">
        {greeting}, Josef.
      </h1>
      <span className="text-sm text-[var(--text-secondary)]">{displayDate}</span>
    </header>
  );
}
