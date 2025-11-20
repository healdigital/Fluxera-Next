'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * StepIndicator Component
 * 
 * Displays progress through a multi-step process with visual indicators.
 * Used in modals and forms to show users where they are in a workflow.
 * 
 * Features:
 * - Visual progress indication (Requirements 12.3)
 * - Current step highlighting
 * - Completed step markers
 * - Step descriptions
 * - Keyboard accessible
 * - Screen reader friendly
 * 
 * @example
 * ```tsx
 * <StepIndicator
 *   steps={[
 *     { label: 'Basic Info', description: 'Enter asset details' },
 *     { label: 'Assignment', description: 'Assign to user' },
 *     { label: 'Review', description: 'Confirm details' }
 *   ]}
 *   currentStep={1}
 * />
 * ```
 */

export interface Step {
  /**
   * Label for the step
   */
  label: string;
  
  /**
   * Optional description of what happens in this step
   */
  description?: string;
  
  /**
   * Optional custom icon for the step
   */
  icon?: React.ComponentType<{ className?: string }>;
}

export interface StepIndicatorProps {
  /**
   * Array of steps in the process
   */
  steps: Step[];
  
  /**
   * Current step index (0-based)
   */
  currentStep: number;
  
  /**
   * Variant for display style
   * @default 'default'
   */
  variant?: 'default' | 'compact' | 'minimal';
  
  /**
   * Orientation of the indicator
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Callback when a step is clicked (for navigation)
   * Only completed steps can be clicked
   */
  onStepClick?: (stepIndex: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  variant = 'default',
  orientation = 'horizontal',
  className,
  onStepClick,
}) => {
  const isHorizontal = orientation === 'horizontal';
  const isCompact = variant === 'compact';
  const isMinimal = variant === 'minimal';

  return (
    <nav
      aria-label="Progress"
      className={cn(
        'w-full',
        isHorizontal ? 'flex items-start' : 'flex flex-col',
        className,
      )}
      data-test="step-indicator"
    >
      <ol
        role="list"
        className={cn(
          'flex w-full',
          isHorizontal
            ? 'items-center justify-between space-x-2'
            : 'flex-col space-y-4',
        )}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = isCompleted && onStepClick;

          return (
            <li
              key={index}
              className={cn(
                'flex',
                isHorizontal ? 'flex-1' : 'w-full',
                index < steps.length - 1 && isHorizontal && 'relative',
              )}
            >
              <div
                className={cn(
                  'flex items-start',
                  isHorizontal ? 'flex-col' : 'flex-row gap-3',
                  'w-full',
                )}
              >
                {/* Step Circle/Icon */}
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => isClickable && onStepClick(index)}
                    disabled={!isClickable}
                    className={cn(
                      'flex items-center justify-center rounded-full',
                      'transition-all duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      isMinimal ? 'h-2 w-2' : 'h-10 w-10',
                      isCompleted &&
                        'bg-primary text-primary-foreground hover:bg-primary/90',
                      isCurrent &&
                        'border-2 border-primary bg-background text-primary',
                      !isCompleted &&
                        !isCurrent &&
                        'border-2 border-muted bg-background text-muted-foreground',
                      isClickable && 'cursor-pointer',
                      !isClickable && 'cursor-default',
                    )}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-label={`${step.label}${isCurrent ? ' (current step)' : ''}${isCompleted ? ' (completed)' : ''}`}
                    data-test={`step-${index}`}
                  >
                    {!isMinimal && (
                      <>
                        {isCompleted ? (
                          <Check className="h-5 w-5" aria-hidden="true" />
                        ) : step.icon ? (
                          <step.icon className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <span className="text-sm font-semibold">
                            {index + 1}
                          </span>
                        )}
                      </>
                    )}
                  </button>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'flex-1',
                        isHorizontal
                          ? 'ml-2 h-0.5 w-full'
                          : 'ml-5 mt-2 h-full w-0.5',
                        isCompleted ? 'bg-primary' : 'bg-muted',
                      )}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Step Content */}
                {!isMinimal && (
                  <div
                    className={cn(
                      'flex flex-col',
                      isHorizontal ? 'mt-2' : 'flex-1',
                    )}
                  >
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isCurrent && 'text-foreground',
                        isCompleted && 'text-foreground',
                        !isCurrent && !isCompleted && 'text-muted-foreground',
                      )}
                    >
                      {step.label}
                    </span>
                    {!isCompact && step.description && (
                      <span
                        className={cn(
                          'mt-0.5 text-xs',
                          isCurrent && 'text-muted-foreground',
                          isCompleted && 'text-muted-foreground',
                          !isCurrent &&
                            !isCompleted &&
                            'text-muted-foreground/70',
                        )}
                      >
                        {step.description}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

StepIndicator.displayName = 'StepIndicator';

/**
 * StepProgress Component
 * 
 * Simplified progress bar for multi-step processes.
 * Shows a linear progress bar with step count.
 * 
 * @example
 * ```tsx
 * <StepProgress currentStep={2} totalSteps={5} />
 * ```
 */

export interface StepProgressProps {
  /**
   * Current step (1-based for display)
   */
  currentStep: number;
  
  /**
   * Total number of steps
   */
  totalSteps: number;
  
  /**
   * Optional label to display
   */
  label?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  totalSteps,
  label,
  className,
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={cn('w-full space-y-2', className)} data-test="step-progress">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {label || 'Progress'}
        </span>
        <span className="font-medium">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Step ${currentStep} of ${totalSteps}`}
      >
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

StepProgress.displayName = 'StepProgress';

/**
 * MultiStepModal Component
 * 
 * Wrapper component that combines a modal with step indicators.
 * Provides a complete multi-step modal experience.
 * 
 * @example
 * ```tsx
 * <MultiStepModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Create Asset"
 *   steps={steps}
 *   currentStep={currentStep}
 *   onStepChange={setCurrentStep}
 * >
 *   {currentStepContent}
 * </MultiStepModal>
 * ```
 */

export interface MultiStepModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;
  
  /**
   * Callback when open state changes
   */
  onOpenChange: (open: boolean) => void;
  
  /**
   * Modal title
   */
  title: string;
  
  /**
   * Steps configuration
   */
  steps: Step[];
  
  /**
   * Current step index (0-based)
   */
  currentStep: number;
  
  /**
   * Callback when step changes
   */
  onStepChange?: (stepIndex: number) => void;
  
  /**
   * Modal content for current step
   */
  children: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Show progress bar instead of step indicator
   */
  showProgressBar?: boolean;
}

export const MultiStepModal: React.FC<MultiStepModalProps> = ({
  open,
  onOpenChange,
  title,
  steps,
  currentStep,
  onStepChange,
  children,
  className,
  showProgressBar = false,
}) => {
  return (
    <div
      className={cn('space-y-6', className)}
      data-test="multi-step-modal"
    >
      {/* Header with Title and Progress */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        
        {showProgressBar ? (
          <StepProgress
            currentStep={currentStep + 1}
            totalSteps={steps.length}
          />
        ) : (
          <StepIndicator
            steps={steps}
            currentStep={currentStep}
            onStepClick={onStepChange}
          />
        )}
      </div>

      {/* Content */}
      <div className="min-h-[200px]">{children}</div>
    </div>
  );
};

MultiStepModal.displayName = 'MultiStepModal';
