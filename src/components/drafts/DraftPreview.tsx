'use client';

import { useState } from 'react';
import { Draft } from '@/lib/types';

interface DraftPreviewProps {
  draft: Draft;
  isEditing: boolean;
  onBodyChange: (text: string) => void;
}

export default function DraftPreview({ draft, isEditing, onBodyChange }: DraftPreviewProps) {
  const [reasoningOpen, setReasoningOpen] = useState(false);

  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-muted)]">{draft.draftTitle}</p>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md p-4">
        {isEditing ? (
          <textarea
            className="w-full bg-transparent text-sm text-[var(--text-primary)] resize-y min-h-[200px] focus:outline-none"
            value={draft.body}
            onChange={(e) => onBodyChange(e.target.value)}
          />
        ) : (
          <div className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">
            {draft.body}
          </div>
        )}
      </div>

      {draft.reasoning && (
        <div>
          <button
            onClick={() => setReasoningOpen(!reasoningOpen)}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            {reasoningOpen ? '▼' : '▶'} Reasoning
          </button>
          {reasoningOpen && (
            <p className="text-xs text-[var(--text-muted)] mt-1 pl-4">
              {draft.reasoning}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
