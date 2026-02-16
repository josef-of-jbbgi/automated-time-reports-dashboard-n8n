'use client';

import { useRef, useEffect } from 'react';
import { useAgent } from '@/lib/hooks/useAgent';
import { useTasks } from '@/lib/hooks/useTasks';
import { useDrafts } from '@/lib/hooks/useDrafts';
import Card from '@/components/ui/Card';
import AgentInput from './AgentInput';
import AgentMessage from './AgentMessage';

export default function PromptWindow() {
  const { messages, isLoading, sendMessage } = useAgent();
  const { mutate: mutateTasks } = useTasks();
  const { mutate: mutateTIDrafts } = useDrafts(undefined, 'Time-In');
  const { mutate: mutateTODrafts } = useDrafts(undefined, 'Time-Out');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(prompt: string) {
    const response = await sendMessage(prompt);
    mutateTasks();
    if (response?.draftsUpdated) {
      mutateTIDrafts();
      mutateTODrafts();
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
          <div className="mb-4 space-y-3 max-h-[28rem] overflow-y-auto overflow-x-hidden min-w-0">
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
