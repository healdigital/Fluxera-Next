'use client';

import { useState } from 'react';

import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';

import type { DashboardAlert } from '../_lib/types/dashboard.types';

interface AlertCardProps {
  alert: DashboardAlert;
  onDismiss?: (alertId: string) => Promise<void>;
}

/**
 * Alert Card Component
 * Displays an individual alert with severity-based styling
 * Shows title, description, timestamp, and optional action button
 */
export function AlertCard({ alert, onDismiss }: AlertCardProps) {
  const [isDismissing, setIsDismissing] = useState(false);

  const handleDismiss = async () => {
    if (!onDismiss) return;

    setIsDismissing(true);
    try {
      await onDismiss(alert.id);
      // Keep isDismissing true since the alert will be removed from the list
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
      setIsDismissing(false);
    }
  };

  const severityConfig = getSeverityConfig(alert.severity);

  return (
    <Card
      className={`border-l-4 shadow-sm transition-opacity ${severityConfig.borderColor} ${
        isDismissing ? 'opacity-50' : ''
      }`}
      data-test={`alert-card-${alert.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Severity Icon */}
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${severityConfig.bgColor}`}
          >
            {severityConfig.icon}
          </div>

          {/* Alert Content */}
          <div className="flex-1 space-y-2">
            {/* Title and Dismiss Button */}
            <div className="flex items-start justify-between gap-2">
              <h4 className="leading-tight font-semibold">{alert.title}</h4>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={handleDismiss}
                  disabled={isDismissing}
                  aria-label="Dismiss alert"
                  data-test={`dismiss-alert-${alert.id}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm leading-relaxed">
              {alert.description}
            </p>

            {/* Footer: Timestamp and Action */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <time
                className="text-muted-foreground text-xs"
                dateTime={alert.created_at}
              >
                {formatTimestamp(alert.created_at)}
              </time>

              {alert.action_url && alert.action_label && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  asChild
                >
                  <a href={alert.action_url}>{alert.action_label}</a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Get severity-specific configuration for styling and icons
 */
function getSeverityConfig(severity: DashboardAlert['severity']) {
  switch (severity) {
    case 'critical':
      return {
        icon: (
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        ),
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        borderColor: 'border-l-red-600 dark:border-l-red-400',
      };
    case 'warning':
      return {
        icon: (
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        ),
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        borderColor: 'border-l-yellow-600 dark:border-l-yellow-400',
      };
    case 'info':
      return {
        icon: <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        borderColor: 'border-l-blue-600 dark:border-l-blue-400',
      };
    default:
      return {
        icon: <Info className="h-4 w-4 text-gray-600 dark:text-gray-400" />,
        bgColor: 'bg-gray-100 dark:bg-gray-900/30',
        borderColor: 'border-l-gray-600 dark:border-l-gray-400',
      };
  }
}

/**
 * Format timestamp for display
 * Shows relative time for recent alerts, absolute time for older ones
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Less than 1 minute
  if (diffInSeconds < 60) {
    return 'Just now';
  }

  // Less than 1 hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  // Less than 24 hours
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  // Less than 7 days
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  // Older than 7 days - show absolute date
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
