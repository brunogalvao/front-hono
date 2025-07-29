import { useState, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

export function useCache<T>(options: CacheOptions = {}) {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options; // Default 5 minutes
  const [cache, setCache] = useState<Map<string, CacheEntry<T>>>(new Map());
  const cleanupRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const cleanup = useCallback(() => {
    const now = Date.now();
    setCache((prev) => {
      const newCache = new Map();
      for (const [key, entry] of prev) {
        if (now - entry.timestamp < entry.ttl) {
          newCache.set(key, entry);
        }
      }
      return newCache;
    });
  }, []);

  const get = useCallback(
    (key: string): T | null => {
      const entry = cache.get(key);
      if (!entry) return null;

      const now = Date.now();
      if (now - entry.timestamp > entry.ttl) {
        setCache((prev) => {
          const newCache = new Map(prev);
          newCache.delete(key);
          return newCache;
        });
        return null;
      }

      return entry.data;
    },
    [cache, ttl]
  );

  const set = useCallback(
    (key: string, data: T, customTtl?: number) => {
      setCache((prev) => {
        const newCache = new Map(prev);

        // Remove oldest entries if cache is full
        if (newCache.size >= maxSize) {
          const entries = Array.from(newCache.entries());
          entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
          const toRemove = entries.slice(0, entries.length - maxSize + 1);
          toRemove.forEach(([key]) => newCache.delete(key));
        }

        newCache.set(key, {
          data,
          timestamp: Date.now(),
          ttl: customTtl || ttl,
        });

        return newCache;
      });

      // Schedule cleanup
      if (cleanupRef.current) {
        clearTimeout(cleanupRef.current);
      }
      cleanupRef.current = setTimeout(cleanup, ttl);
    },
    [ttl, maxSize, cleanup]
  );

  const remove = useCallback((key: string) => {
    setCache((prev) => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
  }, []);

  const clear = useCallback(() => {
    setCache(new Map());
  }, []);

  return { get, set, remove, clear, size: cache.size };
}
