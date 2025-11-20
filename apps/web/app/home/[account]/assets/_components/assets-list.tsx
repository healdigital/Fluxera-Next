'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Plus, Trash, UserPlus, Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@kit/ui/alert-dialog';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Checkbox } from '@kit/ui/checkbox';
import { useModalState } from '@kit/ui/hooks';
import { Spinner } from '@kit/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { toast } from '@kit/ui/sonner';

import { type AssetWithUser } from '../_lib/server/assets-page.loader';
import { deleteAsset } from '../_lib/server/assets-server-actions';
import { AssetFilters } from './asset-filters';
import { AssignAssetModal } from './assign-asset-modal';
import { AssetQuickViewModal } from './asset-quick-view-modal';
import { BulkAssignAssetsModal } from './bulk-assign-assets-modal';
import { BulkDeleteAssetsModal } from './bulk-delete-assets-modal';
import { CreateAssetSheet } from './create-asset-sheet';
import { EditAssetSheet } from './edit-asset-sheet';

interface AssetsListProps {
  assets: AssetWithUser[];
  accountSlug: string;
  users: Array<{ id: string; name: string; email: string }>;
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
  users,
  isLoading = false,
  pagination,
}: AssetsListProps) {
  const router = useRouter();

  // Modal states
  const quickView = useModalState();
  const createSheet = useModalState();
  const editSheet = useModalState();
  const assignModal = useModalState();

  // Bulk action states
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(
    new Set(),
  );
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<AssetWithUser | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Get current asset based on modal states
  const currentAsset = assets.find(
    (a) =>
      a.id === quickView.entityId ||
      a.id === editSheet.entityId ||
      a.id === assignModal.entityId,
  );

  // Handle row click to open quick view
  const handleRowClick = (asset: AssetWithUser) => {
    quickView.open(asset.id);
  };

  // Handle keyboard navigation in quick view
  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!quickView.entityId) return;

    const currentIndex = assets.findIndex((a) => a.id === quickView.entityId);
    if (currentIndex === -1) return;

    let newIndex: number;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : assets.length - 1;
    } else {
      newIndex = currentIndex < assets.length - 1 ? currentIndex + 1 : 0;
    }

    const nextAsset = assets[newIndex];
    if (nextAsset) {
      quickView.open(nextAsset.id);
    }
  };

  // Handle edit action from quick view
  const handleEdit = () => {
    if (!currentAsset) return;
    quickView.close();
    editSheet.open(currentAsset.id);
  };

  // Handle assign action from quick view
  const handleAssign = () => {
    if (!currentAsset) return;
    quickView.close();
    assignModal.open(currentAsset.id);
  };

  // Handle delete action from quick view
  const handleDelete = () => {
    if (!currentAsset) return;
    setAssetToDelete(currentAsset);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!assetToDelete) return;

    setIsDeleting(true);
    try {
      await deleteAsset({ id: assetToDelete.id });

      toast.success('Asset deleted', {
        description: 'The asset has been successfully deleted.',
      });

      setDeleteConfirmOpen(false);
      setAssetToDelete(null);
      quickView.close();

      // Refresh the page
      router.refresh();
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('Error', {
        description:
          error instanceof Error ? error.message : 'Failed to delete asset',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle success callbacks
  const handleModalSuccess = () => {
    router.refresh();
  };

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAssetIds(new Set(assets.map((a) => a.id)));
    } else {
      setSelectedAssetIds(new Set());
    }
  };

  const handleSelectAsset = (assetId: string, checked: boolean) => {
    const newSelection = new Set(selectedAssetIds);
    if (checked) {
      newSelection.add(assetId);
    } else {
      newSelection.delete(assetId);
    }
    setSelectedAssetIds(newSelection);
  };

  const selectedAssets = assets.filter((a) => selectedAssetIds.has(a.id));
  const allSelected =
    assets.length > 0 && selectedAssetIds.size === assets.length;
  const someSelected = selectedAssetIds.size > 0 && !allSelected;

  // Bulk action handlers
  const handleBulkDelete = () => {
    setBulkDeleteOpen(true);
  };

  const handleBulkAssign = () => {
    setBulkAssignOpen(true);
  };

  const handleBulkActionSuccess = () => {
    setSelectedAssetIds(new Set());
    router.refresh();
  };

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
      <>
        <div className="space-y-4">
          <AssetFilters />
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <p className="text-muted-foreground text-center">
              No assets found. Create your first asset to get started.
            </p>
            <Button onClick={() => createSheet.open()}>
              <Plus className="mr-2 h-4 w-4" />
              New Asset
            </Button>
          </div>
        </div>

        {/* Create Asset Sheet */}
        <CreateAssetSheet
          open={createSheet.isOpen}
          onOpenChange={createSheet.close}
          accountSlug={accountSlug}
          onSuccess={handleModalSuccess}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <AssetFilters />

        <div className="flex items-center justify-between">
          {/* Bulk Actions */}
          {selectedAssetIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                {selectedAssetIds.size} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkAssign}
                data-test="bulk-assign-button"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Assign
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

          <Button
            onClick={() => createSheet.open()}
            data-test="new-asset-button"
            aria-label="Create new asset"
            className={selectedAssetIds.size > 0 ? '' : 'ml-auto'}
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            New Asset
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected || someSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all assets"
                    data-test="select-all-checkbox"
                  />
                </TableHead>
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
                  className="hover:bg-muted/50"
                  data-test={`asset-row-${asset.id}`}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedAssetIds.has(asset.id)}
                      onCheckedChange={(checked) =>
                        handleSelectAsset(asset.id, checked as boolean)
                      }
                      aria-label={`Select ${asset.name}`}
                      data-test={`select-asset-${asset.id}`}
                    />
                  </TableCell>
                  <TableCell
                    className="hover:bg-muted/50 focus-within:ring-ring cursor-pointer font-medium focus-within:ring-2 focus-within:ring-offset-2"
                    onClick={() => handleRowClick(asset)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleRowClick(asset);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for ${asset.name}`}
                    data-test="asset-name-cell"
                  >
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

      {/* Quick View Modal */}
      <AssetQuickViewModal
        open={quickView.isOpen}
        onOpenChange={(open) => !open && quickView.close()}
        asset={currentAsset || null}
        onEdit={handleEdit}
        onAssign={handleAssign}
        onDelete={handleDelete}
        onNavigate={handleNavigate}
      />

      {/* Create Asset Sheet */}
      <CreateAssetSheet
        open={createSheet.isOpen}
        onOpenChange={(open) => !open && createSheet.close()}
        accountSlug={accountSlug}
        onSuccess={handleModalSuccess}
      />

      {/* Edit Asset Sheet */}
      {currentAsset && editSheet.isOpen && (
        <EditAssetSheet
          open={editSheet.isOpen}
          onOpenChange={(open) => !open && editSheet.close()}
          asset={currentAsset}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Assign Asset Modal */}
      <AssignAssetModal
        open={assignModal.isOpen}
        onOpenChange={(open) => !open && assignModal.close()}
        asset={currentAsset || null}
        accountSlug={accountSlug}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{assetToDelete?.name}
              &rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Action Modals */}
      <BulkDeleteAssetsModal
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        assets={selectedAssets}
        accountSlug={accountSlug}
        onSuccess={handleBulkActionSuccess}
      />

      <BulkAssignAssetsModal
        open={bulkAssignOpen}
        onOpenChange={setBulkAssignOpen}
        assets={selectedAssets}
        accountSlug={accountSlug}
        users={users}
        onSuccess={handleBulkActionSuccess}
      />
    </>
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
