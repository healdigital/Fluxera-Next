'use client';

import Link from 'next/link';

import { AlertCircle, AlertTriangle, Calendar } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

interface LicenseRenewalAlert {
  id: string;
  licenseId: string;
  licenseName: string;
  vendor: string;
  expirationDate: string;
  daysUntilExpiry: number;
  alertType: '30_day' | '7_day';
  sentAt: string;
  isExpired: boolean;
}

interface LicenseRenewalAlertsProps {
  alerts: LicenseRenewalAlert[];
  accountSlug: string;
}

export function LicenseRenewalAlerts({
  alerts,
  accountSlug,
}: LicenseRenewalAlertsProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>License Renewal Alerts</CardTitle>
          <CardDescription>
            No active license renewal alerts at this time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            You&apos;ll receive alerts here when licenses are approaching their
            expiration dates.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Separate alerts by urgency
  const urgentAlerts = alerts.filter(
    (alert) => alert.alertType === '7_day' && !alert.isExpired,
  );
  const warningAlerts = alerts.filter(
    (alert) => alert.alertType === '30_day' && !alert.isExpired,
  );
  const expiredAlerts = alerts.filter((alert) => alert.isExpired);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>License Renewal Alerts</CardTitle>
          <CardDescription>
            Active alerts for licenses approaching expiration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Urgent Alerts (7 days or less) */}
          {urgentAlerts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
                Urgent - Expires Within 7 Days
              </h3>
              {urgentAlerts.map((alert) => (
                <Alert
                  key={alert.id}
                  variant="destructive"
                  className="relative"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="flex items-center justify-between">
                    <span>{alert.licenseName}</span>
                    <Badge variant="destructive" className="ml-2">
                      {alert.daysUntilExpiry} days left
                    </Badge>
                  </AlertTitle>
                  <AlertDescription className="mt-2 space-y-2">
                    <div className="text-sm">
                      <p>
                        <strong>Vendor:</strong> {alert.vendor}
                      </p>
                      <p>
                        <strong>Expires:</strong>{' '}
                        {new Date(alert.expirationDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" asChild>
                        <Link
                          href={`/home/${accountSlug}/licenses/${alert.licenseId}`}
                        >
                          View License
                        </Link>
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Warning Alerts (8-30 days) */}
          {warningAlerts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                Warning - Expires Within 30 Days
              </h3>
              {warningAlerts.map((alert) => (
                <Alert key={alert.id} className="relative border-yellow-500">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="flex items-center justify-between">
                    <span>{alert.licenseName}</span>
                    <Badge variant="outline" className="ml-2 border-yellow-500">
                      {alert.daysUntilExpiry} days left
                    </Badge>
                  </AlertTitle>
                  <AlertDescription className="mt-2 space-y-2">
                    <div className="text-sm">
                      <p>
                        <strong>Vendor:</strong> {alert.vendor}
                      </p>
                      <p>
                        <strong>Expires:</strong>{' '}
                        {new Date(alert.expirationDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link
                          href={`/home/${accountSlug}/licenses/${alert.licenseId}`}
                        >
                          View License
                        </Link>
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Expired Alerts */}
          {expiredAlerts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Expired Licenses
              </h3>
              {expiredAlerts.map((alert) => (
                <Alert key={alert.id} className="relative border-gray-300">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <AlertTitle className="flex items-center justify-between">
                    <span>{alert.licenseName}</span>
                    <Badge variant="secondary" className="ml-2">
                      Expired
                    </Badge>
                  </AlertTitle>
                  <AlertDescription className="mt-2 space-y-2">
                    <div className="text-sm">
                      <p>
                        <strong>Vendor:</strong> {alert.vendor}
                      </p>
                      <p>
                        <strong>Expired:</strong>{' '}
                        {new Date(alert.expirationDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link
                          href={`/home/${accountSlug}/licenses/${alert.licenseId}`}
                        >
                          View License
                        </Link>
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
