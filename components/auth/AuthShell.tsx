import { ReactNode } from 'react';
import Link from 'next/link';

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-main relative overflow-hidden">
      <div
        className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none"
        style={{
          maskImage: 'radial-gradient(circle at 20% 20%, black 0%, transparent 60%)',
          WebkitMaskImage: 'radial-gradient(circle at 20% 20%, black 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#ff6b35]/30 via-[#ff9f1c]/20 to-transparent blur-2xl" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#ff9f1c]/20 via-[#ff6b35]/10 to-transparent blur-2xl" />

      <div className="page-gutter relative z-10 flex min-h-screen flex-col">
        <div className="py-10">
          <Link href="/" className="text-secondary hover:text-foreground transition-colors no-underline">
            <span className="font-zen text-lg">Megabat</span>
          </Link>
        </div>

        <div className="grid flex-1 place-items-center pb-16 pt-4 sm:pb-20">
          <div className="mx-auto w-full max-w-2xl">
            <div className="mx-auto w-full rounded-[28px] border border-border/70 bg-background/75 p-6 shadow-[0_24px_80px_-48px_rgba(255,107,53,0.45)] backdrop-blur-xl sm:p-8 md:p-10">
              <div className="mx-auto mb-10 max-w-xl text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-secondary mb-3">Access</p>
                <h1 className="font-zen text-3xl sm:text-4xl font-semibold mb-3">{title}</h1>
                <p className="text-secondary leading-relaxed">{description}</p>
              </div>
              <div className="mx-auto w-full max-w-lg">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
