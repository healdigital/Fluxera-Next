/**
 * Property-Based Tests for Z-Index Stack Management
 *
 * Feature: modal-ux-improvements, Property 28: Modal Z-Index Stacking
 * Validates: Requirements 10.4
 *
 * Property: For any sequence of modal openings, each new modal should have a higher z-index than the previous
 */

import { renderHook } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import {
  useZIndexStack,
  getModalStack,
  clearModalStack,
  getZIndexForPosition,
  isTopModal,
} from '../use-z-index-stack';

describe('Property 28: Modal Z-Index Stacking', () => {
  beforeEach(() => {
    // Clear modal stack before each test
    clearModalStack();
  });

  afterEach(() => {
    // Clean up after each test
    clearModalStack();
  });

  describe('Basic z-index stacking', () => {
    it('should assign base z-index to first modal', () => {
      const { result } = renderHook(() => useZIndexStack(true));

      expect(result.current.zIndex).toBe(50); // BASE_Z_INDEX
      expect(result.current.stackPosition).toBe(0);
    });

    it('should assign higher z-index to second modal', () => {
      const { result: result1 } = renderHook(() => useZIndexStack(true, 'modal-1'));
      const { result: result2 } = renderHook(() => useZIndexStack(true, 'modal-2'));

      // Second modal should have higher z-index
      expect(result2.current.zIndex).toBeGreaterThan(result1.current.zIndex);
      expect(result2.current.zIndex).toBe(result1.current.zIndex + 10); // Z_INDEX_INCREMENT
    });

    it('should assign incrementally higher z-index to each new modal', () => {
      const { result: result1 } = renderHook(() => useZIndexStack(true, 'modal-1'));
      const { result: result2 } = renderHook(() => useZIndexStack(true, 'modal-2'));
      const { result: result3 } = renderHook(() => useZIndexStack(true, 'modal-3'));

      // Each modal should have higher z-index than previous
      expect(result2.current.zIndex).toBeGreaterThan(result1.current.zIndex);
      expect(result3.current.zIndex).toBeGreaterThan(result2.current.zIndex);

      // Z-index should increment by 10 each time
      expect(result2.current.zIndex - result1.current.zIndex).toBe(10);
      expect(result3.current.zIndex - result2.current.zIndex).toBe(10);
    });

    it('should maintain correct stack positions', () => {
      const { result: result1 } = renderHook(() => useZIndexStack(true, 'modal-1'));
      const { result: result2 } = renderHook(() => useZIndexStack(true, 'modal-2'));
      const { result: result3 } = renderHook(() => useZIndexStack(true, 'modal-3'));

      expect(result1.current.stackPosition).toBe(0);
      expect(result2.current.stackPosition).toBe(1);
      expect(result3.current.stackPosition).toBe(2);
    });
  });

  describe('Modal stack management', () => {
    it('should add modal to stack when opened', () => {
      const { result } = renderHook(() => useZIndexStack(true, 'modal-1'));

      const stack = getModalStack();
      expect(stack).toContain('modal-1');
      expect(stack.length).toBe(1);
    });

    it('should remove modal from stack when closed', () => {
      const { result, unmount } = renderHook(() => useZIndexStack(true, 'modal-1'));

      expect(getModalStack()).toContain('modal-1');

      unmount();

      expect(getModalStack()).not.toContain('modal-1');
      expect(getModalStack().length).toBe(0);
    });

    it('should maintain stack order when middle modal closes', () => {
      const { result: result1 } = renderHook(() => useZIndexStack(true, 'modal-1'));
      const { result: result2, unmount: unmount2 } = renderHook(() =>
        useZIndexStack(true, 'modal-2')
      );
      const { result: result3 } = renderHook(() => useZIndexStack(true, 'modal-3'));

      // Close middle modal
      unmount2();

      const stack = getModalStack();
      expect(stack).toContain('modal-1');
      expect(stack).not.toContain('modal-2');
      expect(stack).toContain('modal-3');
    });

    it('should track total number of open modals', () => {
      const { result: result1 } = renderHook(() => useZIndexStack(true, 'modal-1'));
      expect(result1.current.totalModals).toBe(1);

      const { result: result2 } = renderHook(() => useZIndexStack(true, 'modal-2'));
      expect(result2.current.totalModals).toBe(2);

      const { result: result3 } = renderHook(() => useZIndexStack(true, 'modal-3'));
      expect(result3.current.totalModals).toBe(3);
    });
  });

  describe('Z-index calculation helpers', () => {
    it('should calculate correct z-index for any position', () => {
      expect(getZIndexForPosition(0)).toBe(50); // BASE_Z_INDEX
      expect(getZIndexForPosition(1)).toBe(60); // BASE + INCREMENT
      expect(getZIndexForPosition(2)).toBe(70); // BASE + 2*INCREMENT
      expect(getZIndexForPosition(5)).toBe(100); // BASE + 5*INCREMENT
    });

    it('should identify top modal correctly', () => {
      const { result: result1 } = renderHook(() => useZIndexStack(true, 'modal-1'));
      expect(isTopModal('modal-1')).toBe(true);

      const { result: result2 } = renderHook(() => useZIndexStack(true, 'modal-2'));
      expect(isTopModal('modal-1')).toBe(false);
      expect(isTopModal('modal-2')).toBe(true);

      const { result: result3 } = renderHook(() => useZIndexStack(true, 'modal-3'));
      expect(isTopModal('modal-2')).toBe(false);
      expect(isTopModal('modal-3')).toBe(true);
    });
  });

  describe('Modal opening and closing sequences', () => {
    it('should handle sequential opening and closing', () => {
      // Open modals sequentially
      const { result: result1, unmount: unmount1 } = renderHook(() =>
        useZIndexStack(true, 'modal-1')
      );
      const { result: result2, unmount: unmount2 } = renderHook(() =>
        useZIndexStack(true, 'modal-2')
      );
      const { result: result3, unmount: unmount3 } = renderHook(() =>
        useZIndexStack(true, 'modal-3')
      );

      // All should have correct z-indices
      expect(result1.current.zIndex).toBe(50);
      expect(result2.current.zIndex).toBe(60);
      expect(result3.current.zIndex).toBe(70);

      // Close in reverse order
      unmount3();
      expect(getModalStack().length).toBe(2);

      unmount2();
      expect(getModalStack().length).toBe(1);

      unmount1();
      expect(getModalStack().length).toBe(0);
    });

    it('should handle opening modal after closing previous ones', () => {
      const { result: result1, unmount: unmount1 } = renderHook(() =>
        useZIndexStack(true, 'modal-1')
      );
      const { result: result2, unmount: unmount2 } = renderHook(() =>
        useZIndexStack(true, 'modal-2')
      );

      // Close both
      unmount1();
      unmount2();

      expect(getModalStack().length).toBe(0);

      // Open new modal
      const { result: result3 } = renderHook(() => useZIndexStack(true, 'modal-3'));

      // Should start from base z-index again
      expect(result3.current.zIndex).toBe(50);
      expect(result3.current.stackPosition).toBe(0);
    });

    it('should handle rapid open/close cycles', () => {
      for (let i = 0; i < 10; i++) {
        const { result, unmount } = renderHook(() =>
          useZIndexStack(true, `modal-${i}`)
        );
        expect(result.current.zIndex).toBe(50); // Always base since we close immediately
        unmount();
      }

      expect(getModalStack().length).toBe(0);
    });
  });

  describe('Auto-generated modal IDs', () => {
    it('should generate unique IDs when not provided', () => {
      const { result: result1 } = renderHook(() => useZIndexStack(true));
      const { result: result2 } = renderHook(() => useZIndexStack(true));

      const stack = getModalStack();
      expect(stack.length).toBe(2);
      expect(stack[0]).not.toBe(stack[1]);
    });

    it('should maintain correct z-index with auto-generated IDs', () => {
      const { result: result1 } = renderHook(() => useZIndexStack(true));
      const { result: result2 } = renderHook(() => useZIndexStack(true));
      const { result: result3 } = renderHook(() => useZIndexStack(true));

      expect(result2.current.zIndex).toBeGreaterThan(result1.current.zIndex);
      expect(result3.current.zIndex).toBeGreaterThan(result2.current.zIndex);
    });
  });

  describe('Z-index stacking consistency', () => {
    it('should always maintain ascending z-index order', () => {
      const modals = [];
      const modalCount = 5;

      // Open multiple modals
      for (let i = 0; i < modalCount; i++) {
        const { result } = renderHook(() => useZIndexStack(true, `modal-${i}`));
        modals.push(result.current);
      }

      // Verify ascending order
      for (let i = 1; i < modalCount; i++) {
        expect(modals[i].zIndex).toBeGreaterThan(modals[i - 1].zIndex);
      }
    });

    it('should never have two modals with the same z-index', () => {
      const zIndices = new Set();
      const modalCount = 10;

      for (let i = 0; i < modalCount; i++) {
        const { result } = renderHook(() => useZIndexStack(true, `modal-${i}`));
        expect(zIndices.has(result.current.zIndex)).toBe(false);
        zIndices.add(result.current.zIndex);
      }

      expect(zIndices.size).toBe(modalCount);
    });

    it('should maintain z-index gaps of exactly 10', () => {
      const { result: result1 } = renderHook(() => useZIndexStack(true, 'modal-1'));
      const { result: result2 } = renderHook(() => useZIndexStack(true, 'modal-2'));
      const { result: result3 } = renderHook(() => useZIndexStack(true, 'modal-3'));

      expect(result2.current.zIndex - result1.current.zIndex).toBe(10);
      expect(result3.current.zIndex - result2.current.zIndex).toBe(10);
    });
  });

  describe('Edge cases', () => {
    it('should handle modal that is never opened', () => {
      const { result } = renderHook(() => useZIndexStack(false, 'modal-1'));

      expect(result.current.zIndex).toBe(50); // Base z-index
      expect(result.current.stackPosition).toBe(0);
      expect(getModalStack()).not.toContain('modal-1');
    });

    it('should handle toggling modal open/close', () => {
      const { result, rerender } = renderHook(
        ({ isOpen }) => useZIndexStack(isOpen, 'modal-1'),
        { initialProps: { isOpen: false } }
      );

      // Initially closed
      expect(getModalStack()).not.toContain('modal-1');

      // Open
      rerender({ isOpen: true });
      expect(getModalStack()).toContain('modal-1');

      // Close
      rerender({ isOpen: false });
      expect(getModalStack()).not.toContain('modal-1');
    });

    it('should handle clearing the stack', () => {
      renderHook(() => useZIndexStack(true, 'modal-1'));
      renderHook(() => useZIndexStack(true, 'modal-2'));
      renderHook(() => useZIndexStack(true, 'modal-3'));

      expect(getModalStack().length).toBe(3);

      clearModalStack();

      expect(getModalStack().length).toBe(0);
    });
  });
});
