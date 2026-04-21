'use client';

import { cn } from '@/lib/utils';

type SectionTagProps = {
  children: string;
  className?: string;
};

export function SectionTag({ children, className }: SectionTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-[0.3rem] border px-2.5 py-1.5',
        'border-border bg-[color:var(--surface-panel)]',
        'font-mono text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--ink-secondary)]',
        className,
      )}
    >
      <span className="h-px w-3 bg-[color:var(--stroke-strong)]" />
      {children}
    </span>
  );
}
