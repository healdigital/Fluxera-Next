import { useEffect } from 'react';

/**
 * Hook to announce messages to screen readers
 * 
 * Creates a live region that screen readers will announce when content changes.
 * Useful for announcing modal openings, state changes, and other dynamic updates.
 * 
 * @param message - The message to announce
 * @param isOpen - Whether the modal/component is open (triggers announcement)
 * @param priority - 'polite' (default) or 'assertive' for urgent announcements
 */
export function useScreenReaderAnnounce(
  message: string,
  isOpen: boolean,
  priority: 'polite' | 'assertive' = 'polite'
) {
  useEffect(() => {
    if (!isOpen || !message) return;

    // Create or get the live region
    let liveRegion = document.getElementById('screen-reader-announcements');
    
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'screen-reader-announcements';
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only'; // Visually hidden but accessible to screen readers
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }

    // Update the aria-live priority if needed
    liveRegion.setAttribute('aria-live', priority);

    // Announce the message
    // Clear first to ensure the announcement is triggered even if the message is the same
    liveRegion.textContent = '';
    
    // Use setTimeout to ensure the screen reader picks up the change
    const timeoutId = setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = message;
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      // Clear the message after a delay
      setTimeout(() => {
        if (liveRegion) {
          liveRegion.textContent = '';
        }
      }, 1000);
    };
  }, [message, isOpen, priority]);
}
