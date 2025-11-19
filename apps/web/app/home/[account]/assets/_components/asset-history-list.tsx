'use client';

import {
  Calendar,
  CheckCircle,
  Edit,
  PlusCircle,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

import { type AssetHistoryWithUser } from '../_lib/server/asset-detail.loader';

interface AssetHistoryListProps {
  history: AssetHistoryWithUser[];
}

export function AssetHistoryList({ history }: AssetHistoryListProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>No history entries yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card data-test="asset-history-card">
      <CardHeader>
        <CardTitle>History</CardTitle>
        <CardDescription>
          Complete timeline of all changes and events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" role="list" aria-label="Asset history">
          {history.map((entry) => (
            <HistoryEntry key={entry.id} entry={entry} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function HistoryEntry({ entry }: { entry: AssetHistoryWithUser }) {
  const icon = getEventIcon(entry.event_type);
  const description = getEventDescription(entry);

  return (
    <div
      className="flex gap-3 border-b pb-4 last:border-b-0 last:pb-0"
      data-test={`history-entry-${entry.event_type}`}
      role="listitem"
    >
      <div className="text-muted-foreground mt-1" aria-hidden="true">
        {icon}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <EventTypeBadge eventType={entry.event_type} />
          {entry.created_at ? (
            <time
              className="text-muted-foreground text-sm"
              dateTime={entry.created_at}
              data-test="history-timestamp"
            >
              {new Date(entry.created_at).toLocaleString()}
            </time>
          ) : (
            <span
              className="text-muted-foreground text-sm"
              data-test="history-timestamp"
            >
              Unknown date
            </span>
          )}
        </div>
        <p className="text-sm" data-test="history-description">
          {description}
        </p>
        {entry.user && (
          <div
            className="text-muted-foreground flex items-center gap-2 text-sm"
            data-test="history-user"
          >
            {entry.user.picture_url && (
              <img
                src={entry.user.picture_url}
                alt=""
                aria-hidden="true"
                className="h-5 w-5 rounded-full"
              />
            )}
            <span>by {entry.user.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function getEventIcon(eventType: AssetHistoryWithUser['event_type']) {
  const iconMap = {
    created: <PlusCircle className="h-5 w-5" />,
    updated: <Edit className="h-5 w-5" />,
    status_changed: <CheckCircle className="h-5 w-5" />,
    assigned: <UserCheck className="h-5 w-5" />,
    unassigned: <UserX className="h-5 w-5" />,
    deleted: <Trash2 className="h-5 w-5" />,
  };

  return iconMap[eventType] || <Calendar className="h-5 w-5" />;
}

function EventTypeBadge({
  eventType,
}: {
  eventType: AssetHistoryWithUser['event_type'];
}) {
  const badgeConfig = {
    created: {
      label: 'Created',
      className:
        'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100',
    },
    updated: {
      label: 'Updated',
      className:
        'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100',
    },
    status_changed: {
      label: 'Status Changed',
      className:
        'bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100',
    },
    assigned: {
      label: 'Assigned',
      className:
        'bg-cyan-100 text-cyan-900 dark:bg-cyan-900 dark:text-cyan-100',
    },
    unassigned: {
      label: 'Unassigned',
      className:
        'bg-orange-100 text-orange-900 dark:bg-orange-900 dark:text-orange-100',
    },
    deleted: {
      label: 'Deleted',
      className: 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100',
    },
  };

  const config = badgeConfig[eventType] || {
    label: eventType,
    className: 'bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100',
  };

  return (
    <Badge
      variant="secondary"
      className={config.className}
      aria-label={`Event type: ${config.label}`}
    >
      {config.label}
    </Badge>
  );
}

function getEventDescription(entry: AssetHistoryWithUser): string {
  const { event_type, event_data } = entry;

  switch (event_type) {
    case 'created':
      return 'Asset was created';

    case 'updated':
      if (event_data.changes) {
        const changes = event_data.changes as Record<string, unknown>;
        const changedFields = Object.keys(changes).filter(
          (key) => changes[key] !== null,
        );
        if (changedFields.length > 0) {
          return `Updated: ${changedFields.join(', ')}`;
        }
      }
      return 'Asset was updated';

    case 'status_changed':
      if (event_data.old_status && event_data.new_status) {
        return `Status changed from "${formatStatus(String(event_data.old_status))}" to "${formatStatus(String(event_data.new_status))}"`;
      }
      return 'Status was changed';

    case 'assigned':
      return 'Asset was assigned to a user';

    case 'unassigned':
      return 'Asset was unassigned';

    case 'deleted':
      return 'Asset was deleted';

    default:
      return 'Event occurred';
  }
}

function formatStatus(status: string): string {
  const statusLabels: Record<string, string> = {
    available: 'Available',
    assigned: 'Assigned',
    in_maintenance: 'In Maintenance',
    retired: 'Retired',
    lost: 'Lost',
  };

  return statusLabels[status] || status;
}
