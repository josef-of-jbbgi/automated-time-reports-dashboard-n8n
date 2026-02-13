'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

interface AgentInputProps {
  onSend: (prompt: string) => void;
  disabled: boolean;
}

export default function AgentInput({ onSend, disabled }: AgentInputProps) {
  const [input, setInput] = useState('');

  function handleSend() {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
        placeholder="Type instructions for the AI agent..."
        disabled={disabled}
        className="flex-1 bg-[var(--bg-hover)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
      />
      <Button
        size="sm"
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        loading={disabled}
      >
        Send to Agent
      </Button>
    </div>
  );
}
