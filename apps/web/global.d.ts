/**
 * Global type declarations for the application
 */

/**
 * Google Analytics gtag function
 */
interface Window {
  gtag?: (
    command: string,
    targetIdOrEventName: string,
    configOrParams?: Record<string, unknown>,
  ) => void;
}
