'use client';

import { useFormContext } from 'react-hook-form';
import { Button, buttonVariants } from '@/components/ui/button';
import { VariantProps } from 'class-variance-authority';
import { ReactNode } from 'react';

interface SubmitButtonProps
  extends Omit<React.ComponentProps<'button'>, 'type' | 'disabled'>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
  loadingLabel?: string;
  externalLoading?: boolean;
}

export function SubmitButton({
  children,
  loadingLabel,
  externalLoading = false,
  className,
  ...props
}: SubmitButtonProps) {
  const {
    formState: { isSubmitting },
  } = useFormContext();

  const isLoading = isSubmitting || externalLoading;

  return (
    <Button
      type="submit"
      disabled={isLoading}
      className={className}
      {...props}
    >
      {isLoading ? loadingLabel || children : children}
    </Button>
  );
}
