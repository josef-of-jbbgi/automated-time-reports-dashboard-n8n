import { NextRequest, NextResponse } from 'next/server';
import { fetchRecords } from '@/lib/airtable';
import { AIRTABLE } from '@/lib/constants';
import { DailyLog } from '@/lib/types';

const TABLE = AIRTABLE.TABLES.DAILY_LOGS;

function mapDailyLog(record: { id: string; fields: Record<string, unknown> }): DailyLog {
  const f = record.fields;
  return {
    id: record.id,
    logDate: (f['Log Date'] as string) || '',
    timeInSentAt: (f['Time In Sent At'] as string) || null,
    timeOutSentAt: (f['Time Out Sent At'] as string) || null,
    timeInEmailBody: (f['Time In Email Body'] as string) || '',
    timeOutEmailBody: (f['Time Out Email Body'] as string) || '',
    dayStatus: (f['Day Status'] as DailyLog['dayStatus']) || 'Not Started',
    totalHours: (f['Total Hours'] as number) ?? null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get('date');
    if (!date) {
      return NextResponse.json({ error: 'date parameter required' }, { status: 400 });
    }

    const records = await fetchRecords(TABLE, {
      filterByFormula: `DATESTR({Log Date})='${date}'`,
      maxRecords: 1,
    });

    if (records.length === 0) {
      return NextResponse.json(null);
    }

    return NextResponse.json(mapDailyLog(records[0]));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
