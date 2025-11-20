'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Plus, Trash2, RefreshCw } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Checkbox } from '@kit/ui/checkbox';
import { Spinner } from '@kit/ui/spinner';

import { type LicenseWithAssignments } from '../_lib/server/licenses-page.loader';
import { AssignLicenseModal } from './assign-license-modal';
import { BulkDeleteLicensesModal } from './bulk-delete-licenses-modal';
import { BulkRenewLicensesModal } from './bulk-renew-licenses-modal';
import { CreateLicenseSheet } from './create-license-sheet';
import { EditLicenseSheet } from './edit-license-sheet';
import { ExportLicensesButton } from './export-licenses-button';
import { LicenseCard } from './license-card';
import { LicenseFilters } from './license-filters';
import { LicenseQuickViewModal } from './license-quick-view-modal';
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
  const router = useRouter();

  // Modal state management
  const [selectedLicense, setSelectedLicense] =
    useState<LicenseWithAssignments | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  // Bulk action states
  const [selectedLicenseIds, setSelectedLicenseIds] = useState<Set<string>>(
    new Set(),
  );
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkRenewOpen, setBulkRenewOpen] = useState(false);

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

  // Handle license card click
  const handleLicenseClick = (license: LicenseWithAssignments) => {
    setSelectedLicense(license);
    setQuickViewOpen(true);
  };

  // Handle quick view actions
  const handleEdit = () => {
    setQuickViewOpen(false);
    setEditSheetOpen(true);
  };

  const handleAssign = () => {
    setQuickViewOpen(false);
    setAssignModalOpen(true);
  };

  const handleRenew = () => {
    // TODO: Implement renew functionality
    console.log('Renew license:', selectedLicense?.id);
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log('Delete license:', selectedLicense?.id);
  };

  // Handle keyboard navigation
  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!selectedLicense) return;

    const currentIndex = licenses.findIndex((l) => l.id === selectedLicense.id);
    let newIndex: number;

    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : licenses.length - 1;
    } else {
      newIndex = currentIndex < licenses.length - 1 ? currentIndex + 1 : 0;
    }

    const nextLicense = licenses[newIndex];
    if (nextLicense) {
      setSelectedLicense(nextLicense);
    }
  };

  // Handle success callbacks
  const handleSuccess = () => {
    router.refresh();
  };

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLicenseIds(new Set(licenses.map((l) => l.id)));
    } else {
      setSelectedLicenseIds(new Set());
    }
  };

  const handleSelectLicense = (licenseId: string, checked: boolean) => {
    const newSelection = new Set(selectedLicenseIds);
    if (checked) {
      newSelection.add(licenseId);
    } else {
      newSelection.delete(licenseId);
    }
    setSelectedLicenseIds(newSelection);
  };

  const selectedLicenses = licenses.filter((l) =>
    selectedLicenseIds.has(l.id),
  );
  const allSelected =
    licenses.length > 0 && selectedLicenseIds.size === licenses.length;
  const someSelected = selectedLicenseIds.size > 0 && !allSelected;

  // Bulk action handlers
  const handleBulkDelete = () => {
    setBulkDeleteOpen(true);
  };

  const handleBulkRenew = () => {
    setBulkRenewOpen(true);
  };

  const handleBulkActionSuccess = () => {
    setSelectedLicenseIds(new Set());
    router.refresh();
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

      <div className="flex items-center justify-between">
        {/* Bulk Actions */}
        {selectedLicenseIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              {selectedLicenseIds.size} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkRenew}
              data-test="bulk-renew-button"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Renew
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              data-test="bulk-delete-button"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}

        <div
          className={`flex gap-2 ${selectedLicenseIds.size > 0 ? '' : 'ml-auto'}`}
        >
          <ExportLicensesButton
            accountSlug={accountSlug}
            filters={currentFilters}
          />
          <Button
            onClick={() => setCreateSheetOpen(true)}
            data-test="new-license-button"
            aria-label="Create new license"
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            New License
          </Button>
        </div>
      </div>

      {/* Select All Checkbox */}
      {licenses.length > 0 && (
        <div className="flex items-center gap-2 border-b pb-2">
          <Checkbox
            checked={allSelected || someSelected}
            onCheckedChange={handleSelectAll}
            aria-label="Select all licenses"
            data-test="select-all-checkbox"
          />
          <span className="text-muted-foreground text-sm">
            {allSelected
              ? 'All licenses selected'
              : someSelected
                ? `${selectedLicenseIds.size} licenses selected`
                : 'Select all'}
          </span>
        </div>
      )}

      <div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label="Software licenses"
      >
        {licenses.map((license) => (
          <div key={license.id} role="listitem" className="relative">
            <div className="absolute left-2 top-2 z-10">
              <Checkbox
                checked={selectedLicenseIds.has(license.id)}
                onCheckedChange={(checked) =>
                  handleSelectLicense(license.id, checked as boolean)
                }
                onClick={(e) => e.stopPropagation()}
                aria-label={`Select ${license.name}`}
                data-test={`select-license-${license.id}`}
              />
            </div>
            <div
              onClick={() => handleLicenseClick(license)}
              className="cursor-pointer"
            >
              <LicenseCard license={license} accountSlug={accountSlug} />
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <LicenseQuickViewModal
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
        license={selectedLicense}
        onEdit={handleEdit}
        onAssign={handleAssign}
        onRenew={handleRenew}
        onDelete={handleDelete}
        onNavigate={handleNavigate}
      />

      <CreateLicenseSheet
        open={createSheetOpen}
        onOpenChange={setCreateSheetOpen}
        accountSlug={accountSlug}
        onSuccess={handleSuccess}
      />

      {selectedLicense && (
        <>
          <EditLicenseSheet
            open={editSheetOpen}
            onOpenChange={setEditSheetOpen}
            accountSlug={accountSlug}
            license={{
              id: selectedLicense.id,
              name: selectedLicense.name,
              vendor: selectedLicense.vendor,
              license_key: selectedLicense.license_key,
              license_type: selectedLicense.license_type,
              purchase_date: '', // Will be loaded from detail
              expiration_date: selectedLicense.expiration_date,
              cost: null,
              notes: null,
            }}
            onSuccess={handleSuccess}
          />

          <AssignLicenseModal
            open={assignModalOpen}
            onOpenChange={setAssignModalOpen}
            licenseId={selectedLicense.id}
            licenseName={selectedLicense.name}
            accountSlug={accountSlug}
            onSuccess={handleSuccess}
          />
        </>
      )}

      {pagination && pagination.totalPages > 1 && (
        <LicensesPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          pageSize={pagination.pageSize}
        />
      )}

      {/* Bulk Action Modals */}
      <BulkDeleteLicensesModal
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        licenses={selectedLicenses}
        accountSlug={accountSlug}
        onSuccess={handleBulkActionSuccess}
      />

      <BulkRenewLicensesModal
        open={bulkRenewOpen}
        onOpenChange={setBulkRenewOpen}
        licenses={selectedLicenses}
        accountSlug={accountSlug}
        onSuccess={handleBulkActionSuccess}
      />
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
