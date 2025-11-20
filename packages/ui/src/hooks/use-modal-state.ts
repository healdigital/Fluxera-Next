import { useCallback, useState } from 'react';

/**
 * Hook for managing modal open/close state and associated entity ID
 *
 * @param initialOpen - Initial open state (default: false)
 * @returns Object with isOpen state, entityId, and open/close functions
 *
 * @example
 * ```tsx
 * const { isOpen, entityId, open, close } = useModalState();
 *
 * // Open modal with entity ID
 * open('asset-123');
 *
 * // Close modal and clear entity ID
 * close();
 * ```
 */
export function useModalState(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [entityId, setEntityId] = useState<string | undefined>();

  const open = useCallback((id?: string) => {
    setEntityId(id);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEntityId(undefined);
  }, []);

  return { isOpen, entityId, open, close };
}
