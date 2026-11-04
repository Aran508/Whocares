import type { ProgressState } from '../types';

/**
 * Persistence adapter. The app talks only to this interface, so a database
 * (REST API, Supabase, IndexedDB…) can replace localStorage later without
 * touching any component.
 */
export interface StorageAdapter {
  load(): ProgressState | null;
  save(state: ProgressState): void;
  clear(): void;
}

const KEY = 'industrial-mastery:progress:v1';

export const localStorageAdapter: StorageAdapter = {
  load() {
    try {
      const raw = window.localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as ProgressState) : null;
    } catch {
      return null;
    }
  },
  save(state) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked — app keeps working in memory */
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },
};

/** Small generic key/value store for per-feature data (template edits, etc.). */
export const kv = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = window.localStorage.getItem('industrial-mastery:' + key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T) {
    try {
      window.localStorage.setItem('industrial-mastery:' + key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  },
  remove(key: string) {
    try {
      window.localStorage.removeItem('industrial-mastery:' + key);
    } catch {
      /* ignore */
    }
  },
};
