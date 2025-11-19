'use client';

import { useReportWebVitals } from 'next/web-vitals';

/**
 * Web Vitals tracking component
 * Monitors and reports Core Web Vitals metrics
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics service in production
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: Math.round(metric.value),
        rating: metric.rating,
        id: metric.id,
      });
    }
  });

  return null;
}
