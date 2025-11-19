'use client';

import { Badge } from '@kit/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

import { LicenseDetail } from '../_lib/server/license-detail.loader';

interface LicenseDetailViewProps {
  license: LicenseDetail;
}

export function LicenseDetailView({ license }: LicenseDetailViewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{license.name}</CardTitle>
            <CardDescription>License Details</CardDescription>
          </div>
          <div className="flex gap-2">
            <LicenseTypeBadge type={license.license_type} />
            <ExpirationStatusBadge
              daysUntilExpiry={license.days_until_expiry}
              isExpired={license.is_expired}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* License Information Grid */}
        <dl
          className="grid gap-4 md:grid-cols-2"
          aria-label="License information"
        >
          <div>
            <dt className="text-muted-foreground text-sm font-medium">
              Vendor
            </dt>
            <dd className="mt-1 text-sm">{license.vendor}</dd>
          </div>

          <div>
            <dt className="text-muted-foreground text-sm font-medium">
              License Key
            </dt>
            <dd className="mt-1 font-mono text-sm">{license.license_key}</dd>
          </div>

          <div>
            <dt className="text-muted-foreground text-sm font-medium">
              Purchase Date
            </dt>
            <dd className="mt-1 text-sm">
              <time dateTime={license.purchase_date}>
                {new Date(license.purchase_date).toLocaleDateString()}
              </time>
            </dd>
          </div>

          <div>
            <dt className="text-muted-foreground text-sm font-medium">
              Expiration Date
            </dt>
            <dd className="mt-1 text-sm">
              <time dateTime={license.expiration_date}>
                {new Date(license.expiration_date).toLocaleDateString()}
              </time>
              {!license.is_expired && license.days_until_expiry >= 0 && (
                <span className="text-muted-foreground ml-2">
                  ({license.days_until_expiry} days remaining)
                </span>
              )}
              {license.is_expired && (
                <span className="ml-2 text-red-600 dark:text-red-400">
                  (Expired {Math.abs(license.days_until_expiry)} days ago)
                </span>
              )}
            </dd>
          </div>

          {license.cost !== null && (
            <div>
              <dt className="text-muted-foreground text-sm font-medium">
                Cost
              </dt>
              <dd className="mt-1 text-sm">
                $
                {license.cost.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </dd>
            </div>
          )}

          {license.notes && (
            <div className="md:col-span-2">
              <dt className="text-muted-foreground text-sm font-medium">
                Notes
              </dt>
              <dd className="mt-1 text-sm whitespace-pre-wrap">
                {license.notes}
              </dd>
            </div>
          )}
        </dl>

        {/* Audit Information */}
        <div className="border-t pt-4">
          <h3 className="text-muted-foreground mb-3 text-sm font-medium">
            Audit Information
          </h3>
          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-muted-foreground text-sm font-medium">
                Created
              </dt>
              <dd className="mt-1 text-sm">
                {license.created_at ? (
                  <time dateTime={license.created_at}>
                    {new Date(license.created_at).toLocaleString()}
                  </time>
                ) : (
                  'Unknown'
                )}
              </dd>
            </div>

            <div>
              <dt className="text-muted-foreground text-sm font-medium">
                Last Updated
              </dt>
              <dd className="mt-1 text-sm">
                {license.updated_at ? (
                  <time dateTime={license.updated_at}>
                    {new Date(license.updated_at).toLocaleString()}
                  </time>
                ) : (
                  'Unknown'
                )}
              </dd>
            </div>
          </dl>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component for license type badge
function LicenseTypeBadge({ type }: { type: string }) {
  const typeLabels: Record<string, string> = {
    perpetual: 'Perpetual',
    subscription: 'Subscription',
    volume: 'Volume',
    oem: 'OEM',
    trial: 'Trial',
    educational: 'Educational',
    enterprise: 'Enterprise',
  };

  return (
    <Badge variant="outline" className="font-normal">
      {typeLabels[type] || type}
    </Badge>
  );
}

// Helper component for expiration status badge
function ExpirationStatusBadge({
  daysUntilExpiry,
  isExpired,
}: {
  daysUntilExpiry: number;
  isExpired: boolean;
}) {
  if (isExpired) {
    return (
      <Badge
        variant="outline"
        className="border-red-700 bg-red-50 font-normal text-red-800 dark:border-red-600 dark:bg-red-950 dark:text-red-300"
      >
        Expired
      </Badge>
    );
  }

  if (daysUntilExpiry <= 7) {
    return (
      <Badge
        variant="outline"
        className="border-red-700 bg-red-50 font-normal text-red-800 dark:border-red-600 dark:bg-red-950 dark:text-red-300"
      >
        Expires in {daysUntilExpiry} days
      </Badge>
    );
  }

  if (daysUntilExpiry <= 30) {
    return (
      <Badge
        variant="outline"
        className="border-orange-700 bg-orange-50 font-normal text-orange-800 dark:border-orange-600 dark:bg-orange-950 dark:text-orange-300"
      >
        Expires in {daysUntilExpiry} days
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-green-700 bg-green-50 font-normal text-green-800 dark:border-green-600 dark:bg-green-950 dark:text-green-300"
    >
      Active
    </Badge>
  );
}
