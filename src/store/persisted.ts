import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

// A tiny observable store persisted to AsyncStorage as JSON. Writes are
// debounced (rapid dhikr taps would otherwise write on every tap) and can be
// flushed explicitly when the app goes to the background.

export type PersistedStore<T> = {
  key: string;
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
  load: () => Promise<T>;
  flush: () => Promise<void>;
};

type Options<T> = {
  /** Normalises whatever was on disk (older shapes, partial objects). */
  sanitize: (raw: unknown) => T;
  /** Called when nothing is stored under `key` yet — e.g. to import v1 data. */
  migrate?: () => Promise<T | null>;
  debounceMs?: number;
};

const registry: PersistedStore<unknown>[] = [];

export function createPersistedStore<T>(key: string, initial: T, opts: Options<T>): PersistedStore<T> {
  let state = initial;
  let loading: Promise<T> | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const listeners = new Set<() => void>();

  const write = () => {
    timer = null;
    return AsyncStorage.setItem(key, JSON.stringify(state)).catch(() => {});
  };

  const store: PersistedStore<T> = {
    key,
    get: () => state,
    set(next) {
      state = typeof next === 'function' ? (next as (p: T) => T)(state) : next;
      listeners.forEach(l => l());
      if (timer) clearTimeout(timer);
      timer = setTimeout(write, opts.debounceMs ?? 250);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    load() {
      loading ??= (async () => {
        try {
          const raw = await AsyncStorage.getItem(key);
          if (raw != null) {
            state = opts.sanitize(JSON.parse(raw));
          } else if (opts.migrate) {
            const migrated = await opts.migrate();
            if (migrated) {
              state = opts.sanitize(migrated);
              await AsyncStorage.setItem(key, JSON.stringify(state));
            }
          }
        } catch {
          // Corrupt or unreadable — keep defaults rather than crash.
        }
        listeners.forEach(l => l());
        return state;
      })();
      return loading;
    },
    async flush() {
      if (timer) {
        clearTimeout(timer);
        await write();
      }
    },
  };
  registry.push(store as PersistedStore<unknown>);
  return store;
}

export function flushAllStores(): Promise<void> {
  return Promise.all(registry.map(s => s.flush())).then(() => {});
}

export function useStore<T>(store: PersistedStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
