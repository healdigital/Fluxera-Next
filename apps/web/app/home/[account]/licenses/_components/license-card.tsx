'use client';

import { Calendar, Link as LinkIcon, Package } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

import { type LicenseWithAssignments } from '../_lib/server/licenses-page.loader';
import { ExpirationBadge } from './expiration-badge';

interface LicenseCardProps {
  license: LicenseWithAssignments;
  accountSlug: string;
}

export function LicenseCard({ license, accountSlug }: LicenseCardProps) {
  // Format expiration date
  const expirationDate = new Date(license.expiration_date);
  const formattedDate = expirationDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card
      className="hover:bg-muted/50 focus-within:ring-ring transition-colors focus-within:ring-2 focus-within:ring-offset-2"
      tabIndex={0}
      role="button"
      aria-label={`View details for ${license.name}`}
      data-test={`license-card-${license.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{license.name}</CardTitle>
          <ExpirationBadge
            daysUntilExpiry={license.days_until_expiry}
            isExpired={license.is_expired}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <LicenseTypeBadge licenseType={license.license_type} />
        </div>

        <div className="space-y-2 text-sm">
          <div className="text-muted-foreground flex items-center gap-2">
            <Package className="h-4 w-4" aria-hidden="true" />
            <span>
              Vendor: <span className="text-foreground">{license.vendor}</span>
            </span>
          </div>

          <div className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <span>
              Expires: <span className="text-foreground">{formattedDate}</span>
            </span>
          </div>

          <div className="text-muted-foreground flex items-center gap-2">
            <LinkIcon className="h-4 w-4" aria-hidden="true" />
            <span>
              Assignments:{' '}
              <span className="text-foreground">
                {license.assignment_count}
              </span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LicenseTypeBadge({
  licenseType,
}: {
  licenseType: LicenseWithAssignments['license_type'];
}) {
  const typeLabels: Record<LicenseWithAssignments['license_type'], string> = {
    perpetual: 'Perpetual',
    subscription: 'Subscription',
    volume: 'Volume',
    oem: 'OEM',
    trial: 'Trial',
    educational: 'Educational',
    enterprise: 'Enterprise',
  };

  return (
    <Badge
      variant="outline"
      className="font-normal"
      aria-label={`License type: ${typeLabels[licenseType]}`}
    >
      {typeLabels[licenseType]}
    </Badge>
  );
}
