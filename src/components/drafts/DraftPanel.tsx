'use client';

import { useState, useEffect } from 'react';
import { useDrafts } from '@/lib/hooks/useDrafts';
import { useDailyLog } from '@/lib/hooks/useDailyLog';
import { formatTime } from '@/lib/utils';
import { PromptMessage } from '@/lib/types';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import DraftVersionDropdown from './DraftVersionDropdown';
import DraftPreview from './DraftPreview';
import DraftActions from './DraftActions';
import DraftEditorModal from './DraftEditorModal';
import MarkdownBody from '@/components/ui/MarkdownBody';

interface DraftPanelProps {
  type: 'Time-In' | 'Time-Out';
}

export default function DraftPanel({ type }: DraftPanelProps) {
  const { drafts, isLoading, mutate: mutateDrafts } = useDrafts(undefined, type);
  const { dailyLog, mutate: mutateDailyLog } = useDailyLog();
  const { toast } = useToast();

  const [selectedVersion, setSelectedVersion] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [showSentBody, setShowSentBody] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<PromptMessage[]>([]);

  // Only show drafts that have body content
  const availableDrafts = drafts.filter(d => d.body.trim().length > 0);

  const selectedDraft = availableDrafts.find(d => d.versionLabel === selectedVersion) || availableDrafts[0];

  useEffect(() => {
    if (availableDrafts.length > 0 && !availableDrafts.find(d => d.versionLabel === selectedVersion)) {
      setSelectedVersion(availableDrafts[0].versionLabel);
    }
  }, [availableDrafts, selectedVersion]);

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

    if (availableDrafts.length > 0) {
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

  // Modal callbacks
  async function handleModalSave(draftId: string, body: string) {
    const res = await fetch('/api/drafts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: draftId, fields: { Body: body } }),
    });
    if (!res.ok) throw new Error('Save failed');
    mutateDrafts();
  }

  async function handleModalSend(draftId: string) {
    const endpoint = type === 'Time-In' ? '/api/send-time-in' : '/api/send-time-out';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draftRecordId: draftId }),
    });
    if (!res.ok) throw new Error('Send failed');
    const data = await res.json();
    const totalHoursInfo = data.totalHours ? ` · ${data.totalHours}h` : '';
    toast(`${type} sent${totalHoursInfo}`, 'success');
    mutateDrafts();
    mutateDailyLog();
  }

  function handleSendSuccess() {
    mutateDrafts();
    mutateDailyLog();
  }

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
              <MarkdownBody content={sentDraft.body} />
              <p className="text-xs text-[var(--text-muted)] mt-3 italic">
                Gmail signature appended automatically
              </p>
            </div>
          )}
        </div>

        {/* AI conversation history on sent panel */}
        <ConversationSummary history={conversationHistory} />
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
      ) : availableDrafts.length === 0 || isLocked ? (
        <EmptyState
          title={isLocked ? 'Send Time-In first' : `No drafts available`}
          description={isLocked ? undefined : `Drafts will generate at ${type === 'Time-In' ? '7:30 AM' : '5:00 PM'}`}
        />
      ) : selectedDraft ? (
        <div className="space-y-4">
          <DraftVersionDropdown
            drafts={availableDrafts}
            selectedVersion={selectedVersion}
            onVersionChange={setSelectedVersion}
          />
          <DraftPreview draft={selectedDraft} />
          <DraftActions
            draft={selectedDraft}
            type={type}
            sendLocked={isSendTimeLocked}
            sendLockedReason={isSendTimeLocked ? 'Available at 5:00 PM' : undefined}
            onToggleEdit={() => setEditorOpen(true)}
            onSendSuccess={handleSendSuccess}
          />
          {/* AI conversation history on main panel */}
          <ConversationSummary history={conversationHistory} />
        </div>
      ) : null}

      <DraftEditorModal
        isOpen={editorOpen}
        drafts={availableDrafts}
        initialVersion={selectedVersion}
        type={type}
        sendLocked={isSendTimeLocked}
        sendLockedReason={isSendTimeLocked ? 'Available at 5:00 PM' : undefined}
        conversationHistory={conversationHistory}
        onClose={() => setEditorOpen(false)}
        onSave={handleModalSave}
        onSend={handleModalSend}
        onConversationUpdate={setConversationHistory}
      />
    </Card>
  );
}

// ── Collapsible conversation summary shown on main panel ──
function ConversationSummary({ history }: { history: PromptMessage[] }) {
  const [open, setOpen] = useState(false);

  if (history.length === 0) return null;

  const userMessages = history.filter(m => m.role === 'user');

  return (
    <div className="mt-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
      >
        <span className="text-[10px]">{open ? '▼' : '▶'}</span>
        <span>✦</span>
        {userMessages.length} AI edit{userMessages.length !== 1 ? 's' : ''}
      </button>
      {open && (
        <div className="mt-2 space-y-1.5 pl-4">
          {history.map((msg, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className={msg.role === 'user' ? 'text-[var(--text-muted)] shrink-0' : 'text-purple-400 shrink-0'}>
                {msg.role === 'user' ? 'You:' : '✦'}
              </span>
              <span className="text-[var(--text-secondary)]">{msg.content}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
