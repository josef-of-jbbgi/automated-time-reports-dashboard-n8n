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

  return (
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
  );
}
