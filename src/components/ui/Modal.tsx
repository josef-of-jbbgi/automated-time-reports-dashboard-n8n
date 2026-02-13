'use client';

import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h3>
        <div className="text-[var(--text-secondary)] text-sm mb-6">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3">{footer}</div>
        )}
      </div>
    </div>
  );
}
