import { useEffect, useState, useCallback } from 'react';

interface HybridOptions<T> {
  fetcher?: () => Promise<T>;
  local: () => T;
  auto?: boolean; // default true
  deps?: any[];
}

export function useHybridResource<T>({ fetcher, local, auto = true, deps = [] }: HybridOptions<T>) {
  const USE_API = (import.meta as any).env?.VITE_USE_API === 'true';
  const [data, setData] = useState<T>(() => local());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_API && fetcher) {
        const remote = await fetcher();
        setData(remote);
      } else {
        setData(local());
      }
    } catch (e: any) {
      setData(local());
      setError(e?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [USE_API, fetcher, local]);

  const backgroundSync = useCallback(async () => {
    try {
      if (USE_API && fetcher) {
        const remote = await fetcher();
        setData(remote);
      } else {
        setData(local());
      }
    } catch {
      // silencioso
    }
  }, [USE_API, fetcher, local]);

  useEffect(() => {
    if (auto) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, version, ...deps]);

  const bump = () => setVersion(v => v + 1);

  const mutate = useCallback((next: T | ((prev: T) => T)) => {
    setData(prev => typeof next === 'function' ? (next as any)(prev) : next);
  }, []);

  return { data, loading, error, reload, refresh: bump, mutate, backgroundSync } as const;
}
