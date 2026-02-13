export const AIRTABLE = {
  BASE_ID: process.env.AIRTABLE_BASE_ID || 'appEqBkZc2EfCY5kj',
  TABLES: {
    TASKS:       'tblgcTijaYRdLG3Wn',
    DAILY_LOGS:  'tblqEHZcreZ0DzFJo',
    MIDDAY_LOGS: 'tblvjUYwfzMxQrKHL',
    DRAFTS:      'tblkBZuG4hP48JGvz',
  },
  FIELDS: {
    // Tasks table
    TASK_NAME:        'fldEVYEXJh9U8YNs7',
    TASK_DATE:        'fldEnhUiw9j5uE1E3',
    TASK_SOURCE:      'fldaf8abCKs4TvnUh',
    TASK_STATUS:      'fldNGvkFsioBPyre0',
    TASK_PRIORITY:    'fldoC1QDbESSbpnGw',
    TASK_APPROACH:    'fldwwIUi6NqN8ZcpE',
    TASK_AI_INSIGHTS: 'fldgiVysRdDnODksb',
    TASK_BASECAMP_ID: 'fldX3JzRxf7DFPnpk',
    TASK_COMPLETED:   'fldsRCVLoLFlzdKqJ',
    TASK_CREATED:     'fld1WRTOnaHavgSNq',
    TASK_MIDDAY_LOGS: 'fld5jMCpEcrE2DIQt',
    // Daily Logs table
    LOG_DATE:            'fld479cMLcofUc5wP',
    TIME_IN_SENT_AT:     'fldHrNCwrC8YtibrZ',
    TIME_OUT_SENT_AT:    'fldtHeZjDdc4ig8qG',
    TIME_IN_EMAIL_BODY:  'fldIPNkcjJWVnPqcq',
    TIME_OUT_EMAIL_BODY: 'fldnkiJSR2TD9TMwe',
    DAY_STATUS:          'fld8WE7ccUnXwaMzm',
    TOTAL_HOURS:         'fldEMOAABTZrYBjcX',
    // Midday Logs table
    ENTRY_TITLE:  'fldgBbZbbKg5Bn1Us',
    ML_DATE:      'fldNgc2hzlUNQ5ulf',
    LOGGED_AT:    'fldukdorQDmIMDeJD',
    DETAILS:      'fldemCZBhx04yNuvQ',
    ML_SOURCE:    'fldWWyp2ak6ba8AiL',
    RELATED_TASK: 'fldmYq5drPcowhQTt',
    // Drafts table
    DRAFT_TITLE:   'fldBqCHloqIQw8IO4',
    DRAFT_TYPE:    'fld2QopW811p0fR9M',
    DRAFT_DATE:    'fldFRHgugrMiY9b6k',
    VERSION_LABEL: 'flduoYeRf0hypBaQ5',
    DRAFT_BODY:    'fld0bNTtypSlOBh28',
    REASONING:     'fldkzKLpq5BfUdCtO',
    DRAFT_STATUS:  'fldn74sps9b7AqvEX',
    GENERATED_AT:  'fldUaWtqYnybDnib5',
    GENERATED_BY:  'fldxqcy7rUX9GokRJ',
  },
} as const;

export const N8N = {
  BASE_URL: process.env.N8N_WEBHOOK_BASE || 'https://journey.app.n8n.cloud/webhook',
  ENDPOINTS: {
    SEND_TIME_IN:  '/send-time-in',
    SEND_TIME_OUT: '/send-time-out',
    MIDDAY_AGENT:  '/midday-agent',
  },
} as const;
