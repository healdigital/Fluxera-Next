import { useEffect } from 'react';

/**
 * Hook for keyboard navigation between entities in a list
 * Supports arrow keys (Left/Up for previous, Right/Down for next)
 *
 * @param items - Array of items with id property
 * @param currentId - Currently selected item ID
 * @param onNavigate - Callback when navigation occurs
 *
 * @example
 * ```tsx
 * const assets = [{ id: '1' }, { id: '2' }, { id: '3' }];
 * const [currentAssetId, setCurrentAssetId] = useState('1');
 *
 * useKeyboardNavigation(
 *   assets,
 *   currentAssetId,
 *   (id) => setCurrentAssetId(id)
 * );
 * ```
 */
export function useKeyboardNavigation<T extends { id: string }>(
  items: T[],
  currentId: string | undefined,
  onNavigate: (id: string) => void,
) {
  useEffect(() => {
    if (!currentId || items.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = items.findIndex((item) => item.id === currentId);

      if (currentIndex === -1) return;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex =
          currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        const prevItem = items[prevIndex];
        if (prevItem) {
          onNavigate(prevItem.id);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex =
          currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        const nextItem = items[nextIndex];
        if (nextItem) {
          onNavigate(nextItem.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, currentId, onNavigate]);
}
