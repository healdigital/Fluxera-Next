/**
 * Performance monitoring utilities
 * Provides tools for measuring and tracking application performance
 */

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetIdOrEventName: string,
      configOrParams?: Record<string, unknown>,
    ) => void;
  }
}

/**
 * Measures the execution time of a function
 * Logs the duration to console and can optionally send to analytics
 *
 * @param name - Name of the operation being measured
 * @param fn - Function to measure (can be sync or async)
 * @returns The result of the function
 *
 * @example
 * ```typescript
 * // Synchronous operation
 * const result = measurePerformance('data-processing', () => {
 *   return processData(data);
 * });
 *
 * // Asynchronous operation
 * const result = await measurePerformance('api-call', async () => {
 *   return await fetchData();
 * });
 * ```
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>,
): T | Promise<T> {
  const start = performance.now();

  const result = fn();

  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = performance.now() - start;
      logPerformance(name, duration);
    }) as Promise<T>;
  }

  const duration = performance.now() - start;
  logPerformance(name, duration);

  return result;
}

/**
 * Logs performance metrics
 * @param name - Operation name
 * @param duration - Duration in milliseconds
 */
function logPerformance(name: string, duration: number): void {
  const formattedDuration = duration.toFixed(2);

  // Always log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name}: ${formattedDuration}ms`);
  }

  // Log warnings for slow operations (>1000ms)
  if (duration > 1000) {
    console.warn(`[Performance Warning] ${name} took ${formattedDuration}ms`);
  }

  // Send to analytics in production (if available)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'performance_measure', {
      event_category: 'Performance',
      event_label: name,
      value: Math.round(duration),
      non_interaction: true,
    });
  }
}

/**
 * Wraps a promise with a timeout to prevent hanging operations
 * Useful for API calls, database queries, and other async operations
 *
 * @param promise - Promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param errorMessage - Custom error message if timeout occurs
 * @returns Promise that rejects if timeout is reached
 *
 * @example
 * ```typescript
 * // Prevent API call from hanging
 * const data = await withTimeout(
 *   fetch('/api/data'),
 *   5000,
 *   'API request timed out after 5 seconds'
 * );
 *
 * // Database query with timeout
 * const result = await withTimeout(
 *   client.from('assets').select('*'),
 *   3000
 * );
 * ```
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out',
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs),
  );

  return Promise.race([promise, timeout]);
}

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  page_load_time: number;
  time_to_interactive: number;
  first_contentful_paint: number;
  largest_contentful_paint: number;
  cumulative_layout_shift: number;
  first_input_delay: number;
}

/**
 * Page performance data
 */
export interface PagePerformance {
  url: string;
  metrics: PerformanceMetrics;
  timestamp: string;
  user_agent: string;
}

/**
 * Measures an async operation with automatic timeout
 * Combines measurePerformance and withTimeout for convenience
 *
 * @param name - Name of the operation
 * @param fn - Async function to measure
 * @param timeoutMs - Timeout in milliseconds (default: 10000)
 * @returns Promise with the result
 *
 * @example
 * ```typescript
 * const assets = await measureAsync(
 *   'load-assets',
 *   async () => {
 *     return await client.from('assets').select('*');
 *   },
 *   5000
 * );
 * ```
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  timeoutMs = 10000,
): Promise<T> {
  return measurePerformance(name, () =>
    withTimeout(fn(), timeoutMs, `${name} timed out after ${timeoutMs}ms`),
  ) as Promise<T>;
}

/**
 * Performance thresholds for different operation types
 */
export const PERFORMANCE_THRESHOLDS = {
  /** Database queries should complete within 1 second */
  DATABASE_QUERY: 1000,
  /** API calls should complete within 3 seconds */
  API_CALL: 3000,
  /** Page loads should complete within 2 seconds */
  PAGE_LOAD: 2000,
  /** Search operations should complete within 500ms */
  SEARCH: 500,
  /** Filter operations should complete within 300ms */
  FILTER: 300,
} as const;
