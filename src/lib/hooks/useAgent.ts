'use client';

import { useState, useEffect, useCallback } from 'react';
import { MiddayAgentResponse } from '../types';
import { getTodayDate } from '../utils';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  draftsUpdated?: boolean;
}

const STORAGE_KEY_PREFIX = 'agent-chat-';

function getStorageKey(): string {
  return `${STORAGE_KEY_PREFIX}${getTodayDate()}`;
}

function loadMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages(messages: ChatMessage[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(messages));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

function cleanOldSessions() {
  if (typeof window === 'undefined') return;
  const todayKey = getStorageKey();
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_KEY_PREFIX) && key !== todayKey) {
      localStorage.removeItem(key);
    }
  }
}

export function useAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load persisted messages on mount, clean old sessions
  useEffect(() => {
    setMessages(loadMessages());
    cleanOldSessions();
  }, []);

  // Persist whenever messages change (skip initial empty state)
  const persistMessages = useCallback((msgs: ChatMessage[]) => {
    setMessages(msgs);
    if (msgs.length > 0) saveMessages(msgs);
  }, []);

  async function sendMessage(prompt: string, type?: string): Promise<ChatMessage | null> {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
    };

    persistMessages([...messages, userMessage]);
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

      const updated = [...messages, userMessage, assistantMessage];
      persistMessages(updated);
      return assistantMessage;
    } catch {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Failed to reach the agent. Please try again.',
        timestamp: new Date().toISOString(),
      };
      const updated = [...messages, userMessage, errorMessage];
      persistMessages(updated);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return { messages, isLoading, sendMessage };
}
