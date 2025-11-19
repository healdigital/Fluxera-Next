import type { ErrorMessage } from './error-messages';
import {
  AssetErrors,
  DashboardErrors,
  GeneralErrors,
  LicenseErrors,
  UserErrors,
} from './error-messages';

/**
 * Error handler utility for consistent error handling across the application
 * Follows Requirement 2.3: Display clear error messages with actionable guidance
 */

export type ErrorContext =
  | 'asset'
  | 'license'
  | 'user'
  | 'dashboard'
  | 'general';

export interface ErrorHandlerOptions {
  context?: ErrorContext;
  operation?: string;
  logError?: boolean;
  captureException?: (error: Error) => void;
}

/**
 * Handle an error and return a user-friendly error message
 */
export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {},
): ErrorMessage {
  const { context = 'general', operation, logError = true } = options;

  // Log error in development
  if (logError && process.env.NODE_ENV === 'development') {
    console.error(`[${context}${operation ? `:${operation}` : ''}]`, error);
  }

  // Capture exception if handler provided
  if (options.captureException && error instanceof Error) {
    options.captureException(error);
  }

  // Get specific error message based on context and error type
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Context-specific error handling
    switch (context) {
      case 'asset':
        return getAssetError(message, operation);
      case 'license':
        return getLicenseError(message, operation);
      case 'user':
        return getUserError(message, operation);
      case 'dashboard':
        return getDashboardError(message, operation);
      default:
        return getGeneralError(message);
    }
  }

  // Default error message
  return GeneralErrors.UNKNOWN_ERROR;
}

/**
 * Get asset-specific error message
 */
function getAssetError(message: string, operation?: string): ErrorMessage {
  if (message.includes('not found') || message.includes('404')) {
    return AssetErrors.NOT_FOUND;
  }

  if (message.includes('permission') || message.includes('forbidden')) {
    return AssetErrors.PERMISSION_DENIED;
  }

  if (message.includes('not assigned')) {
    return AssetErrors.NOT_ASSIGNED;
  }

  switch (operation) {
    case 'create':
      return AssetErrors.CREATE_FAILED;
    case 'update':
      return AssetErrors.UPDATE_FAILED;
    case 'delete':
      return AssetErrors.DELETE_FAILED;
    case 'assign':
      return AssetErrors.ASSIGN_FAILED;
    case 'unassign':
      return AssetErrors.UNASSIGN_FAILED;
    case 'load':
      return AssetErrors.LOAD_FAILED;
    default:
      return AssetErrors.LOAD_FAILED;
  }
}

/**
 * Get license-specific error message
 */
function getLicenseError(message: string, operation?: string): ErrorMessage {
  if (message.includes('not found') || message.includes('404')) {
    return LicenseErrors.NOT_FOUND;
  }

  if (message.includes('duplicate') || message.includes('already exists')) {
    return LicenseErrors.DUPLICATE_KEY;
  }

  if (message.includes('expired')) {
    return LicenseErrors.EXPIRED;
  }

  if (message.includes('invalid date')) {
    return LicenseErrors.INVALID_DATES;
  }

  switch (operation) {
    case 'create':
      return LicenseErrors.CREATE_FAILED;
    case 'update':
      return LicenseErrors.UPDATE_FAILED;
    case 'delete':
      return LicenseErrors.DELETE_FAILED;
    case 'assign_user':
      return LicenseErrors.ASSIGN_TO_USER_FAILED;
    case 'assign_asset':
      return LicenseErrors.ASSIGN_TO_ASSET_FAILED;
    case 'unassign':
      return LicenseErrors.UNASSIGN_FAILED;
    case 'load':
      return LicenseErrors.LOAD_FAILED;
    default:
      return LicenseErrors.LOAD_FAILED;
  }
}

/**
 * Get user-specific error message
 */
function getUserError(message: string, operation?: string): ErrorMessage {
  if (message.includes('not found') || message.includes('404')) {
    return UserErrors.NOT_FOUND;
  }

  if (message.includes('duplicate') || message.includes('already exists')) {
    return UserErrors.DUPLICATE_EMAIL;
  }

  if (message.includes('permission') || message.includes('forbidden')) {
    return UserErrors.PERMISSION_DENIED;
  }

  if (message.includes('self') || message.includes('yourself')) {
    return UserErrors.SELF_DEACTIVATION;
  }

  switch (operation) {
    case 'invite':
      return UserErrors.INVITE_FAILED;
    case 'update':
      return UserErrors.UPDATE_FAILED;
    case 'role_change':
      return UserErrors.ROLE_CHANGE_FAILED;
    case 'status_change':
      return UserErrors.STATUS_CHANGE_FAILED;
    case 'load':
      return UserErrors.LOAD_FAILED;
    default:
      return UserErrors.LOAD_FAILED;
  }
}

/**
 * Get dashboard-specific error message
 */
function getDashboardError(message: string, operation?: string): ErrorMessage {
  switch (operation) {
    case 'widget_config':
      return DashboardErrors.WIDGET_CONFIG_FAILED;
    case 'data_fetch':
      return DashboardErrors.DATA_FETCH_FAILED;
    case 'load':
    default:
      return DashboardErrors.LOAD_FAILED;
  }
}

/**
 * Get general error message
 */
function getGeneralError(message: string): ErrorMessage {
  if (message.includes('network') || message.includes('fetch')) {
    return GeneralErrors.NETWORK_ERROR;
  }

  if (message.includes('unauthorized') || message.includes('401')) {
    return GeneralErrors.UNAUTHORIZED;
  }

  if (message.includes('forbidden') || message.includes('403')) {
    return GeneralErrors.FORBIDDEN;
  }

  if (message.includes('500') || message.includes('server error')) {
    return GeneralErrors.SERVER_ERROR;
  }

  if (message.includes('timeout')) {
    return GeneralErrors.TIMEOUT;
  }

  if (message.includes('validation')) {
    return GeneralErrors.VALIDATION_ERROR;
  }

  return GeneralErrors.UNKNOWN_ERROR;
}

/**
 * Format error for display in toast notifications
 */
export function formatErrorForToast(
  error: unknown,
  options: ErrorHandlerOptions = {},
): string {
  const errorMessage = handleError(error, options);
  return `${errorMessage.title}: ${errorMessage.description}`;
}

/**
 * Check if an error is a specific type
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection')
    );
  }
  return false;
}

export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('unauthorized') ||
      message.includes('401') ||
      message.includes('forbidden') ||
      message.includes('403')
    );
  }
  return false;
}

export function isValidationError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('validation') || message.includes('invalid');
  }
  return false;
}
