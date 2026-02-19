import useSWR from 'swr';
import { DailyLog } from '../types';
import { getTodayDate } from '../utils';
import { swrDefaults, markSynced } from '../swr-config';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useDailyLog(date?: string) {
  const d = date || getTodayDate();
  const { data, error, isLoading, mutate } = useSWR<DailyLog | null>(
    `/api/daily-logs?date=${d}`,
    fetcher,
    { ...swrDefaults, refreshInterval: 30000, onSuccess: markSynced }
  );
  return { dailyLog: data ?? null, error, isLoading, mutate };
}
