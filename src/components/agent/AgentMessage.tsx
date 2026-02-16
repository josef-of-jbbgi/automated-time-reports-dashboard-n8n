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
          max-w-[85%] rounded-lg px-4 py-2.5 text-sm
          ${isUser
            ? 'bg-[var(--accent)] text-white'
            : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)]'
          }
        `}
      >
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
