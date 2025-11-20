/**
 * Property-Based Tests for Multi-step Progress Indicators
 * 
 * Feature: modal-ux-improvements, Property 33: Multi-step Progress Indicators
 * Validates: Requirements 12.3
 * 
 * Property: For any multi-step modal process, progress indicators and step descriptions should be visible
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  StepIndicator,
  StepProgress,
  MultiStepModal,
  type Step,
} from '../step-indicator';

describe('Property 33: Multi-step Progress Indicators', () => {
  describe('StepIndicator Component', () => {
    it('should display all steps with labels', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              label: fc.string({ minLength: 1, maxLength: 50 }),
              description: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
            }),
            { minLength: 2, maxLength: 10 }
          ),
          fc.integer({ min: 0 }),
          (steps, currentStepBase) => {
            const currentStep = currentStepBase % steps.length;
            const { unmount } = render(
              <StepIndicator steps={steps} currentStep={currentStep} />
            );

            // All step labels should be visible
            steps.forEach((step) => {
              expect(screen.getByText(step.label)).toBeInTheDocument();
            });

            unmount();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should display step descriptions when provided', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              label: fc.string({ minLength: 1, maxLength: 50 }),
              description: fc.string({ minLength: 1, maxLength: 100 }),
            }),
            { minLength: 2, maxLength: 5 }
          ),
          fc.integer({ min: 0 }),
          (steps, currentStepBase) => {
            const currentStep = currentStepBase % steps.length;
            const { unmount } = render(
              <StepIndicator steps={steps} currentStep={currentStep} />
            );

            // All descriptions should be visible (not in compact mode)
            steps.forEach((step) => {
              expect(screen.getByText(step.description)).toBeInTheDocument();
            });

            unmount();
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should mark current step correctly', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              label: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 3, maxLength: 7 }
          ),
          fc.integer({ min: 0 }),
          (steps, currentStepBase) => {
            const currentStep = currentStepBase % steps.length;
            const { unmount } = render(
              <StepIndicator steps={steps} currentStep={currentStep} />
            );

            const currentStepButton = screen.getByTestId(`step-${currentStep}`);
            expect(currentStepButton).toHaveAttribute('aria-current', 'step');

            unmount();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should mark completed steps with check icon', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              label: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 3, maxLength: 7 }
          ),
          fc.integer({ min: 1 }),
          (steps, currentStepBase) => {
            const currentStep = (currentStepBase % (steps.length - 1)) + 1; // At least 1 completed step
            const { unmount } = render(
              <StepIndicator steps={steps} currentStep={currentStep} />
            );

            // Check that completed steps have check icons
            for (let i = 0; i < currentStep; i++) {
              const stepButton = screen.getByTestId(`step-${i}`);
              const checkIcon = stepButton.querySelector('svg');
              expect(checkIcon).toBeInTheDocument();
            }

            unmount();
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should support horizontal and vertical orientations', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              label: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 2, maxLength: 5 }
          ),
          fc.constantFrom('horizontal' as const, 'vertical' as const),
          (steps, orientation) => {
            const { unmount } = render(
              <StepIndicator
                steps={steps}
                currentStep={0}
                orientation={orientation}
              />
            );

            const nav = screen.getByRole('navigation');
            expect(nav).toBeInTheDocument();

            unmount();
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should support different variants', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              label: fc.string({ minLength: 1, maxLength: 50 }),
              description: fc.string({ minLength: 1, maxLength: 100 }),
            }),
            { minLength: 2, maxLength: 5 }
          ),
          fc.constantFrom(
            'default' as const,
            'compact' as const,
            'minimal' as const
          ),
          (steps, variant) => {
            const { unmount } = render(
              <StepIndicator steps={steps} currentStep={0} variant={variant} />
            );

            // All labels should be visible except in minimal mode
            if (variant !== 'minimal') {
              steps.forEach((step) => {
                expect(screen.getByText(step.label)).toBeInTheDocument();
              });
            }

            // Descriptions should be hidden in compact mode
            if (variant === 'compact') {
              steps.forEach((step) => {
                expect(
                  screen.queryByText(step.description)
                ).not.toBeInTheDocument();
              });
            }

            unmount();
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should allow clicking on completed steps when callback provided', async () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              label: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 3, maxLength: 5 }
          ),
          fc.integer({ min: 2 }),
          async (steps, currentStepBase) => {
            const currentStep = (currentStepBase % (steps.length - 1)) + 1;
            const onStepClick = vi.fn();
            const user = userEvent.setup();

            const { unmount } = render(
              <StepIndicator
                steps={steps}
                currentStep={currentStep}
                onStepClick={onStepClick}
              />
            );

            // Click on a completed step (step 0)
            const completedStepButton = screen.getByTestId('step-0');
            await user.click(completedStepButton);

            expect(onStepClick).toHaveBeenCalledWith(0);

            unmount();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should not allow clicking on future steps', async () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              label: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 3, maxLength: 5 }
          ),
          async (steps) => {
            const currentStep = 0;
            const onStepClick = vi.fn();
            const user = userEvent.setup();

            const { unmount } = render(
              <StepIndicator
                steps={steps}
                currentStep={currentStep}
                onStepClick={onStepClick}
              />
            );

            // Try to click on a future step
            const futureStepButton = screen.getByTestId('step-1');
            await user.click(futureStepButton);

            // Should not trigger callback
            expect(onStepClick).not.toHaveBeenCalled();

            unmount();
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('StepProgress Component', () => {
    it('should display current step and total steps', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 1, max: 20 }),
          (currentStepBase, totalSteps) => {
            const currentStep = (currentStepBase % totalSteps) + 1;
            const { unmount } = render(
              <StepProgress currentStep={currentStep} totalSteps={totalSteps} />
            );

            expect(
              screen.getByText(`Step ${currentStep} of ${totalSteps}`)
            ).toBeInTheDocument();

            unmount();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should calculate progress percentage correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 1, max: 20 }),
          (currentStepBase, totalSteps) => {
            const currentStep = (currentStepBase % totalSteps) + 1;
            const { unmount } = render(
              <StepProgress currentStep={currentStep} totalSteps={totalSteps} />
            );

            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toHaveAttribute('aria-valuenow', String(currentStep));
            expect(progressBar).toHaveAttribute('aria-valuemin', '1');
            expect(progressBar).toHaveAttribute('aria-valuemax', String(totalSteps));

            unmount();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should display custom label when provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 10 }),
          (label, currentStepBase, totalSteps) => {
            const currentStep = (currentStepBase % totalSteps) + 1;
            const { unmount } = render(
              <StepProgress
                currentStep={currentStep}
                totalSteps={totalSteps}
                label={label}
              />
            );

            expect(screen.getByText(label)).toBeInTheDocument();

            unmount();
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should have proper ARIA attributes', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 10 }),
          (currentStepBase, totalSteps) => {
            const currentStep = (currentStepBase % totalSteps) + 1;
            const { unmount } = render(
              <StepProgress currentStep={currentStep} totalSteps={totalSteps} />
            );

            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toHaveAttribute(
              'aria-label',
              `Step ${currentStep} of ${totalSteps}`
            );

            unmount();
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('MultiStepModal Component', () => {
    it('should display title and step indicator', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.array(
            fc.record({
              label: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 2, maxLength: 5 }
          ),
          (title, steps) => {
            const { unmount } = render(
              <MultiStepModal
                open={true}
                onOpenChange={() => {}}
                title={title}
                steps={steps}
                currentStep={0}
              >
                <div>Content</div>
              </MultiStepModal>
            );

            expect(screen.getByText(title)).toBeInTheDocument();
            expect(screen.getByTestId('step-indicator')).toBeInTheDocument();

            unmount();
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should display progress bar when showProgressBar is true', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.array(
            fc.record({
              label: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 2, maxLength: 5 }
          ),
          (title, steps) => {
            const { unmount } = render(
              <MultiStepModal
                open={true}
                onOpenChange={() => {}}
                title={title}
                steps={steps}
                currentStep={0}
                showProgressBar={true}
              >
                <div>Content</div>
              </MultiStepModal>
            );

            expect(screen.getByTestId('step-progress')).toBeInTheDocument();
            expect(
              screen.queryByTestId('step-indicator')
            ).not.toBeInTheDocument();

            unmount();
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should render children content', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.array(
            fc.record({
              label: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 2, maxLength: 5 }
          ),
          fc.string({ minLength: 1, maxLength: 100 }),
          (title, steps, content) => {
            const { unmount } = render(
              <MultiStepModal
                open={true}
                onOpenChange={() => {}}
                title={title}
                steps={steps}
                currentStep={0}
              >
                <div>{content}</div>
              </MultiStepModal>
            );

            expect(screen.getByText(content)).toBeInTheDocument();

            unmount();
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Accessibility Requirements', () => {
    it('should have proper navigation role', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              label: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 2, maxLength: 5 }
          ),
          (steps) => {
            const { unmount } = render(
              <StepIndicator steps={steps} currentStep={0} />
            );

            const nav = screen.getByRole('navigation', { name: 'Progress' });
            expect(nav).toBeInTheDocument();

            unmount();
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should have proper ARIA labels for steps', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              label: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 3, maxLength: 5 }
          ),
          fc.integer({ min: 0 }),
          (steps, currentStepBase) => {
            const currentStep = currentStepBase % steps.length;
            const { unmount } = render(
              <StepIndicator steps={steps} currentStep={currentStep} />
            );

            // Current step should have descriptive label
            const currentStepButton = screen.getByTestId(`step-${currentStep}`);
            const ariaLabel = currentStepButton.getAttribute('aria-label');
            expect(ariaLabel).toContain(steps[currentStep].label);
            expect(ariaLabel).toContain('current step');

            unmount();
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should have keyboard focus styles', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              label: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 2, maxLength: 5 }
          ),
          (steps) => {
            const { unmount } = render(
              <StepIndicator steps={steps} currentStep={0} />
            );

            const stepButton = screen.getByTestId('step-0');
            expect(stepButton).toHaveClass('focus-visible:ring-2');

            unmount();
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle single step', () => {
      const steps: Step[] = [{ label: 'Only Step' }];
      const { unmount } = render(
        <StepIndicator steps={steps} currentStep={0} />
      );

      expect(screen.getByText('Only Step')).toBeInTheDocument();

      unmount();
    });

    it('should handle many steps', () => {
      const steps: Step[] = Array.from({ length: 20 }, (_, i) => ({
        label: `Step ${i + 1}`,
      }));

      const { unmount } = render(
        <StepIndicator steps={steps} currentStep={10} />
      );

      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Step 20')).toBeInTheDocument();

      unmount();
    });

    it('should handle last step as current', () => {
      const steps: Step[] = [
        { label: 'First' },
        { label: 'Second' },
        { label: 'Last' },
      ];

      const { unmount } = render(
        <StepIndicator steps={steps} currentStep={2} />
      );

      const lastStepButton = screen.getByTestId('step-2');
      expect(lastStepButton).toHaveAttribute('aria-current', 'step');

      unmount();
    });
  });
});
