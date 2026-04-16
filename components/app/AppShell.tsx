'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { RiAddLine, RiBookOpenLine, RiDashboardLine, RiFlashlightLine, RiLogoutCircleRLine, RiTelegram2Line } from 'react-icons/ri';
import { Button } from '@/components/ui/Button';
import { buildLoginHref } from '@/lib/auth/redirect';
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
  { href: '/docs', label: 'Docs', icon: RiBookOpenLine },
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
    <div className="min-h-screen bg-main">
      <div className="pointer-events-none absolute inset-0 bg-line-grid opacity-30" aria-hidden="true" />
      <div className="relative z-10">
        <header className="border-b border-border/80 bg-background/85 backdrop-blur-md">
          <div className="page-gutter">
            <div className="page-frame py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <Link href="/app" className="no-underline">
                    <span className="font-zen text-lg text-foreground">Megabat</span>
                  </Link>
                  <span className="hidden text-xs uppercase tracking-[0.3em] text-secondary sm:block">Console</span>
                </div>

                <nav className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1 lg:justify-center lg:pb-0">
                  {navItems.map((item) => {
                    const active = isActivePath(pathname, item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'inline-flex items-center gap-2 rounded-sm border px-4 py-2 text-sm no-underline transition-colors',
                          active
                            ? 'border-[#ff6b35]/30 bg-background text-foreground'
                            : 'border-transparent bg-transparent text-secondary hover:border-border hover:bg-background/70 hover:text-foreground'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="flex items-center gap-2 self-start lg:self-auto">
                  <Link href={createSignalHref} className="no-underline">
                    <Button size="sm" variant="secondary" className="gap-2">
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
            </div>
          </div>
        </header>

        <main className="page-gutter py-8">
          <div className="page-frame min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
