'use client';

import { ChatMessage } from '@/lib/hooks/useAgent';

interface AgentMessageProps {
  message: ChatMessage;
}

export default function AgentMessage({ message }: AgentMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[85%] rounded-lg px-4 py-2.5 text-sm min-w-0
          ${isUser
            ? 'bg-[var(--accent)] text-white'
            : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)]'
          }
        `}
      >
        {message.fileName && (
          <div className={`flex items-center gap-1.5 text-xs mb-1.5 ${isUser ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9.5V13a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13V3a1.5 1.5 0 0 1 1.5-1.5H7" />
              <path d="M10 1.5h4.5V6" />
            </svg>
            <span className="truncate">{message.fileName}</span>
          </div>
        )}
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        {message.draftsUpdated && (
          <div className="mt-2 px-2 py-1 bg-blue-900/30 border border-blue-800/50 rounded text-xs text-blue-300">
            Drafts have been updated
          </div>
        )}
      </div>
    </div>
  );
}
