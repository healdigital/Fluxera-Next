import Link from 'next/link';

import { FileKey, Plus } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';
import { Trans } from '@kit/ui/trans';

interface LicensesEmptyStateProps {
  accountSlug: string;
}

export function LicensesEmptyState({ accountSlug }: LicensesEmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="bg-muted mb-4 rounded-full p-6">
          <FileKey className="text-muted-foreground h-12 w-12" />
        </div>

        <h3 className="mb-2 text-lg font-semibold">
          <Trans
            i18nKey="licenses:noLicensesTitle"
            defaults="No Licenses Yet"
          />
        </h3>

        <p className="text-muted-foreground mb-6 max-w-md text-center text-sm">
          <Trans
            i18nKey="licenses:noLicensesDescription"
            defaults="Get started by creating your first software license. Track expiration dates, manage assignments, and stay compliant."
          />
        </p>

        <Button asChild data-test="new-license-button">
          <Link href={`/home/${accountSlug}/licenses/new`}>
            <Plus className="mr-2 h-4 w-4" />
            <Trans i18nKey="licenses:createLicense" defaults="Create License" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
