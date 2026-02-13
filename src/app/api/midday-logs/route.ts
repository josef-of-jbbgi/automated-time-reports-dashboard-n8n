import { NextRequest, NextResponse } from 'next/server';
import { fetchRecords, createRecord } from '@/lib/airtable';
import { AIRTABLE } from '@/lib/constants';
import { MiddayLog } from '@/lib/types';
import { getTodayDate } from '@/lib/utils';

const TABLE = AIRTABLE.TABLES.MIDDAY_LOGS;

function mapMiddayLog(record: { id: string; fields: Record<string, unknown> }): MiddayLog {
  const f = record.fields;
  return {
    id: record.id,
    entryTitle: (f['Entry Title'] as string) || '',
    date: (f['Date'] as string) || '',
    loggedAt: (f['Logged At'] as string) || '',
    details: (f['Details'] as string) || '',
    source: (f['Source'] as MiddayLog['source']) || 'Dashboard',
    relatedTask: (f['Related Task'] as string[]) || [],
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
      sort: [{ field: 'Logged At', direction: 'asc' }],
    });

    const logs = records.map(mapMiddayLog);
    return NextResponse.json(logs);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entryTitle, details, source, relatedTask } = body as {
      entryTitle: string;
      details: string;
      source: string;
      relatedTask?: string[];
    };

    if (!entryTitle) {
      return NextResponse.json({ error: 'entryTitle required' }, { status: 400 });
    }

    const fields: Record<string, unknown> = {
      'Entry Title': entryTitle,
      'Date': getTodayDate(),
      'Logged At': new Date().toISOString(),
      'Details': details || '',
      'Source': source || 'Dashboard',
    };

    if (relatedTask && relatedTask.length > 0) {
      fields['Related Task'] = relatedTask;
    }

    const record = await createRecord(TABLE, fields);
    return NextResponse.json(mapMiddayLog(record));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
