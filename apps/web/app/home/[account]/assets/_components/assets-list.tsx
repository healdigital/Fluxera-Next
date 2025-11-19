'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Plus } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Spinner } from '@kit/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';

import { type AssetWithUser } from '../_lib/server/assets-page.loader';
import { AssetFilters } from './asset-filters';

interface AssetsListProps {
  assets: AssetWithUser[];
  accountSlug: string;
  isLoading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
  };
}

export function AssetsList({
  assets,
  accountSlug,
  isLoading = false,
  pagination,
}: AssetsListProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <AssetFilters />
        <div
          className="flex flex-col items-center justify-center space-y-4 py-12"
          role="status"
          aria-live="polite"
        >
          <Spinner className="h-8 w-8" aria-hidden="true" />
          <p className="text-muted-foreground text-sm">Loading assets...</p>
        </div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="space-y-4">
        <AssetFilters />
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <p className="text-muted-foreground text-center">
            No assets found. Create your first asset to get started.
          </p>
          <Button asChild>
            <Link href={`/home/${accountSlug}/assets/new`}>
              <Plus className="mr-2 h-4 w-4" />
              New Asset
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AssetFilters />

      <div className="flex justify-end">
        <Button asChild data-test="new-asset-button">
          <Link
            href={`/home/${accountSlug}/assets/new`}
            aria-label="Create new asset"
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            New Asset
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow
                key={asset.id}
                className="hover:bg-muted/50 focus-within:ring-ring cursor-pointer focus-within:ring-2 focus-within:ring-offset-2"
                onClick={() => {
                  router.push(`/home/${accountSlug}/assets/${asset.id}`);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/home/${accountSlug}/assets/${asset.id}`);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${asset.name}`}
                data-test={`asset-row-${asset.id}`}
              >
                <TableCell className="font-medium" data-test="asset-name-cell">
                  {asset.name}
                </TableCell>
                <TableCell>
                  <CategoryBadge category={asset.category} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={asset.status} />
                </TableCell>
                <TableCell>
                  {asset.assigned_user ? (
                    <div
                      className="flex items-center gap-2"
                      data-test="assigned-user"
                    >
                      {asset.assigned_user.picture_url && (
                        <img
                          src={asset.assigned_user.picture_url}
                          alt={asset.assigned_user.name}
                          className="h-6 w-6 rounded-full"
                        />
                      )}
                      <span className="text-sm">
                        {asset.assigned_user.name}
                      </span>
                    </div>
                  ) : (
                    <span
                      className="text-muted-foreground text-sm"
                      data-test="unassigned-label"
                    >
                      Unassigned
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <AssetsPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
        />
      )}
    </div>
  );
}

function AssetsPagination({
  currentPage,
  totalPages,
  totalCount,
}: {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}) {
  const router = useRouter();
  const pageSize = 50; // Default page size

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
      aria-label="Asset list pagination"
    >
      <div className="text-muted-foreground text-sm" aria-live="polite">
        Showing {startItem} to {endItem} of {totalCount} assets
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

function CategoryBadge({ category }: { category: AssetWithUser['category'] }) {
  const categoryLabels: Record<AssetWithUser['category'], string> = {
    laptop: 'Laptop',
    desktop: 'Desktop',
    mobile_phone: 'Mobile Phone',
    tablet: 'Tablet',
    monitor: 'Monitor',
    printer: 'Printer',
    other_equipment: 'Other Equipment',
  };

  return (
    <Badge
      variant="outline"
      className="font-normal"
      aria-label={`Category: ${categoryLabels[category]}`}
    >
      {categoryLabels[category]}
    </Badge>
  );
}

function StatusBadge({ status }: { status: AssetWithUser['status'] }) {
  const statusConfig: Record<
    AssetWithUser['status'],
    { label: string; className: string }
  > = {
    available: {
      label: 'Available',
      className:
        'text-green-800 border-green-700 bg-green-50 dark:text-green-300 dark:border-green-600 dark:bg-green-950',
    },
    assigned: {
      label: 'Assigned',
      className:
        'text-blue-800 border-blue-700 bg-blue-50 dark:text-blue-300 dark:border-blue-600 dark:bg-blue-950',
    },
    in_maintenance: {
      label: 'In Maintenance',
      className:
        'text-orange-800 border-orange-700 bg-orange-50 dark:text-orange-300 dark:border-orange-600 dark:bg-orange-950',
    },
    retired: {
      label: 'Retired',
      className:
        'text-gray-800 border-gray-700 bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:bg-gray-950',
    },
    lost: {
      label: 'Lost',
      className:
        'text-red-800 border-red-700 bg-red-50 dark:text-red-300 dark:border-red-600 dark:bg-red-950',
    },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={`font-normal ${config.className}`}
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </Badge>
  );
}
