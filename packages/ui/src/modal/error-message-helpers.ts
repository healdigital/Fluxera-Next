/**
 * Error Message Helpers
 * 
 * Utilities for creating actionable, user-friendly error messages.
 * Validates Requirements 12.4 - clear, actionable error messages with suggestions.
 */

/**
 * Error message configuration
 */
export interface ErrorMessageConfig {
  /**
   * The error message to display
   */
  message: string;
  
  /**
   * Optional suggestion for how to fix the error
   */
  suggestion?: string;
  
  /**
   * Optional link to documentation or help
   */
  helpLink?: {
    text: string;
    url: string;
  };
  
  /**
   * Field name if this is a field-specific error
   */
  field?: string;
}

/**
 * Common validation error messages with actionable suggestions
 */
export const ValidationErrors = {
  required: (fieldName: string): ErrorMessageConfig => ({
    message: `${fieldName} is required`,
    suggestion: `Please enter a value for ${fieldName}`,
    field: fieldName,
  }),

  email: (fieldName: string = 'Email'): ErrorMessageConfig => ({
    message: 'Invalid email address',
    suggestion: 'Please enter a valid email address (e.g., user@example.com)',
    field: fieldName,
  }),

  minLength: (
    fieldName: string,
    minLength: number
  ): ErrorMessageConfig => ({
    message: `${fieldName} is too short`,
    suggestion: `Please enter at least ${minLength} characters`,
    field: fieldName,
  }),

  maxLength: (
    fieldName: string,
    maxLength: number
  ): ErrorMessageConfig => ({
    message: `${fieldName} is too long`,
    suggestion: `Please limit to ${maxLength} characters or less`,
    field: fieldName,
  }),

  pattern: (
    fieldName: string,
    pattern: string
  ): ErrorMessageConfig => ({
    message: `${fieldName} format is invalid`,
    suggestion: `Please match the required format: ${pattern}`,
    field: fieldName,
  }),

  min: (fieldName: string, min: number): ErrorMessageConfig => ({
    message: `${fieldName} is too small`,
    suggestion: `Please enter a value of ${min} or greater`,
    field: fieldName,
  }),

  max: (fieldName: string, max: number): ErrorMessageConfig => ({
    message: `${fieldName} is too large`,
    suggestion: `Please enter a value of ${max} or less`,
    field: fieldName,
  }),

  date: (fieldName: string): ErrorMessageConfig => ({
    message: 'Invalid date',
    suggestion: 'Please enter a valid date in the format YYYY-MM-DD',
    field: fieldName,
  }),

  dateRange: (
    startField: string,
    endField: string
  ): ErrorMessageConfig => ({
    message: 'Invalid date range',
    suggestion: `${endField} must be after ${startField}`,
  }),

  duplicate: (fieldName: string): ErrorMessageConfig => ({
    message: `${fieldName} already exists`,
    suggestion: `Please choose a different ${fieldName}`,
    field: fieldName,
  }),

  notFound: (entityName: string): ErrorMessageConfig => ({
    message: `${entityName} not found`,
    suggestion: `The ${entityName} may have been deleted or you may not have permission to access it`,
  }),

  permission: (action: string): ErrorMessageConfig => ({
    message: 'Permission denied',
    suggestion: `You don't have permission to ${action}. Please contact your administrator if you need access.`,
  }),

  network: (): ErrorMessageConfig => ({
    message: 'Network error',
    suggestion:
      'Please check your internet connection and try again. If the problem persists, contact support.',
  }),

  server: (): ErrorMessageConfig => ({
    message: 'Server error',
    suggestion:
      'An unexpected error occurred. Please try again in a few moments. If the problem persists, contact support.',
  }),

  timeout: (): ErrorMessageConfig => ({
    message: 'Request timed out',
    suggestion:
      'The operation took too long. Please try again with a smaller dataset or contact support.',
  }),
};

/**
 * Format an error message with suggestion
 */
export function formatErrorMessage(config: ErrorMessageConfig): string {
  let message = config.message;

  if (config.suggestion) {
    message += `. ${config.suggestion}`;
  }

  return message;
}

/**
 * Extract field-specific errors from a validation error object
 */
export function extractFieldErrors(
  error: unknown
): Record<string, ErrorMessageConfig> {
  const fieldErrors: Record<string, ErrorMessageConfig> = {};

  // Handle Zod validation errors
  if (
    error &&
    typeof error === 'object' &&
    'issues' in error &&
    Array.isArray((error as any).issues)
  ) {
    (error as any).issues.forEach((issue: any) => {
      const field = issue.path.join('.');
      const message = issue.message;

      fieldErrors[field] = {
        message,
        suggestion: getSuggestionForZodError(issue),
        field,
      };
    });
  }

  return fieldErrors;
}

