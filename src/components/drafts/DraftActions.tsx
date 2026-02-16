'use client';

import { useState } from 'react';
import { Draft } from '@/lib/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

interface DraftActionsProps {
  draft: Draft;
  type: 'Time-In' | 'Time-Out';
  isEditing: boolean;
  sendLocked?: boolean;
  sendLockedReason?: string;
  onToggleEdit: () => void;
  onSaveEdit: () => Promise<void>;
  onCancelEdit: () => void;
  onSendSuccess: () => void;
}

export default function DraftActions({
  draft,
  type,
  isEditing,
  sendLocked,
  sendLockedReason,
  onToggleEdit,
  onSaveEdit,
  onCancelEdit,
  onSendSuccess,
}: DraftActionsProps) {
  const [showModal, setShowModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const isGenerated = draft.draftStatus === 'Generated';

  async function handleSend() {
    setIsSending(true);
    try {
      const endpoint = type === 'Time-In' ? '/api/send-time-in' : '/api/send-time-out';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftRecordId: draft.id }),
      });

      if (!res.ok) throw new Error('Send failed');

      const data = await res.json();
      const totalHoursInfo = data.totalHours ? ` · ${data.totalHours}h` : '';
      toast(`${type} sent${totalHoursInfo}`, 'success');
      setShowModal(false);
      onSendSuccess();
    } catch {
      toast('Failed to send. Try again.', 'error');
    } finally {
      setIsSending(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSaveEdit();
    } finally {
      setIsSaving(false);
    }
  }

  if (isEditing) {
    return (
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancelEdit}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleSave} loading={isSaving}>
          Save
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {sendLocked && sendLockedReason && (
          <span className="text-xs text-[var(--text-muted)]">{sendLockedReason}</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleEdit}
          disabled={!isGenerated}
        >
          Edit
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowModal(true)}
          disabled={!isGenerated || sendLocked}
        >
          Send
        </Button>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => !isSending && setShowModal(false)}
        title="Confirm Send"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowModal(false)} disabled={isSending}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSend} loading={isSending}>
              Send
            </Button>
          </>
        }
      >
        <p>
          Send {draft.versionLabel} as your {type} email to John and Ged?
        </p>
      </Modal>
    </>
  );
}
