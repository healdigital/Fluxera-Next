'use client';

import { useState } from 'react';

import { Download } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { toast } from '@kit/ui/sonner';

import { exportLicenses } from '../_lib/server/licenses-server-actions';

interface ExportLicensesButtonProps {
  accountSlug: string;
  filters?: {
    search?: string;
    vendor?: string;
    licenseTypes?: string[];
    expirationStatus?: 'all' | 'active' | 'expiring' | 'expired';
  };
}

export function ExportLicensesButton({
  accountSlug,
  filters,
}: ExportLicensesButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const result = await exportLicenses({
        accountSlug,
        search: filters?.search,
        vendor: filters?.vendor,
        licenseTypes: filters?.licenseTypes as
          | (
              | 'perpetual'
              | 'subscription'
              | 'volume'
              | 'oem'
              | 'trial'
              | 'educational'
              | 'enterprise'
            )[]
          | undefined,
        expirationStatus: filters?.expirationStatus,
      });

      if (!result.success || !result.data) {
        toast.error(result.message || 'Failed to export licenses');
        return;
      }

      // Create a blob from the CSV data
      const blob = new Blob([result.data.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `licenses-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(
        `Successfully exported ${result.data.count} license${result.data.count !== 1 ? 's' : ''}`,
      );
    } catch (error) {
      console.error('Export error:', error);
      toast.error('An unexpected error occurred while exporting');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isExporting}
      data-test="export-licenses-button"
      aria-label="Export licenses to CSV"
    >
      <Download
        className={`mr-2 h-4 w-4 ${isExporting ? 'animate-pulse' : ''}`}
        aria-hidden="true"
      />
      {isExporting ? 'Exporting...' : 'Export'}
    </Button>
  );
}
