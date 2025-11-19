import { Loader2Icon } from 'lucide-react';

import { cn } from '../lib/utils/cn';

interface SpinnerProps extends Omit<React.ComponentProps<'svg'>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
}

function Spinner({ className, size = 'md', ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: 'size-4',
    md: 'size-6',
    lg: 'size-8',
  };

  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn(
        'text-muted-foreground animate-spin',
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}

export { Spinner };
