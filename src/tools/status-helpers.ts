import type { LifecycleStatus, StatusObject } from '../types.js';

export function isStatusObject(status: LifecycleStatus): status is StatusObject {
  return typeof status === 'object' && status !== null && 'default' in status;
}

export function statusMatchesExact(status: LifecycleStatus | undefined, filter: string): boolean {
  if (status === undefined) return false;
  if (typeof status === 'string') return status === filter;
  if (!isStatusObject(status)) return false;
  if (status.default === filter) return true;
  if (status.platforms) {
    return Object.values(status.platforms).some((p) => p.stage === filter);
  }
  return false;
}

export function statusMatchesFuzzy(status: LifecycleStatus | undefined, query: string): boolean {
  if (status === undefined) return false;
  const q = query.toLowerCase();
  if (typeof status === 'string') return status.toLowerCase().includes(q);
  if (!isStatusObject(status)) return false;
  if (status.default.toLowerCase().includes(q)) return true;
  if (status.platforms) {
    return Object.entries(status.platforms).some(
      ([key, p]) => key.toLowerCase().includes(q) || p.stage.toLowerCase().includes(q),
    );
  }
  return false;
}
