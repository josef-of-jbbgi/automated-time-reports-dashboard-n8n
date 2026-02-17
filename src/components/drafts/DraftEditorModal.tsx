'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Draft, PromptMessage } from '@/lib/types';
import Button from '@/components/ui/Button';
import MarkdownBody from '@/components/ui/MarkdownBody';
import { useToast } from '@/components/ui/Toast';
import LexicalEditor from './LexicalEditor';

interface DraftEditorModalProps {
  isOpen: boolean;
  drafts: Draft[];
  initialVersion: string;
  type: 'Time-In' | 'Time-Out';
  sendLocked: boolean;
  sendLockedReason?: string;
  conversationHistory: PromptMessage[];
  onClose: () => void;
  onSave: (draftId: string, body: string) => Promise<void>;
  onSend: (draftId: string) => Promise<void>;
  onConversationUpdate: (history: PromptMessage[]) => void;
}

type ViewMode = 'split' | 'preview';

export default function DraftEditorModal({
  isOpen,
  drafts,
  initialVersion,
  type,
  sendLocked,
  sendLockedReason,
  conversationHistory,
  onClose,
  onSave,
  onSend,
  onConversationUpdate,
}: DraftEditorModalProps) {
  const { toast } = useToast();
  const promptRef = useRef<HTMLTextAreaElement>(null);

  // Tracks whether the next OnChange from LexicalEditor is from initialization
  // (not a user edit). Used to sync originalBody with the round-tripped markdown
  // so hasChanges is accurate and auto-save won't corrupt data.
  const editorInitRef = useRef(false);

  const [selectedVersion, setSelectedVersion] = useState(initialVersion);
  const [editedBody, setEditedBody] = useState('');
  const [originalBody, setOriginalBody] = useState('');
  const [ready, setReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [editorKey, setEditorKey] = useState(0);

  // AI prompt state
  const [promptText, setPromptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [undoBody, setUndoBody] = useState<string | null>(null);

  const selectedDraft = drafts.find(d => d.versionLabel === selectedVersion) || drafts[0];
  const hasChanges = editedBody !== originalBody;

  // Single initialization effect when modal opens
  useEffect(() => {
    if (!isOpen) {
      setReady(false);
      return;
    }

    const version = initialVersion;
    const draft = drafts.find(d => d.versionLabel === version) || drafts[0];

    setSelectedVersion(version);
    setShowSendConfirm(false);
    setViewMode('split');
    setPromptText('');

    if (draft) {
      setEditedBody(draft.body);
      setOriginalBody(draft.body);
      editorInitRef.current = true;
      setEditorKey(k => k + 1);
      setUndoBody(null);
      setReady(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  const handleClose = useCallback(() => {
    if (isSaving || isSending || isGenerating) return;
    if (hasChanges) {
      if (!confirm('You have unsaved changes. Discard them?')) return;
    }
    onClose();
  }, [isSaving, isSending, isGenerating, hasChanges, onClose]);

  async function handleVersionChange(version: string) {
    if (hasChanges && selectedDraft) {
      setIsSaving(true);
      try {
        await onSave(selectedDraft.id, editedBody);
        toast('Draft saved', 'success');
      } catch {
        toast('Failed to save before switching', 'error');
        setIsSaving(false);
        return;
      }
      setIsSaving(false);
    }
    setSelectedVersion(version);

    // Directly initialize body for the new version — no effect dependency needed
    const draft = drafts.find(d => d.versionLabel === version) || drafts[0];
    if (draft) {
      setEditedBody(draft.body);
      setOriginalBody(draft.body);
      editorInitRef.current = true;
      setEditorKey(k => k + 1);
      setUndoBody(null);
    }
  }

  async function handleSave() {
    if (!selectedDraft) return;
    setIsSaving(true);
    try {
      await onSave(selectedDraft.id, editedBody);
      setOriginalBody(editedBody);
      toast('Draft saved', 'success');
    } catch {
      toast('Failed to save', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSend() {
    if (!selectedDraft) return;
    setIsSending(true);
    try {
      if (hasChanges) {
        await onSave(selectedDraft.id, editedBody);
        setOriginalBody(editedBody);
      }
      await onSend(selectedDraft.id);
      onClose();
    } catch {
      toast('Failed to send', 'error');
    } finally {
      setIsSending(false);
      setShowSendConfirm(false);
    }
  }

  const handleEditorChange = useCallback((markdown: string) => {
    // After each editor mount, the OnChangePlugin fires immediately with the
    // round-tripped markdown (which may differ from the raw DB value in whitespace).
    // Sync originalBody to match so hasChanges stays false until the user truly edits.
    if (editorInitRef.current) {
      editorInitRef.current = false;
      setOriginalBody(markdown);
    }
    setEditedBody(markdown);
  }, []);

  // ── AI Prompt ──
  async function handlePromptSubmit() {
    if (!promptText.trim() || isGenerating) return;

    const userMessage = promptText.trim();
    setPromptText('');
    setIsGenerating(true);

    // Store current body for undo
    setUndoBody(editedBody);

    // Add user message to conversation
    const updatedHistory: PromptMessage[] = [
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];
    onConversationUpdate(updatedHistory);

    try {
      const res = await fetch('/api/draft-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          currentBody: editedBody,
          type,
          history: conversationHistory,
        }),
      });

      if (!res.ok) throw new Error('Generation failed');

      const data = await res.json();
      const newBody = data.body as string;

      // Replace editor content
      setEditedBody(newBody);
      setEditorKey(k => k + 1);

      // Add assistant response to conversation
      onConversationUpdate([
        ...updatedHistory,
        { role: 'assistant', content: `Rewrote draft: "${userMessage}"` },
      ]);

      toast('Draft rewritten by AI', 'success');
    } catch {
      toast('AI generation failed', 'error');
      // Remove the user message on failure
      onConversationUpdate(conversationHistory);
      setUndoBody(null);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleUndo() {
    if (undoBody === null) return;
    setEditedBody(undoBody);
    setEditorKey(k => k + 1);
    setUndoBody(null);
    toast('Reverted AI changes', 'info');
  }

  function handlePromptKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter submits, Shift+Enter adds newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePromptSubmit();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-3">
          <select
            value={selectedVersion}
            onChange={(e) => handleVersionChange(e.target.value)}
            className="bg-[var(--bg-hover)] border border-[var(--border)] rounded-md px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            {drafts.map((draft) => (
              <option key={draft.id} value={draft.versionLabel}>
                {draft.versionLabel}
              </option>
            ))}
          </select>

          <div className="w-px h-4 bg-[var(--border)]" />

          <button
            onClick={() => setViewMode('split')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              viewMode === 'split'
                ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
            }`}
            title="Split view (editor + preview)"
          >
            &#9776;
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              viewMode === 'preview'
                ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
            }`}
            title="Preview only"
          >
            &#128065;
          </button>

          {undoBody !== null && (
            <>
              <div className="w-px h-4 bg-[var(--border)]" />
              <button
                onClick={handleUndo}
                className="px-2 py-1 text-xs rounded bg-amber-900/30 text-amber-300 hover:bg-amber-900/50 transition-colors"
                title="Undo AI rewrite"
              >
                &#8630; Undo AI
              </button>
            </>
          )}

          {hasChanges && (
            <span className="text-xs text-[var(--text-muted)]">Unsaved changes</span>
          )}
        </div>

        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          Edit {type} Draft
        </h2>
        <button
          onClick={handleClose}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-xl leading-none p-1"
          aria-label="Close editor"
        >
          &times;
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Editor pane (Lexical + prompt bar) */}
        {viewMode === 'split' && (
          <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-[var(--border)] min-h-0">
            {/* Active draft indicator */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-primary)]">
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Editing: {selectedDraft?.versionLabel}
              </span>
              <span className="text-xs text-[var(--text-muted)]">&mdash;</span>
              <span className="text-xs text-[var(--text-muted)] truncate">
                {selectedDraft?.draftTitle}
              </span>
            </div>

            {/* Lexical editor — only render once body is loaded to avoid empty flash */}
            <div className="flex-1 flex flex-col min-h-0">
              {ready ? (
                <LexicalEditor
                  key={editorKey}
                  initialMarkdown={editedBody}
                  onChange={handleEditorChange}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-[var(--text-muted)]">
                  Loading editor…
                </div>
              )}
            </div>

            {/* AI Prompt bar */}
            <div className="border-t border-[var(--border)] bg-[var(--bg-secondary)] p-3">
              {/* Conversation history (compact) */}
              {conversationHistory.length > 0 && (
                <div className="mb-2 max-h-24 overflow-y-auto space-y-1">
                  {conversationHistory.map((msg, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className={msg.role === 'user' ? 'text-[var(--text-muted)]' : 'text-purple-400'}>
                        {msg.role === 'user' ? 'You:' : '✦'}
                      </span>
                      <span className="text-[var(--text-secondary)] truncate">{msg.content}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Prompt input */}
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-2.5 text-purple-400 text-sm pointer-events-none">✦</span>
                  <textarea
                    ref={promptRef}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    onKeyDown={handlePromptKeyDown}
                    placeholder="Ask Gemini to rewrite..."
                    rows={1}
                    disabled={isGenerating}
                    className="w-full bg-[var(--bg-hover)] border border-[var(--border)] rounded-md pl-8 pr-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none disabled:opacity-50"
                  />
                </div>
                <button
                  onClick={handlePromptSubmit}
                  disabled={!promptText.trim() || isGenerating}
                  className="shrink-0 px-3 py-2 rounded-md text-sm bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                >
                  {isGenerating ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <span className="text-xs">&#9166;</span>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                Enter to send &middot; Shift+Enter for newline
              </p>
            </div>
          </div>
        )}

        {/* Live preview */}
        <div className={`flex-1 overflow-y-auto p-4 ${viewMode === 'preview' ? '' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Preview</div>
            {viewMode === 'preview' && selectedDraft && (
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                <span className="text-xs text-[var(--text-secondary)]">{selectedDraft.versionLabel}</span>
              </div>
            )}
          </div>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md p-4">
            {isGenerating && (
              <div className="flex items-center gap-2 mb-3 text-xs text-purple-400">
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Gemini is rewriting...
              </div>
            )}
            <MarkdownBody content={editedBody} />
            <p className="text-xs text-[var(--text-muted)] mt-3 italic">
              Gmail signature appended automatically
            </p>
          </div>
        </div>

        {/* Mobile preview below editor in split mode */}
        {viewMode === 'split' && (
          <div className="flex-1 overflow-y-auto p-4 lg:hidden">
            <div className="text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wide">Preview</div>
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md p-4">
              <MarkdownBody content={editedBody} />
              <p className="text-xs text-[var(--text-muted)] mt-3 italic">
                Gmail signature appended automatically
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
        <p className="text-xs text-[var(--text-muted)]">
          Ctrl+B bold &middot; Markdown shortcuts supported
        </p>

        <div className="flex items-center gap-2">
          {sendLocked && sendLockedReason && (
            <span className="text-xs text-[var(--text-muted)]">{sendLockedReason}</span>
          )}

          {showSendConfirm ? (
            <>
              <span className="text-xs text-[var(--text-secondary)]">
                Send {selectedDraft?.versionLabel} as {type}?
              </span>
              <Button variant="ghost" size="sm" onClick={() => setShowSendConfirm(false)} disabled={isSending}>
                No
              </Button>
              <Button variant="primary" size="sm" onClick={handleSend} loading={isSending}>
                Confirm Send
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={handleClose} disabled={isSaving || isSending}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSave}
                loading={isSaving}
                disabled={!hasChanges}
              >
                Save
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowSendConfirm(true)}
                disabled={sendLocked || !selectedDraft}
              >
                Send
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
