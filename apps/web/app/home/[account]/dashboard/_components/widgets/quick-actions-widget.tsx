'use client';

import Link from 'next/link';

import { Laptop, Package, Plus, UserPlus, Wrench } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

interface QuickActionsWidgetProps {
  accountSlug: string;
}

/**
 * Quick Actions Widget
 * Provides shortcuts to frequently used actions
 * Actions are filtered based on user's role permissions (handled by RLS at database level)
 */
export function QuickActionsWidget({ accountSlug }: QuickActionsWidgetProps) {
  const actions = [
    {
      id: 'create-asset',
      label: 'Create Asset',
      description: 'Add a new asset to inventory',
      icon: <Laptop className="h-5 w-5" />,
      href: `/home/${accountSlug}/assets/new`,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
    },
    {
      id: 'add-user',
      label: 'Add User',
      description: 'Invite a new team member',
      icon: <UserPlus className="h-5 w-5" />,
      href: `/home/${accountSlug}/users?action=invite`,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-950',
    },
    {
      id: 'register-license',
      label: 'Register License',
      description: 'Add a software license',
      icon: <Package className="h-5 w-5" />,
      href: `/home/${accountSlug}/licenses?action=create`,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-950',
    },
    {
      id: 'schedule-maintenance',
      label: 'Schedule Maintenance',
      description: 'Plan asset maintenance',
      icon: <Wrench className="h-5 w-5" />,
      href: `/home/${accountSlug}/maintenance?action=schedule`,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-950',
    },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              asChild
              variant="outline"
              className="hover:bg-muted/50 h-auto justify-start p-4"
              data-test={`quick-action-${action.id}`}
            >
              <Link href={action.href} aria-label={action.description}>
                <div className="flex w-full items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${action.bgColor}`}
                  >
                    <span className={action.color}>{action.icon}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-muted-foreground text-xs">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
