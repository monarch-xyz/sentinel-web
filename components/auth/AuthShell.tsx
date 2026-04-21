import { ReactNode } from 'react';
import Link from 'next/link';

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden pb-10 pt-6">
      <div className="page-gutter relative z-10 flex min-h-screen flex-col">
        <div className="flex items-center justify-between">
          <Link href="/" className="ui-link inline-flex items-center gap-3 no-underline">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-[0.35rem] border border-border bg-[color:var(--surface-panel)]">
              <span className="h-px w-5 -rotate-[28deg] bg-[color:var(--signal-copper)]" />
            </span>
            <span className="font-display text-[1.22rem] text-foreground">Iruka</span>
          </Link>
          <span className="ui-chip" data-tone="accent">
            Access
          </span>
        </div>

        <div className="grid flex-1 place-items-center py-10">
          <div className="page-frame-compact">
            <section className="ui-hero px-6 py-8 sm:px-8 sm:py-10">
              <div className="relative z-10">
                <div className="ui-kicker">Operator Access</div>
                <h1 className="ui-page-title mt-4">{title}</h1>
                <p className="ui-copy mt-4">{description}</p>
              </div>

              <div className="relative z-10 mt-8">{children}</div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
