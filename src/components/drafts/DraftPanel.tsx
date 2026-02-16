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
  const [showSentBody, setShowSentBody] = useState(false);

  const selectedDraft = drafts.find(d => d.versionLabel === selectedVersion) || drafts[0];

  useEffect(() => {
    if (drafts.length > 0 && !drafts.find(d => d.versionLabel === selectedVersion)) {
      setSelectedVersion(drafts[0].versionLabel);
    }
  }, [drafts, selectedVersion]);

  // Check if any draft of this type has been sent
  const sentDraft = drafts.find(d => d.draftStatus === 'Sent');
  const sentTime = type === 'Time-In' ? dailyLog?.timeInSentAt : dailyLog?.timeOutSentAt;

  // Status rendering
  function renderStatus() {
    if (sentDraft) {
      return (
        <span className="text-xs text-[var(--success)] flex items-center gap-1">
          &#10003; Sent
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

  // Time-Out send is locked until 5:00 PM
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  useEffect(() => {
    if (type !== 'Time-Out') return;
    const interval = setInterval(() => setCurrentHour(new Date().getHours()), 60_000);
    return () => clearInterval(interval);
  }, [type]);
  const isSendTimeLocked = type === 'Time-Out' && currentHour < 17;

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

  // Sent state — banner is the primary content, email body is collapsible
  if (sentDraft && !isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
            {type} Panel
          </h2>
          {renderStatus()}
        </div>

        <div className="rounded-md border border-green-800/50 bg-green-900/20 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-900/50 text-green-400 text-lg">
              &#10003;
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-green-300">
                {type} sent{sentTime ? ` at ${formatTime(sentTime)}` : ''}
              </p>
              <p className="text-xs text-green-400/60 truncate mt-0.5">
                {sentDraft.draftTitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSentBody(!showSentBody)}
            className="mt-3 flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <span className="text-[10px]">{showSentBody ? '▼' : '▶'}</span>
            View sent email
          </button>

          {showSentBody && (
            <div className="mt-3 rounded border border-[var(--border)] bg-[var(--bg-secondary)] p-3">
              <div className="text-sm text-[var(--text-muted)] whitespace-pre-wrap">
                {sentDraft.body}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

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
          <DraftActions
            draft={selectedDraft}
            type={type}
            isEditing={isEditing}
            sendLocked={isSendTimeLocked}
            sendLockedReason={isSendTimeLocked ? 'Available at 5:00 PM' : undefined}
            onToggleEdit={handleToggleEdit}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            onSendSuccess={handleSendSuccess}
          />
        </div>
      ) : null}
    </Card>
  );
}
