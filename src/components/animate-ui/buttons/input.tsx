'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { HTMLMotionProps, Transition } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type InputButtonContextType = {
  showInput: boolean;
  setShowInput: React.Dispatch<React.SetStateAction<boolean>>;
  transition: Transition;
  id: string;
};
const InputButtonContext = React.createContext<
  InputButtonContextType | undefined
>(undefined);

const useInputButton = (): InputButtonContextType => {
  const context = React.useContext(InputButtonContext);
  if (!context) {
    throw new Error('useInputButton must be used within a InputButton');
  }
  return context;
};

type InputButtonProviderProps = React.ComponentProps<'div'> &
  Partial<InputButtonContextType>;

function InputButtonProvider({
  className,
  transition = { type: 'spring', stiffness: 300, damping: 20 },
  showInput,
  setShowInput,
  id,
  ...props
}: InputButtonProviderProps) {
  const localId = React.useId();
  const [localShowInput, setLocalShowInput] = React.useState(false);

  return (
    <InputButtonContext.Provider
      value={{
        showInput: showInput ?? localShowInput,
        setShowInput: setShowInput ?? setLocalShowInput,
        transition,
        id: id ?? localId,
      }}
    >
      <div
        data-slot="input-button-provider"
        className={cn(
          'relative flex h-10 w-fit items-center justify-center',
          (showInput || localShowInput) && 'w-full max-w-[400px]',
          className
        )}
        {...props}
      />
    </InputButtonContext.Provider>
  );
}

type InputButtonProps = HTMLMotionProps<'div'>;

function InputButton({ className, ...props }: InputButtonProps) {
  return (
    <motion.div
      data-slot="input-button"
      className={cn('flex size-full', className)}
      {...props}
    />
  );
}

type InputButtonActionProps = HTMLMotionProps<'button'>;

function InputButtonAction({ className, ...props }: InputButtonActionProps) {
  const { transition, setShowInput, id } = useInputButton();

  return (
    <motion.button
      data-slot="input-button-action"
      className={cn(
        'bg-background focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-background-foreground size-full shrink-0 cursor-pointer rounded-full border pr-12 pl-4 text-sm font-medium whitespace-nowrap outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
        className
      )}
      layoutId={`input-button-action-${id}`}
      transition={transition}
      onClick={() => setShowInput((prev) => !prev)}
      {...props}
    />
  );
}

type InputButtonSubmitProps = HTMLMotionProps<'button'> & {
  icon?: React.ElementType;
};

function InputButtonSubmit({
  className,
  children,
  icon: Icon = ArrowRight,
  ...props
}: InputButtonSubmitProps) {
  const { transition, showInput, setShowInput, id } = useInputButton();

  return (
    <motion.button
      data-slot="input-button-submit"
      layoutId={`input-button-submit-${id}`}
      transition={transition}
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary hover:bg-primary/90 text-primary-foreground absolute inset-y-1 right-1 z-[1] flex shrink-0 cursor-pointer items-center justify-center rounded-full text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        showInput ? 'px-4' : 'aspect-square',
        className
      )}
      onClick={() => setShowInput((prev) => !prev)}
      {...props}
    >
      {showInput ? (
        <motion.span
          key="show-button"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.span>
      ) : (
        <motion.span
          key="show-icon"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="size-4" />
        </motion.span>
      )}
    </motion.button>
  );
}

type InputButtonInputProps = React.ComponentProps<'input'>;

function InputButtonInput({ className, ...props }: InputButtonInputProps) {
  const { transition, showInput, id } = useInputButton();

  return (
    <AnimatePresence>
      {showInput && (
        <div className="absolute inset-0 flex size-full items-center justify-center">
          <motion.div
            layoutId={`input-button-input-${id}`}
            className="bg-background relative flex size-full items-center rounded-full"
            transition={transition}
          >
            <input
              data-slot="input-button-input"
              className={cn(
                'selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 bg-background aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive absolute inset-0 size-full shrink-0 rounded-full border py-2 pr-32 pl-4 text-sm focus:outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed',
                className
              )}
              {...props}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* eslint-disable react-refresh/only-export-components */
export {
  InputButton,
  InputButtonProvider,
  InputButtonAction,
  InputButtonSubmit,
  InputButtonInput,
  useInputButton,
  type InputButtonProps,
  type InputButtonProviderProps,
  type InputButtonActionProps,
  type InputButtonSubmitProps,
  type InputButtonInputProps,
};
