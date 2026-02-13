'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface ToastData {
  id: string;
  message: string;
  variant: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastData['variant']) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const toast = useCallback((message: string, variant: ToastData['variant'] = 'info') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, variant }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <ToastItem key={t.id} data={t} onDismiss={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ data, onDismiss }: { data: ToastData; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const variantStyles = {
    success: 'border-green-600 bg-green-950 text-green-300',
    error: 'border-red-600 bg-red-950 text-red-300',
    info: 'border-blue-600 bg-blue-950 text-blue-300',
  };

  return (
    <div
      className={`
        rounded-lg border px-4 py-3 text-sm shadow-lg
        animate-in slide-in-from-right
        ${variantStyles[data.variant]}
      `}
    >
      {data.message}
    </div>
  );
}
