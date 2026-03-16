'use client';

import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface rounded-md p-6',
        'border border-border',
        'transition-colors duration-200',
        className
      )}
    >
      {children}
    </div>
  );
}
