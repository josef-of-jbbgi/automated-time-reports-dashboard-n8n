// ─── Tasks (Airtable.md lines 28-40) ───
export interface Task {
  id: string;
  taskName: string;
  date: string;
  source: 'Basecamp' | 'Manual' | 'Claude Code' | 'Dashboard' | 'n8n Agent';
  status: 'To Do' | 'In Progress' | 'Done' | 'Carried Over';
  priority: 'High' | 'Medium' | 'Low';
  approach: string;
  aiInsights: string;
  basecampId: string;
  completedAt: string | null;
  createdAt: string;
  middayLogs: string[];
}

// ─── Daily Logs (Airtable.md lines 144-150) ───
export interface DailyLog {
  id: string;
  logDate: string;
  timeInSentAt: string | null;
  timeOutSentAt: string | null;
  timeInEmailBody: string;
  timeOutEmailBody: string;
  dayStatus: 'Not Started' | 'Timed In' | 'Timed Out' | 'Complete';
  totalHours: number | null;
}

// ─── Midday Logs (Airtable.md lines 209-216) ───
export interface MiddayLog {
  id: string;
  entryTitle: string;
  date: string;
  loggedAt: string;
  details: string;
  source: 'Claude Code' | 'Dashboard' | 'n8n Agent';
  relatedTask: string[];
}

// ─── Drafts (Airtable.md lines 270-280) ───
// NOTE: No "Subject" field — subject is computed at send time by n8n
export interface Draft {
  id: string;
  draftTitle: string;
  type: 'Time-In' | 'Time-Out';
  date: string;
  versionLabel: 'Version A' | 'Version B' | 'Version C';
  body: string;
  reasoning: string;
  draftStatus: 'Generated' | 'Selected' | 'Sent' | 'Discarded';
  generatedAt: string;
  generatedBy: 'n8n AI Agent' | 'Manual Edit';
}

// ─── Webhook Responses ───
export interface SendTimeInResponse {
  success: boolean;
  sentAt: string;
  subject: string;
}

export interface SendTimeOutResponse {
  success: boolean;
  sentAt: string;
  subject: string;
  totalHours: number;
}

export interface MiddayAgentResponse {
  message: string;
  draftsUpdated: boolean;
}

// ─── Webhook Request Bodies ───
export interface SendDraftRequest {
  draftRecordId: string;
}

export interface MiddayAgentRequest {
  prompt: string;
  type?: string;
}
