import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SignalDeleteButton } from '@/components/app/SignalDeleteButton';
import { SignalDslPanel } from '@/components/app/SignalDslPanel';
import { Button } from '@/components/ui/Button';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { requestSentinel, SentinelRequestError } from '@/lib/sentinel/user-server';
import { getTelegramLinkStatus } from '@/lib/telegram/link-state';
import { buildTemplateEntryPath } from '@/lib/telegram/setup-flow';
import type {
  SignalConditionExplanation,
  SignalHistoryResponse,
  SignalNotificationLogEntry,
  SignalRecord,
  SignalRunLogEntry,
  SignalScope,
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

const formatScopeSummary = (scope?: SignalScope) => {
  if (!scope) {
    return null;
  }

  const parts: string[] = [];

  if (scope.protocol) {
    parts.push(scope.protocol.toUpperCase());
  }

  if (scope.chains.length > 0) {
    parts.push(`Chains ${scope.chains.join(', ')}`);
  }

  if (scope.markets?.length) {
    parts.push(`${scope.markets.length} market${scope.markets.length === 1 ? '' : 's'}`);
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

const ExplanationSection = ({
  title,
  items,
}: {
  title: string;
  items: SignalConditionExplanation[];
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 border-t border-border/70 pt-3">
      <p className="text-[11px] uppercase tracking-[0.25em] text-secondary">{title}</p>
      <div className="mt-2 space-y-2">
        {items.slice(0, 3).map((item, index) => (
          <p key={`${item.conditionIndex}-${index}`} className="text-xs text-secondary">
            {formatConditionSummary(item)}
          </p>
        ))}
      </div>
    </div>
  );
};

const renderEvaluationLabel = (evaluation: SignalRunLogEntry) => {
  if (evaluation.triggered) {
    return 'Triggered';
  }

  if (!evaluation.conclusive) {
    return 'Inconclusive';
  }

  if (evaluation.in_cooldown) {
    return 'Cooldown';
  }

  return 'Checked';
};

const renderNotificationLabel = (notification: SignalNotificationLogEntry) => {
  if (typeof notification.webhook_status === 'number' && notification.webhook_status < 400) {
    return 'Delivered';
  }

  if (typeof notification.webhook_status === 'number') {
    return `Failed (${notification.webhook_status})`;
  }

  return 'Pending';
};

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
      requestSentinel<SignalRecord>(`/signals/${id}`),
      requestSentinel<SignalHistoryResponse>(`/signals/${id}/history?include_notifications=true`),
    ]);
  } catch (error) {
    if (error instanceof SentinelRequestError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  const telegramStatus = await getTelegramLinkStatus();
  const createSignalHref = buildTemplateEntryPath(telegramStatus.linked);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <Link href="/signals" className="text-xs uppercase tracking-[0.3em] text-secondary no-underline transition-colors hover:text-foreground">
            Signals
          </Link>
          <h1 className="font-zen text-3xl sm:text-4xl">{signal.name}</h1>
          <p className="text-secondary mt-2 max-w-3xl">Review the raw DSL, recent evaluation explanations, and delivery attempts for this signal.</p>
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

      <SignalDslPanel signal={signal} title="Signal DSL structure" />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
        <div className="rounded-md border border-border bg-surface p-6">
          <h2 className="mb-4 font-zen text-xl">Recent evaluations</h2>
          {history.evaluations.length > 0 ? (
            <div className="space-y-3">
              {history.evaluations.slice(0, 8).map((evaluation) => (
                <div key={evaluation.id} className="rounded-sm border border-border/80 bg-background/40 p-4">
                  {(() => {
                    const evaluationDetails = [getEvaluationLogic(evaluation), formatScopeSummary(getEvaluationScope(evaluation))]
                      .filter(Boolean)
                      .join(' · ');
                    const matchedConditions = getEvaluationConditionsMet(evaluation);
                    const conditionResults = getEvaluationConditionResults(evaluation);

                    return (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <p className="text-sm">{renderEvaluationLabel(evaluation)}</p>
                            <p className="text-xs text-secondary">{formatTimestamp(evaluation.evaluated_at)}</p>
                          </div>
                          <div className="text-xs text-secondary">
                            {evaluation.notification_attempted
                              ? `Notify ${evaluation.notification_success ? 'ok' : 'attempted'}`
                              : 'No notification'}
                          </div>
                        </div>
                        {evaluationDetails ? <p className="mt-3 text-xs text-secondary">{evaluationDetails}</p> : null}
                        {evaluation.error_message ? <p className="text-xs text-red-400 mt-3">{evaluation.error_message}</p> : null}
                        <ExplanationSection title="Matched conditions" items={matchedConditions} />
                        <ExplanationSection title="Condition results" items={conditionResults} />
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary text-sm">No evaluation history yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-md border border-border bg-surface p-6">
        <h2 className="mb-4 font-zen text-xl">Recent notifications</h2>
        {history.notifications.length > 0 ? (
          <div className="space-y-3">
            {history.notifications.slice(0, 8).map((notification) => (
              <div key={notification.id} className="rounded-sm border border-border/80 bg-background/40 p-4">
                {(() => {
                  const matchedConditions = getNotificationConditionsMet(notification);

                  return (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="text-sm">{renderNotificationLabel(notification)}</p>
                          <p className="text-xs text-secondary">{formatTimestamp(notification.triggered_at)}</p>
                        </div>
                        <div className="text-xs text-secondary">Retry count {notification.retry_count}</div>
                      </div>
                      {notification.error_message ? <p className="text-xs text-red-400 mt-3">{notification.error_message}</p> : null}
                      <ExplanationSection title="Delivered conditions" items={matchedConditions} />
                    </>
                  );
                })()}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-secondary text-sm">No notification deliveries recorded yet.</p>
        )}
      </div>
    </div>
  );
}
