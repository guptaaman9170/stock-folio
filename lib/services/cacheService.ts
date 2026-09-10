interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class CacheService {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTTLMs: number;

  constructor() {
    const ttlSeconds = parseInt(process.env.CACHE_TTL_SECONDS || '30', 10);
    this.defaultTTLMs = ttlSeconds * 1000;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.defaultTTLMs;
    if (isExpired) {
      return null;
    }

    return entry.data;
  }

  // Get stale cached data when upstream request fails (Graceful degradation)
  getStale<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    return entry ? entry.data : null;
  }

  set<T>(key: string, data: T, customTTLMs?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global singleton instance for server runtime
const globalForCache = globalThis as unknown as { appCache?: CacheService };
export const appCache = globalForCache.appCache || new CacheService();
if (process.env.NODE_ENV !== 'production') globalForCache.appCache = appCache;
