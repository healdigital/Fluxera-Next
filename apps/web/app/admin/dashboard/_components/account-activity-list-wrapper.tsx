'use client';

import { useState, useTransition } from 'react';

import { loadAccountActivityPage } from '../_lib/server/admin-dashboard-actions';
import type { AccountActivity } from '../_lib/types/admin-dashboard.types';
import {
  AccountActivityList,
  AccountActivityListSkeleton,
} from './account-activity-list';

interface AccountActivityListWrapperProps {
  initialAccounts: AccountActivity[];
  initialTotalCount: number;
  initialPage?: number;
  initialPageSize?: number;
}

/**
 * Account Activity List Wrapper
 * Client component wrapper that handles pagination state and server actions
 * Requirements: 8.2, 8.3, 8.5
 */
export function AccountActivityListWrapper({
  initialAccounts,
  initialTotalCount,
  initialPage = 1,
  initialPageSize = 50,
}: AccountActivityListWrapperProps) {
  const [accounts, setAccounts] = useState<AccountActivity[]>(initialAccounts);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [isPending, startTransition] = useTransition();

  /**
   * Handle page change
   * Fetches new page of data from server
   */
  const handlePageChange = (newPage: number) => {
    startTransition(async () => {
      try {
        const result = await loadAccountActivityPage(newPage, pageSize);
        setAccounts(result.accounts);
        setTotalCount(result.totalCount);
        setCurrentPage(result.currentPage);
      } catch (error) {
        console.error('Error loading page:', error);
        // Silently handle error - user can retry by clicking again
      }
    });
  };

  /**
   * Handle page size change
   * Resets to first page with new page size
   */
  const handlePageSizeChange = (newPageSize: number) => {
    startTransition(async () => {
      try {
        const result = await loadAccountActivityPage(1, newPageSize);
        setAccounts(result.accounts);
        setTotalCount(result.totalCount);
        setCurrentPage(1);
        setPageSize(newPageSize);
      } catch (error) {
        console.error('Error changing page size:', error);
        // Silently handle error - user can retry by changing again
      }
    });
  };

  // Show skeleton while loading
  if (isPending) {
    return <AccountActivityListSkeleton />;
  }

  return (
    <AccountActivityList
      accounts={accounts}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  );
}
