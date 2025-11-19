'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';

interface UsersPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function UsersPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
}: UsersPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const navigateToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const changePageSize = (newPageSize: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('pageSize', newPageSize);
    params.set('page', '1'); // Reset to first page when changing page size
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <nav
      className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"
      aria-label="User list pagination"
    >
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground text-sm" aria-live="polite">
          Showing {startItem} to {endItem} of {totalCount} users
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Items per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={changePageSize}
            aria-label="Select page size"
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToPage(1)}
          disabled={currentPage === 1}
          aria-label="Go to first page"
          className="hidden sm:flex"
        >
          <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToPage(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="flex items-center gap-1">
          <span className="text-sm" aria-current="page">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToPage(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Go to last page"
          className="hidden sm:flex"
        >
          <ChevronsRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
