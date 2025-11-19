'use client';

import { Badge } from '@kit/ui/badge';

interface ExpirationBadgeProps {
  daysUntilExpiry: number;
  isExpired: boolean;
}

export function ExpirationBadge({
  daysUntilExpiry,
  isExpired,
}: ExpirationBadgeProps) {
  // Determine status and styling based on expiration
  const getStatusConfig = () => {
    if (isExpired) {
      return {
        label: 'Expired',
        className:
          'text-red-800 border-red-700 bg-red-50 dark:text-red-300 dark:border-red-600 dark:bg-red-950',
        ariaLabel: 'License expired',
      };
    }

    if (daysUntilExpiry <= 7) {
      return {
        label: `Expires in ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'day' : 'days'}`,
        className:
          'text-red-800 border-red-700 bg-red-50 dark:text-red-300 dark:border-red-600 dark:bg-red-950',
        ariaLabel: `License expires in ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'day' : 'days'} - urgent`,
      };
    }

    if (daysUntilExpiry <= 30) {
      return {
        label: `Expires in ${daysUntilExpiry} days`,
        className:
          'text-orange-800 border-orange-700 bg-orange-50 dark:text-orange-300 dark:border-orange-600 dark:bg-orange-950',
        ariaLabel: `License expires in ${daysUntilExpiry} days - warning`,
      };
    }

    return {
      label: 'Active',
      className:
        'text-green-800 border-green-700 bg-green-50 dark:text-green-300 dark:border-green-600 dark:bg-green-950',
      ariaLabel: 'License active',
    };
  };

  const config = getStatusConfig();

  return (
    <Badge
      variant="outline"
      className={`font-normal ${config.className}`}
      aria-label={config.ariaLabel}
      data-test="expiration-badge"
    >
      {config.label}
    </Badge>
  );
}
