'use client';

import { ReactNode, HTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  iconGradient?: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({
  icon: Icon,
  iconGradient = 'from-cyan-100 to-blue-100',
  iconColor,
  title,
  subtitle,
  action,
  className,
  ...props
}: CardHeaderProps) {
  return (
    <div className={cn('flex items-center gap-2 mb-6', className)} {...props}>
      {Icon && (
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center',
          iconGradient ? `bg-gradient-to-br ${iconGradient}` : 'bg-white/80',
          iconColor && `text-${iconColor}`
        )}>
          <Icon className={cn(
            'w-4 h-4',
            iconColor || 'text-cyan-600'
          )} />
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
