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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';

type LicenseType =
  | 'perpetual'
  | 'subscription'
  | 'volume'
  | 'oem'
  | 'trial'
  | 'educational'
  | 'enterprise';

type ExpirationStatus = 'all' | 'active' | 'expiring' | 'expired';

const LICENSE_TYPE_LABELS: Record<LicenseType, string> = {
  perpetual: 'Perpetual',
  subscription: 'Subscription',
  volume: 'Volume',
  oem: 'OEM',
  trial: 'Trial',
  educational: 'Educational',
  enterprise: 'Enterprise',
};

const EXPIRATION_STATUS_LABELS: Record<ExpirationStatus, string> = {
  all: 'All Licenses',
  active: 'Active',
  expiring: 'Expiring Soon',
  expired: 'Expired',
};

const LICENSE_TYPES: LicenseType[] = [
  'perpetual',
  'subscription',
  'volume',
  'oem',
  'trial',
  'educational',
  'enterprise',
];

interface LicenseFiltersProps {
  vendors?: string[];
}

export function LicenseFilters({ vendors = [] }: LicenseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(
    searchParams.get('search') ?? '',
  );

  const selectedLicenseTypes = useMemo(
    () => searchParams.get('licenseTypes')?.split(',') ?? [],
    [searchParams],
  );

  const expirationStatus = useMemo(
    () => (searchParams.get('expirationStatus') as ExpirationStatus) ?? 'all',
    [searchParams],
  );

  const selectedVendor = useMemo(
    () => searchParams.get('vendor') ?? 'all',
    [searchParams],
  );

  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'all') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Reset to page 1 when filters change
      params.delete('page');

      const queryString = params.toString();
      router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
    },
    [pathname, router, searchParams],
  );

  const handleLicenseTypeToggle = useCallback(
    (licenseType: LicenseType) => {
      const current = selectedLicenseTypes;
      const updated = current.includes(licenseType)
        ? current.filter((t) => t !== licenseType)
        : [...current, licenseType];

      updateSearchParams({
        licenseTypes: updated.length > 0 ? updated.join(',') : null,
      });
    },
    [selectedLicenseTypes, updateSearchParams],
  );

  const handleExpirationStatusChange = useCallback(
    (value: ExpirationStatus) => {
      updateSearchParams({
        expirationStatus: value === 'all' ? null : value,
      });
    },
    [updateSearchParams],
  );

  const handleVendorChange = useCallback(
    (value: string) => {
      updateSearchParams({
        vendor: value === 'all' ? null : value,
      });
    },
    [updateSearchParams],
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
      licenseTypes: null,
      expirationStatus: null,
      vendor: null,
      search: null,
    });
  }, [updateSearchParams]);

  const hasActiveFilters =
    selectedLicenseTypes.length > 0 ||
    expirationStatus !== 'all' ||
    selectedVendor !== 'all' ||
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
            placeholder="Search by name, vendor, or license key..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
            data-test="license-search-input"
            aria-label="Search licenses by name, vendor, or license key"
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
        <Select
          value={expirationStatus}
          onValueChange={handleExpirationStatusChange}
        >
          <SelectTrigger
            className="h-9 w-[160px]"
            data-test="expiration-status-select"
            aria-label="Filter by expiration status"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(EXPIRATION_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {vendors.length > 0 && (
          <Select value={selectedVendor} onValueChange={handleVendorChange}>
            <SelectTrigger
              className="h-9 w-[160px]"
              data-test="vendor-select"
              aria-label="Filter by vendor"
            >
              <SelectValue placeholder="All Vendors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vendors</SelectItem>
              {vendors.map((vendor) => (
                <SelectItem key={vendor} value={vendor}>
                  {vendor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              data-test="license-type-filter-trigger"
              aria-label={`Filter by license type${selectedLicenseTypes.length > 0 ? `, ${selectedLicenseTypes.length} selected` : ''}`}
            >
              <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
              License Type
              {selectedLicenseTypes.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 rounded-sm px-1"
                  aria-hidden="true"
                >
                  {selectedLicenseTypes.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[200px] p-3"
            align="end"
            role="dialog"
            aria-label="License type filter options"
          >
            <div className="space-y-2">
              <div
                className="text-sm font-medium"
                id="license-type-filter-label"
              >
                Filter by License Type
              </div>
              <div className="space-y-2">
                {LICENSE_TYPES.map((licenseType) => (
                  <div
                    key={licenseType}
                    className="flex items-center space-x-2"
                    data-test={`license-type-filter-${licenseType}`}
                  >
                    <Checkbox
                      id={`license-type-${licenseType}`}
                      checked={selectedLicenseTypes.includes(licenseType)}
                      onCheckedChange={() =>
                        handleLicenseTypeToggle(licenseType)
                      }
                    />
                    <Label
                      htmlFor={`license-type-${licenseType}`}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {LICENSE_TYPE_LABELS[licenseType]}
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
