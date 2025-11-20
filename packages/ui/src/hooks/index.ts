export { useModalState } from './use-modal-state';
export { useUnsavedChanges } from './use-unsaved-changes';
export { useKeyboardNavigation } from './use-keyboard-navigation';
export { useContextPreservation } from './use-context-preservation';
export { useFocusReturn } from './use-focus-return';
export { useScreenReaderAnnounce } from './use-screen-reader-announce';

// Performance hooks
export { useBodyScrollLock, useBodyScrollLockNested } from './use-body-scroll-lock';
export { useZIndexStack, getModalStack, clearModalStack, getZIndexForPosition, isTopModal } from './use-z-index-stack';
