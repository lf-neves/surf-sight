'use client';

import { ReactNode, HTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'glass';
  gradient?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  hoverable?: boolean;
}

const cardVariants = {
  default: 'bg-white',
  gradient: 'bg-gradient-to-br',
  glass: 'bg-white/80 backdrop-blur-sm',
};

const paddingVariants = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-12',
};

export function Card({
  children,
  className,
  variant = 'default',
  gradient,
  padding = 'md',
  hoverable = false,
  ...props
}: CardProps) {
  const baseClasses = 'rounded-2xl shadow-sm';
  const hoverClasses = hoverable ? 'hover:shadow-lg transition-all cursor-pointer' : '';
  const variantClass = variant === 'gradient' && gradient 
    ? `${cardVariants[variant]} ${gradient}` 
    : cardVariants[variant];
  
  return (
    <div
      className={cn(
        baseClasses,
        variantClass,
        paddingVariants[padding],
        hoverClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface AnimatedCardProps extends Omit<HTMLMotionProps<'div'>, 'children'>, CardProps {
  children: ReactNode;
  delay?: number;
}

export function AnimatedCard({
  children,
  className,
  variant = 'default',
  gradient,
  padding = 'md',
  hoverable = false,
  delay = 0,
  initial = { y: 20, opacity: 0 },
  animate = { y: 0, opacity: 1 },
  transition,
  whileHover,
  ...props
}: AnimatedCardProps) {
  const baseClasses = 'rounded-2xl shadow-sm';
  const hoverClasses = hoverable ? 'hover:shadow-lg transition-all cursor-pointer' : '';
  const variantClass = variant === 'gradient' && gradient 
    ? `${cardVariants[variant]} ${gradient}` 
    : cardVariants[variant];
  
  return (
    <motion.div
      className={cn(
        baseClasses,
        variantClass,
        paddingVariants[padding],
        hoverClasses,
        className
      )}
      initial={initial}
      animate={animate}
      transition={transition || { delay }}
      whileHover={whileHover || (hoverable ? { y: -4, scale: 1.02 } : undefined)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
