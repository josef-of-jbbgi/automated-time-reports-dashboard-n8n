import useSWR from 'swr';
import { MiddayLog } from '../types';
import { getTodayDate } from '../utils';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useMiddayLogs(date?: string) {
  const d = date || getTodayDate();
  const { data, error, isLoading, mutate } = useSWR<MiddayLog[]>(
    `/api/midday-logs?date=${d}`,
    fetcher,
    { refreshInterval: 60000, revalidateOnFocus: true }
  );
  return { middayLogs: data || [], error, isLoading, mutate };
}
