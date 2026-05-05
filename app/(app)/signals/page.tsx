import Link from 'next/link';
import { RiAddLine } from 'react-icons/ri';
import { SignalComplexityIndicator } from '@/components/app/SignalComplexityIndicator';
import { SignalRow } from '@/components/app/SignalRow';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { requestIruka, IrukaRequestError } from '@/lib/iruka/user-server';
import { getTelegramLinkStatus } from '@/lib/telegram/link-state';
import { buildTemplateEntryPath } from '@/lib/telegram/setup-flow';
import type { SignalPlanLimits, SignalRecord } from '@/lib/types/signal';

const byUpdatedAtDesc = (left: SignalRecord, right: SignalRecord) =>
  new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();

export default async function SignalsPage() {
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
  const hasSignals = orderedSignals.length > 0;
  const telegramStatus = user
    ? await getTelegramLinkStatus()
    : { linked: false, linkedAt: null, appUserId: null, telegramUsername: null };
  const createSignalHref = buildTemplateEntryPath(telegramStatus.linked);
  const createSignalLabel = hasSignals
    ? telegramStatus.linked
      ? 'Add new signal'
      : 'Set up Telegram'
    : telegramStatus.linked
      ? 'Create first signal'
      : 'Set up Telegram';
  const description = hasSignals
    ? telegramStatus.linked
      ? 'Review the signals already running and add another watch when needed.'
      : 'Review what is already live. Telegram setup still gates managed template creation.'
    : telegramStatus.linked
      ? 'You do not have any signals yet. Create one and this page becomes the inventory.'
      : 'Connect Telegram first, then return here to start your first signal template.';

  return (
    <div className="space-y-6">
      <section className="ui-hero px-6 py-7 sm:px-8 sm:py-8">
        <div className="relative z-10 max-w-3xl">
          <div className="ui-kicker">Signals</div>
          <h1 className="ui-page-title mt-4">Signal workspace</h1>
          <p className="ui-copy mt-4">{description}</p>
        </div>

        <div className="relative z-10 mt-7 flex flex-wrap gap-3">
          <span className="ui-chip" data-tone="accent">
            {orderedSignals.length} active definitions
          </span>
          <span className="ui-chip" data-tone={telegramStatus.linked ? 'success' : 'telegram'}>
            {telegramStatus.linked ? 'Managed delivery ready' : 'Managed delivery unavailable'}
          </span>
        </div>

        <div className="relative z-10 mt-7">
          <Link href={createSignalHref} className="no-underline">
            <Button size="lg" className="gap-2">
              <RiAddLine className="h-5 w-5" />
              {createSignalLabel}
            </Button>
          </Link>
        </div>

        <div className="relative z-10 mt-6">
          <SignalComplexityIndicator limits={signalLimits} />
        </div>
      </section>

      {signalsError ? (
        <Card>
          <div className="ui-notice" data-tone="danger">
            <p className="text-foreground">Signal inventory is unavailable.</p>
            <p className="mt-2 text-sm">{signalsError.message}</p>
          </div>
        </Card>
      ) : hasSignals ? (
        <Card className="space-y-5">
          <div>
            <div className="ui-kicker">Inventory</div>
            <h2 className="mt-4 font-display text-[1.9rem] leading-none text-foreground">Registered signals</h2>
          </div>
          <div className="divide-y divide-border/70">
            {orderedSignals.map((signal) => (
              <SignalRow key={signal.id} signal={signal} />
            ))}
          </div>
        </Card>
      ) : (
        <Card className="text-center">
          <div className="mx-auto max-w-2xl">
            <div className="ui-kicker justify-center">Empty Inventory</div>
            <h2 className="mt-4 font-display text-[2rem] leading-none text-foreground">
              {telegramStatus.linked ? 'No signals yet' : 'Telegram required first'}
            </h2>
            <p className="ui-copy mx-auto mt-4">
              {telegramStatus.linked
                ? 'Create a signal first. The builder owns template choice and configuration so this page can stay focused on inventory and review.'
                : 'Connect Telegram once, then return here to choose a template and create the first managed signal.'}
            </p>
          </div>
          <div className="mt-7">
            <Link href={createSignalHref} className="no-underline">
              <Button>{telegramStatus.linked ? 'Create first signal' : 'Set up Telegram'}</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
