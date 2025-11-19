'use client';

import { useState } from 'react';

import { UserMinus } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

import { LicenseAssignmentWithDetails } from '../_lib/server/license-detail.loader';
import { UnassignLicenseDialog } from './unassign-license-dialog';

interface LicenseAssignmentsListProps {
  assignments: LicenseAssignmentWithDetails[];
  licenseId: string;
  licenseName: string;
  accountSlug: string;
}

export function LicenseAssignmentsList({
  assignments,
  licenseName,
  accountSlug,
}: LicenseAssignmentsListProps) {
  if (assignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
          <CardDescription>
            This license is not currently assigned to any users or assets
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignments</CardTitle>
        <CardDescription>
          {assignments.length}{' '}
          {assignments.length === 1 ? 'assignment' : 'assignments'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <AssignmentItem
              key={assignment.id}
              assignment={assignment}
              licenseName={licenseName}
              accountSlug={accountSlug}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AssignmentItem({
  assignment,
  licenseName,
  accountSlug,
}: {
  assignment: LicenseAssignmentWithDetails;
  licenseName: string;
  accountSlug: string;
}) {
  const [showUnassignDialog, setShowUnassignDialog] = useState(false);
  const isUserAssignment = assignment.assigned_to_user !== null;

  return (
    <div
      className="flex items-start justify-between rounded-lg border p-4"
      data-test="license-assignment-item"
    >
      <div className="flex-1 space-y-2">
        {/* Assignment Type Badge */}
        <div>
          <Badge variant="outline" className="font-normal">
            {isUserAssignment ? 'User' : 'Asset'}
          </Badge>
        </div>

        {/* User Assignment Details */}
        {isUserAssignment && assignment.user && (
          <div className="flex items-center gap-3">
            {assignment.user.picture_url && (
              <img
                src={assignment.user.picture_url}
                alt={assignment.user.name}
                className="h-10 w-10 rounded-full"
              />
            )}
            <div>
              <div className="font-medium" data-test="assigned-user-name">
                {assignment.user.name}
              </div>
              {assignment.user.email && (
                <div className="text-muted-foreground text-sm">
                  {assignment.user.email}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Asset Assignment Details */}
        {!isUserAssignment && assignment.asset && (
          <div>
            <div className="font-medium" data-test="assigned-asset-name">
              {assignment.asset.name}
            </div>
            <div className="text-muted-foreground text-sm">
              {formatAssetCategory(assignment.asset.category)}
              {assignment.asset.serial_number && (
                <span className="ml-2">
                  • SN: {assignment.asset.serial_number}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Assignment Metadata */}
        <div className="text-muted-foreground text-xs">
          Assigned on{' '}
          {assignment.assigned_at
            ? new Date(assignment.assigned_at).toLocaleDateString()
            : 'Unknown'}
        </div>

        {/* Assignment Notes */}
        {assignment.notes && (
          <div className="text-sm">
            <span className="text-muted-foreground font-medium">Notes: </span>
            {assignment.notes}
          </div>
        )}
      </div>

      {/* Unassign Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowUnassignDialog(true)}
        data-test="unassign-button"
        aria-label={`Unassign ${licenseName} from ${isUserAssignment ? assignment.user?.name : assignment.asset?.name}`}
      >
        <UserMinus className="h-4 w-4" aria-hidden="true" />
      </Button>

      {/* Unassign Confirmation Dialog */}
      <UnassignLicenseDialog
        open={showUnassignDialog}
        onOpenChange={setShowUnassignDialog}
        assignmentId={assignment.id}
        assignmentType={isUserAssignment ? 'user' : 'asset'}
        assignmentName={
          isUserAssignment
            ? assignment.user?.name || 'Unknown User'
            : assignment.asset?.name || 'Unknown Asset'
        }
        licenseName={licenseName}
        accountSlug={accountSlug}
      />
    </div>
  );
}

// Helper function to format asset category
function formatAssetCategory(category: string): string {
  const categoryLabels: Record<string, string> = {
    laptop: 'Laptop',
    desktop: 'Desktop',
    mobile_phone: 'Mobile Phone',
    tablet: 'Tablet',
    monitor: 'Monitor',
    printer: 'Printer',
    other_equipment: 'Other Equipment',
  };

  return categoryLabels[category] || category;
}
