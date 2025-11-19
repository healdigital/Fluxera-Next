'use client';

import dynamic from 'next/dynamic';

import { TrendChartWidgetSkeleton } from './trend-chart-widget';

/**
 * Lazy-loaded Trend Chart Widget
 * Uses dynamic import to code-split the recharts library
 * This reduces the initial bundle size significantly
 */
export const TrendChartWidget = dynamic(
  () =>
    import('./trend-chart-widget').then((mod) => ({
      default: mod.TrendChartWidget,
    })),
  {
    loading: () => <TrendChartWidgetSkeleton />,
    ssr: false,
  },
);
