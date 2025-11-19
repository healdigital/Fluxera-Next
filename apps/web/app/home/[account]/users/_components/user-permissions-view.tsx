'use client';

import { Check, Shield, X } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

interface UserPermission {
  permission: string;
  granted: boolean;
  source: 'role' | 'custom';
}

interface UserPermissionsViewProps {
  role: string;
  permissions: string[];
}

// Permission categories and their descriptions
const PERMISSION_CATEGORIES = {
  roles: {
    label: 'Role Management',
    description: 'Manage team roles and permissions',
    icon: Shield,
  },
  billing: {
    label: 'Billing & Subscriptions',
    description: 'Manage billing and subscription settings',
    icon: Shield,
  },
  settings: {
    label: 'Settings',
    description: 'Manage team settings and configuration',
    icon: Shield,
  },
  members: {
    label: 'Member Management',
    description: 'Manage team members and invitations',
    icon: Shield,
  },
  invites: {
    label: 'Invitations',
    description: 'Send and manage team invitations',
    icon: Shield,
  },
  tasks: {
    label: 'Tasks',
    description: 'Create, edit, and delete tasks',
    icon: Shield,
  },
} as const;

// All possible permissions in the system
const ALL_PERMISSIONS = [
  'roles.manage',
  'billing.manage',
  'settings.manage',
  'members.manage',
  'invites.manage',
  'tasks.write',
  'tasks.delete',
] as const;

export function UserPermissionsView({
  role,
  permissions,
}: UserPermissionsViewProps) {
  // Group permissions by category
  const permissionsByCategory = groupPermissionsByCategory(permissions);

  return (
    <Card data-test="user-permissions-view">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>
              Permissions granted through the{' '}
              <Badge variant="outline" className="font-normal">
                {role
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>{' '}
              role
            </CardDescription>
          </div>
          <Badge variant="secondary" data-test="permissions-count">
            {permissions.length} granted
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(permissionsByCategory).map(
            ([category, categoryPermissions]) => {
              const categoryInfo =
                PERMISSION_CATEGORIES[
                  category as keyof typeof PERMISSION_CATEGORIES
                ];

              if (!categoryInfo) return null;

              const Icon = categoryInfo.icon;

              return (
                <div
                  key={category}
                  className="space-y-3"
                  data-test={`permission-category-${category}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="text-muted-foreground mt-0.5 h-5 w-5" />
                    <div className="flex-1">
                      <h4 className="font-medium">{categoryInfo.label}</h4>
                      <p className="text-muted-foreground text-sm">
                        {categoryInfo.description}
                      </p>
                    </div>
                  </div>
                  <div className="ml-8 space-y-2">
                    {categoryPermissions.map((perm) => (
                      <PermissionItem key={perm.permission} permission={perm} />
                    ))}
                  </div>
                </div>
              );
            },
          )}

          {/* Show message if no permissions */}
          {permissions.length === 0 && (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
              <Shield className="mb-2 h-12 w-12 opacity-50" />
              <p className="text-sm">No permissions granted</p>
              <p className="text-xs">
                This role does not have any permissions assigned
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component to display individual permission
function PermissionItem({ permission }: { permission: UserPermission }) {
  const permissionLabel = formatPermissionLabel(permission.permission);

  return (
    <div
      className="flex items-center justify-between rounded-lg border p-3"
      data-test={`permission-${permission.permission}`}
    >
      <div className="flex items-center gap-3">
        {permission.granted ? (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
            <Check className="h-3 w-3 text-green-700" aria-hidden="true" />
          </div>
        ) : (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
            <X className="h-3 w-3 text-gray-500" aria-hidden="true" />
          </div>
        )}
        <span className="text-sm">{permissionLabel}</span>
      </div>
      <Badge
        variant={permission.source === 'role' ? 'secondary' : 'outline'}
        className="text-xs font-normal"
      >
        {permission.source === 'role' ? 'Role-based' : 'Custom'}
      </Badge>
    </div>
  );
}

// Helper function to group permissions by category
function groupPermissionsByCategory(
  permissions: string[],
): Record<string, UserPermission[]> {
  const grouped: Record<string, UserPermission[]> = {};

  // Process all possible permissions
  ALL_PERMISSIONS.forEach((perm) => {
    const parts = perm.split('.');
    const category = parts[0];
    const action = parts[1];

    if (!category || !action) return;

    const granted = permissions.includes(perm);

    if (!grouped[category]) {
      grouped[category] = [];
    }

    grouped[category].push({
      permission: perm,
      granted,
      source: 'role', // All permissions in this view are role-based
    });
  });

  // Filter out categories with no granted permissions
  return Object.fromEntries(
    Object.entries(grouped).filter(([_, perms]) =>
      perms.some((p) => p.granted),
    ),
  );
}

// Helper function to format permission labels
function formatPermissionLabel(permission: string): string {
  const parts = permission.split('.');
  const category = parts[0] || '';
  const action = parts[1] || '';

  const actionLabels: Record<string, string> = {
    manage: 'Manage',
    write: 'Create and Edit',
    delete: 'Delete',
    read: 'View',
  };

  const categoryLabels: Record<string, string> = {
    roles: 'roles',
    billing: 'billing',
    settings: 'settings',
    members: 'members',
    invites: 'invitations',
    tasks: 'tasks',
  };

  const actionLabel = actionLabels[action] || action;
  const categoryLabel = categoryLabels[category] || category;

  return `${actionLabel} ${categoryLabel}`;
}
