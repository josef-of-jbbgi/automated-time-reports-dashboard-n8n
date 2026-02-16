import { NextRequest, NextResponse } from 'next/server';
import { callWebhook } from '@/lib/n8n';
import { N8N } from '@/lib/constants';
import { MiddayAgentResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, type } = body as { prompt: string; type?: string };

    if (!prompt) {
      return NextResponse.json({ error: 'prompt required' }, { status: 400 });
    }

    const payload: Record<string, unknown> = { prompt };
    if (type) payload.type = type;

    const result = await callWebhook(N8N.ENDPOINTS.MIDDAY_AGENT, payload);
    // n8n Respond node returns array — extract the first item
    const data = Array.isArray(result) ? result[0] : result;
    return NextResponse.json(data as MiddayAgentResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
