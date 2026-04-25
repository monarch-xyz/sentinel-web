import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SignalDeleteButton } from '@/components/app/SignalDeleteButton';
import { SignalDslPanel } from '@/components/app/SignalDslPanel';
import { Button } from '@/components/ui/Button';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { requestIruka, IrukaRequestError } from '@/lib/iruka/user-server';
import { getTelegramLinkStatus } from '@/lib/telegram/link-state';
import { buildTemplateEntryPath } from '@/lib/telegram/setup-flow';
import type {
  ExecutionScope,
  SignalConditionExplanation,
  SignalHistoryResponse,
  SignalNotificationLogEntry,
  SignalRecord,
  SignalRunLogEntry,
} from '@/lib/types/signal';

interface SignalDetailPageProps {
  params: Promise<{ id: string }> | { id: string };
}

const formatTimestamp = (value?: string | null) => {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString();
};

const getEvaluationLogic = (evaluation: SignalRunLogEntry) => evaluation.logic ?? evaluation.metadata?.logic;
const getEvaluationScope = (evaluation: SignalRunLogEntry) => evaluation.scope ?? evaluation.metadata?.scope;
const getEvaluationConditionResults = (evaluation: SignalRunLogEntry) =>
  evaluation.condition_results ?? evaluation.metadata?.condition_results ?? [];
const getEvaluationConditionsMet = (evaluation: SignalRunLogEntry) =>
  evaluation.conditions_met ?? evaluation.metadata?.conditions_met ?? [];
const getNotificationConditionsMet = (notification: SignalNotificationLogEntry) =>
  notification.conditions_met ?? notification.payload.conditions_met ?? [];

const formatScopeSummary = (scope?: ExecutionScope) => {
  if (!scope) {
    return null;
  }

  const parts: string[] = [];

  if (scope.chains.length > 0) {
    parts.push(`Chains ${scope.chains.join(', ')}`);
  }

  if (scope.entities?.length) {
    parts.push(`${scope.entities.length} entit${scope.entities.length === 1 ? 'y' : 'ies'}`);
  }

  if (scope.addresses?.length) {
    parts.push(`${scope.addresses.length} address${scope.addresses.length === 1 ? '' : 'es'}`);
  }

  return parts.join(' · ');
};

const formatConditionSummary = (condition: SignalConditionExplanation) => {
  const matchedCount = condition.matchedAddresses?.length ?? 0;
  if (matchedCount < 1) {
    return condition.summary;
  }

  return `${condition.summary} · ${matchedCount} matched address${matchedCount === 1 ? '' : 'es'}`;
};

const renderEvaluationLabel = (evaluation: SignalRunLogEntry) => {
  if (evaluation.triggered) {
    return { label: 'Triggered', tone: 'accent' as const };
  }

  if (!evaluation.conclusive) {
    return { label: 'Inconclusive', tone: undefined };
  }

  if (evaluation.in_cooldown) {
    return { label: 'Cooldown', tone: 'telegram' as const };
  }

  return { label: 'Checked', tone: undefined };
};

const renderNotificationLabel = (notification: SignalNotificationLogEntry) => {
  if (typeof notification.webhook_status === 'number' && notification.webhook_status < 400) {
    return { label: 'Sent', tone: 'success' as const };
  }

  if (typeof notification.webhook_status === 'number') {
    return { label: `Failed (${notification.webhook_status})`, tone: 'danger' as const };
  }

  return { label: 'Pending', tone: undefined };
};

