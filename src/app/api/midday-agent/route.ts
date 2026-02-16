import { NextRequest, NextResponse } from 'next/server';
import { callWebhook } from '@/lib/n8n';
import { N8N } from '@/lib/constants';
import { MiddayAgentResponse } from '@/lib/types';

interface FilePayload {
  name: string;
  type: string;
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, type, file } = body as {
      prompt: string;
      type?: string;
      file?: FilePayload;
    };

    if (!prompt && !file) {
      return NextResponse.json({ error: 'prompt or file required' }, { status: 400 });
    }

    const payload: Record<string, unknown> = { prompt: prompt || '' };
    if (type) payload.type = type;
    if (file) {
      payload.file = {
        name: file.name,
        type: file.type,
        content: file.content,
      };
    }

    const result = await callWebhook(N8N.ENDPOINTS.MIDDAY_AGENT, payload);
    // n8n Respond node returns array — extract the first item
    const data = Array.isArray(result) ? result[0] : result;
    return NextResponse.json(data as MiddayAgentResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
