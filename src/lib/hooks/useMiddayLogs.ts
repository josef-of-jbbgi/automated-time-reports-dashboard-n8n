import useSWR from 'swr';
import { MiddayLog } from '../types';
import { getTodayDate } from '../utils';
import { swrDefaults, markSynced } from '../swr-config';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useMiddayLogs(date?: string) {
  const d = date || getTodayDate();
  const { data, error, isLoading, mutate } = useSWR<MiddayLog[]>(
    `/api/midday-logs?date=${d}`,
    fetcher,
    { ...swrDefaults, refreshInterval: 60000, onSuccess: markSynced }
  );
  return { middayLogs: data || [], error, isLoading, mutate };
}
