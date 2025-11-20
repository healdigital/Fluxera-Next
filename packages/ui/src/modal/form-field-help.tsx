'use client';

import * as React from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../shadcn/tooltip';

/**
 * FormFieldHelp Component
 * 
 * Displays a help icon with a tooltip that appears after 500ms delay.
 * Used for complex form fields to provide contextual help to users.
 * 
 * Features:
 * - 500ms delay before tooltip appears (Requirements 12.1, 12.2)
 * - Keyboard accessible (can be focused and activated with Enter/Space)
 * - Screen reader friendly with proper ARIA labels
 * - Customizable icon and positioning
 * 
 * @example
 * ```tsx
 * <FormFieldHelp content="Enter the asset's unique serial number">
 *   Serial Number
 * </FormFieldHelp>
 * ```
 */

export interface FormFieldHelpProps {
  /**
   * The help text or content to display in the tooltip
   */
  content: React.ReactNode;
  
  /**
   * Optional custom icon component (defaults to HelpCircle)
   */
  icon?: React.ComponentType<{ className?: string }>;
  
  /**
   * Position of the tooltip relative to the icon
   * @default 'top'
   */
  side?: 'top' | 'right' | 'bottom' | 'left';
  
  /**
   * Delay in milliseconds before tooltip appears
   * @default 500
   */
  delayDuration?: number;
  
  /**
   * Additional CSS classes for the icon button
   */
  className?: string;
  
  /**
   * ARIA label for the help button (for screen readers)
   * @default 'Help information'
   */
  ariaLabel?: string;
}

export const FormFieldHelp: React.FC<FormFieldHelpProps> = ({
  content,
  icon: Icon = HelpCircle,
  side = 'top',
  delayDuration = 500,
  className,
  ariaLabel = 'Help information',
}) => {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger
          type="button"
          className={cn(
            'inline-flex items-center justify-center',
            'text-muted-foreground hover:text-foreground',
            'transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'rounded-full',
            className,
          )}
          aria-label={ariaLabel}
          data-test="form-field-help-trigger"
        >
          <Icon className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="max-w-xs text-sm"
          data-test="form-field-help-content"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

FormFieldHelp.displayName = 'FormFieldHelp';

/**
 * FormFieldLabel Component
 * 
 * Combines a label with optional help tooltip for form fields.
 * Provides a consistent pattern for labeling complex form fields.
 * 
 * @example
 * ```tsx
 * <FormFieldLabel
 *   label="Serial Number"
 *   helpContent="Enter the asset's unique serial number as printed on the device"
 *   required
 * />
 * ```
 */

export interface FormFieldLabelProps {
  /**
   * The label text
   */
  label: React.ReactNode;
  
  /**
   * Optional help content to display in tooltip
   */
  helpContent?: React.ReactNode;
  
  /**
   * Whether the field is required
   */
  required?: boolean;
  
  /**
   * HTML for attribute to associate with input
   */
  htmlFor?: string;
  
  /**
   * Additional CSS classes for the label
   */
  className?: string;
  
  /**
   * Position of the help tooltip
   * @default 'top'
   */
  helpSide?: 'top' | 'right' | 'bottom' | 'left';
}

export const FormFieldLabel: React.FC<FormFieldLabelProps> = ({
  label,
  helpContent,
  required,
  htmlFor,
  className,
  helpSide = 'top',
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        'flex items-center gap-1.5',
        className,
      )}
    >
      <span>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </span>
      {helpContent && (
        <FormFieldHelp
          content={helpContent}
          side={helpSide}
          ariaLabel={`Help for ${label}`}
        />
      )}
    </label>
  );
};

FormFieldLabel.displayName = 'FormFieldLabel';
