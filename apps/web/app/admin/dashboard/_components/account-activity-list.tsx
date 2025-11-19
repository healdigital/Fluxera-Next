'use client';

import { useState } from 'react';

import Link from 'next/link';

import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Skeleton } from '@kit/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { Trans } from '@kit/ui/trans';

import type { AccountActivity } from '../_lib/types/admin-dashboard.types';

interface AccountActivityListProps {
  accounts: AccountActivity[];
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

/**
 * Account Activity List Widget
 * Displays team accounts with activity metrics
 * Supports pagination and navigation to team dashboards
 * Requirements: 8.2, 8.3, 8.5
 */
export function AccountActivityList({
  accounts,
  totalCount,
  currentPage = 1,
  pageSize = 50,
  onPageChange,
  onPageSizeChange,
}: AccountActivityListProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Calculate pagination
  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : 1;
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return formatDate(dateString);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Trans i18nKey={'admin:dashboard.accountActivity'} />
        </CardTitle>
        <CardDescription>
          <Trans i18nKey={'admin:dashboard.accountActivityDescription'} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Table */}
        <div className="border-border overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Trans i18nKey={'admin:dashboard.accountName'} />
                </TableHead>
                <TableHead className="text-right">
                  <Trans i18nKey={'admin:dashboard.users'} />
                </TableHead>
                <TableHead className="text-right">
                  <Trans i18nKey={'admin:dashboard.assets'} />
                </TableHead>
                <TableHead>
                  <Trans i18nKey={'admin:dashboard.lastActivity'} />
                </TableHead>
                <TableHead>
                  <Trans i18nKey={'admin:dashboard.created'} />
                </TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground h-32 text-center"
                  >
                    <Trans i18nKey={'admin:dashboard.noAccounts'} />
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => (
                  <TableRow
                    key={account.account_id}
                    className="group hover:bg-muted/50 cursor-pointer transition-colors"
                    onMouseEnter={() => setHoveredRow(account.account_id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {/* Account Name */}
                    <TableCell>
                      <Link
                        href={`/home/${account.account_slug}/dashboard`}
                        className="block"
                      >
                        <div className="text-foreground group-hover:text-primary font-medium">
                          {account.account_name}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {account.account_slug}
                        </div>
                      </Link>
                    </TableCell>

                    {/* User Count */}
                    <TableCell className="text-right">
                      <span className="font-medium">
                        {account.user_count.toLocaleString()}
                      </span>
                    </TableCell>

                    {/* Asset Count */}
                    <TableCell className="text-right">
                      <span className="font-medium">
                        {account.asset_count.toLocaleString()}
                      </span>
                    </TableCell>

                    {/* Last Activity */}
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {formatRelativeTime(account.last_activity_at)}
                        </div>
                        <div className="text-muted-foreground">
                          {formatDate(account.last_activity_at)}
                        </div>
                      </div>
                    </TableCell>

                    {/* Created Date */}
                    <TableCell>
                      <div className="text-muted-foreground text-sm">
                        {formatDate(account.created_at)}
                      </div>
                    </TableCell>

                    {/* Action Button */}
                    <TableCell>
                      <Link
                        href={`/home/${account.account_slug}/dashboard`}
                        className="inline-flex"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 transition-opacity ${
                            hoveredRow === account.account_id
                              ? 'opacity-100'
                              : 'opacity-0'
                          }`}
                          aria-label={`View ${account.account_name} dashboard`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {totalCount && totalCount > 0 && (
          <div className="mt-4 flex items-center justify-between">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                <Trans i18nKey={'admin:dashboard.rowsPerPage'} />
              </span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) =>
                  onPageSizeChange?.(parseInt(value, 10))
                }
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Page Info and Navigation */}
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground text-sm">
                Page {currentPage} of {totalPages} (
                {totalCount.toLocaleString()} total)
              </span>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(currentPage - 1)}
                  disabled={!hasPreviousPage}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(currentPage + 1)}
                  disabled={!hasNextPage}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Account Activity List Skeleton
 * Loading placeholder for the account activity list
 */
export function AccountActivityListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-2 h-4 w-96" />
      </CardHeader>
      <CardContent>
        <div className="border-border overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Skeleton className="h-4 w-32" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="ml-auto h-4 w-16" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="ml-auto h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="mt-1 h-3 w-32" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-8" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="mt-1 h-3 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
