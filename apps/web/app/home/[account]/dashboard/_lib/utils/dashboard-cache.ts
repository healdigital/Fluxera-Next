/**
 * Dashboard Data Cache Utility
 * Implements in-memory caching with TTL for frequently accessed dashboard data
 * Reduces database load and improves response times
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class DashboardCache {
  private cache: Map<string, CacheEntry<unknown>>;
  private readonly DEFAULT_TTL = 30000; // 30 seconds

  constructor() {
    this.cache = new Map();
  }

  /**
   * Get data from cache if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set data in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.DEFAULT_TTL,
    });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Clear specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      const isExpired = now - entry.timestamp > entry.ttl;

      if (isExpired) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    keys: string[];
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
const dashboardCache = new DashboardCache();

// Clear expired entries every minute
if (typeof window !== 'undefined') {
  setInterval(() => {
    dashboardCache.clearExpired();
  }, 60000);
}

export { dashboardCache };

/**
 * Cache key generators for consistent cache keys
 */
export const CacheKeys = {
  teamMetrics: (accountSlug: string) => `team-metrics:${accountSlug}`,
  assetStatus: (accountSlug: string) => `asset-status:${accountSlug}`,
  trends: (accountSlug: string, metricType: string, timeRange: string) =>
    `trends:${accountSlug}:${metricType}:${timeRange}`,
  widgets: (accountSlug: string, userId: string) =>
    `widgets:${accountSlug}:${userId}`,
  alerts: (accountSlug: string) => `alerts:${accountSlug}`,
  adminMetrics: () => 'admin-metrics',
  accountActivity: (limit: number, offset: number) =>
    `account-activity:${limit}:${offset}`,
};
