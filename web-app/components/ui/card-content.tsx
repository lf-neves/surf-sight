'use client';

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient';
  gradient?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const variantClasses = {
  default: 'bg-white',
  glass: 'bg-white/80 backdrop-blur-sm',
  gradient: 'bg-gradient-to-br',
};

const contentPaddingVariants = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function CardContent({
  children,
  className,
  variant = 'default',
  gradient,
  padding = 'md',
  ...props
}: CardContentProps) {
  const variantClass =
    variant === 'gradient' && gradient
      ? `${variantClasses[variant]} ${gradient}`
      : variantClasses[variant];

  return (
    <div
      className={cn(
        'rounded-xl',
        contentPaddingVariants[padding],
        variantClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
