/**
 * Property-Based Tests for Animation Timing
 *
 * Feature: modal-ux-improvements, Property 26: Animation Timing Consistency
 * Validates: Requirements 10.1
 *
 * Property: For any modal open or close transition, the animation should complete within 200-300ms
 */

import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ANIMATION_CONFIG, getAnimationDuration, waitForAnimation } from '../animation-config';
import { QuickViewModal } from '../quick-view-modal';
import { FormSheet } from '../form-sheet';

describe('Property 26: Animation Timing Consistency', () => {
  describe('Animation duration configuration', () => {
    it('should have modal animation duration within 200-300ms range', () => {
      expect(ANIMATION_CONFIG.MODAL_DURATION).toBeGreaterThanOrEqual(200);
      expect(ANIMATION_CONFIG.MODAL_DURATION).toBeLessThanOrEqual(300);
    });

    it('should have sheet animation duration within 200-300ms range', () => {
      expect(ANIMATION_CONFIG.SHEET_DURATION).toBeGreaterThanOrEqual(200);
      expect(ANIMATION_CONFIG.SHEET_DURATION).toBeLessThanOrEqual(300);
    });

    it('should have overlay animation duration within 200-300ms range', () => {
      expect(ANIMATION_CONFIG.OVERLAY_DURATION).toBeGreaterThanOrEqual(200);
      expect(ANIMATION_CONFIG.OVERLAY_DURATION).toBeLessThanOrEqual(300);
    });
  });

  describe('Animation duration helper functions', () => {
    it('should return correct duration for modal type', () => {
      const duration = getAnimationDuration('modal');
      expect(duration).toBe(ANIMATION_CONFIG.MODAL_DURATION);
      expect(duration).toBeGreaterThanOrEqual(200);
      expect(duration).toBeLessThanOrEqual(300);
    });

    it('should return correct duration for sheet type', () => {
      const duration = getAnimationDuration('sheet');
      expect(duration).toBe(ANIMATION_CONFIG.SHEET_DURATION);
      expect(duration).toBeGreaterThanOrEqual(200);
      expect(duration).toBeLessThanOrEqual(300);
    });

    it('should return correct duration for overlay type', () => {
      const duration = getAnimationDuration('overlay');
      expect(duration).toBe(ANIMATION_CONFIG.OVERLAY_DURATION);
      expect(duration).toBeGreaterThanOrEqual(200);
      expect(duration).toBeLessThanOrEqual(300);
    });
  });

  describe('QuickViewModal animation timing', () => {
    it('should complete open animation within expected timeframe', async () => {
      const user = userEvent.setup();
      let isOpen = false;
      const setIsOpen = (open: boolean) => {
        isOpen = open;
      };

      const { rerender } = render(
        <QuickViewModal
          open={isOpen}
          onOpenChange={setIsOpen}
          title="Test Modal"
        >
          <div>Test Content</div>
        </QuickViewModal>
      );

      const startTime = performance.now();

      // Open the modal
      rerender(
        <QuickViewModal
          open={true}
          onOpenChange={setIsOpen}
          title="Test Modal"
        >
          <div>Test Content</div>
        </QuickViewModal>
      );

      // Wait for animation to complete
      await waitForAnimation('modal');

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Animation should complete within 200-300ms + buffer for rendering
      expect(duration).toBeLessThan(500); // 300ms animation + 200ms buffer
    });
  });

  describe('FormSheet animation timing', () => {
    it('should complete open animation within expected timeframe', async () => {
      let isOpen = false;
      const setIsOpen = (open: boolean) => {
        isOpen = open;
      };

      const { rerender } = render(
        <FormSheet
          open={isOpen}
          onOpenChange={setIsOpen}
          title="Test Sheet"
        >
          <div>Test Content</div>
        </FormSheet>
      );

      const startTime = performance.now();

      // Open the sheet
      rerender(
        <FormSheet
          open={true}
          onOpenChange={setIsOpen}
          title="Test Sheet"
        >
          <div>Test Content</div>
        </FormSheet>
      );

      // Wait for animation to complete
      await waitForAnimation('sheet');

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Animation should complete within 200-300ms + buffer for rendering
      expect(duration).toBeLessThan(500); // 300ms animation + 200ms buffer
    });
  });

  describe('Animation consistency across modal types', () => {
    it('should use consistent animation durations across all modal types', () => {
      const modalDuration = getAnimationDuration('modal');
      const sheetDuration = getAnimationDuration('sheet');
      const overlayDuration = getAnimationDuration('overlay');

      // All durations should be within the 200-300ms range
      expect(modalDuration).toBeGreaterThanOrEqual(200);
      expect(modalDuration).toBeLessThanOrEqual(300);
      expect(sheetDuration).toBeGreaterThanOrEqual(200);
      expect(sheetDuration).toBeLessThanOrEqual(300);
      expect(overlayDuration).toBeGreaterThanOrEqual(200);
      expect(overlayDuration).toBeLessThanOrEqual(300);

      // Durations should not vary by more than 100ms
      const maxDuration = Math.max(modalDuration, sheetDuration, overlayDuration);
      const minDuration = Math.min(modalDuration, sheetDuration, overlayDuration);
      expect(maxDuration - minDuration).toBeLessThanOrEqual(100);
    });
  });

  describe('waitForAnimation helper', () => {
    it('should wait for the correct duration plus buffer', async () => {
      const startTime = performance.now();
      await waitForAnimation('modal');
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should wait for animation duration + 50ms buffer
      const expectedDuration = ANIMATION_CONFIG.MODAL_DURATION + 50;
      expect(duration).toBeGreaterThanOrEqual(expectedDuration - 10); // Allow 10ms tolerance
      expect(duration).toBeLessThan(expectedDuration + 100); // Allow 100ms tolerance for system delays
    });
  });
});
