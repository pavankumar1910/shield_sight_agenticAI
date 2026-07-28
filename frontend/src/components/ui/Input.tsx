import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import type { HTMLMotionProps } from 'framer-motion';


export interface InputProps
  extends Omit<HTMLMotionProps<'input'>, 'ref'> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <motion.input
          whileFocus={{ scale: 1.01 }}
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-destructive mt-1"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';