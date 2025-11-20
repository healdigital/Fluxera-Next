/**
 * Animation Configuration for Modal Components
 *
 * Centralized animation timing configuration to ensure consistent
 * performance across all modal components.
 *
 * Requirements: 10.1 - Modal animations should be 200-300ms
 */

export const ANIMATION_CONFIG = {
  /**
   * Duration for modal open/close animations (in milliseconds)
   * Target: 200-300ms for smooth, performant transitions
   */
  MODAL_DURATION: 200,
  SHEET_DURATION: 300,
  OVERLAY_DURATION: 200,

  /**
   * Tailwind CSS duration classes
   */
  MODAL_DURATION_CLASS: 'duration-200',
  SHEET_DURATION_CLASS: 'duration-300',
  OVERLAY_DURATION_CLASS: 'duration-200',

  /**
   * Animation easing functions
   */
  EASING: {
    DEFAULT: 'ease-in-out',
    IN: 'ease-in',
    OUT: 'ease-out',
  },

  /**
   * Complete animation class strings for different modal types
   */
  CLASSES: {
    DIALOG_OVERLAY:
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200',
    DIALOG_CONTENT:
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200',
    SHEET_OVERLAY:
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200',
    SHEET_CONTENT:
      'data-[state=open]:animate-in data-[state=closed]:animate-out duration-300 ease-in-out',
  },
} as const;

/**
 * Helper function to get animation duration in milliseconds
 */
export function getAnimationDuration(type: 'modal' | 'sheet' | 'overlay'): number {
  switch (type) {
    case 'modal':
      return ANIMATION_CONFIG.MODAL_DURATION;
    case 'sheet':
      return ANIMATION_CONFIG.SHEET_DURATION;
    case 'overlay':
      return ANIMATION_CONFIG.OVERLAY_DURATION;
    default:
      return ANIMATION_CONFIG.MODAL_DURATION;
  }
}

/**
 * Helper function to wait for animation to complete
 * Useful for testing and ensuring animations finish before assertions
 */
export function waitForAnimation(type: 'modal' | 'sheet' | 'overlay' = 'modal'): Promise<void> {
  const duration = getAnimationDuration(type);
  return new Promise((resolve) => setTimeout(resolve, duration + 50)); // Add 50ms buffer
}
