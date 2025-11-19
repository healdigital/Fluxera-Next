'use client';

import { useState, useTransition } from 'react';

import { ArrowDown, ArrowUp, Eye, EyeOff, Settings } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import { toast } from '@kit/ui/sonner';

import type { WidgetType } from '../_lib/schemas/dashboard.schema';
import { updateWidgetLayout } from '../_lib/server/dashboard-server-actions';
import type { DashboardWidget } from '../_lib/types/dashboard.types';

interface ConfigureWidgetsDialogProps {
  widgets: DashboardWidget[];
  accountSlug: string;
}

interface WidgetConfig {
  widget_type: WidgetType;
  position_order: number;
  is_visible: boolean;
  label: string;
  description: string;
}

// Widget metadata for display
const WIDGET_METADATA: Record<
  WidgetType,
  { label: string; description: string }
> = {
  metrics_summary: {
    label: 'Metrics Summary',
    description:
      'Overview of key metrics including assets, users, and licenses',
  },
  asset_status: {
    label: 'Asset Status',
    description: 'Distribution of assets by status with pie chart',
  },
  trend_chart: {
    label: 'Trend Chart',
    description: 'Historical trends for assets, users, and licenses',
  },
  alerts: {
    label: 'Alerts',
    description: 'Active alerts and notifications requiring attention',
  },
  quick_actions: {
    label: 'Quick Actions',
    description: 'Shortcuts to frequently used actions',
  },
  recent_activity: {
    label: 'Recent Activity',
    description: 'Latest activity and changes in your account',
  },
  license_expiry: {
    label: 'License Expiry',
    description: 'Upcoming license expirations and renewals',
  },
  maintenance_schedule: {
    label: 'Maintenance Schedule',
    description: 'Scheduled and pending maintenance tasks',
  },
};

/**
 * Configure Widgets Dialog Component
 * Allows users to customize their dashboard by showing/hiding widgets
 * and reordering them using up/down buttons
 */
export function ConfigureWidgetsDialog({
  widgets,
  accountSlug,
}: ConfigureWidgetsDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Initialize widget configuration from existing widgets or defaults
  const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfig[]>(() => {
    // Get all available widget types
    const allWidgetTypes = Object.keys(WIDGET_METADATA) as WidgetType[];

    // If user has configured widgets, use those
    if (widgets.length > 0) {
      return widgets
        .map((widget) => ({
          widget_type: widget.widget_type,
          position_order: widget.position_order,
          is_visible: widget.is_visible,
          label: WIDGET_METADATA[widget.widget_type].label,
          description: WIDGET_METADATA[widget.widget_type].description,
        }))
        .sort((a, b) => a.position_order - b.position_order);
    }

    // Otherwise, use default configuration (all visible)
    return allWidgetTypes.map((widgetType, index) => ({
      widget_type: widgetType,
      position_order: index,
      is_visible: true,
      label: WIDGET_METADATA[widgetType].label,
      description: WIDGET_METADATA[widgetType].description,
    }));
  });

  /**
   * Toggle widget visibility
   */
  const toggleVisibility = (widgetType: WidgetType) => {
    setWidgetConfigs((prev) =>
      prev.map((config) =>
        config.widget_type === widgetType
          ? { ...config, is_visible: !config.is_visible }
          : config,
      ),
    );
  };

  /**
   * Move widget up in the order
   */
  const moveUp = (index: number) => {
    if (index === 0) return;

    setWidgetConfigs((prev) => {
      const newConfigs = [...prev];
      const temp = newConfigs[index];
      const prevItem = newConfigs[index - 1];

      if (!temp || !prevItem) return prev;

      newConfigs[index] = prevItem;
      newConfigs[index - 1] = temp;

      // Update position_order values
      return newConfigs.map((config, idx) => ({
        ...config,
        position_order: idx,
      }));
    });
  };

  /**
   * Move widget down in the order
   */
  const moveDown = (index: number) => {
    if (index === widgetConfigs.length - 1) return;

    setWidgetConfigs((prev) => {
      const newConfigs = [...prev];
      const temp = newConfigs[index];
      const nextItem = newConfigs[index + 1];

      if (!temp || !nextItem) return prev;

      newConfigs[index] = nextItem;
      newConfigs[index + 1] = temp;

      // Update position_order values
      return newConfigs.map((config, idx) => ({
        ...config,
        position_order: idx,
      }));
    });
  };

  /**
   * Save widget configuration
   */
  const handleSave = async () => {
    startTransition(async () => {
      try {
        await updateWidgetLayout({
          accountSlug,
          widgets: widgetConfigs.map((config) => ({
            widget_type: config.widget_type,
            position_order: config.position_order,
            is_visible: config.is_visible,
          })),
        });

        toast.success('Widget configuration saved', {
          description: 'Your dashboard layout has been updated',
        });

        setOpen(false);
      } catch (error) {
        console.error('Error saving widget configuration:', error);
        toast.error('Failed to save widget configuration', {
          description: error instanceof Error ? error.message : 'An unexpected error occurred',
        });
      }
    });
  };

  /**
   * Reset to default configuration
   */
  const handleReset = () => {
    const allWidgetTypes = Object.keys(WIDGET_METADATA) as WidgetType[];
    setWidgetConfigs(
      allWidgetTypes.map((widgetType, index) => ({
        widget_type: widgetType,
        position_order: index,
        is_visible: true,
        label: WIDGET_METADATA[widgetType].label,
        description: WIDGET_METADATA[widgetType].description,
      })),
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          data-test="configure-widgets-button"
        >
          <Settings className="mr-2 h-4 w-4" />
          Configure Widgets
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[80vh] max-w-2xl overflow-hidden"
        data-test="configure-widgets-dialog"
      >
        <DialogHeader>
          <DialogTitle>Configure Dashboard Widgets</DialogTitle>
          <DialogDescription>
            Customize your dashboard by showing or hiding widgets and changing
            their order. Use the arrow buttons to reorder widgets.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-2 overflow-y-auto pr-2">
          {widgetConfigs.map((config, index) => (
            <div
              key={config.widget_type}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                config.is_visible ? 'bg-background' : 'bg-muted/50 opacity-60'
              }`}
            >
              {/* Reorder buttons */}
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => moveUp(index)}
                  disabled={index === 0 || isPending}
                  aria-label={`Move ${config.label} up`}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => moveDown(index)}
                  disabled={index === widgetConfigs.length - 1 || isPending}
                  aria-label={`Move ${config.label} down`}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>

              {/* Widget info */}
              <div className="flex-1">
                <h4 className="font-medium">{config.label}</h4>
                <p className="text-muted-foreground text-sm">
                  {config.description}
                </p>
              </div>

              {/* Visibility toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleVisibility(config.widget_type)}
                disabled={isPending}
                aria-label={
                  config.is_visible
                    ? `Hide ${config.label}`
                    : `Show ${config.label}`
                }
                data-test={`toggle-widget-${config.widget_type}`}
              >
                {config.is_visible ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-row justify-between gap-2 sm:justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isPending}
            type="button"
          >
            Reset to Default
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              type="button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              type="button"
              data-test="save-widget-config-button"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
