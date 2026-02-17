'use client';
import { createContext, useContext, useState, useCallback } from 'react';

interface AgentContextValue {
  isProcessing: boolean;
  setProcessing: (v: boolean) => void;
}

const AgentContext = createContext<AgentContextValue>({
  isProcessing: false,
  setProcessing: () => {},
});

export function useAgentStatus() {
  return useContext(AgentContext);
}

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const setProcessing = useCallback((v: boolean) => setIsProcessing(v), []);
  return (
    <AgentContext.Provider value={{ isProcessing, setProcessing }}>
      {children}
    </AgentContext.Provider>
  );
}
