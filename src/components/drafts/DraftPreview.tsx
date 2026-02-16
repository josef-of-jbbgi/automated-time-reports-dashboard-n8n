'use client';

import { useState } from 'react';
import { Draft } from '@/lib/types';
import MarkdownBody from '@/components/ui/MarkdownBody';

interface DraftPreviewProps {
  draft: Draft;
}

export default function DraftPreview({ draft }: DraftPreviewProps) {
  const [reasoningOpen, setReasoningOpen] = useState(false);

  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-muted)]">{draft.draftTitle}</p>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md p-4">
        <MarkdownBody content={draft.body} />
        <p className="text-xs text-[var(--text-muted)] mt-3 italic">
          Gmail signature appended automatically
        </p>
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
