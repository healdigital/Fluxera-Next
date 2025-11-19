'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import {
  AlertTriangle,
  FileText,
  Link as LinkIcon,
  XCircle,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

import { type LicenseStats } from '../_lib/server/licenses-page.loader';

interface LicenseStatsCardsProps {
  stats: LicenseStats;
}

export function LicenseStatsCards({ stats }: LicenseStatsCardsProps) {
  const params = useParams();
  const accountSlug = params.account as string;

  const statCards = [
    {
      title: 'Total Licenses',
      value: stats.total_licenses,
      icon: FileText,
      description: 'All software licenses',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Expiring Soon',
      value: stats.expiring_soon,
      icon: AlertTriangle,
      description: 'Within 30 days',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      href: `/home/${accountSlug}/licenses/alerts`,
    },
    {
      title: 'Expired',
      value: stats.expired,
      icon: XCircle,
      description: 'Require renewal',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950',
    },
    {
      title: 'Total Assignments',
      value: stats.total_assignments,
      icon: LinkIcon,
      description: 'Users and assets',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
  ];

  return (
    <div
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      role="region"
      aria-label="License statistics"
    >
      {statCards.map((stat) => {
        const Icon = stat.icon;

        const cardContent = (
          <Card
            data-test={`stat-card-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
            className={stat.href ? 'cursor-pointer' : ''}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold"
                aria-label={`${stat.title}: ${stat.value}`}
              >
                {stat.value}
              </div>
              <p className="text-muted-foreground text-xs">
                {stat.description}
                {stat.href && ' - Click to view alerts'}
              </p>
            </CardContent>
          </Card>
        );

        if (stat.href) {
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="block transition-transform hover:scale-105"
            >
              {cardContent}
            </Link>
          );
        }

        return <div key={stat.title}>{cardContent}</div>;
      })}
    </div>
  );
}
