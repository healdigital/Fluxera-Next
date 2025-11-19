/**
 * Dashboard Performance Monitoring Utility
 * Tracks and logs performance metrics for dashboard operations
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

class DashboardPerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 100;

  /**
   * Start timing an operation
   */
  startTimer(name: string): () => void {
    const startTime = performance.now();

    return (metadata?: Record<string, unknown>) => {
      const duration = performance.now() - startTime;

      this.recordMetric({
        name,
        duration,
        timestamp: Date.now(),
        metadata,
      });

      // Log slow operations (> 1 second)
      if (duration > 1000) {
        console.warn(
          `[Performance] Slow operation detected: ${name} took ${duration.toFixed(2)}ms`,
          metadata,
        );
      }
    };
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }
  }

  /**
   * Get performance statistics
   */
  getStats(operationName?: string): {
    count: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    p95Duration: number;
  } {
    const filteredMetrics = operationName
      ? this.metrics.filter((m) => m.name === operationName)
      : this.metrics;

    if (filteredMetrics.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        p95Duration: 0,
      };
    }

    const durations = filteredMetrics
      .map((m) => m.duration)
      .sort((a, b) => a - b);
    const sum = durations.reduce((acc, d) => acc + d, 0);
    const p95Index = Math.floor(durations.length * 0.95);

    return {
      count: filteredMetrics.length,
      avgDuration: sum / durations.length,
      minDuration: durations[0] ?? 0,
      maxDuration: durations[durations.length - 1] ?? 0,
      p95Duration: durations[p95Index] ?? 0,
    };
  }

  /**
   * Get all recorded metrics
   */
  getAllMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Log performance summary
   */
  logSummary(): void {
    const operations = new Set(this.metrics.map((m) => m.name));

    console.group('[Dashboard Performance Summary]');

    for (const operation of operations) {
      const stats = this.getStats(operation);
      console.log(`${operation}:`, {
        count: stats.count,
        avg: `${stats.avgDuration.toFixed(2)}ms`,
        min: `${stats.minDuration.toFixed(2)}ms`,
        max: `${stats.maxDuration.toFixed(2)}ms`,
        p95: `${stats.p95Duration.toFixed(2)}ms`,
      });
    }

    console.groupEnd();
  }
}

// Singleton instance
export const performanceMonitor = new DashboardPerformanceMonitor();

/**
 * Higher-order function to measure async function performance
 */
export function measurePerformance<
  T extends (...args: unknown[]) => Promise<unknown>,
>(fn: T, operationName: string): T {
  return (async (...args: unknown[]) => {
    const endTimer = performanceMonitor.startTimer(operationName);

    try {
      const result = await fn(...args);
      endTimer();
      return result;
    } catch (error) {
      endTimer();
      throw error;
    }
  }) as T;
}

/**
 * React hook for measuring component render performance
 */
export function usePerformanceMonitor(componentName: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;

    if (duration > 100) {
      console.warn(
        `[Performance] Slow render: ${componentName} took ${duration.toFixed(2)}ms`,
      );
    }
  };
}
