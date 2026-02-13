'use client';

import Header from '@/components/layout/Header';
import TimeTracker from '@/components/layout/TimeTracker';
import DraftPanel from '@/components/drafts/DraftPanel';
import TaskList from '@/components/tasks/TaskList';
import PromptWindow from '@/components/agent/PromptWindow';

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Header />
        <DraftPanel type="Time-In" />
        <TaskList />
        <DraftPanel type="Time-Out" />
        <PromptWindow />
        <TimeTracker />
      </div>
    </main>
  );
}
