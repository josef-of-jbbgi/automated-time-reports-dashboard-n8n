import useSWR from 'swr';
import { Draft } from '../types';
import { getTodayDate } from '../utils';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useDrafts(date?: string, type?: 'Time-In' | 'Time-Out') {
  const d = date || getTodayDate();
  const params = new URLSearchParams({ date: d });
  if (type) params.set('type', type);

  const { data, error, isLoading, mutate } = useSWR<Draft[]>(
    `/api/drafts?${params.toString()}`,
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );
  return { drafts: data || [], error, isLoading, mutate };
}
