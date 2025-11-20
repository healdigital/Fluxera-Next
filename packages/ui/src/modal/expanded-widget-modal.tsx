'use client';

import * as React from 'react';

import { format } from 'date-fns';
import { type DateRange } from 'react-day-picker';

import { useFocusReturn } from '../hooks/use-focus-return';
import { useScreenReaderAnnounce } from '../hooks/use-screen-reader-announce';
import { cn } from '../lib/utils';
import { LoadingSpinner } from '../makerkit/loading-spinner';
import { Button } from '../shadcn/button';
import { Calendar } from '../shadcn/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../shadcn/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../shadcn/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../shadcn/select';

export interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'dateRange';
  options?: Array<{ value: string; label: string }>;
  value?: string | { from: Date; to: Date };
  onChange: (value: string | { from: Date; to: Date }) => void;
}

export interface ExpandedWidgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  loading?: boolean;
  filters?: FilterConfig[];
  onExport?: (format: 'csv' | 'pdf') => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * ExpandedWidgetModal - Display dashboard widgets in expanded view
 *
 * Features:
 * - Full-screen or large modal
 * - Interactive filters
 * - Real-time data updates
 * - Export functionality (CSV, PDF)
 * - Responsive charts and tables
 *
 * @example
 * ```tsx
 * <ExpandedWidgetModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Asset Distribution"
 *   description="Detailed view of asset distribution by category"
 *   data={chartData}
 *   filters={[
 *     {
 *       id: 'category',
 *       label: 'Category',
 *       type: 'select',
 *       options: categories,
 *       onChange: handleCategoryChange
 *     }
 *   ]}
 *   onExport={handleExport}
 * >
 *   <AssetChart data={chartData} />
 * </ExpandedWidgetModal>
 * ```
 */
export function ExpandedWidgetModal({
  open,
  onOpenChange,
  title,
  description,
  loading = false,
  filters = [],
  onExport,
  children,
  className,
}: ExpandedWidgetModalProps) {
  // Ensure focus returns to trigger element on close
  useFocusReturn(open);

  // Announce widget expansion to screen readers
  useScreenReaderAnnounce(
    `${title} expanded view opened. ${description || ''}`,
    open,
    'polite'
  );

  const [exportLoading, setExportLoading] = React.useState(false);

  const handleExport = React.useCallback(
    async (format: 'csv' | 'pdf') => {
      if (!onExport) return;

      setExportLoading(true);
      try {
        await onExport(format);
      } catch (error) {
        console.error('Export failed:', error);
      } finally {
        setExportLoading(false);
      }
    },
    [onExport],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[90vh] flex-col',
          'w-[95vw] sm:w-full',
          'max-w-full sm:max-w-6xl',
          'p-4 sm:p-6',
          className
        )}
        aria-describedby={description ? 'widget-description' : undefined}
      >
        <DialogHeader className="shrink-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 space-y-1.5">
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription id="widget-description">
                  {description}
                </DialogDescription>
              )}
            </div>

            {/* Export Buttons */}
            {onExport && (
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Export options">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('csv')}
                  disabled={loading || exportLoading}
                  aria-label="Export data as CSV file"
                  aria-busy={exportLoading}
                  className="min-h-[44px]" // Touch-friendly
                >
                  {exportLoading ? (
                    <LoadingSpinner className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    'Export CSV'
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('pdf')}
                  disabled={loading || exportLoading}
                  aria-label="Export data as PDF file"
                  aria-busy={exportLoading}
                  className="min-h-[44px]" // Touch-friendly
                >
                  {exportLoading ? (
                    <LoadingSpinner className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    'Export PDF'
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Filters */}
          {filters.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 pt-4">
              {filters.map((filter) => (
                <div key={filter.id} className="flex items-center gap-2">
                  <label
                    htmlFor={`filter-${filter.id}`}
                    className="text-sm font-medium"
                  >
                    {filter.label}:
                  </label>

                  {filter.type === 'select' && filter.options && (
                    <Select
                      value={filter.value as string}
                      onValueChange={filter.onChange}
                      disabled={loading}
                    >
                      <SelectTrigger
                        id={`filter-${filter.id}`}
                        className="w-[180px]"
                      >
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {filter.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {filter.type === 'dateRange' && (
                    <DateRangePicker
                      value={filter.value as { from: Date; to: Date }}
                      onChange={filter.onChange}
                      disabled={loading}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <LoadingSpinner className="h-8 w-8" />
            </div>
          ) : (
            <div className="space-y-4">{children}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * DateRangePicker - Internal component for date range selection
 */
function DateRangePicker({
  value,
  onChange,
  disabled,
}: {
  value?: { from: Date; to: Date };
  onChange: (value: { from: Date; to: Date }) => void;
  disabled?: boolean;
}) {
  const [date, setDate] = React.useState<DateRange | undefined>(value);

  const handleSelect = React.useCallback(
    (newDate: DateRange | undefined) => {
      setDate(newDate);
      if (newDate?.from && newDate?.to) {
        onChange({ from: newDate.from, to: newDate.to });
      }
    },
    [onChange],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !date && 'text-muted-foreground',
          )}
          disabled={disabled}
        >
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, 'LLL dd, y')} -{' '}
                {format(date.to, 'LLL dd, y')}
              </>
            ) : (
              format(date.from, 'LLL dd, y')
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
