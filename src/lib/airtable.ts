import { AIRTABLE } from './constants';

export interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
  createdTime: string;
}

interface FetchOptions {
  filterByFormula?: string;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  maxRecords?: number;
}

const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE.BASE_ID}`;

function getHeaders(): Record<string, string> {
  const pat = process.env.AIRTABLE_PAT;
  if (!pat) throw new Error('AIRTABLE_PAT is not set');
  return {
    Authorization: `Bearer ${pat}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchRecords(
  tableId: string,
  options: FetchOptions = {}
): Promise<AirtableRecord[]> {
  const params = new URLSearchParams();
  if (options.filterByFormula) {
    params.set('filterByFormula', options.filterByFormula);
  }
  if (options.sort) {
    options.sort.forEach((s, i) => {
      params.set(`sort[${i}][field]`, s.field);
      params.set(`sort[${i}][direction]`, s.direction);
    });
  }
  if (options.maxRecords) {
    params.set('maxRecords', String(options.maxRecords));
  }

  const url = `${BASE_URL}/${tableId}?${params.toString()}`;
  const res = await fetch(url, { headers: getHeaders(), cache: 'no-store' });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable fetch failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data.records as AirtableRecord[];
}

export async function createRecord(
  tableId: string,
  fields: Record<string, unknown>
): Promise<AirtableRecord> {
  const url = `${BASE_URL}/${tableId}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable create failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data as AirtableRecord;
}

export async function updateRecord(
  tableId: string,
  recordId: string,
  fields: Record<string, unknown>
): Promise<AirtableRecord> {
  const url = `${BASE_URL}/${tableId}/${recordId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable update failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data as AirtableRecord;
}
