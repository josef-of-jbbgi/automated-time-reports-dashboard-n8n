import { NextRequest, NextResponse } from 'next/server';
import { callWebhook } from '@/lib/n8n';
import { N8N } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { draftRecordId } = body as { draftRecordId: string };

    if (!draftRecordId) {
      return NextResponse.json({ error: 'draftRecordId required' }, { status: 400 });
    }

    // n8n webhook responds immediately; email sends in the background
    await callWebhook(N8N.ENDPOINTS.SEND_TIME_IN, { draftRecordId });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
