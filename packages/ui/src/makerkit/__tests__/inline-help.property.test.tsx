/**
 * Property-Based Tests for Help Tooltips
 * 
 * Feature: modal-ux-improvements, Property 32: Help Tooltips with Delay
 * Validates: Requirements 12.1, 12.2
 * 
 * Property: For any complex form field with a help icon, hovering should display a tooltip after 500ms
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';
import { FormFieldHelp, InlineHelp, InlineHelpText } from '../inline-help';

describe('Property 32: Help Tooltips with Delay', () => {
  describe('FormFieldHelp Component', () => {
    it('should display tooltip after 500ms delay on hover', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 200 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (content, title) => {
            const user = userEvent.setup({ delay: null });
            const { unmount } = render(
              <FormFieldHelp content={content} title={title} />
            );

            const helpButton = screen.getByRole('button', { name: title });
            expect(helpButton).toBeInTheDocument();

            // Hover over the help icon
            await user.hover(helpButton);

            // Tooltip should NOT appear immediately
            expect(screen.queryByText(content)).not.toBeInTheDocument();

            // Wait for the 500ms delay
            await waitFor(
              () => {
                expect(screen.getByText(content)).toBeInTheDocument();
              },
              { timeout: 1000 }
            );

            // Verify title is also displayed
            expect(screen.getByText(title)).toBeInTheDocument();

            unmount();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should hide tooltip when mouse leaves', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 200 }),
          async (content) => {
            const user = userEvent.setup({ delay: null });
            const { unmount } = render(
              <FormFieldHelp content={content} title="Test Help" />
            );

            const helpButton = screen.getByRole('button');

            // Hover to show tooltip
            await user.hover(helpButton);
            await waitFor(
              () => {
                expect(screen.getByText(content)).toBeInTheDocument();
              },
              { timeout: 1000 }
            );

            // Unhover to hide tooltip
            await user.unhover(helpButton);

            // Tooltip should disappear
            await waitFor(
              () => {
                expect(screen.queryByText(content)).not.toBeInTheDocument();
              },
              { timeout: 500 }
            );

            unmount();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should be keyboard accessible', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 200 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (content, title) => {
            const user = userEvent.setup({ delay: null });
            const { unmount } = render(
              <div>
                <button>Before</button>
                <FormFieldHelp content={content} title={title} />
                <button>After</button>
              </div>
            );

            const helpButton = screen.getByRole('button', { name: title });

            // Tab to the help button
            await user.tab();
            await user.tab();

            // Help button should be focused
            expect(helpButton).toHaveFocus();

            // Tooltip should appear after delay when focused
            await waitFor(
              () => {
                expect(screen.getByText(content)).toBeInTheDocument();
              },
              { timeout: 1000 }
            );

            unmount();
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('InlineHelp Component', () => {
    it('should support custom delay durations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 200 }),
          fc.integer({ min: 100, max: 1000 }),
          async (content, delayDuration) => {
            const user = userEvent.setup({ delay: null });
            const { unmount } = render(
              <InlineHelp
                content={content}
                delayDuration={delayDuration}
                title="Custom Delay"
              />
            );

            const helpButton = screen.getByRole('button');
            await user.hover(helpButton);

            // Should not appear before delay
            await new Promise((resolve) =>
              setTimeout(resolve, delayDuration - 50)
            );
            expect(screen.queryByText(content)).not.toBeInTheDocument();

            // Should appear after delay
            await waitFor(
              () => {
                expect(screen.getByText(content)).toBeInTheDocument();
              },
              { timeout: delayDuration + 500 }
            );

            unmount();
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should support different icon variants', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 200 }),
          fc.constantFrom('help' as const, 'info' as const),
          async (content, variant) => {
            const { unmount } = render(
              <InlineHelp content={content} variant={variant} title="Test" />
            );

            const helpButton = screen.getByRole('button');
            expect(helpButton).toBeInTheDocument();

            // Icon should be present (aria-hidden)
            const icon = helpButton.querySelector('svg');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveAttribute('aria-hidden', 'true');

            unmount();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should support different sizes', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 200 }),
          fc.constantFrom('sm' as const, 'md' as const, 'lg' as const),
          async (content, size) => {
            const { unmount } = render(
              <InlineHelp content={content} size={size} title="Test" />
            );

            const helpButton = screen.getByRole('button');
            const icon = helpButton.querySelector('svg');

            expect(icon).toBeInTheDocument();

            // Verify size classes are applied
            const sizeClasses = {
              sm: 'h-4 w-4',
              md: 'h-5 w-5',
              lg: 'h-6 w-6',
            };

            const expectedClasses = sizeClasses[size].split(' ');
            expectedClasses.forEach((className) => {
              expect(icon).toHaveClass(className);
            });

            unmount();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should support different tooltip positions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 200 }),
          fc.constantFrom(
            'top' as const,
            'right' as const,
            'bottom' as const,
            'left' as const
          ),
          async (content, side) => {
            const user = userEvent.setup({ delay: null });
            const { unmount } = render(
              <InlineHelp content={content} side={side} title="Test" />
            );

            const helpButton = screen.getByRole('button');
            await user.hover(helpButton);

            // Wait for tooltip to appear
            await waitFor(
              () => {
                expect(screen.getByText(content)).toBeInTheDocument();
              },
              { timeout: 1000 }
            );

            unmount();
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('InlineHelpText Component', () => {
    it('should display label text alongside icon', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 200 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (content, label) => {
            const { unmount } = render(
              <InlineHelpText content={content} label={label} />
            );

            const helpButton = screen.getByRole('button', { name: label });
            expect(helpButton).toBeInTheDocument();

            // Label text should be visible
            expect(screen.getByText(label)).toBeInTheDocument();

            unmount();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should show tooltip on hover with label', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 200 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (content, label) => {
            const user = userEvent.setup({ delay: null });
            const { unmount } = render(
              <InlineHelpText content={content} label={label} />
            );

            const helpButton = screen.getByRole('button', { name: label });
            await user.hover(helpButton);

            // Wait for tooltip
            await waitFor(
              () => {
                expect(screen.getByText(content)).toBeInTheDocument();
              },
              { timeout: 1000 }
            );

            unmount();
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Accessibility Requirements', () => {
    it('should have proper ARIA labels', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 200 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (content, title) => {
            const { unmount } = render(
              <FormFieldHelp content={content} title={title} />
            );

            const helpButton = screen.getByRole('button', { name: title });
            expect(helpButton).toHaveAttribute('aria-label', title);

            unmount();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should have focus visible styles', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 200 }),
          async (content) => {
            const user = userEvent.setup({ delay: null });
            const { unmount } = render(
              <div>
                <button>Before</button>
                <FormFieldHelp content={content} title="Test" />
              </div>
            );

            const helpButton = screen.getByRole('button', { name: 'Test' });

            // Tab to focus
            await user.tab();
            await user.tab();

            expect(helpButton).toHaveFocus();

            // Should have focus ring classes
            expect(helpButton).toHaveClass('focus:ring-2');
            expect(helpButton).toHaveClass('focus:ring-ring');

            unmount();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should hide icon from screen readers', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 200 }),
          async (content) => {
            const { unmount } = render(
              <InlineHelp content={content} title="Test" />
            );

            const helpButton = screen.getByRole('button');
            const icon = helpButton.querySelector('svg');

            expect(icon).toHaveAttribute('aria-hidden', 'true');

            unmount();
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content gracefully', () => {
      const { container } = render(
        <FormFieldHelp content="" title="Empty Content" />
      );

      const helpButton = screen.getByRole('button');
      expect(helpButton).toBeInTheDocument();
    });

    it('should handle very long content', async () => {
      const longContent = 'A'.repeat(1000);
      const user = userEvent.setup({ delay: null });

      const { unmount } = render(
        <FormFieldHelp content={longContent} title="Long Content" />
      );

      const helpButton = screen.getByRole('button');
      await user.hover(helpButton);

      await waitFor(
        () => {
          expect(screen.getByText(longContent)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      unmount();
    });

    it('should handle special characters in content', async () => {
      const specialContent = '<script>alert("xss")</script>';
      const user = userEvent.setup({ delay: null });

      const { unmount } = render(
        <FormFieldHelp content={specialContent} title="Special" />
      );

      const helpButton = screen.getByRole('button');
      await user.hover(helpButton);

      await waitFor(
        () => {
          // Content should be escaped and displayed as text
          expect(screen.getByText(specialContent)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      unmount();
    });
  });
});
