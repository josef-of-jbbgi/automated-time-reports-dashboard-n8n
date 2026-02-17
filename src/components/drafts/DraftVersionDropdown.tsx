'use client';

import { Draft } from '@/lib/types';

interface DraftVersionDropdownProps {
  drafts: Draft[];
  selectedVersion: string;
  onVersionChange: (version: string) => void;
}

export default function DraftVersionDropdown({
  drafts,
  selectedVersion,
  onVersionChange,
}: DraftVersionDropdownProps) {
  if (drafts.length === 0) return null;

  // Single draft — show as a static label with active indicator
  if (drafts.length === 1) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent)]" />
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {drafts[0].versionLabel}
        </span>
        <span className="text-xs text-[var(--text-muted)]">1 version available</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent)]" />
      <select
        value={selectedVersion}
        onChange={(e) => onVersionChange(e.target.value)}
        className="bg-[var(--bg-hover)] border border-[var(--border)] rounded-md px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      >
        {drafts.map((draft) => (
          <option key={draft.id} value={draft.versionLabel}>
            {draft.versionLabel}
          </option>
        ))}
      </select>
      <span className="text-xs text-[var(--text-muted)]">{drafts.length} versions</span>
    </div>
  );
}
