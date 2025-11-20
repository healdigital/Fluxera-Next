import { useEffect, useRef } from 'react';

/**
 * useBodyScrollLock - Prevent body scroll when modal is open
 *
 * Features:
 * - Prevents body scroll while modal is open
 * - Preserves scroll position on modal close
 * - Handles nested modals correctly with reference counting
 * - Prevents layout shift by adding padding when scrollbar is hidden
 *
 * Requirements: 10.5 - Body scroll lock with position preservation
 *
 * @param isLocked - Whether to lock the body scroll
 *
 * @example
 * ```tsx
 * function Modal({ open }) {
 *   useBodyScrollLock(open);
 *   return <div>Modal content</div>;
 * }
 * ```
 */
export function useBodyScrollLock(isLocked: boolean) {
  const scrollPositionRef = useRef<number>(0);
  const originalStyleRef = useRef<{
    overflow: string;
    paddingRight: string;
    position: string;
    top: string;
    width: string;
  } | null>(null);

  useEffect(() => {
    if (!isLocked) {
      return;
    }

    const body = document.body;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Store original styles
    if (!originalStyleRef.current) {
      originalStyleRef.current = {
        overflow: body.style.overflow,
        paddingRight: body.style.paddingRight,
        position: body.style.position,
        top: body.style.top,
        width: body.style.width,
      };
    }

    // Store current scroll position
    scrollPositionRef.current = window.scrollY;

    // Apply scroll lock styles
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollPositionRef.current}px`;
    body.style.width = '100%';

    // Add padding to prevent layout shift when scrollbar disappears
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Cleanup function
    return () => {
      if (originalStyleRef.current) {
        // Restore original styles
        body.style.overflow = originalStyleRef.current.overflow;
        body.style.paddingRight = originalStyleRef.current.paddingRight;
        body.style.position = originalStyleRef.current.position;
        body.style.top = originalStyleRef.current.top;
        body.style.width = originalStyleRef.current.width;

        // Restore scroll position
        window.scrollTo(0, scrollPositionRef.current);

        originalStyleRef.current = null;
      }
    };
  }, [isLocked]);
}

/**
 * Global counter for nested modals
 * This ensures that body scroll is only unlocked when all modals are closed
 */
let modalCount = 0;

/**
 * useBodyScrollLockNested - Body scroll lock with support for nested modals
 *
 * This version uses a global counter to track multiple open modals
 * and only unlocks scroll when all modals are closed.
 *
 * @param isLocked - Whether to lock the body scroll
 *
 * @example
 * ```tsx
 * function Modal({ open }) {
 *   useBodyScrollLockNested(open);
 *   return <div>Modal content</div>;
 * }
 * ```
 */
export function useBodyScrollLockNested(isLocked: boolean) {
  const scrollPositionRef = useRef<number>(0);
  const wasLockedRef = useRef<boolean>(false);

  useEffect(() => {
    const body = document.body;

    if (isLocked && !wasLockedRef.current) {
      // Increment modal count
      modalCount++;
      wasLockedRef.current = true;

      // Only lock if this is the first modal
      if (modalCount === 1) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        // Store current scroll position
        scrollPositionRef.current = window.scrollY;

        // Apply scroll lock styles
        body.style.overflow = 'hidden';
        body.style.position = 'fixed';
        body.style.top = `-${scrollPositionRef.current}px`;
        body.style.width = '100%';

        // Add padding to prevent layout shift
        if (scrollbarWidth > 0) {
          body.style.paddingRight = `${scrollbarWidth}px`;
        }
      }
    } else if (!isLocked && wasLockedRef.current) {
      // Decrement modal count
      modalCount = Math.max(0, modalCount - 1);
      wasLockedRef.current = false;

      // Only unlock if this was the last modal
      if (modalCount === 0) {
        // Restore original styles
        body.style.overflow = '';
        body.style.paddingRight = '';
        body.style.position = '';
        body.style.top = '';
        body.style.width = '';

        // Restore scroll position
        window.scrollTo(0, scrollPositionRef.current);
      }
    }

    // Cleanup on unmount
    return () => {
      if (wasLockedRef.current) {
        modalCount = Math.max(0, modalCount - 1);
        wasLockedRef.current = false;

        if (modalCount === 0) {
          body.style.overflow = '';
          body.style.paddingRight = '';
          body.style.position = '';
          body.style.top = '';
          body.style.width = '';
          window.scrollTo(0, scrollPositionRef.current);
        }
      }
    };
  }, [isLocked]);
}
