'use client';

import * as React from 'react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { motion, type HTMLMotionProps } from 'motion/react';

import { cn } from '@/lib/utils';

type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root> &
  HTMLMotionProps<'button'>;

function Checkbox({ className, onCheckedChange, ...props }: CheckboxProps) {
  const [isChecked, setIsChecked] = React.useState(
    props?.checked ?? props?.defaultChecked ?? false
  );

  React.useEffect(() => {
    if (props?.checked !== undefined) setIsChecked(props.checked);
  }, [props?.checked]);

  const handleCheckedChange = React.useCallback(
    (checked: boolean) => {
      setIsChecked(checked);
      onCheckedChange?.(checked);
    },
    [onCheckedChange]
  );

  return (
    <CheckboxPrimitive.Root
      {...props}
      onCheckedChange={handleCheckedChange}
      asChild
    >
      <motion.button
        data-slot="checkbox"
        className={cn(
          'peer bg-input focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground flex size-5 shrink-0 items-center justify-center rounded-sm transition-colors duration-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        {...props}
      >
        <CheckboxPrimitive.Indicator forceMount asChild>
          <motion.svg
            data-slot="checkbox-indicator"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="3.5"
            stroke="currentColor"
            className="size-3.5"
            initial="unchecked"
            animate={isChecked ? 'checked' : 'unchecked'}
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
              variants={{
                checked: {
                  pathLength: 1,
                  opacity: 1,
                  transition: {
                    duration: 0.2,
                    delay: 0.2,
                  },
                },
                unchecked: {
                  pathLength: 0,
                  opacity: 0,
                  transition: {
                    duration: 0.2,
                  },
                },
              }}
            />
          </motion.svg>
        </CheckboxPrimitive.Indicator>
      </motion.button>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox, type CheckboxProps };
