'use client';

import { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';

export interface FileAttachment {
  name: string;
  type: string;
  /** base64-encoded content for images, raw text for text files */
  content: string;
}

interface AgentInputProps {
  onSend: (prompt: string, file?: FileAttachment) => void;
  disabled: boolean;
}

const TEXT_TYPES = ['text/', 'application/json', 'application/csv', 'application/xml'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function isTextFile(file: File): boolean {
  return TEXT_TYPES.some(t => file.type.startsWith(t)) || /\.(txt|csv|json|md|log|xml|html|ts|tsx|js|jsx|py)$/i.test(file.name);
}

export default function AgentInput({ onSend, disabled }: AgentInputProps) {
  const [input, setInput] = useState('');
  const [file, setFile] = useState<FileAttachment | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  function handleSend() {
    if ((!input.trim() && !file) || disabled) return;
    onSend(input.trim(), file ?? undefined);
    setInput('');
    setFile(null);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    // Reset so the same file can be re-selected
    e.target.value = '';

    if (selected.size > MAX_FILE_SIZE) {
      alert('File must be under 5 MB');
      return;
    }

    if (isTextFile(selected)) {
      const text = await selected.text();
      setFile({ name: selected.name, type: selected.type || 'text/plain', content: text });
    } else {
      // Binary files (images, PDFs) → base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Strip the data:...;base64, prefix
          resolve(result.split(',')[1] || '');
        };
        reader.readAsDataURL(selected);
      });
      setFile({ name: selected.name, type: selected.type, content: base64 });
    }
  }

  return (
    <div className="space-y-2 min-w-0">
      {file && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-hover)] border border-[var(--border)] rounded-md text-xs text-[var(--text-secondary)]">
          <span className="truncate flex-1">{file.name}</span>
          <button
            onClick={() => setFile(null)}
            className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Remove file"
          >
            &#10005;
          </button>
        </div>
      )}

      <div className="flex gap-2 items-end min-w-0">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept=".txt,.csv,.json,.md,.log,.xml,.html,.ts,.tsx,.js,.jsx,.py,.png,.jpg,.jpeg,.gif,.webp,.pdf"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="shrink-0 flex items-center justify-center w-9 h-9 rounded-md border border-[var(--border)] bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors disabled:opacity-50"
          title="Attach file"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 9.5V13a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13V3a1.5 1.5 0 0 1 1.5-1.5H7" />
            <path d="M10 1.5h4.5V6" />
            <path d="M7 9.5l7.5-8" />
          </svg>
        </button>
        <textarea
          ref={textareaRef}
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type instructions for the AI agent...&#10;Press Enter to send, Shift+Enter for new line"
          disabled={disabled}
          className="flex-1 min-w-0 bg-[var(--bg-hover)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50 resize-none scrollbar-hidden"
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={disabled || (!input.trim() && !file)}
          loading={disabled}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
