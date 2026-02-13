import { NextRequest, NextResponse } from 'next/server';
import { fetchRecords, createRecord, updateRecord } from '@/lib/airtable';
import { AIRTABLE } from '@/lib/constants';
import { Task } from '@/lib/types';

const TABLE = AIRTABLE.TABLES.TASKS;

function mapTask(record: { id: string; fields: Record<string, unknown> }): Task {
  const f = record.fields;
  return {
    id: record.id,
    taskName: (f['Task Name'] as string) || '',
    date: (f['Date'] as string) || '',
    source: (f['Source'] as Task['source']) || 'Manual',
    status: (f['Status'] as Task['status']) || 'To Do',
    priority: (f['Priority'] as Task['priority']) || 'Medium',
    approach: (f['Approach'] as string) || '',
    aiInsights: (f['AI Insights'] as string) || '',
    basecampId: (f['Basecamp ID'] as string) || '',
    completedAt: (f['Completed At'] as string) || null,
    createdAt: (f['Created At'] as string) || '',
    middayLogs: (f['Midday Logs'] as string[]) || [],
  };
}

export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get('date');
    if (!date) {
      return NextResponse.json({ error: 'date parameter required' }, { status: 400 });
    }

    const records = await fetchRecords(TABLE, {
      filterByFormula: `DATESTR({Date})='${date}'`,
    });

    const tasks = records.map(mapTask);
    return NextResponse.json(tasks);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, fields } = body as { id: string; fields: Record<string, unknown> };

    if (!id || !fields) {
      return NextResponse.json({ error: 'id and fields required' }, { status: 400 });
    }

    const record = await updateRecord(TABLE, id, fields);
    return NextResponse.json(mapTask(record));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskName, date, source, status, priority } = body as {
      taskName: string;
      date: string;
      source: string;
      status: string;
      priority: string;
    };

    if (!taskName || !date) {
      return NextResponse.json({ error: 'taskName and date required' }, { status: 400 });
    }

    const record = await createRecord(TABLE, {
      'Task Name': taskName,
      'Date': date,
      'Source': source || 'Dashboard',
      'Status': status || 'To Do',
      'Priority': priority || 'Medium',
      'Created At': new Date().toISOString(),
    });

    return NextResponse.json(mapTask(record));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
