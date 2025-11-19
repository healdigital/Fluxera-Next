'use client';

import { useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import {
  Activity,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  XCircle,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';

import { ExportActivityDialog } from './export-activity-dialog';

interface UserActivityWithDetails {
  id: string;
  user_id: string;
  account_id: string;
  action_type: string;
  resource_type: string | null;
  resource_id: string | null;
  action_details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  result_status: string;
  created_at: string;
  user: {
    display_name: string;
    email: string;
    avatar_url: string | null;
  };
}

interface UserActivityListProps {
  activities: UserActivityWithDetails[];
  userId: string;
  accountSlug: string;
  currentPage: number;
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  user_created: 'User Created',
  user_updated: 'User Updated',
  user_deleted: 'User Deleted',
  role_changed: 'Role Changed',
  status_changed: 'Status Changed',
  asset_assigned: 'Asset Assigned',
  asset_unassigned: 'Asset Unassigned',
  login: 'Login',
  logout: 'Logout',
  password_changed: 'Password Changed',
  profile_updated: 'Profile Updated',
};

const RESULT_STATUS_CONFIG = {
  success: {
    label: 'Success',
    icon: CheckCircle,
    variant: 'success' as const,
  },
  failure: {
    label: 'Failed',
    icon: XCircle,
    variant: 'destructive' as const,
  },
  partial: {
    label: 'Partial',
    icon: AlertCircle,
    variant: 'warning' as const,
  },
};

export function UserActivityList({
  activities,
  userId,
  accountSlug,
  currentPage,
}: UserActivityListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [actionType, setActionType] = useState(
    searchParams.get('action_type') || '',
  );
  const [startDate, setStartDate] = useState(
    searchParams.get('start_date') || '',
  );
  const [endDate, setEndDate] = useState(searchParams.get('end_date') || '');

  const handleFilterChange = () => {
    const params = new URLSearchParams();

    if (actionType) params.set('action_type', actionType);
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);

    router.push(
      `/home/${accountSlug}/users/${userId}/activity?${params.toString()}`,
    );
  };

  const handleClearFilters = () => {
    setActionType('');
    setStartDate('');
    setEndDate('');
    router.push(`/home/${accountSlug}/users/${userId}/activity`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(
      `/home/${accountSlug}/users/${userId}/activity?${params.toString()}`,
    );
  };

  const formatActionDetails = (
    actionType: string,
    details: Record<string, unknown> | null,
  ): string => {
    if (!details || Object.keys(details).length === 0) {
      return '';
    }

    switch (actionType) {
      case 'role_changed':
        return `Changed from ${details.old_role || 'N/A'} to ${details.new_role || 'N/A'}`;
      case 'status_changed':
        return `Changed to ${details.new_status || 'N/A'}${details.reason ? `: ${details.reason}` : ''}`;
      case 'asset_assigned':
      case 'asset_unassigned':
        return `Asset: ${details.asset_name || details.asset_id || 'Unknown'}`;
      case 'profile_updated':
        return `Updated fields: ${Object.keys(details).join(', ')}`;
      default:
        return JSON.stringify(details);
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header with Export Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Activity Filters</h2>
          <p className="text-muted-foreground text-sm">
            Filter and export activity logs
          </p>
        </div>
        <ExportActivityDialog
          userId={userId}
          accountSlug={accountSlug}
          actionType={actionType || undefined}
          startDate={startDate || undefined}
          endDate={endDate || undefined}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="min-w-[200px] flex-1">
          <Select value={actionType} onValueChange={setActionType}>
            <SelectTrigger data-test="activity-action-type-filter">
              <SelectValue placeholder="Filter by action type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="" data-test="action-type-all">
                All Actions
              </SelectItem>
              {Object.entries(ACTION_TYPE_LABELS).map(([value, label]) => (
                <SelectItem
                  key={value}
                  value={value}
                  data-test={`action-type-${value}`}
                >
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[200px] flex-1">
          <Input
            type="date"
            placeholder="Start date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            data-test="activity-start-date-input"
          />
        </div>

        <div className="min-w-[200px] flex-1">
          <Input
            type="date"
            placeholder="End date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            data-test="activity-end-date-input"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleFilterChange}
            data-test="apply-activity-filters-button"
          >
            Apply Filters
          </Button>
          <Button
            variant="outline"
            onClick={handleClearFilters}
            data-test="clear-activity-filters-button"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Activity Table */}
      {activities.length === 0 ? (
        <div className="py-12 text-center">
          <Activity className="text-muted-foreground mx-auto h-12 w-12" />
          <h3 className="mt-4 text-lg font-semibold">No activity found</h3>
          <p className="text-muted-foreground">
            No activity logs match your current filters.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => {
                  const statusConfig =
                    RESULT_STATUS_CONFIG[
                      activity.result_status as keyof typeof RESULT_STATUS_CONFIG
                    ];
                  const StatusIcon = statusConfig?.icon || Activity;

                  return (
                    <TableRow
                      key={activity.id}
                      data-test={`activity-row-${activity.id}`}
                    >
                      <TableCell
                        className="whitespace-nowrap"
                        data-test="activity-timestamp"
                      >
                        {formatTimestamp(activity.created_at)}
                      </TableCell>
                      <TableCell data-test="activity-action-type">
                        <Badge variant="outline">
                          {ACTION_TYPE_LABELS[activity.action_type] ||
                            activity.action_type}
                        </Badge>
                      </TableCell>
                      <TableCell data-test="activity-resource-type">
                        {activity.resource_type ? (
                          <span className="text-muted-foreground text-sm">
                            {activity.resource_type}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell
                        className="max-w-md truncate"
                        data-test="activity-details"
                      >
                        {formatActionDetails(
                          activity.action_type,
                          activity.action_details,
                        ) || '-'}
                      </TableCell>
                      <TableCell data-test="activity-status">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge variant={statusConfig?.variant || 'default'}>
                            {statusConfig?.label || activity.result_status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell
                        className="text-muted-foreground text-sm"
                        data-test="activity-ip-address"
                      >
                        {activity.ip_address || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">Page {currentPage}</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={activities.length < 50}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
