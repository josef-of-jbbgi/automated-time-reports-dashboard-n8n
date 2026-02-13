import { N8N } from './constants';

export async function callWebhook(
  endpoint: string,
  body: Record<string, unknown>
): Promise<unknown> {
  const url = `${N8N.BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`n8n webhook failed (${res.status}): ${text}`);
    }

    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}
