import { SWRConfiguration } from 'swr';

/** Shared SWR options: stop polling when tab is hidden, dedupe rapid calls */
export const swrDefaults: SWRConfiguration = {
  revalidateOnFocus: true,
  refreshWhenHidden: false,
  refreshWhenOffline: false,
  dedupingInterval: 5000,
};

// ── Lightweight last-synced tracker ──
let _lastSynced = Date.now();
const _listeners = new Set<() => void>();

export function markSynced() {
  _lastSynced = Date.now();
  _listeners.forEach((fn) => fn());
}

export function getLastSynced() {
  return _lastSynced;
}

export function subscribeLastSynced(fn: () => void) {
  _listeners.add(fn);
  return () => { _listeners.delete(fn); };
}
