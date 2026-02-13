'use client';

import { useState } from 'react';
import { getTodayDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface TaskQuickAddProps {
  onTaskAdded: () => void;
  onMiddayLogAdded: () => void;
}

export default function TaskQuickAdd({ onTaskAdded, onMiddayLogAdded }: TaskQuickAddProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  async function handleSubmit() {
    if (!taskName.trim()) return;
    setIsSubmitting(true);

    try {
      // Dual-write: create task + midday log
      const [taskRes, logRes] = await Promise.all([
        fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskName: taskName.trim(),
            date: getTodayDate(),
            source: 'Dashboard',
            status: 'To Do',
            priority,
          }),
        }),
        fetch('/api/midday-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entryTitle: taskName.trim(),
            details: 'Added via dashboard',
            source: 'Dashboard',
          }),
        }),
      ]);

      if (!taskRes.ok || !logRes.ok) throw new Error('Failed to add');

      toast('Task added', 'success');
      setTaskName('');
      setPriority('Medium');
      setIsOpen(false);
      onTaskAdded();
      onMiddayLogAdded();
    } catch {
      toast('Failed to add task', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full text-left text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] py-2 px-1 transition-colors"
      >
        + Add task or note
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 py-2 px-1">
      <input
        type="text"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        placeholder="Task name..."
        className="flex-1 bg-[var(--bg-hover)] border border-[var(--border)] rounded-md px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
        autoFocus
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="bg-[var(--bg-hover)] border border-[var(--border)] rounded-md px-2 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none"
      >
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
      <Button size="sm" onClick={handleSubmit} loading={isSubmitting} disabled={!taskName.trim()}>
        Add
      </Button>
      <Button variant="ghost" size="sm" onClick={() => { setIsOpen(false); setTaskName(''); }}>
        Cancel
      </Button>
    </div>
  );
}
