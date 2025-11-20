import { useCallback, useState } from 'react';

/**
 * Hook for managing unsaved changes warnings in forms
 *
 * @param isDirty - Whether the form has unsaved changes
 * @returns Object with warning state and handlers for close confirmation
 *
 * @example
 * ```tsx
 * const { showWarning, handleClose, confirmClose, cancelClose } = useUnsavedChanges(form.formState.isDirty);
 *
 * // Attempt to close - will show warning if dirty
 * const canClose = handleClose();
 * if (canClose) {
 *   closeModal();
 * }
 *
 * // User confirms they want to discard changes
 * confirmClose();
 * closeModal();
 *
 * // User cancels the close
 * cancelClose();
 * ```
 */
export function useUnsavedChanges(isDirty: boolean) {
  const [showWarning, setShowWarning] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);

  const handleClose = useCallback(() => {
    if (isDirty) {
      setShowWarning(true);
      setPendingClose(true);
      return false;
    }
    return true;
  }, [isDirty]);

  const confirmClose = useCallback(() => {
    setShowWarning(false);
    setPendingClose(false);
    return true;
  }, []);

  const cancelClose = useCallback(() => {
    setShowWarning(false);
    setPendingClose(false);
  }, []);

  return { showWarning, pendingClose, handleClose, confirmClose, cancelClose };
}
