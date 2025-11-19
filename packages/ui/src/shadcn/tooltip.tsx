'use client';

import * as React from 'react';

import { Tooltip as TooltipPrimitive } from 'radix-ui';

import { cn } from '../lib/utils';

/**
 * TooltipProvider with 500ms delay as per accessibility requirements
 * Wraps the application to provide tooltip context
 */
const TooltipProvider: React.FC<
  React.ComponentPropsWithRef<typeof TooltipPrimitive.Provider>
> = ({ delayDuration = 500, skipDelayDuration = 300, ...props }) => (
  <TooltipPrimitive.Provider
    delayDuration={delayDuration}
    skipDelayDuration={skipDelayDuration}
    {...props}
  />
);

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent: React.FC<
  React.ComponentPropsWithRef<typeof TooltipPrimitive.Content>
> = ({ className, sideOffset = 4, ...props }) => (
  <TooltipPrimitive.Content
    sideOffset={sideOffset}
    className={cn(
      'bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 overflow-hidden rounded-md px-3 py-1.5 text-xs',
      className,
    )}
    {...props}
  />
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

/**
 * Simple tooltip wrapper component for easy usage
 * Automatically includes trigger and content
 */
interface SimpleTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayDuration?: number;
}

const SimpleTooltip: React.FC<SimpleTooltipProps> = ({
  content,
  children,
  side = 'top',
  delayDuration = 500,
}) => (
  <TooltipProvider delayDuration={delayDuration}>
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{content}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  SimpleTooltip,
};
