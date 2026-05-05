import Link from 'next/link';
import { RiArrowRightLine, RiWallet3Line } from 'react-icons/ri';
import { SignalComplexityIndicator } from '@/components/app/SignalComplexityIndicator';
import { SignalRow } from '@/components/app/SignalRow';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getAuthenticatedUser, getWalletAddressFromUser } from '@/lib/auth/session';
import { requestIruka, IrukaRequestError } from '@/lib/iruka/user-server';
import { getTelegramLinkStatus } from '@/lib/telegram/link-state';
import { buildTemplateEntryPath } from '@/lib/telegram/setup-flow';
import type { SignalPlanLimits, SignalRecord } from '@/lib/types/signal';

const byUpdatedAtDesc = (left: SignalRecord, right: SignalRecord) =>
  new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();

export default async function AppHome() {
  const user = await getAuthenticatedUser();
  let signals: SignalRecord[] = [];
  let signalLimits: SignalPlanLimits | null = null;
  let signalsError: { message: string; status?: number } | null = null;

  if (user) {
    try {
      [signals, signalLimits] = await Promise.all([
        requestIruka<SignalRecord[]>('/signals'),
        requestIruka<SignalPlanLimits>('/me/limits'),
      ]);
    } catch (error) {
      signalsError =
        error instanceof IrukaRequestError
          ? { message: error.message, status: error.status }
          : { message: error instanceof Error ? error.message : 'Unable to load signals.' };
    }
  }

  const orderedSignals = [...signals].sort(byUpdatedAtDesc);
  const walletAddress = user ? getWalletAddressFromUser(user) : null;
  const recentSignals = orderedSignals.slice(0, 5);
  const hasSignals = orderedSignals.length > 0;
  const telegramStatus = user
    ? await getTelegramLinkStatus()
    : { linked: false, linkedAt: null, appUserId: null, telegramUsername: null };
  const createSignalHref = buildTemplateEntryPath(telegramStatus.linked);
  const primaryAction = hasSignals
    ? {
        href: '/signals',
        label: 'Open signal workspace',
        description: 'Review live definitions, inspect current signal logic, or add another watch.',
      }
    : telegramStatus.linked
      ? {
          href: createSignalHref,
          label: 'Create your first signal',
          description: 'Start from a template, tune the inputs, and let Iruka register the final JSON.',
        }
      : {
          href: createSignalHref,
          label: 'Set up Telegram',
          description: 'Managed template delivery is routed through Telegram before the builder opens.',
        };
  const pageTitle = hasSignals ? 'Signal workspace' : telegramStatus.linked ? 'Start with a signal' : 'Telegram comes first';
  const pageDescription = hasSignals
    ? 'Iruka is already tracking active definitions for this account.'
    : telegramStatus.linked
      ? 'Telegram is ready. Start with one signal and this space becomes your operating surface.'
      : 'Connect Telegram once, then Iruka can attach managed template delivery to the signals you create.';

  return (
    <div className="space-y-6">
      <section className="ui-hero px-6 py-7 sm:px-8 sm:py-8">
        <div className="relative z-10 max-w-3xl">
          <div className="ui-kicker">Workspace</div>
          <h1 className="ui-page-title mt-4">{pageTitle}</h1>
          <p className="ui-copy mt-4">{pageDescription}</p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href={primaryAction.href} className="no-underline">
              <Button size="md" className="gap-2">
                {primaryAction.label}
                <RiArrowRightLine className="h-4 w-4" />
              </Button>
            </Link>
            {hasSignals ? (
              <Link href={createSignalHref} className="ui-link inline-flex items-center gap-2 text-sm no-underline">
                {telegramStatus.linked ? 'Create another signal' : 'Finish Telegram setup'}
                <RiArrowRightLine className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>

        <div className="relative z-10 mt-7 flex flex-wrap gap-3">
          {walletAddress ? (
            <span className="ui-chip">
              <RiWallet3Line className="h-4 w-4 text-[color:var(--signal-copper)]" />
              <span className="font-mono text-foreground">{walletAddress}</span>
            </span>
          ) : null}
          <span className="ui-chip" data-tone="accent">
            {orderedSignals.length} signal{orderedSignals.length === 1 ? '' : 's'} registered
          </span>
          <span className="ui-chip" data-tone={telegramStatus.linked ? 'success' : 'telegram'}>
            {telegramStatus.linked ? 'Telegram ready' : 'Telegram setup required'}
          </span>
        </div>
      </section>

      <SignalComplexityIndicator limits={signalLimits} />

      {signalsError ? (
        <Card>
          <div className="ui-notice" data-tone="danger">
            <p className="text-foreground">The workspace loaded, but Iruka signal data is unavailable.</p>
            <p className="mt-2 text-sm">{signalsError.message}</p>
          </div>
        </Card>
      ) : null}

      {!signalsError && hasSignals ? (
        <Card className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="ui-kicker">Recent Signals</div>
              <h2 className="mt-4 font-display text-[1.9rem] leading-none text-foreground">Current inventory</h2>
            </div>
            <Link href="/signals" className="ui-link text-sm no-underline">
              Open inventory
            </Link>
          </div>

          <div className="divide-y divide-border/70">
            {recentSignals.map((signal) => (
              <SignalRow key={signal.id} signal={signal} />
            ))}
          </div>
        </Card>
      ) : !signalsError ? (
        <Card className="text-center">
          <div className="mx-auto max-w-2xl">
            <div className="ui-kicker justify-center">Next Step</div>
            <h2 className="mt-4 font-display text-[2rem] leading-none text-foreground">
              {telegramStatus.linked ? 'No signals yet' : 'Connect Telegram first'}
            </h2>
            <p className="ui-copy mx-auto mt-4">
              {telegramStatus.linked
                ? 'Template selection and configuration live in the builder. Once you create the first signal, this dashboard becomes the operating surface.'
                : 'Connect Telegram once, then come back here to pick a template and define the first signal Iruka should watch.'}
            </p>
          </div>
          <div className="mt-7">
            <Link href={createSignalHref} className="no-underline">
              <Button>{telegramStatus.linked ? 'Create first signal' : 'Set up Telegram'}</Button>
            </Link>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
