'use client';

import * as React from 'react';

import { useFocusReturn } from '../hooks/use-focus-return';
import { useScreenReaderAnnounce } from '../hooks/use-screen-reader-announce';
import { cn } from '../lib/utils';
import { LoadingSpinner } from '../makerkit/loading-spinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../shadcn/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../shadcn/avatar';
import { Badge } from '../shadcn/badge';
import { Button } from '../shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../shadcn/dialog';
import { Input } from '../shadcn/input';

export interface AssignmentUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface AssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: 'asset' | 'license';
  entityName: string;
  currentAssignee?: AssignmentUser;
  users: AssignmentUser[];
  onAssign: (userId: string) => Promise<void>;
  onUnassign?: () => Promise<void>;
  loading?: boolean;
  searchLoading?: boolean;
}

/**
 * AssignmentModal - Specialized modal for assigning assets/licenses to users
 *
 * Features:
 * - Real-time user search with debouncing
 * - Current assignment display
 * - Reassignment warning
 * - Unassignment option
 * - Loading states
 *
 * @example
 * ```tsx
 * <AssignmentModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   entityType="asset"
 *   entityId="asset-123"
 *   entityName="MacBook Pro"
 *   currentAssignee={currentUser}
 *   users={availableUsers}
 *   onAssign={handleAssign}
 *   onUnassign={handleUnassign}
 * />
 * ```
 */
export function AssignmentModal({
  open,
  onOpenChange,
  entityType,
  entityName,
  currentAssignee,
  users,
  onAssign,
  onUnassign,
  loading = false,
  searchLoading = false,
}: AssignmentModalProps) {
  // Ensure focus returns to trigger element on close
  useFocusReturn(open);

  // Announce modal opening to screen readers
  const assignmentMessage = currentAssignee
    ? `Assign ${entityType} ${entityName} dialog opened. Currently assigned to ${currentAssignee.name}.`
    : `Assign ${entityType} ${entityName} dialog opened.`;
  useScreenReaderAnnounce(assignmentMessage, open, 'polite');

  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedUser, setSelectedUser] = React.useState<
    AssignmentUser | undefined
  >();
  const [showReassignWarning, setShowReassignWarning] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Filter users based on search
  const filteredUsers = React.useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term),
    );
  }, [users, searchTerm]);

  const handleUserSelect = React.useCallback(
    (user: AssignmentUser) => {
      if (currentAssignee && currentAssignee.id !== user.id) {
        // Show reassignment warning
        setSelectedUser(user);
        setShowReassignWarning(true);
      } else {
        // Direct assignment
        setSelectedUser(user);
      }
    },
    [currentAssignee],
  );

  const handleConfirmAssignment = React.useCallback(async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      await onAssign(selectedUser.id);
      setShowReassignWarning(false);
      onOpenChange(false);
      setSearchTerm('');
      setSelectedUser(undefined);
    } catch (error) {
      console.error('Assignment failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedUser, onAssign, onOpenChange]);

  const handleUnassign = React.useCallback(async () => {
    if (!onUnassign) return;

    setIsSubmitting(true);
    try {
      await onUnassign();
      onOpenChange(false);
    } catch (error) {
      console.error('Unassignment failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onUnassign, onOpenChange]);

  const handleDirectAssign = React.useCallback(async () => {
    if (!selectedUser) return;
    await handleConfirmAssignment();
  }, [selectedUser, handleConfirmAssignment]);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setSelectedUser(undefined);
      setShowReassignWarning(false);
    }
  }, [open]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>
              Assign {entityType === 'asset' ? 'Asset' : 'License'}
            </DialogTitle>
            <DialogDescription>
              Assign &ldquo;{entityName}&rdquo; to a user
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Assignment */}
            {currentAssignee && (
              <div className="bg-muted rounded-lg p-3">
                <div className="mb-2 text-sm font-medium">
                  Currently Assigned To
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentAssignee.avatarUrl} />
                      <AvatarFallback>
                        {currentAssignee.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">
                        {currentAssignee.name}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {currentAssignee.email}
                      </div>
                    </div>
                  </div>
                  {onUnassign && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleUnassign}
                      disabled={isSubmitting}
                    >
                      Unassign
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Search Input */}
            <div className="space-y-2">
              <label htmlFor="user-search" className="text-sm font-medium">
                Search Users
              </label>
              <Input
                id="user-search"
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading || isSubmitting}
                aria-label="Search users by name or email"
                aria-describedby="user-search-description"
              />
              <span id="user-search-description" className="sr-only">
                Type to filter the list of users below
              </span>
            </div>

            {/* User List */}
            <div 
              className="max-h-[300px] space-y-2 overflow-y-auto"
              role="listbox"
              aria-label="Available users"
              aria-busy={searchLoading}
            >
              {searchLoading ? (
                <div className="flex items-center justify-center py-8" role="status">
                  <LoadingSpinner aria-label="Loading users" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center text-sm" role="status">
                  {searchTerm ? 'No users found' : 'No users available'}
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleUserSelect(user)}
                    disabled={isSubmitting}
                    role="option"
                    aria-selected={selectedUser?.id === user.id}
                    aria-label={`Assign to ${user.name}, ${user.email}${currentAssignee?.id === user.id ? ', currently assigned' : ''}`}
                    className={cn(
                      'hover:bg-accent flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors',
                      selectedUser?.id === user.id && 'bg-accent',
                      currentAssignee?.id === user.id && 'opacity-50',
                    )}
                  >
                    <Avatar className="h-10 w-10" aria-hidden="true">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">{user.name}</div>
                        {currentAssignee?.id === user.id && (
                          <Badge variant="secondary" className="text-xs" aria-label="Currently assigned">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {user.email}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="min-h-[44px]" // Touch-friendly
            >
              Cancel
            </Button>
            <Button
              onClick={handleDirectAssign}
              disabled={!selectedUser || isSubmitting}
              className="min-h-[44px]" // Touch-friendly
            >
              {isSubmitting ? <LoadingSpinner className="h-4 w-4" /> : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassignment Warning */}
      <AlertDialog
        open={showReassignWarning}
        onOpenChange={setShowReassignWarning}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Reassignment</AlertDialogTitle>
            <AlertDialogDescription>
              This {entityType} is currently assigned to{' '}
              <strong>{currentAssignee?.name}</strong>. Are you sure you want to
              reassign it to <strong>{selectedUser?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowReassignWarning(false);
                setSelectedUser(undefined);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAssignment}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoadingSpinner className="h-4 w-4" />
              ) : (
                'Reassign'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
