'use client';

import { useEffect, useRef, useState } from 'react';

import { DashboardWidgetSkeleton } from '../../_components/dashboard-widget-skeleton';

interface LazyWidgetLoaderProps {
  children: React.ReactNode;
  threshold?: number;
}

/**
 * Lazy Widget Loader Component
 * Implements Intersection Observer to lazy load widgets outside initial viewport
 * Improves initial page load performance by deferring non-visible widget rendering
 */
export function LazyWidgetLoader({
  children,
  threshold = 0.1,
}: LazyWidgetLoaderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasLoaded) {
            setIsVisible(true);
            setHasLoaded(true);
          }
        });
      },
      {
        threshold,
        rootMargin: '50px', // Start loading slightly before widget enters viewport
      },
    );

    const currentRef = containerRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, hasLoaded]);

  return (
    <div ref={containerRef} className="min-h-[200px]">
      {isVisible ? children : <DashboardWidgetSkeleton />}
    </div>
  );
}
