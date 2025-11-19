'use client';

import { useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Label } from '@kit/ui/label';
import { RadioGroup, RadioGroupItem } from '@kit/ui/radio-group';

import {
  type ExportUserActivityData,
  ExportUserActivitySchema,
} from '~/home/[account]/users/_lib/schemas/user.schema';
import { exportUserActivity } from '~/home/[account]/users/_lib/server/users-server-actions';

interface ExportActivityDialogProps {
  userId: string;
  accountSlug: string;
  actionType?: string;
  startDate?: string;
  endDate?: string;
}

export function ExportActivityDialog({
  userId,
  accountSlug,
  actionType,
  startDate,
  endDate,
}: ExportActivityDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<ExportUserActivityData>({
    resolver: zodResolver(ExportUserActivitySchema),
    defaultValues: {
      user_id: userId,
      format: 'csv',
      action_type: actionType,
      start_date: startDate,
      end_date: endDate,
    },
  });

  const handleExport = (data: ExportUserActivityData) => {
    startTransition(async () => {
      try {
        setError(null);
        setSuccess(false);

        const result = await exportUserActivity({
          ...data,
          accountSlug,
        });

        if (!result.success) {
          setError(result.message || 'Failed to export activity logs');
          return;
        }

        if (!result.data) {
          setError('No data returned from export');
          return;
        }

        // Create a blob and trigger download
        const blob = new Blob([result.data.content], {
          type: result.data.contentType,
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
        }, 1500);
      } catch (error) {
        console.error('Export error:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Activity Logs</DialogTitle>
          <DialogDescription>
            Choose a format to export the activity logs. The export will include
            all activities matching your current filters.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Export Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertTitle>Export Successful</AlertTitle>
            <AlertDescription>
              Your activity logs have been downloaded successfully.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleExport)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Export Format</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div className="hover:bg-accent flex items-center space-x-3 rounded-lg border p-4">
                        <RadioGroupItem value="csv" id="csv" />
                        <Label
                          htmlFor="csv"
                          className="flex flex-1 cursor-pointer items-center gap-3"
                        >
                          <FileSpreadsheet className="h-5 w-5 text-green-600" />
                          <div className="flex-1">
                            <div className="font-medium">CSV</div>
                            <div className="text-muted-foreground text-sm">
                              Comma-separated values, compatible with Excel and
                              spreadsheet applications
                            </div>
                          </div>
                        </Label>
                      </div>

                      <div className="hover:bg-accent flex items-center space-x-3 rounded-lg border p-4">
                        <RadioGroupItem value="json" id="json" />
                        <Label
                          htmlFor="json"
                          className="flex flex-1 cursor-pointer items-center gap-3"
                        >
                          <FileJson className="h-5 w-5 text-blue-600" />
                          <div className="flex-1">
                            <div className="font-medium">JSON</div>
                            <div className="text-muted-foreground text-sm">
                              Structured data format, ideal for programmatic
                              processing
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Select the format that best suits your needs
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(actionType || startDate || endDate) && (
              <div className="bg-muted/50 rounded-lg border p-4">
                <h4 className="mb-2 text-sm font-medium">Active Filters</h4>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  {actionType && (
                    <li>
                      <span className="font-medium">Action Type:</span>{' '}
                      {actionType}
                    </li>
                  )}
                  {startDate && (
                    <li>
                      <span className="font-medium">Start Date:</span>{' '}
                      {startDate}
                    </li>
                  )}
                  {endDate && (
                    <li>
                      <span className="font-medium">End Date:</span> {endDate}
                    </li>
                  )}
                </ul>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Download className="mr-2 h-4 w-4 animate-pulse" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
