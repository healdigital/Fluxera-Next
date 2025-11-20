/**
 * Property-Based Tests for Body Scroll Lock
 *
 * Feature: modal-ux-improvements, Property 29: Body Scroll Lock with Position Preservation
 * Validates: Requirements 10.5
 *
 * Property: For any open modal, the body should not scroll, and the scroll position
 * should be restored when the modal closes
 */

import { renderHook } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

import { useBodyScrollLock, useBodyScrollLockNested } from '../use-body-scroll-lock';

describe('Property 29: Body Scroll Lock with Position Preservation', () => {
  let originalScrollY: number;
  let originalBodyStyle: {
    overflow: string;
    position: string;
    top: string;
    width: string;
    paddingRight: string;
  };

  beforeEach(() => {
    // Store original values
    originalScrollY = window.scrollY;
    originalBodyStyle = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      paddingRight: document.body.style.paddingRight,
    };

    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });

    // Mock window.scrollTo
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    // Restore original values
    document.body.style.overflow = originalBodyStyle.overflow;
    document.body.style.position = originalBodyStyle.position;
    document.body.style.top = originalBodyStyle.top;
    document.body.style.width = originalBodyStyle.width;
    document.body.style.paddingRight = originalBodyStyle.paddingRight;
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: originalScrollY,
    });
  });

  describe('useBodyScrollLock basic functionality', () => {
    it('should lock body scroll when isLocked is true', () => {
      const { result } = renderHook(() => useBodyScrollLock(true));

      // Body should have scroll lock styles applied
      expect(document.body.style.overflow).toBe('hidden');
      expect(document.body.style.position).toBe('fixed');
      expect(document.body.style.width).toBe('100%');
    });

    it('should not lock body scroll when isLocked is false', () => {
      const { result } = renderHook(() => useBodyScrollLock(false));

      // Body should not have scroll lock styles
      expect(document.body.style.overflow).not.toBe('hidden');
      expect(document.body.style.position).not.toBe('fixed');
    });

    it('should preserve scroll position when locking', () => {
      // Set a scroll position
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 500,
      });

      const { result } = renderHook(() => useBodyScrollLock(true));

      // Body top should be set to negative scroll position
      expect(document.body.style.top).toBe('-500px');
    });

    it('should restore scroll position when unlocking', () => {
      // Set a scroll position
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 300,
      });

      const { result, unmount } = renderHook(() => useBodyScrollLock(true));

      // Lock is applied
      expect(document.body.style.overflow).toBe('hidden');

      // Unmount to unlock
      unmount();

      // Scroll position should be restored
      expect(window.scrollTo).toHaveBeenCalledWith(0, 300);
    });

    it('should restore original styles when unlocking', () => {
      // Set some initial styles
      document.body.style.overflow = 'auto';
      document.body.style.position = 'relative';
      document.body.style.paddingRight = '10px';

      const { result, unmount } = renderHook(() => useBodyScrollLock(true));

      // Styles should be changed
      expect(document.body.style.overflow).toBe('hidden');
      expect(document.body.style.position).toBe('fixed');

      // Unmount to unlock
      unmount();

      // Original styles should be restored
      expect(document.body.style.overflow).toBe('auto');
      expect(document.body.style.position).toBe('relative');
      expect(document.body.style.paddingRight).toBe('10px');
    });

    it('should handle toggling lock state', () => {
      const { result, rerender } = renderHook(
        ({ locked }) => useBodyScrollLock(locked),
        { initialProps: { locked: false } }
      );

      // Initially unlocked
      expect(document.body.style.overflow).not.toBe('hidden');

      // Lock
      rerender({ locked: true });
      expect(document.body.style.overflow).toBe('hidden');

      // Unlock
      rerender({ locked: false });
      expect(document.body.style.overflow).not.toBe('hidden');
    });
  });

  describe('useBodyScrollLockNested for nested modals', () => {
    it('should lock body scroll for first modal', () => {
      const { result } = renderHook(() => useBodyScrollLockNested(true));

      expect(document.body.style.overflow).toBe('hidden');
      expect(document.body.style.position).toBe('fixed');
    });

    it('should maintain lock when second modal opens', () => {
      const { result: result1 } = renderHook(() => useBodyScrollLockNested(true));
      const { result: result2 } = renderHook(() => useBodyScrollLockNested(true));

      // Body should still be locked
      expect(document.body.style.overflow).toBe('hidden');
      expect(document.body.style.position).toBe('fixed');
    });

    it('should maintain lock when first modal closes but second remains', () => {
      const { result: result1, unmount: unmount1 } = renderHook(() =>
        useBodyScrollLockNested(true)
      );
      const { result: result2 } = renderHook(() => useBodyScrollLockNested(true));

      // Close first modal
      unmount1();

      // Body should still be locked because second modal is open
      expect(document.body.style.overflow).toBe('hidden');
      expect(document.body.style.position).toBe('fixed');
    });

    it('should unlock only when all modals are closed', () => {
      const { result: result1, unmount: unmount1 } = renderHook(() =>
        useBodyScrollLockNested(true)
      );
      const { result: result2, unmount: unmount2 } = renderHook(() =>
        useBodyScrollLockNested(true)
      );

      // Both modals open - body locked
      expect(document.body.style.overflow).toBe('hidden');

      // Close first modal - body still locked
      unmount1();
      expect(document.body.style.overflow).toBe('hidden');

      // Close second modal - body unlocked
      unmount2();
      expect(document.body.style.overflow).toBe('');
    });

    it('should preserve scroll position across nested modals', () => {
      // Set a scroll position
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 400,
      });

      const { result: result1, unmount: unmount1 } = renderHook(() =>
        useBodyScrollLockNested(true)
      );
      const { result: result2, unmount: unmount2 } = renderHook(() =>
        useBodyScrollLockNested(true)
      );

      // Close both modals
      unmount1();
      unmount2();

      // Scroll position should be restored
      expect(window.scrollTo).toHaveBeenCalledWith(0, 400);
    });
  });

  describe('Scroll lock edge cases', () => {
    it('should handle rapid lock/unlock cycles', () => {
      const { result, rerender } = renderHook(
        ({ locked }) => useBodyScrollLock(locked),
        { initialProps: { locked: false } }
      );

      // Rapid toggling
      for (let i = 0; i < 10; i++) {
        rerender({ locked: true });
        rerender({ locked: false });
      }

      // Should end in unlocked state
      expect(document.body.style.overflow).not.toBe('hidden');
    });

    it('should handle zero scroll position', () => {
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 0,
      });

      const { result, unmount } = renderHook(() => useBodyScrollLock(true));

      expect(document.body.style.top).toBe('-0px');

      unmount();

      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should handle large scroll positions', () => {
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 10000,
      });

      const { result, unmount } = renderHook(() => useBodyScrollLock(true));

      expect(document.body.style.top).toBe('-10000px');

      unmount();

      expect(window.scrollTo).toHaveBeenCalledWith(0, 10000);
    });
  });

  describe('Scroll lock consistency', () => {
    it('should always prevent scroll when locked', () => {
      const { result } = renderHook(() => useBodyScrollLock(true));

      // Body overflow should be hidden
      expect(document.body.style.overflow).toBe('hidden');

      // Body should be fixed positioned
      expect(document.body.style.position).toBe('fixed');

      // Body should take full width
      expect(document.body.style.width).toBe('100%');
    });

    it('should always restore scroll position on unlock', () => {
      const testPositions = [0, 100, 500, 1000, 5000];

      testPositions.forEach((position) => {
        Object.defineProperty(window, 'scrollY', {
          writable: true,
          configurable: true,
          value: position,
        });

        const { result, unmount } = renderHook(() => useBodyScrollLock(true));
        unmount();

        expect(window.scrollTo).toHaveBeenCalledWith(0, position);

        // Reset for next iteration
        vi.clearAllMocks();
      });
    });
  });
});