/**
 * Get actionable suggestion for Zod error
 */
function getSuggestionForZodError(issue: any): string | undefined {
  switch (issue.code) {
    case 'too_small':
      if (issue.type === 'string') {
        return `Please enter at least ${issue.minimum} characters`;
      }
      if (issue.type === 'number') {
        return `Please enter a value of ${issue.minimum} or greater`;
      }
      if (issue.type === 'array') {
        return `Please select at least ${issue.minimum} items`;
      }
      break;

    case 'too_big':
      if (issue.type === 'string') {
        return `Please limit to ${issue.maximum} characters or less`;
      }
      if (issue.type === 'number') {
        return `Please enter a value of ${issue.maximum} or less`;
      }
      if (issue.type === 'array') {
        return `Please select no more than ${issue.maximum} items`;
      }
      break;

    case 'invalid_string':
      if (issue.validation === 'email') {
        return 'Please enter a valid email address (e.g., user@example.com)';
      }
      if (issue.validation === 'url') {
        return 'Please enter a valid URL (e.g., https://example.com)';
      }
      if (issue.validation === 'uuid') {
        return 'Please enter a valid UUID';
      }
      break;

    case 'invalid_type':
      return `Expected ${issue.expected}, but received ${issue.received}`;

    case 'invalid_date':
      return 'Please enter a valid date';

    case 'custom':
      // Custom validation errors should provide their own messages
      return undefined;
  }

  return undefined;
}

/**
 * Create an error message for API errors
 */
export function createApiErrorMessage(
  error: unknown,
  context?: string
): ErrorMessageConfig {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return ValidationErrors.network();
  }

  // HTTP errors
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as any).status;

    switch (status) {
      case 400:
        return {
          message: 'Invalid request',
          suggestion:
            'Please check your input and try again. Some fields may be missing or invalid.',
        };

      case 401:
        return {
          message: 'Authentication required',
          suggestion: 'Please log in and try again.',
        };

      case 403:
        return ValidationErrors.permission(context || 'perform this action');

      case 404:
        return ValidationErrors.notFound(context || 'Resource');

      case 409:
        return {
          message: 'Conflict',
          suggestion:
            'This item may have been modified by another user. Please refresh and try again.',
        };

      case 422:
        return {
          message: 'Validation failed',
          suggestion:
            'Please check your input. Some fields may contain invalid data.',
        };

      case 429:
        return {
          message: 'Too many requests',
          suggestion:
            'Please wait a moment before trying again. You have exceeded the rate limit.',
        };

      case 500:
      case 502:
      case 503:
        return ValidationErrors.server();

      case 504:
        return ValidationErrors.timeout();
    }
  }

  // Generic error
  if (error instanceof Error) {
    return {
      message: error.message,
      suggestion:
        'If this problem persists, please contact support with the error details.',
    };
  }

  // Unknown error
  return {
    message: 'An unexpected error occurred',
    suggestion:
      'Please try again. If the problem persists, contact support.',
  };
}

/**
 * Check if an error message is actionable (has a suggestion)
 */
export function isActionableError(config: ErrorMessageConfig): boolean {
  return !!config.suggestion || !!config.helpLink;
}

/**
 * Combine multiple error messages into a summary
 */
export function summarizeErrors(
  errors: ErrorMessageConfig[]
): ErrorMessageConfig {
  if (errors.length === 0) {
    return {
      message: 'No errors',
    };
  }

  if (errors.length === 1) {
    return errors[0];
  }

  const fieldErrors = errors.filter((e) => e.field);
  const generalErrors = errors.filter((e) => !e.field);

  let message = `${errors.length} errors found`;
  let suggestion = '';

  if (fieldErrors.length > 0) {
    suggestion += `Please correct the following fields: ${fieldErrors.map((e) => e.field).join(', ')}. `;
  }

  if (generalErrors.length > 0) {
    suggestion += generalErrors
      .map((e) => e.suggestion)
      .filter(Boolean)
      .join(' ');
  }

  return {
    message,
    suggestion: suggestion.trim(),
  };
}

/**
 * Create error message for bulk operation failures
 */
export function createBulkErrorMessage(
  total: number,
  failed: number,
  errors: Array<{ id: string; error: string }>
): ErrorMessageConfig {
  const succeeded = total - failed;

  if (failed === 0) {
    return {
      message: `All ${total} items processed successfully`,
    };
  }

  if (succeeded === 0) {
    return {
      message: `All ${total} items failed to process`,
      suggestion:
        'Please check the error details below and try again. You may need to fix the items individually.',
    };
  }

  return {
    message: `${succeeded} of ${total} items processed successfully, ${failed} failed`,
    suggestion:
      'Please review the failed items below. You can retry the failed items or fix them individually.',
  };
}
