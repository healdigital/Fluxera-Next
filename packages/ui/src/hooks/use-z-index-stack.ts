import { useEffect, useRef, useState } from 'react';

/**
 * Z-Index Stack Manager
 *
 * Manages z-index values for nested modals to ensure proper layering.
 * Each new modal gets a higher z-index than the previous one.
 *
 * Requirements: 10.4 - Z-index management for nested modals
 */

// Base z-index for modals (should be higher than other page content)
const BASE_Z_INDEX = 50;

// Increment for each modal layer
const Z_INDEX_INCREMENT = 10;

// Global stack to track open modals
let modalStack: string[] = [];

/**
 * useZIndexStack - Hook to manage z-index for modal components
 *
 * Features:
 * - Automatically assigns z-index based on modal stack position
 * - Ensures proper layering for nested modals
 * - Cleans up on unmount
 *
 * @param isOpen - Whether the modal is currently open
 * @param modalId - Unique identifier for the modal (optional, auto-generated if not provided)
 * @returns Object containing z-index value and stack position
 *
 * @example
 * ```tsx
 * function Modal({ open }) {
 *   const { zIndex, stackPosition } = useZIndexStack(open);
 *
 *   return (
 *     <div style={{ zIndex }}>
 *       Modal content (layer {stackPosition})
 *     </div>
 *   );
 * }
 * ```
 */
export function useZIndexStack(isOpen: boolean, modalId?: string) {
  const [zIndex, setZIndex] = useState(BASE_Z_INDEX);
  const [stackPosition, setStackPosition] = useState(0);
  const idRef = useRef(modalId || `modal-${Math.random().toString(36).substr(2, 9)}`);
  const isInStackRef = useRef(false);

  useEffect(() => {
    const id = idRef.current;

    if (isOpen && !isInStackRef.current) {
      // Add to stack
      modalStack.push(id);
      isInStackRef.current = true;

      // Calculate z-index based on position in stack
      const position = modalStack.indexOf(id);
      const newZIndex = BASE_Z_INDEX + position * Z_INDEX_INCREMENT;

      setZIndex(newZIndex);
      setStackPosition(position);
    } else if (!isOpen && isInStackRef.current) {
      // Remove from stack
      const index = modalStack.indexOf(id);
      if (index > -1) {
        modalStack.splice(index, 1);
      }
      isInStackRef.current = false;

      // Reset to base z-index
      setZIndex(BASE_Z_INDEX);
      setStackPosition(0);
    }

    // Cleanup on unmount
    return () => {
      if (isInStackRef.current) {
        const index = modalStack.indexOf(id);
        if (index > -1) {
          modalStack.splice(index, 1);
        }
        isInStackRef.current = false;
      }
    };
  }, [isOpen]);

  return {
    zIndex,
    stackPosition,
    totalModals: modalStack.length,
  };
}

/**
 * Get the current modal stack for debugging
 */
export function getModalStack(): readonly string[] {
  return [...modalStack];
}

/**
 * Clear the modal stack (useful for testing)
 */
export function clearModalStack(): void {
  modalStack = [];
}

/**
 * Get the z-index for a specific stack position
 */
export function getZIndexForPosition(position: number): number {
  return BASE_Z_INDEX + position * Z_INDEX_INCREMENT;
}

/**
 * Check if a modal is at the top of the stack
 */
export function isTopModal(modalId: string): boolean {
  return modalStack.length > 0 && modalStack[modalStack.length - 1] === modalId;
}
