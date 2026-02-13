'use client';

import { useState } from 'react';
import { MiddayAgentResponse } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  draftsUpdated?: boolean;
}

export function useAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function sendMessage(prompt: string, type?: string): Promise<ChatMessage | null> {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const payload: Record<string, string> = { prompt };
      if (type) payload.type = type;

      const res = await fetch('/api/midday-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Agent request failed');
      }

      const data = (await res.json()) as MiddayAgentResponse;

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
        draftsUpdated: data.draftsUpdated,
      };

      setMessages(prev => [...prev, assistantMessage]);
      return assistantMessage;
    } catch {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Failed to reach the agent. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return { messages, isLoading, sendMessage };
}
