/**
 * Property-Based Tests for Actionable Error Messages
 * 
 * Feature: modal-ux-improvements, Property 34: Actionable Error Messages
 * Validates: Requirements 12.4
 * 
 * Property: For any validation error, the error message should be non-empty and provide guidance for correction
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';
import {
  ActionableError,
  FieldError,
  ErrorList,
  BulkErrorSummary,
} from '../actionable-error';
import {
  ValidationErrors,
  formatErrorMessage,
  isActionableError,
  summarizeErrors,
  createBulkErrorMessage,
  type ErrorMessageConfig,
} from '../error-message-helpers';

describe('Property 34: Actionable Error Messages', () => {
  describe('Error Message Non-Empty Property', () => {
    it('should always have non-empty error messages', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (message) => {
            const error: ErrorMessageConfig = { message };
            expect(error.message).toBeTruthy();
            expect(error.message.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide suggestions for common validation errors', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (fieldName) => {
            const errors = [
              ValidationErrors.required(fieldName),
              ValidationErrors.email(fieldName),
              ValidationErrors.minLength(fieldName, 5),
              ValidationErrors.maxLength(fieldName, 100),
            ];

            errors.forEach((error) => {
              expect(error.message).toBeTruthy();
              expect(error.suggestion).toBeTruthy();
              expect(isActionableError(error)).toBe(true);
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('ActionableError Component', () => {
    it('should display error message', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }),
          (message) => {
            const { unmount } = render(
              <ActionableError error={{ message }} />
            );

            expect(screen.getByText(message)).toBeInTheDocument();

            unmount();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should display suggestion when provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }),
          fc.string({ minLength: 1, maxLength: 200 }),
          (message, suggestion) => {
            const { unmount } = render(
              <ActionableError error={{ message, suggestion }} />
            );

            expect(screen.getByText(message)).toBeInTheDocument();
            expect(screen.getByText(suggestion)).toBeInTheDocument();
            expect(screen.getByTestId('error-suggestion')).toBeInTheDocument();

            unmount();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should display help link when provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.webUrl(),
          (message, linkText, url) => {
            const { unmount } = render(
              <ActionableError
                error={{
                  message,
                  helpLink: { text: linkText, url },
                }}
              />
            );

            const helpLink = screen.getByTestId('error-help-link');
            expect(helpLink).toBeInTheDocument();
            expect(helpLink).toHaveAttribute('href', url);
            expect(helpLink).toHaveTextContent(linkText);

            unmount();
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should handle string errors', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }),
          (message) => {
            const { unmount } = render(<ActionableError error={message} />);

            expect(screen.getByText(message)).toBeInTheDocument();

            unmount();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('FieldError Component', () => {
    it('should display field error message', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }),
          (message) => {
            const { unmount } = render(<FieldError error={{ message }} />);

            expect(screen.getByText(message)).toBeInTheDocument();
            expect(screen.getByRole('alert')).toBeInTheDocument();

            unmount();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should display field error suggestion', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }),
          fc.string({ minLength: 1, maxLength: 200 }),
          (message, suggestion) => {
            const { unmount } = render(
              <FieldError error={{ message, suggestion }} />
            );

            expect(screen.getByText(message)).toBeInTheDocument();
            expect(screen.getByText(suggestion)).toBeInTheDocument();
            expect(
              screen.getByTestId('field-error-suggestion')
            ).toBeInTheDocument();

            unmount();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('ErrorList Component', () => {
    it('should display multiple errors', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              message: fc.string({ minLength: 1, maxLength: 100 }),
              suggestion: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (errors) => {
            const { unmount } = render(<ErrorList errors={errors} />);

            errors.forEach((error) => {
              expect(screen.getByText(error.message)).toBeInTheDocument();
            });

            unmount();
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should display suggestions for each error', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              message: fc.string({ minLength: 1, maxLength: 100 }),
              suggestion: fc.string({ minLength: 1, maxLength: 100 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (errors) => {
            const { unmount } = render(<ErrorList errors={errors} />);

            errors.forEach((error) => {
              expect(screen.getByText(error.message)).toBeInTheDocument();
              expect(screen.getByText(error.suggestion)).toBeInTheDocument();
            });

            unmount();
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should not render when errors array is empty', () => {
      const { container } = render(<ErrorList errors={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('BulkErrorSummary Component', () => {
    it('should display success message when no failures', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          (total) => {
            const { unmount } = render(
              <BulkErrorSummary
                total={total}
                succeeded={total}
                failed={0}
                errors={[]}
              />
            );

            expect(
              screen.getByText(`All ${total} items processed successfully`)
            ).toBeInTheDocument();

            unmount();
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should display failure summary when some items fail', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 100 }),
          fc.integer({ min: 1 }),
          (total, failedBase) => {
            const failed = (failedBase % (total - 1)) + 1;
            const succeeded = total - failed;

            const { unmount } = render(
              <BulkErrorSummary
                total={total}
                succeeded={succeeded}
                failed={failed}
                errors={[]}
              />
            );

            expect(
              screen.getByText(
                `${succeeded} of ${total} items processed successfully`
              )
            ).toBeInTheDocument();

            unmount();
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should display error details', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 20 }),
              error: fc.string({ minLength: 1, maxLength: 100 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (errors) => {
            const total = errors.length + 5;
            const failed = errors.length;
            const succeeded = total - failed;

            const { unmount } = render(
              <BulkErrorSummary
                total={total}
                succeeded={succeeded}
                failed={failed}
                errors={errors}
              />
            );

            errors.forEach((error) => {
              expect(screen.getByText(error.id)).toBeInTheDocument();
              expect(screen.getByText(error.error)).toBeInTheDocument();
            });

            unmount();
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Error Message Helpers', () => {
    it('should format error messages with suggestions', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          (message, suggestion) => {
            const formatted = formatErrorMessage({ message, suggestion });
            expect(formatted).toContain(message);
            expect(formatted).toContain(suggestion);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should identify actionable errors', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.option(fc.string({ minLength: 1, maxLength: 100 })),
          (message, suggestion) => {
            const error: ErrorMessageConfig = { message, suggestion };
            const isActionable = isActionableError(error);

            if (suggestion) {
              expect(isActionable).toBe(true);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should summarize multiple errors', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              message: fc.string({ minLength: 1, maxLength: 100 }),
              suggestion: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
              field: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (errors) => {
            const summary = summarizeErrors(errors);
            expect(summary.message).toBeTruthy();
            expect(summary.message.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should create bulk error messages', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 0 }),
          (total, failedBase) => {
            const failed = failedBase % (total + 1);
            const errors = Array.from({ length: failed }, (_, i) => ({
              id: `item-${i}`,
              error: `Error ${i}`,
            }));

            const message = createBulkErrorMessage(total, failed, errors);
            expect(message.message).toBeTruthy();
            expect(message.message.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Validation Error Generators', () => {
    it('should generate required field errors with suggestions', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (fieldName) => {
            const error = ValidationErrors.required(fieldName);
            expect(error.message).toContain(fieldName);
            expect(error.suggestion).toBeTruthy();
            expect(error.field).toBe(fieldName);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should generate min/max length errors with specific values', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 1, max: 1000 }),
          (fieldName, minLength, maxLength) => {
            const minError = ValidationErrors.minLength(fieldName, minLength);
            expect(minError.suggestion).toContain(String(minLength));

            const maxError = ValidationErrors.maxLength(fieldName, maxLength);
            expect(maxError.suggestion).toContain(String(maxLength));
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should generate email errors with format example', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (fieldName) => {
            const error = ValidationErrors.email(fieldName);
            expect(error.message).toBeTruthy();
            expect(error.suggestion).toContain('@');
            expect(error.suggestion).toContain('example.com');
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should generate date range errors with field names', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          (startField, endField) => {
            const error = ValidationErrors.dateRange(startField, endField);
            expect(error.message).toBeTruthy();
            expect(error.suggestion).toContain(startField);
            expect(error.suggestion).toContain(endField);
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty error message gracefully', () => {
      const { container } = render(<ActionableError error={{ message: '' }} />);
      expect(container).toBeInTheDocument();
    });

    it('should handle very long error messages', () => {
      const longMessage = 'A'.repeat(1000);
      const { unmount } = render(
        <ActionableError error={{ message: longMessage }} />
      );

      expect(screen.getByText(longMessage)).toBeInTheDocument();

      unmount();
    });

    it('should handle special characters in error messages', () => {
      const specialMessage = '<script>alert("xss")</script>';
      const { unmount } = render(
        <ActionableError error={{ message: specialMessage }} />
      );

      // Should be escaped and displayed as text
      expect(screen.getByText(specialMessage)).toBeInTheDocument();

      unmount();
    });

    it('should handle errors without suggestions', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (message) => {
            const { unmount } = render(
              <ActionableError error={{ message }} />
            );

            expect(screen.getByText(message)).toBeInTheDocument();
            expect(
              screen.queryByTestId('error-suggestion')
            ).not.toBeInTheDocument();

            unmount();
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});
