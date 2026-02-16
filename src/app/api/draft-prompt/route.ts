import { NextRequest, NextResponse } from 'next/server';
import { callWebhook } from '@/lib/n8n';
import { N8N } from '@/lib/constants';
import { PromptMessage } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { prompt, currentBody, type, history } = (await request.json()) as {
      prompt: string;
      currentBody: string;
      type: 'Time-In' | 'Time-Out';
      history: PromptMessage[];
    };

    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    // Build a structured prompt for the AI agent
    const conversationContext = history.length > 0
      ? `\n\nPrevious conversation:\n${history.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n')}`
      : '';

    const structuredPrompt = [
      `IMPORTANT: Do NOT use any tools. Do NOT read, update, create, or delete any Airtable records. Do NOT modify any database records. Your ONLY job is to return rewritten text.`,
      `\nYou are editing a ${type} email draft. Rewrite the ENTIRE email body based on the user's instruction.`,
      `Return ONLY the new email body in markdown — no explanation, no wrapping, no preamble.`,
      `\nCurrent email body:\n---\n${currentBody}\n---`,
      conversationContext,
      `\nUser instruction: ${prompt}`,
    ].join('\n');

    const result = await callWebhook(N8N.ENDPOINTS.MIDDAY_AGENT, {
      prompt: structuredPrompt,
      type: 'draft-edit',
    });

    const data = Array.isArray(result) ? result[0] : result;

    // The agent returns { message: string } — that message IS the new body
    const newBody = typeof data === 'object' && data !== null && 'message' in data
      ? (data as { message: string }).message
      : String(data);

    return NextResponse.json({ body: newBody });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
