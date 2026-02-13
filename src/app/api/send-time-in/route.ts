import { NextRequest, NextResponse } from 'next/server';
import { callWebhook } from '@/lib/n8n';
import { N8N } from '@/lib/constants';
import { SendTimeInResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { draftRecordId } = body as { draftRecordId: string };

    if (!draftRecordId) {
      return NextResponse.json({ error: 'draftRecordId required' }, { status: 400 });
    }

    const result = await callWebhook(N8N.ENDPOINTS.SEND_TIME_IN, { draftRecordId });
    return NextResponse.json(result as SendTimeInResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
