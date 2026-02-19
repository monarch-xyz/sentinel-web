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

      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 relative z-10">
        <div className="py-10">
          <Link href="/" className="inline-flex items-center gap-2 text-secondary hover:text-foreground transition-colors no-underline">
            <span className="text-xl">🔥</span>
            <span className="font-zen text-lg">Sentinel</span>
          </Link>
        </div>

        <div className="max-w-5xl mx-auto pb-16">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-secondary mb-3">Access</p>
            <h1 className="font-zen text-3xl sm:text-4xl font-semibold mb-3">{title}</h1>
            <p className="text-secondary leading-relaxed max-w-2xl">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
