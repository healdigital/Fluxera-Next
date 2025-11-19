'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Plus } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Spinner } from '@kit/ui/spinner';

import { type LicenseWithAssignments } from '../_lib/server/licenses-page.loader';
import { ExportLicensesButton } from './export-licenses-button';
import { LicenseCard } from './license-card';
import { LicenseFilters } from './license-filters';
import { LicensesEmptyState } from './licenses-empty-state';

interface LicensesListProps {
  licenses: LicenseWithAssignments[];
  accountSlug: string;
  vendors?: string[];
  isLoading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
  };
}

export function LicensesList({
  licenses,
  accountSlug,
  vendors = [],
  isLoading = false,
  pagination,
}: LicensesListProps) {
  const searchParams = useSearchParams();

  // Get current filters from URL
  const currentFilters = {
    search: searchParams.get('search') ?? undefined,
    vendor: searchParams.get('vendor') ?? undefined,
    licenseTypes: searchParams.get('licenseTypes')?.split(',') ?? undefined,
    expirationStatus:
      (searchParams.get('expirationStatus') as
        | 'all'
        | 'active'
        | 'expiring'
        | 'expired') ?? 'all',
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LicenseFilters vendors={vendors} />
        <div
          className="flex flex-col items-center justify-center space-y-4 py-12"
          role="status"
          aria-live="polite"
        >
          <Spinner className="h-8 w-8" aria-hidden="true" />
          <p className="text-muted-foreground text-sm">Loading licenses...</p>
        </div>
      </div>
    );
  }

  // Check if there are any active filters
  const hasActiveFilters =
    currentFilters.search ||
    (currentFilters.vendor && currentFilters.vendor !== 'all') ||
    (currentFilters.licenseTypes && currentFilters.licenseTypes.length > 0) ||
    (currentFilters.expirationStatus &&
      currentFilters.expirationStatus !== 'all');

  if (licenses.length === 0) {
    return (
      <div className="space-y-4">
        <LicenseFilters vendors={vendors} />
        {hasActiveFilters ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <p className="text-muted-foreground text-center">
              No licenses found matching your filters. Try adjusting your search
              criteria.
            </p>
            <Button variant="outline" asChild>
              <Link href={`/home/${accountSlug}/licenses`}>Clear Filters</Link>
            </Button>
          </div>
        ) : (
          <LicensesEmptyState accountSlug={accountSlug} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LicenseFilters vendors={vendors} />

      <div className="flex justify-end gap-2">
        <ExportLicensesButton
          accountSlug={accountSlug}
          filters={currentFilters}
        />
        <Button asChild data-test="new-license-button">
          <Link
            href={`/home/${accountSlug}/licenses/new`}
            aria-label="Create new license"
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            New License
          </Link>
        </Button>
      </div>

      <div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label="Software licenses"
      >
        {licenses.map((license) => (
          <div key={license.id} role="listitem">
            <LicenseCard license={license} accountSlug={accountSlug} />
          </div>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <LicensesPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          pageSize={pagination.pageSize}
        />
      )}
    </div>
  );
}

function LicensesPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
}: {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
}) {
  const router = useRouter();

  const handlePageChange = (page: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    router.push(url.pathname + url.search);
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <nav
      className="flex items-center justify-between border-t pt-4"
      aria-label="License list pagination"
    >
      <div className="text-muted-foreground text-sm" aria-live="polite">
        Showing {startItem} to {endItem} of {totalCount} licenses
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
        >
          Previous
        </Button>
        <div className="text-sm" aria-current="page">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
