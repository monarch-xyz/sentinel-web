import Link from 'next/link';
import { RiArrowRightLine, RiWallet3Line } from 'react-icons/ri';
import { SignalRow } from '@/components/app/SignalRow';
import { TelegramSetupGuide } from '@/components/app/TelegramSetupGuide';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getAuthenticatedUser, getWalletAddressFromUser } from '@/lib/auth/session';
import { requestSentinelForUser } from '@/lib/sentinel/user-server';
import type { SignalRecord } from '@/lib/types/signal';

const byUpdatedAtDesc = (left: SignalRecord, right: SignalRecord) =>
  new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();

export default async function AppHome() {
  const user = await getAuthenticatedUser();
  let signals: SignalRecord[] = [];
  let signalsError: string | null = null;

  if (user) {
    try {
      signals = await requestSentinelForUser<SignalRecord[]>(user, '/signals');
    } catch (error) {
      signalsError = error instanceof Error ? error.message : 'Unable to load signals.';
    }
  }

  const orderedSignals = [...signals].sort(byUpdatedAtDesc);
  const walletAddress = user ? getWalletAddressFromUser(user) : null;
  const recentSignals = orderedSignals.slice(0, 5);
  const hasSignals = orderedSignals.length > 0;
  const primaryAction = hasSignals
    ? {
        href: '/signals',
        label: 'Open signal workspace',
        description: 'Signals are the operating surface. Review live definitions, inspect DSL output, or add another signal from there.',
      }
    : {
        href: '/signals/new',
        label: 'Create your first signal',
        description: 'Start with a template, update the market and wallets, then let Sentinel register the JSON definition for you.',
      };

  return (
    <div className="space-y-6">
      <section className="rounded-[16px] border border-border bg-surface p-6 sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-secondary">Workspace</p>
          <h1 className="mt-3 font-zen text-3xl sm:text-4xl">{hasSignals ? 'Signal workspace' : 'Start with a signal'}</h1>
          <p className="mt-3 text-secondary">
            {hasSignals
              ? 'Use the signal workspace to review and manage what is already live.'
              : 'Start by creating your first signal. Telegram and other setup steps can wait until after that.'}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href={primaryAction.href} className="no-underline">
              <Button size="md" className="gap-2">
                {primaryAction.label}
                <RiArrowRightLine className="h-4 w-4" />
              </Button>
            </Link>
            {hasSignals ? (
              <Link
                href="/signals/new"
                className="inline-flex items-center gap-2 text-sm text-secondary transition-colors hover:text-foreground no-underline"
              >
                Create another signal
                <RiArrowRightLine className="h-4 w-4" />
              </Link>
            ) : null}
            <TelegramSetupGuide triggerLabel="Telegram setup guide" />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm text-secondary">
          {walletAddress ? (
            <div className="inline-flex items-center gap-2 rounded-sm border border-border bg-background/70 px-3 py-1.5">
              <RiWallet3Line className="h-4 w-4 text-[#ff6b35]" />
              <span className="font-mono text-foreground">{walletAddress}</span>
            </div>
          ) : null}
          <div className="inline-flex items-center gap-2 rounded-sm border border-border bg-background/70 px-3 py-1.5">
            <span>{orderedSignals.length}</span>
            <span>signal{orderedSignals.length === 1 ? '' : 's'} registered</span>
          </div>
        </div>
      </section>

      {signalsError ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <p className="font-medium text-foreground">The overview loaded, but Sentinel signal data is unavailable.</p>
          <p className="mt-2 text-sm text-secondary">{signalsError}</p>
        </Card>
      ) : null}

      {!signalsError && hasSignals ? (
        <Card className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-secondary">Recent Signals</p>
              <h2 className="mt-2 font-zen text-2xl">Current inventory</h2>
            </div>
            <Link href="/signals" className="text-sm text-secondary no-underline transition-colors hover:text-foreground">
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
        <Card className="rounded-[28px] border-dashed text-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-secondary">Getting Started</p>
            <h2 className="mt-2 font-zen text-2xl">No signals yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-secondary">
              Start with the signal builder. Template selection and configuration happen there, not on the dashboard.
            </p>
          </div>
          <div className="mt-6">
            <Link href="/signals/new" className="no-underline">
              <Button>Create first signal</Button>
            </Link>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
