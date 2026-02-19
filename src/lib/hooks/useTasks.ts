import useSWR from 'swr';
import { Task } from '../types';
import { getTodayDate } from '../utils';
import { swrDefaults, markSynced } from '../swr-config';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useTasks(date?: string) {
  const d = date || getTodayDate();
  const { data, error, isLoading, mutate } = useSWR<Task[]>(
    `/api/tasks?date=${d}`,
    fetcher,
    { ...swrDefaults, refreshInterval: 60000, onSuccess: markSynced }
  );
  return { tasks: data || [], error, isLoading, mutate };
}
