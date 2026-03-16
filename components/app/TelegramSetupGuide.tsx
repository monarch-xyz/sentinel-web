'use client';

import Link from 'next/link';
import { useEffect, useId, useState } from 'react';
import { RiCloseLine, RiExternalLinkLine, RiQuestionLine, RiTelegram2Line } from 'react-icons/ri';
import { Button } from '@/components/ui/Button';

interface TelegramSetupGuideProps {
  triggerLabel?: string;
  triggerVariant?: 'primary' | 'secondary' | 'ghost';
  triggerSize?: 'sm' | 'md' | 'lg';
  className?: string;
}

const guideSteps = [
  {
    title: 'Run delivery with a bot token',
    body: 'Start Sentinel delivery with a valid Telegram bot token configured so the bot can issue short-lived link tokens.',
  },
  {
    title: 'Start the bot chat',
    body: 'Send /start to the bot in Telegram. The bot returns the link token that identifies the chat for this delivery flow.',
  },
  {
    title: 'Paste the token into Sentinel',
    body: 'Open the Telegram workspace in this app, submit the token, and Sentinel maps your current user to that Telegram chat.',
  },
];

const docsLinks = [
  {
    href: 'https://github.com/monarch-xyz/sentinel/blob/main/docs/TELEGRAM_DELIVERY.md',
    label: 'Telegram delivery docs',
  },
  {
    href: 'https://github.com/monarch-xyz/sentinel/blob/main/packages/delivery/README.md',
    label: 'Delivery service setup',
  },
];

export function TelegramSetupGuide({
  triggerLabel = 'Telegram setup guide',
  triggerVariant = 'ghost',
  triggerSize = 'sm',
  className,
}: TelegramSetupGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <Button type="button" variant={triggerVariant} size={triggerSize} className={className} onClick={() => setIsOpen(true)}>
        <RiQuestionLine className="h-4 w-4" />
        {triggerLabel}
      </Button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-2xl rounded-[16px] border border-border bg-background shadow-2xl shadow-slate-950/20"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border/80 px-6 py-5 sm:px-7">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.3em] text-secondary">Telegram delivery</p>
                <h2 id={titleId} className="mt-2 font-zen text-2xl text-foreground">
                  Link chat delivery only when you need it
                </h2>
                <p className="mt-2 max-w-xl text-sm text-secondary">
                  The main workflow is still signal creation. Telegram is a secondary delivery step, so this guide stays out
                  of the dashboard until you ask for it.
                </p>
              </div>

              <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={() => setIsOpen(false)}>
                <RiCloseLine className="h-4 w-4" />
                Close
              </Button>
            </div>

            <div className="space-y-6 px-6 py-6 sm:px-7">
              <div className="grid gap-3">
                {guideSteps.map((step, index) => (
                  <div key={step.title} className="flex gap-4 rounded-md border border-border/80 bg-surface p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[#229ED9]/10 text-sm text-[#229ED9]">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-foreground">{step.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-secondary">{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-md border border-border/80 bg-surface p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#229ED9]/10 text-[#229ED9]">
                    <RiTelegram2Line className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-foreground">What happens after linking</p>
                    <p className="mt-1 text-sm leading-relaxed text-secondary">
                      New and existing signals can then deliver through the Telegram adapter flow expected by Sentinel&apos;s
                      delivery service.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-border/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-4 text-sm">
                  {docsLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-secondary transition-colors hover:text-foreground no-underline"
                    >
                      {link.label}
                      <RiExternalLinkLine className="h-4 w-4" />
                    </Link>
                  ))}
                </div>

                <Link href="/telegram" className="no-underline">
                  <Button type="button" className="gap-2" onClick={() => setIsOpen(false)}>
                    Open Telegram workspace
                    <RiTelegram2Line className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
