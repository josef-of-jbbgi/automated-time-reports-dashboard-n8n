'use client';
import { createContext, useContext, useState, useCallback } from 'react';

export type AgentTarget = 'tasks' | 'time-in' | 'time-out';

interface AgentContextValue {
  processingTargets: Set<AgentTarget>;
  startProcessing: (targets: Set<AgentTarget>) => void;
  clearProcessing: () => void;
}

const EMPTY_SET = new Set<AgentTarget>();

const AgentContext = createContext<AgentContextValue>({
  processingTargets: EMPTY_SET,
  startProcessing: () => {},
  clearProcessing: () => {},
});

export function useAgentStatus() {
  return useContext(AgentContext);
}

const TASK_PATTERN = /\b(task|to.?do|add|status|priorit|carr(y|ied).?over|done|in.?progress|basecamp)\b/i;
const TI_PATTERN = /\b(time.?in|ti\s+(report|draft)|morning)\b/i;
const TO_PATTERN = /\b(time.?out|to\s+(report|draft)|evening)\b/i;
const DRAFT_PATTERN = /\b(draft|re.?draft|rewrite|re.?write|email)\b/i;

export function classifyPrompt(prompt: string): Set<AgentTarget> {
  const targets = new Set<AgentTarget>();

  if (TASK_PATTERN.test(prompt)) targets.add('tasks');
  if (TI_PATTERN.test(prompt)) targets.add('time-in');
  if (TO_PATTERN.test(prompt)) targets.add('time-out');

  // "draft" / "email" without a specific TI/TO qualifier → both panels
  if (DRAFT_PATTERN.test(prompt) && !targets.has('time-in') && !targets.has('time-out')) {
    targets.add('time-in');
    targets.add('time-out');
  }

  // Fallback: ambiguous prompt → all three
  if (targets.size === 0) {
    targets.add('tasks');
    targets.add('time-in');
    targets.add('time-out');
  }

  return targets;
}

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [processingTargets, setProcessingTargets] = useState<Set<AgentTarget>>(EMPTY_SET);
  const startProcessing = useCallback((targets: Set<AgentTarget>) => setProcessingTargets(targets), []);
  const clearProcessing = useCallback(() => setProcessingTargets(EMPTY_SET), []);
  return (
    <AgentContext.Provider value={{ processingTargets, startProcessing, clearProcessing }}>
      {children}
    </AgentContext.Provider>
  );
}
