'use client';

import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SectionProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'hero';
  gradient?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  overflow?: boolean;
}

const variantClasses = {
  default: 'bg-white',
  gradient: 'bg-gradient-to-br',
  hero: 'relative overflow-hidden rounded-3xl bg-gradient-to-br',
};

const paddingVariants = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-8 md:p-12',
};

export function Section({
  children,
  className,
  variant = 'default',
  gradient,
  padding = 'lg',
  overflow = false,
  ...props
}: SectionProps) {
  const baseGradient = gradient || 
    (variant === 'hero' ? 'from-cyan-50 via-blue-50 to-teal-50' : 
     variant === 'gradient' ? 'from-indigo-50 via-blue-50 to-cyan-50' : '');

  return (
    <div
      className={cn(
        variant === 'hero' ? variantClasses.hero : variantClasses[variant],
        variant !== 'default' && baseGradient,
        paddingVariants[padding],
        overflow && 'overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
