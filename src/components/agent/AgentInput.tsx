'use client';

import { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';

interface AgentInputProps {
  onSend: (prompt: string) => void;
  disabled: boolean;
}

export default function AgentInput({ onSend, disabled }: AgentInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea to fit content
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  function handleSend() {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter inserts newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex gap-2 items-end">
      <textarea
        ref={textareaRef}
        rows={2}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type instructions for the AI agent...&#10;Press Enter to send, Shift+Enter for new line"
        disabled={disabled}
        className="flex-1 bg-[var(--bg-hover)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50 resize-none"
      />
      <Button
        size="sm"
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        loading={disabled}
      >
        Send
      </Button>
    </div>
  );
}
