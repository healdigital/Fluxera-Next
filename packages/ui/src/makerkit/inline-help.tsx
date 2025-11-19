'use client';

import * as React from 'react';

import { HelpCircle, Info } from 'lucide-react';

import { cn } from '../lib/utils';
import { SimpleTooltip } from '../shadcn/tooltip';

interface InlineHelpProps {
  /**
   * The help content to display in the tooltip
   */
  content: React.ReactNode;

  /**
   * Optional title for the help content
   */
  title?: string;

  /**
   * Icon variant to display
   * @default 'help'
   */
  variant?: 'help' | 'info';

  /**
   * Size of the icon
   * @default 'sm'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Position of the tooltip relative to the icon
   * @default 'top'
   */
  side?: 'top' | 'right' | 'bottom' | 'left';

  /**
   * Additional CSS classes for the icon button
   */
  className?: string;

  /**
   * Delay before showing tooltip (in milliseconds)
   * @default 500
   */
  delayDuration?: number;
}

/**
 * InlineHelp component provides contextual help using a tooltip
 *
 * Use this component to add helpful information next to form fields,
 * buttons, or any UI element that might need clarification.
 *
 * @example
 * ```tsx
 * <InlineHelp content="Enter your full legal name as it appears on official documents" />
 * ```
 *
 * @example With title
 * ```tsx
 * <InlineHelp
 *   title="Serial Number"
 *   content="The serial number can be found on the bottom of the device or in the original packaging"
 * />
 * ```
 */
export function InlineHelp({
  content,
  title,
  variant = 'help',
  size = 'sm',
  side = 'top',
  className,
  delayDuration = 500,
}: InlineHelpProps) {
  const Icon = variant === 'help' ? HelpCircle : Info;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const tooltipContent = title ? (
    <div className="space-y-1">
      <div className="font-semibold">{title}</div>
      <div className="text-xs opacity-90">{content}</div>
    </div>
  ) : (
    content
  );

  return (
    <SimpleTooltip
      content={tooltipContent}
      side={side}
      delayDuration={delayDuration}
    >
      <button
        type="button"
        className={cn(
          'inline-flex items-center justify-center',
          'text-muted-foreground hover:text-foreground',
          'transition-colors duration-200',
          'focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none',
          'rounded-full',
          className,
        )}
        aria-label={title || 'Help'}
      >
        <Icon className={cn(sizeClasses[size])} aria-hidden="true" />
      </button>
    </SimpleTooltip>
  );
}

/**
 * InlineHelpText component provides inline help with text label
 *
 * Use this when you want to show "Learn more" or similar text
 * alongside the help icon.
 *
 * @example
 * ```tsx
 * <InlineHelpText
 *   label="Learn more"
 *   content="Detailed explanation of this feature..."
 * />
 * ```
 */
interface InlineHelpTextProps extends Omit<InlineHelpProps, 'variant'> {
  /**
   * Text label to display next to the icon
   */
  label: string;
}

export function InlineHelpText({
  label,
  content,
  title,
  size = 'sm',
  side = 'top',
  className,
  delayDuration = 500,
}: InlineHelpTextProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const tooltipContent = title ? (
    <div className="space-y-1">
      <div className="font-semibold">{title}</div>
      <div className="text-xs opacity-90">{content}</div>
    </div>
  ) : (
    content
  );

  return (
    <SimpleTooltip
      content={tooltipContent}
      side={side}
      delayDuration={delayDuration}
    >
      <button
        type="button"
        className={cn(
          'inline-flex items-center gap-1',
          'text-muted-foreground hover:text-foreground',
          'transition-colors duration-200',
          'focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none',
          'rounded',
          textSizeClasses[size],
          className,
        )}
        aria-label={title || label}
      >
        <span>{label}</span>
        <HelpCircle className={cn(sizeClasses[size])} aria-hidden="true" />
      </button>
    </SimpleTooltip>
  );
}

/**
 * FormFieldHelp component specifically designed for form fields
 *
 * Use this component next to form field labels to provide
 * contextual help about what to enter.
 *
 * @example
 * ```tsx
 * <Label htmlFor="email">
 *   Email Address
 *   <FormFieldHelp content="We'll never share your email with anyone else" />
 * </Label>
 * ```
 */
interface FormFieldHelpProps {
  /**
   * The help content to display
   */
  content: React.ReactNode;

  /**
   * Optional title for the help content
   */
  title?: string;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export function FormFieldHelp({
  content,
  title,
  className,
}: FormFieldHelpProps) {
  return (
    <InlineHelp
      content={content}
      title={title}
      size="sm"
      side="right"
      className={cn('ml-1.5', className)}
    />
  );
}
