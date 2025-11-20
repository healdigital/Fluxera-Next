import { useEffect, useRef } from 'react';

/**
 * Hook to ensure focus returns to the trigger element when a modal closes
 * 
 * Radix UI handles this automatically, but this hook provides additional
 * control and ensures proper focus management in edge cases.
 * 
 * @param isOpen - Whether the modal is currently open
 */
export function useFocusReturn(isOpen: boolean) {
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element when modal opens
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
    } else if (previouslyFocusedElement.current) {
      // Return focus when modal closes
      // Use setTimeout to ensure the modal has fully closed
      const timeoutId = setTimeout(() => {
        previouslyFocusedElement.current?.focus();
        previouslyFocusedElement.current = null;
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);
}
