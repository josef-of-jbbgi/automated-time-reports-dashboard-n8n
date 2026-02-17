'use client';

import { useRef, useEffect } from 'react';
import { useAgent } from '@/lib/hooks/useAgent';
import { useTasks } from '@/lib/hooks/useTasks';
import { useDrafts } from '@/lib/hooks/useDrafts';
import Card from '@/components/ui/Card';
import AgentInput from './AgentInput';
import type { FileAttachment } from './AgentInput';
import AgentMessage from './AgentMessage';
import { useAgentStatus } from '@/lib/context/AgentContext';

export default function PromptWindow() {
  const { messages, isLoading, sendMessage } = useAgent();
  const { mutate: mutateTasks } = useTasks();
  const { mutate: mutateTIDrafts } = useDrafts(undefined, 'Time-In');
  const { mutate: mutateTODrafts } = useDrafts(undefined, 'Time-Out');
  const { setProcessing } = useAgentStatus();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(prompt: string, file?: FileAttachment) {
    setProcessing(true);
    try {
      const response = await sendMessage(prompt, file);
      mutateTasks();
      if (response?.draftsUpdated) {
        mutateTIDrafts();
        mutateTODrafts();
      }
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col min-w-0">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
          Prompt Window
        </h2>

        {messages.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] mb-4 text-center">
            Ask the AI agent to add tasks, update status, or re-draft your emails.
          </p>
        ) : (
          <div className="mb-4 space-y-3 max-h-[28rem] overflow-y-auto overflow-x-hidden min-w-0 scrollbar-hidden">
            {messages.map(msg => (
              <AgentMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        <AgentInput onSend={handleSend} disabled={isLoading} />
      </div>
    </Card>
  );
}