function ExplanationSection({
  title,
  items,
}: {
  title: string;
  items: SignalConditionExplanation[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      <p className="ui-stat-label">{title}</p>
      <div className="mt-3 space-y-2">
        {items.slice(0, 3).map((item, index) => (
          <div key={`${item.conditionIndex}-${index}`} className="ui-panel-ghost px-3 py-2.5">
            <p className="text-xs leading-relaxed text-secondary">{formatConditionSummary(item)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function SignalDetailPage({ params }: SignalDetailPageProps) {
  const { id } = await params;
  const user = await getAuthenticatedUser();

  if (!user) {
    notFound();
  }

  let signal: SignalRecord;
  let history: SignalHistoryResponse;

  try {
    [signal, history] = await Promise.all([
      requestIruka<SignalRecord>(`/signals/${id}`),
      requestIruka<SignalHistoryResponse>(`/signals/${id}/history?include_notifications=true`),
    ]);
  } catch (error) {
    if (error instanceof IrukaRequestError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  const telegramStatus = await getTelegramLinkStatus();
  const createSignalHref = buildTemplateEntryPath(telegramStatus.linked);

  return (
    <div className="space-y-6">
      <section className="ui-hero px-6 py-7 sm:px-8 sm:py-8">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <Link href="/signals" className="ui-link text-xs uppercase tracking-[0.28em] no-underline">
              Signals
            </Link>
            <h1 className="ui-page-title mt-4">{signal.name}</h1>
            <p className="ui-copy mt-4">
              Review the raw DSL, recent evaluation explanations, and delivery attempts for this signal.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/signals" className="no-underline">
              <Button variant="secondary">Back to inventory</Button>
            </Link>
            <Link href={createSignalHref} className="no-underline">
              <Button>{telegramStatus.linked ? 'Create another' : 'Set up Telegram'}</Button>
            </Link>
            <SignalDeleteButton signalId={signal.id} signalName={signal.name} redirectTo="/signals" />
          </div>
        </div>
      </section>

      <SignalDslPanel signal={signal} title="Signal definition" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <CardSection
          title="Recent evaluations"
          items={history.evaluations}
          renderItem={(evaluation) => {
            const evaluationDetails = [getEvaluationLogic(evaluation), formatScopeSummary(getEvaluationScope(evaluation))]
              .filter(Boolean)
              .join(' · ');
            const matchedConditions = getEvaluationConditionsMet(evaluation);
            const conditionResults = getEvaluationConditionResults(evaluation);
            const label = renderEvaluationLabel(evaluation);

            return (
              <div className="ui-panel-ghost p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="ui-chip" data-tone={label.tone}>
                      {label.label}
                    </span>
                    <p className="mt-3 text-xs text-secondary">{formatTimestamp(evaluation.evaluated_at)}</p>
                  </div>
                  <div className="text-xs text-secondary">
                    {evaluation.notification_attempted
                      ? `Notify ${evaluation.notification_success ? 'ok' : 'attempted'}`
                      : 'No notification'}
                  </div>
                </div>

                {evaluationDetails ? <p className="mt-4 text-xs leading-relaxed text-secondary">{evaluationDetails}</p> : null}
                {evaluation.error_message ? (
                  <div className="ui-notice mt-4 text-sm" data-tone="danger">
                    {evaluation.error_message}
                  </div>
                ) : null}

                <ExplanationSection title="Matched conditions" items={matchedConditions} />
                <ExplanationSection title="Condition results" items={conditionResults} />
              </div>
            );
          }}
          empty="No evaluation history yet."
        />

        <CardSection
          title="Recent notifications"
          items={history.notifications}
          initialCount={3}
          renderItem={(notification) => {
            const matchedConditions = getNotificationConditionsMet(notification);
            const label = renderNotificationLabel(notification);
            const statusDetail =
              typeof notification.webhook_status === 'number'
                ? `HTTP ${notification.webhook_status}`
                : 'Waiting for result';

            return (
              <div className="ui-panel-ghost p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <span className="ui-chip" data-tone={label.tone}>
                      {label.label}
                    </span>
                    <p className="mt-3 text-xs text-secondary">{formatTimestamp(notification.triggered_at)}</p>
                  </div>
                  <div className="text-xs text-secondary sm:text-right">
                    <p>{statusDetail}</p>
                    <p className="mt-1">{notification.retry_count > 0 ? `${notification.retry_count} retries` : 'No retries'}</p>
                  </div>
                </div>

                {(notification.error_message || matchedConditions.length > 0) ? (
                  <details className="mt-4 border-t border-border pt-4">
                    <summary className="cursor-pointer text-xs text-secondary transition-colors hover:text-foreground">
                      Details
                    </summary>
                    {notification.error_message ? (
                      <div className="ui-notice mt-3 text-sm" data-tone="danger">
                        {notification.error_message}
                      </div>
                    ) : null}
                    <ExplanationSection title="Delivered conditions" items={matchedConditions} />
                  </details>
                ) : null}
              </div>
            );
          }}
          empty="No notification deliveries recorded yet."
        />
      </div>
    </div>
  );
}

function CardSection<T>({
  title,
  items,
  renderItem,
  empty,
  initialCount = 5,
}: {
  title: string;
  items: T[];
  renderItem: (item: T) => ReactNode;
  empty: string;
  initialCount?: number;
}) {
  const visibleItems = items.slice(0, initialCount);
  const hiddenItems = items.slice(initialCount);

  return (
    <div className="ui-panel p-6">
      <div className="ui-kicker">{title}</div>
      <h2 className="mt-4 font-display text-[1.7rem] leading-none text-foreground">{title}</h2>

      {items.length > 0 ? (
        <div className="mt-5 space-y-3">
          {visibleItems.map(renderItem)}
          {hiddenItems.length > 0 ? (
            <details className="group">
              <summary className="ui-button mt-3 inline-flex cursor-pointer px-3 py-2 text-xs" data-variant="secondary">
                Show {hiddenItems.length} more
              </summary>
              <div className="space-y-3">{hiddenItems.map(renderItem)}</div>
            </details>
          ) : null}
        </div>
      ) : (
        <p className="mt-5 text-sm text-secondary">{empty}</p>
      )}
    </div>
  );
}
