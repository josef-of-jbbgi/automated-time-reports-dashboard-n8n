import { N8N } from './constants';

// Midday agent runs AI + multiple Airtable tool calls (~20-30s).
// Send flows are faster (~10s). Default 60s covers both with margin.
const WEBHOOK_TIMEOUT_MS: Record<string, number> = {
  '/midday-agent': 60_000,
};
const DEFAULT_TIMEOUT_MS = 30_000;

export async function callWebhook(
  endpoint: string,
  body: Record<string, unknown>
): Promise<unknown> {
  const url = `${N8N.BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const ms = WEBHOOK_TIMEOUT_MS[endpoint] ?? DEFAULT_TIMEOUT_MS;
  const timeout = setTimeout(() => controller.abort(), ms);

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
