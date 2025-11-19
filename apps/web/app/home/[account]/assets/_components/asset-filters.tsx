'use client';

import { useCallback, useMemo, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Filter, Search, X } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Checkbox } from '@kit/ui/checkbox';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';

import {
  type AssetCategory,
  type AssetStatus,
} from '../_lib/schemas/asset.schema';

const CATEGORY_LABELS: Record<AssetCategory, string> = {
  laptop: 'Laptop',
  desktop: 'Desktop',
  mobile_phone: 'Mobile Phone',
  tablet: 'Tablet',
  monitor: 'Monitor',
  printer: 'Printer',
  other_equipment: 'Other Equipment',
};

const STATUS_LABELS: Record<AssetStatus, string> = {
  available: 'Available',
  assigned: 'Assigned',
  in_maintenance: 'In Maintenance',
  retired: 'Retired',
  lost: 'Lost',
};

const CATEGORIES: AssetCategory[] = [
  'laptop',
  'desktop',
  'mobile_phone',
  'tablet',
  'monitor',
  'printer',
  'other_equipment',
];

const STATUSES: AssetStatus[] = [
  'available',
  'assigned',
  'in_maintenance',
  'retired',
  'lost',
];

export function AssetFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(
    searchParams.get('search') ?? '',
  );

  const selectedCategories = useMemo(
    () => searchParams.get('categories')?.split(',') ?? [],
    [searchParams],
  );
  const selectedStatuses = useMemo(
    () => searchParams.get('statuses')?.split(',') ?? [],
    [searchParams],
  );

  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      const queryString = params.toString();
      router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
    },
    [pathname, router, searchParams],
  );

  const handleCategoryToggle = useCallback(
    (category: AssetCategory) => {
      const current = selectedCategories;
      const updated = current.includes(category)
        ? current.filter((c) => c !== category)
        : [...current, category];

      updateSearchParams({
        categories: updated.length > 0 ? updated.join(',') : null,
      });
    },
    [selectedCategories, updateSearchParams],
  );

  const handleStatusToggle = useCallback(
    (status: AssetStatus) => {
      const current = selectedStatuses;
      const updated = current.includes(status)
        ? current.filter((s) => s !== status)
        : [...current, status];

      updateSearchParams({
        statuses: updated.length > 0 ? updated.join(',') : null,
      });
    },
    [selectedStatuses, updateSearchParams],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      updateSearchParams({ search: value || null });
    },
    [updateSearchParams],
  );

  const handleClearFilters = useCallback(() => {
    setSearchValue('');
    updateSearchParams({
      categories: null,
      statuses: null,
      search: null,
    });
  }, [updateSearchParams]);

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedStatuses.length > 0 ||
    searchValue.length > 0;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search
            className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="text"
            placeholder="Search assets by name..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
            data-test="asset-search-input"
            aria-label="Search assets by name"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              data-test="category-filter-trigger"
              aria-label={`Filter by category${selectedCategories.length > 0 ? `, ${selectedCategories.length} selected` : ''}`}
            >
              <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
              Category
              {selectedCategories.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 rounded-sm px-1"
                  aria-hidden="true"
                >
                  {selectedCategories.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[200px] p-3"
            align="end"
            role="dialog"
            aria-label="Category filter options"
          >
            <div className="space-y-2">
              <div className="text-sm font-medium" id="category-filter-label">
                Filter by Category
              </div>
              <div className="space-y-2">
                {CATEGORIES.map((category) => (
                  <div
                    key={category}
                    className="flex items-center space-x-2"
                    data-test={`category-filter-${category}`}
                  >
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <Label
                      htmlFor={`category-${category}`}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {CATEGORY_LABELS[category]}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              data-test="status-filter-trigger"
              aria-label={`Filter by status${selectedStatuses.length > 0 ? `, ${selectedStatuses.length} selected` : ''}`}
            >
              <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
              Status
              {selectedStatuses.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 rounded-sm px-1"
                  aria-hidden="true"
                >
                  {selectedStatuses.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[200px] p-3"
            align="end"
            role="dialog"
            aria-label="Status filter options"
          >
            <div className="space-y-2">
              <div className="text-sm font-medium" id="status-filter-label">
                Filter by Status
              </div>
              <div className="space-y-2">
                {STATUSES.map((status) => (
                  <div
                    key={status}
                    className="flex items-center space-x-2"
                    data-test={`status-filter-${status}`}
                  >
                    <Checkbox
                      id={`status-${status}`}
                      checked={selectedStatuses.includes(status)}
                      onCheckedChange={() => handleStatusToggle(status)}
                    />
                    <Label
                      htmlFor={`status-${status}`}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {STATUS_LABELS[status]}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-9"
            data-test="clear-filters-button"
            aria-label="Clear all filters"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
