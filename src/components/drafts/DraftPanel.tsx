'use client';

import { useState, useEffect } from 'react';
import { useDrafts } from '@/lib/hooks/useDrafts';
import { useDailyLog } from '@/lib/hooks/useDailyLog';
import { formatTime } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import DraftVersionDropdown from './DraftVersionDropdown';
import DraftPreview from './DraftPreview';
import DraftActions from './DraftActions';

interface DraftPanelProps {
  type: 'Time-In' | 'Time-Out';
}

export default function DraftPanel({ type }: DraftPanelProps) {
  const { drafts, isLoading, mutate: mutateDrafts } = useDrafts(undefined, type);
  const { dailyLog, mutate: mutateDailyLog } = useDailyLog();
  const { toast } = useToast();

  const [selectedVersion, setSelectedVersion] = useState('Version A');
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState('');

  const selectedDraft = drafts.find(d => d.versionLabel === selectedVersion) || drafts[0];

  useEffect(() => {
    if (drafts.length > 0 && !drafts.find(d => d.versionLabel === selectedVersion)) {
      setSelectedVersion(drafts[0].versionLabel);
    }
  }, [drafts, selectedVersion]);

  // Check if any draft of this type has been sent
  const sentDraft = drafts.find(d => d.draftStatus === 'Sent');

  // Status rendering
  function renderStatus() {
    if (sentDraft) {
      const sentTime = sentDraft.generatedAt ? formatTime(sentDraft.generatedAt) : '';
      return (
        <span className="text-xs text-[var(--success)] flex items-center gap-1">
          &#10003; Sent{sentTime ? ` at ${sentTime}` : ''}
        </span>
      );
    }

    if (type === 'Time-Out' && dailyLog?.dayStatus !== 'Timed In' && dailyLog?.dayStatus !== 'Complete') {
      return (
        <span className="text-xs text-[var(--text-muted)]">Send Time-In first</span>
      );
    }

    if (drafts.length > 0) {
      return (
        <span className="text-xs text-[var(--success)] flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--success)]" />
          Drafts Ready
        </span>
      );
    }

    const time = type === 'Time-In' ? '7:30 AM' : '5:00 PM';
    return (
      <span className="text-xs text-[var(--text-muted)]">Drafts will generate at {time}</span>
    );
  }

  const isLocked = type === 'Time-Out' && dailyLog?.dayStatus !== 'Timed In' && dailyLog?.dayStatus !== 'Complete' && dailyLog?.dayStatus !== 'Timed Out';

  function handleToggleEdit() {
    if (!selectedDraft) return;
    setEditedBody(selectedDraft.body);
    setIsEditing(true);
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setEditedBody('');
  }

  async function handleSaveEdit() {
    if (!selectedDraft) return;
    try {
      const res = await fetch('/api/drafts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedDraft.id, fields: { Body: editedBody } }),
      });
      if (!res.ok) throw new Error('Save failed');
      setIsEditing(false);
      mutateDrafts();
      toast('Draft saved', 'success');
    } catch {
      toast('Failed to save edit', 'error');
    }
  }

  function handleSendSuccess() {
    mutateDrafts();
    mutateDailyLog();
  }

  // Build a working draft object for preview (use editedBody when editing)
  const displayDraft = selectedDraft
    ? { ...selectedDraft, body: isEditing ? editedBody : selectedDraft.body }
    : null;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          {type} Panel
        </h2>
        {renderStatus()}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : drafts.length === 0 || isLocked ? (
        <EmptyState
          title={isLocked ? 'Send Time-In first' : `No drafts available`}
          description={isLocked ? undefined : `Drafts will generate at ${type === 'Time-In' ? '7:30 AM' : '5:00 PM'}`}
        />
      ) : displayDraft ? (
        <div className="space-y-4">
          <DraftVersionDropdown
            drafts={drafts}
            selectedVersion={selectedVersion}
            onVersionChange={(v) => {
              setSelectedVersion(v);
              setIsEditing(false);
            }}
          />
          <DraftPreview
            draft={displayDraft}
            isEditing={isEditing}
            onBodyChange={setEditedBody}
          />
          {!sentDraft && (
            <DraftActions
              draft={selectedDraft}
              type={type}
              isEditing={isEditing}
              onToggleEdit={handleToggleEdit}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onSendSuccess={handleSendSuccess}
            />
          )}
        </div>
      ) : null}
    </Card>
  );
}
