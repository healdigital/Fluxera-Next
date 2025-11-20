import { useCallback, useEffect, useState } from 'react';

/**
 * Interface for list view context that should be preserved
 */
export interface ListViewContext {
  scrollPosition: number;
  filters: Record<string, unknown>;
  searchTerm: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedIds: string[];
}

/**
 * Hook for preserving and restoring list view context when opening/closing modals
 * Uses sessionStorage to persist state across component unmounts
 *
 * @param storageKey - Unique key for storing context in sessionStorage
 * @returns Object with context state and save/restore/clear functions
 *
 * @example
 * ```tsx
 * const { context, saveContext, restoreContext, clearContext } = useContextPreservation('assets-list');
 *
 * // Save current context before opening modal
 * saveContext({
 *   scrollPosition: window.scrollY,
 *   filters: { category: 'laptop' },
 *   searchTerm: 'macbook',
 *   sortBy: 'name',
 *   sortOrder: 'asc',
 *   selectedIds: ['1', '2']
 * });
 *
 * // Restore context after closing modal
 * const savedContext = restoreContext();
 * if (savedContext) {
 *   window.scrollTo(0, savedContext.scrollPosition);
 *   // Apply filters, search, etc.
 * }
 * ```
 */
export function useContextPreservation(storageKey: string) {
  const [context, setContext] = useState<ListViewContext | null>(null);

  const saveContext = useCallback(
    (newContext: ListViewContext) => {
      setContext(newContext);
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(newContext));
      } catch (error) {
        console.error('Failed to save context to sessionStorage:', error);
      }
    },
    [storageKey],
  );

  const restoreContext = useCallback((): ListViewContext | null => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const parsedContext = JSON.parse(stored) as ListViewContext;
        setContext(parsedContext);
        return parsedContext;
      }
    } catch (error) {
      console.error('Failed to restore context from sessionStorage:', error);
    }
    return null;
  }, [storageKey]);

  const clearContext = useCallback(() => {
    setContext(null);
    try {
      sessionStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear context from sessionStorage:', error);
    }
  }, [storageKey]);

  // Restore context on mount
  useEffect(() => {
    // Only restore if not already loaded
    if (!context) {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsedContext = JSON.parse(stored) as ListViewContext;
          setContext(parsedContext);
        } catch (error) {
          console.error(
            'Failed to restore context from sessionStorage:',
            error,
          );
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { context, saveContext, restoreContext, clearContext };
}
