'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RiArrowRightUpLine, RiBookLine, RiDiscordFill, RiLoginCircleLine, RiMenuLine, RiCloseLine } from 'react-icons/ri';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { IRUKA_DOCS_OVERVIEW_URL } from '@/lib/iruka-links';

const navLinks = [
  { href: IRUKA_DOCS_OVERVIEW_URL, label: 'Docs', icon: RiBookLine, external: true },
  { href: 'https://discord.gg/Ur4dwN3aPS', label: 'Discord', icon: RiDiscordFill, external: true },
];

function BrandMark() {
  return (
    <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-[0.35rem] border border-border bg-[color:var(--surface-panel)]">
      <span className="h-px w-5 -rotate-[28deg] bg-[color:var(--signal-copper)]" />
    </span>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="page-gutter pt-3 md:pt-4">
        <div
          className={cn(
            'relative overflow-hidden rounded-[0.5rem] border px-4 py-3 transition-all duration-300 md:px-5',
            scrolled
              ? 'border-[color:color-mix(in_oklch,var(--stroke-strong)_52%,var(--stroke-soft))] bg-[color:color-mix(in_oklch,var(--surface-panel)_96%,var(--surface-muted))] shadow-[0_16px_34px_-30px_rgba(31,45,68,0.24)]'
              : 'border-border bg-[color:color-mix(in_oklch,var(--surface-panel)_78%,transparent)]'
          )}
        >
          <div className="absolute inset-0 bg-line-grid opacity-[0.035]" aria-hidden="true" />
          <div className="relative flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 no-underline">
              <BrandMark />
              <div className="min-w-0">
                <div className="font-display text-[1.22rem] leading-none text-foreground">Iruka</div>
                <div className="mt-1 hidden text-[0.62rem] uppercase tracking-[0.1em] text-[color:color-mix(in_oklch,var(--ink-primary)_84%,var(--signal-copper))] sm:block">
                  Open Data For Smarter Agents
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              {navLinks.map((link) =>
                link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ui-link inline-flex items-center gap-2 rounded-[0.38rem] px-3 py-2 text-sm no-underline"
                  >
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                    <RiArrowRightUpLine className="h-3.5 w-3.5 text-[color:var(--ink-muted)]" />
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="ui-link inline-flex items-center gap-2 rounded-[0.38rem] px-3 py-2 text-sm no-underline"
                  >
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                )
              )}

              <Link href="/login" className="no-underline">
                <Button size="sm" className="gap-2">
                  <RiLoginCircleLine className="h-4 w-4" />
                  Open Console
                </Button>
              </Link>
            </nav>

            <div className="flex items-center gap-2 md:hidden">
              <Link href="/login" className="no-underline">
                <Button size="sm" variant="secondary" className="px-3">
                  <RiLoginCircleLine className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="px-3"
                aria-label="Toggle menu"
                onClick={() => setMobileMenuOpen((current) => !current)}
              >
                {mobileMenuOpen ? <RiCloseLine className="h-4 w-4" /> : <RiMenuLine className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen ? (
            <nav className="relative mt-4 grid gap-2 border-t border-border pt-4 md:hidden">
              {navLinks.map((link) =>
                link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ui-option flex items-center justify-between px-4 py-3 text-sm no-underline"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </span>
                    <RiArrowRightUpLine className="h-4 w-4 text-[color:var(--ink-muted)]" />
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="ui-option flex items-center justify-between px-4 py-3 text-sm no-underline"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </span>
                  </Link>
                )
              )}
            </nav>
          ) : null}
        </div>
      </div>
    </header>
  );
}
