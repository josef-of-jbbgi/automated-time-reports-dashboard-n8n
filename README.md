# Journey — Automated Time Reports Dashboard

An AI-driven automation system that replaces manual daily time-in/time-out email reporting with an intelligent dashboard. Built with Next.js, Airtable, n8n, and Claude AI.

## Problem

Composing daily time-in and time-out emails manually takes 15-20 minutes each. The process involves recalling tasks, formatting updates, and sending structured reports to management — a repetitive workflow ripe for automation.

## Solution

Journey automates the entire daily reporting cycle:

- **Morning**: An AI agent drafts a time-in email from your planned tasks and carryovers
- **Throughout the day**: Log work via the dashboard prompt, quick-add tasks, or Claude Code CLI
- **Evening**: The agent compiles your actual accomplishments into a time-out email with plan-vs-actual comparison

You review, optionally edit, and send — all from a single dashboard.

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│  Next.js         │────▶│  Airtable    │◀────│  n8n         │
│  Dashboard       │     │  (4 tables)  │     │  AI Agent    │
│  (Frontend)      │     └──────────────┘     │  (5 paths)   │
└────────┬─────────┘                          └──────┬───────┘
         │                                           │
         │         ┌──────────────┐                  │
         └────────▶│  n8n Webhooks│◀─────────────────┘
                   └──────┬───────┘
                          │
                   ┌──────▼───────┐
                   │  Claude AI   │
                   │  + Gmail API │
                   └──────────────┘
```

**Components:**

| Component | Role |
|-----------|------|
| **Next.js Dashboard** | Single-page UI for reviewing drafts, managing tasks, sending emails |
| **Airtable** | Persistent storage — Tasks, Daily Logs, Midday Logs, Drafts |
| **n8n** | Workflow orchestration — 5 trigger paths (morning, midday, evening, send time-in, send time-out) |
| **Claude AI** | Email draft generation with layered context from project docs |
| **Gmail API** | Sends the final approved emails |

## Airtable Schema

Base ID: `appEqBkZc2EfCY5kj` | Timezone: `Asia/Manila`

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **Tasks** | Daily task tracking | Task Name, Status (To Do / In Progress / Done / Carried Over), Priority, Notes |
| **Daily Logs** | One record per workday | Date, Time In/Out, Status (Draft / Sent), Hours Worked |
| **Midday Logs** | Freeform updates throughout the day | Date, Prompt, Agent Response, Source (Dashboard / Claude Code) |
| **Drafts** | AI-generated email versions | Title, Type (Time-In / Time-Out), Version (A / B / C), Body, Status (Draft / Sent / Discarded), Reasoning |

## n8n Workflows

A single workflow with 5 independent trigger paths hosted on `journey.app.n8n.cloud`:

| Path | Trigger | What It Does |
|------|---------|--------------|
| **Morning Draft** | Schedule (5:30 AM) | Fetches tasks + carryovers, generates 3 time-in draft versions |
| **Midday Agent** | Webhook POST | Processes dashboard/CLI prompts, logs to Midday Logs, returns AI response |
| **Evening Draft** | Schedule (5:00 PM) | Compiles day's work, marks task statuses, generates 3 time-out draft versions |
| **Send Time-In** | Webhook POST | Sends selected draft via Gmail, marks others as discarded, updates Daily Log |
| **Send Time-Out** | Webhook POST | Same as Send Time-In, plus calculates hours worked |

## Dashboard Features

- **Header** — Date display, greeting, connection status indicators
- **Draft Panels** — Time-In and Time-Out sections with version dropdown (A/B/C), preview, inline edit, and one-click send
- **Task List** — Grouped by status, inline status cycling (To Do → In Progress → Done), quick-add with Airtable dual-write
- **Prompt Window** — Chat-style interface to the n8n midday agent for logging updates mid-day
- **Time Tracker** — Visual indicator showing elapsed work time and current state
- **Offline Banner** — Automatic detection and notification of connectivity issues

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, SWR
- **Backend**: Next.js API routes (proxy to Airtable + n8n webhooks)
- **Database**: Airtable
- **Automation**: n8n (self-hosted cloud)
- **AI**: Claude API (via n8n AI Agent node)
- **Email**: Gmail API (via n8n)
- **Testing**: Playwright (e2e)

## Getting Started

### Prerequisites

- Node.js 18+
- Airtable account with the configured base
- n8n instance with workflows deployed
- Gmail OAuth2 credentials (configured in n8n)

### Environment Variables

Create a `.env.local` file:

```env
AIRTABLE_PAT=your_airtable_personal_access_token
AIRTABLE_BASE_ID=appEqBkZc2EfCY5kj
N8N_BASE_URL=https://journey.app.n8n.cloud
N8N_MIDDAY_WEBHOOK_PATH=/webhook/midday-agent
N8N_SEND_TIME_IN_PATH=/webhook/send-time-in
N8N_SEND_TIME_OUT_PATH=/webhook/send-time-out
```

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Running Tests

```bash
npx playwright install
npx playwright test
```

## Project Structure

```
src/
├── app/
│   ├── api/                    # Server-side proxy routes
│   │   ├── tasks/              # Airtable Tasks CRUD
│   │   ├── daily-logs/         # Airtable Daily Logs
│   │   ├── midday-logs/        # Airtable Midday Logs
│   │   ├── drafts/             # Airtable Drafts
│   │   ├── send-time-in/       # n8n Send Time-In webhook
│   │   ├── send-time-out/      # n8n Send Time-Out webhook
│   │   └── midday-agent/       # n8n Midday Agent webhook
│   ├── globals.css             # Design tokens (dark theme)
│   ├── layout.tsx              # Root layout with providers
│   └── page.tsx                # Single-page dashboard
├── components/
│   ├── agent/                  # PromptWindow, AgentInput, AgentMessage
│   ├── drafts/                 # DraftPanel, DraftPreview, DraftActions
│   ├── layout/                 # Header, TimeTracker, OfflineBanner
│   ├── tasks/                  # TaskList, TaskRow, TaskQuickAdd
│   └── ui/                     # Button, Card, Badge, Modal, Toast, etc.
└── lib/
    ├── airtable.ts             # Airtable API client
    ├── n8n.ts                  # n8n webhook client
    ├── constants.ts            # All Airtable IDs and field mappings
    ├── types.ts                # TypeScript interfaces
    ├── utils.ts                # Shared utilities
    └── hooks/                  # SWR data-fetching hooks
        ├── useTasks.ts
        ├── useDailyLog.ts
        ├── useDrafts.ts
        ├── useMiddayLogs.ts
        └── useAgent.ts
```

## AI Draft Generation

The AI agent generates 3 email draft versions per cycle:

| Version | Style | Description |
|---------|-------|-------------|
| **A** | Concise Technical | Straightforward, minimal context |
| **B** | Contextual | Includes project context and reasoning |
| **C** | Detailed | Comprehensive with full technical detail |

**Time-In emails** use prose paragraphs (no bullets). **Time-Out emails** use structured headers with bullet points and Root Cause/Resolution sections where applicable.

## Data Integrity Rules

1. Never delete Airtable records — use status fields instead
2. Check-before-create to avoid duplicates
3. Dual-write tasks to both Airtable and Daily Log
4. All timestamps in `Asia/Manila` timezone
5. Carryover tasks create new records (not mutations)
6. Source field must accurately reflect origin (Dashboard / Claude Code / n8n Agent)

## License

Private — Internal use only.
