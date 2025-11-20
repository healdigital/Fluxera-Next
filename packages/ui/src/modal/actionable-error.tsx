'use client';

import * as React from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';
import { Alert, AlertDescription, AlertTitle } from '../shadcn/alert';
import type { ErrorMessageConfig } from './error-message-helpers';

/**
 * ActionableError Component
 * 
 * Displays error messages with actionable suggestions for correction.
 * Validates Requirements 12.4 - clear, actionable error messages.
 * 
 * Features:
 * - Clear error message
 * - Actionable suggestion for correction
 * - Optional help link
 * - Accessible markup
 * 
 * @example
 * ```tsx
 * <ActionableError
 *   error={{
 *     message: 'Invalid email address',
 *     suggestion: 'Please enter a valid email address (e.g., user@example.com)',
 *   }}
 * />
 * ```
 */

export interface ActionableErrorProps {
  /**
   * Error configuration with message and suggestion
   */
  error: ErrorMessageConfig | string;
  
  /**
   * Variant for styling
   * @default 'destructive'
   */
  variant?: 'default' | 'destructive';
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Show icon
   * @default true
   */
  showIcon?: boolean;
  
  /**
   * Callback when help link is clicked
   */
  onHelpClick?: () => void;
}

export const ActionableError: React.FC<ActionableErrorProps> = ({
  error,
  variant = 'destructive',
  className,
  showIcon = true,
  onHelpClick,
}) => {
  const errorConfig: ErrorMessageConfig =
    typeof error === 'string' ? { message: error } : error;

  const hasSuggestion = !!errorConfig.suggestion;
  const hasHelpLink = !!errorConfig.helpLink;

  return (
    <Alert
      variant={variant}
      className={cn('relative', className)}
      data-test="actionable-error"
    >
      {showIcon && (
        <AlertCircle className="h-4 w-4" aria-hidden="true" />
      )}
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="space-y-2">
        <p className="font-medium">{errorConfig.message}</p>
        
        {hasSuggestion && (
          <p className="text-sm opacity-90" data-test="error-suggestion">
            {errorConfig.suggestion}
          </p>
        )}
        
        {hasHelpLink && (
          <a
            href={errorConfig.helpLink.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onHelpClick}
            className="inline-flex items-center gap-1 text-sm underline hover:no-underline"
            data-test="error-help-link"
          >
            {errorConfig.helpLink.text}
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        )}
      </AlertDescription>
    </Alert>
  );
};

ActionableError.displayName = 'ActionableError';

/**
 * FieldError Component
 * 
 * Displays field-specific error messages inline with form fields.
 * 
 * @example
 * ```tsx
 * <FieldError
 *   error={{
 *     message: 'Email is required',
 *     suggestion: 'Please enter your email address',
 *     field: 'email',
 *   }}
 * />
 * ```
 */

export interface FieldErrorProps {
  /**
   * Error configuration
   */
  error: ErrorMessageConfig | string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({
  error,
  className,
}) => {
  const errorConfig: ErrorMessageConfig =
    typeof error === 'string' ? { message: error } : error;

  return (
    <div
      className={cn(
        'text-sm font-medium text-destructive',
        'space-y-1',
        className,
      )}
      role="alert"
      data-test="field-error"
    >
      <p>{errorConfig.message}</p>
      {errorConfig.suggestion && (
        <p className="text-xs opacity-90" data-test="field-error-suggestion">
          {errorConfig.suggestion}
        </p>
      )}
    </div>
  );
};

FieldError.displayName = 'FieldError';

/**
 * ErrorList Component
 * 
 * Displays a list of multiple errors with suggestions.
 * 
 * @example
 * ```tsx
 * <ErrorList
 *   errors={[
 *     { message: 'Name is required', suggestion: 'Please enter a name' },
 *     { message: 'Email is invalid', suggestion: 'Please enter a valid email' },
 *   ]}
 * />
 * ```
 */

export interface ErrorListProps {
  /**
   * Array of errors to display
   */
  errors: Array<ErrorMessageConfig | string>;
  
  /**
   * Title for the error list
   * @default 'Please correct the following errors:'
   */
  title?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const ErrorList: React.FC<ErrorListProps> = ({
  errors,
  title = 'Please correct the following errors:',
  className,
}) => {
  if (errors.length === 0) {
    return null;
  }

  const errorConfigs = errors.map((error) =>
    typeof error === 'string' ? { message: error } : error
  );

  return (
    <Alert variant="destructive" className={cn(className)} data-test="error-list">
      <AlertCircle className="h-4 w-4" aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 space-y-2 list-disc list-inside">
          {errorConfigs.map((error, index) => (
            <li key={index} className="text-sm">
              <span className="font-medium">{error.message}</span>
              {error.suggestion && (
                <span className="block ml-5 mt-0.5 text-xs opacity-90">
                  {error.suggestion}
                </span>
              )}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};

ErrorList.displayName = 'ErrorList';

/**
 * BulkErrorSummary Component
 * 
 * Displays a summary of bulk operation errors.
 * 
 * @example
 * ```tsx
 * <BulkErrorSummary
 *   total={10}
 *   succeeded={7}
 *   failed={3}
 *   errors={[
 *     { id: '1', error: 'Permission denied' },
 *     { id: '2', error: 'Not found' },
 *     { id: '3', error: 'Validation failed' },
 *   ]}
 * />
 * ```
 */

export interface BulkErrorSummaryProps {
  /**
   * Total number of items
   */
  total: number;
  
  /**
   * Number of successful items
   */
  succeeded: number;
  
  /**
   * Number of failed items
   */
  failed: number;
  
  /**
   * Array of error details
   */
  errors: Array<{ id: string; error: string }>;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Callback when retry is clicked
   */
  onRetry?: (failedIds: string[]) => void;
}

export const BulkErrorSummary: React.FC<BulkErrorSummaryProps> = ({
  total,
  succeeded,
  failed,
  errors,
  className,
  onRetry,
}) => {
  const variant = failed === 0 ? 'default' : 'destructive';

  return (
    <Alert variant={variant} className={cn(className)} data-test="bulk-error-summary">
      <AlertCircle className="h-4 w-4" aria-hidden="true" />
      <AlertTitle>
        {failed === 0
          ? `All ${total} items processed successfully`
          : `${succeeded} of ${total} items processed successfully`}
      </AlertTitle>
      {failed > 0 && (
        <AlertDescription className="space-y-3">
          <p className="text-sm">
            {failed} {failed === 1 ? 'item' : 'items'} failed to process.
          </p>
          
          {errors.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Failed items:</p>
              <ul className="text-xs space-y-1 max-h-40 overflow-y-auto">
                {errors.map((error) => (
                  <li key={error.id} className="flex gap-2">
                    <span className="font-mono opacity-70">{error.id}</span>
                    <span>{error.error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {onRetry && (
            <button
              type="button"
              onClick={() => onRetry(errors.map((e) => e.id))}
              className="text-sm underline hover:no-underline"
              data-test="retry-failed-button"
            >
              Retry failed items
            </button>
          )}
        </AlertDescription>
      )}
    </Alert>
  );
};

BulkErrorSummary.displayName = 'BulkErrorSummary';
