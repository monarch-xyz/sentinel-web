'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { RiAddLine, RiArrowRightUpLine, RiBookOpenLine, RiDashboardLine, RiFlashlightLine, RiLogoutCircleRLine, RiTelegram2Line } from 'react-icons/ri';
import { Button } from '@/components/ui/Button';
import { buildLoginHref } from '@/lib/auth/redirect';
import { IRUKA_DOCS_OVERVIEW_URL } from '@/lib/iruka-links';
import { buildTemplateEntryPath } from '@/lib/telegram/setup-flow';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: ReactNode;
  telegramLinked: boolean;
}

const navItems = [
  { href: '/app', label: 'Dashboard', icon: RiDashboardLine },
  { href: '/signals', label: 'Signals', icon: RiFlashlightLine },
  { href: '/telegram', label: 'Telegram', icon: RiTelegram2Line },
  { href: IRUKA_DOCS_OVERVIEW_URL, label: 'Docs', icon: RiBookOpenLine, external: true },
];

const isActivePath = (pathname: string | null, href: string) => {
  if (!pathname) {
    return false;
  }

  if (href === '/app') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

export function AppShell({ children, telegramLinked }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const createSignalHref = buildTemplateEntryPath(telegramLinked);
  const CreateActionIcon = telegramLinked ? RiAddLine : RiTelegram2Line;
  const createSignalLabel = telegramLinked ? 'Create signal' : 'Set up Telegram';

  const currentSearch = searchParams.toString();
  const currentPath = pathname ? `${pathname}${currentSearch ? `?${currentSearch}` : ''}` : undefined;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      router.replace(buildLoginHref(currentPath));
      router.refresh();
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative min-h-screen pb-8 pt-4">
      <div className="page-gutter relative z-10">
        <header className="ui-panel px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/app" className="flex items-center gap-3 no-underline">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[0.35rem] border border-border bg-[color:var(--surface-panel)]">
                  <span className="h-px w-5 -rotate-[28deg] bg-[color:var(--signal-copper)]" />
                </span>
                <div className="min-w-0">
                  <div className="font-display text-[1.24rem] leading-none text-foreground">Iruka</div>
                  <div className="mt-1 text-[0.62rem] uppercase tracking-[0.1em] text-secondary">
                    Operator Console
                  </div>
                </div>
              </Link>
            </div>

            <nav className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1 scrollbar-hide xl:justify-center xl:pb-0">
              {navItems.map((item) => {
                const active = item.external ? false : isActivePath(pathname, item.href);

                return item.external ? (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ui-option inline-flex items-center gap-2 px-4 py-2.5 text-sm no-underline"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    <RiArrowRightUpLine className="h-3.5 w-3.5 text-[color:var(--ink-muted)]" />
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    data-active={active}
                    className={cn(
                      'ui-option inline-flex items-center gap-2 px-4 py-2.5 text-sm no-underline',
                      active && 'border-[color:color-mix(in_oklch,var(--signal-copper)_36%,var(--stroke-strong))] bg-[color:color-mix(in_oklch,var(--signal-copper)_10%,var(--surface-inset))] text-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex flex-wrap items-center gap-2">
              <Link href={createSignalHref} className="no-underline">
                <Button size="sm" className="gap-2">
                  <CreateActionIcon className="h-4 w-4" />
                  {createSignalLabel}
                </Button>
              </Link>
              <Button variant="secondary" size="sm" className="gap-2" onClick={handleLogout} disabled={isLoggingOut}>
                <RiLogoutCircleRLine className="h-4 w-4" />
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          </div>
        </header>

        <main className="page-frame mt-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
