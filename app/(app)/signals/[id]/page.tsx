import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SignalDslPanel } from '@/components/app/SignalDslPanel';
import { Button } from '@/components/ui/Button';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { requestSentinelForUser, SentinelRequestError } from '@/lib/sentinel/user-server';
import type { SignalHistoryResponse, SignalNotificationLogEntry, SignalRecord, SignalRunLogEntry } from '@/lib/types/signal';

interface SignalDetailPageProps {
  params: Promise<{ id: string }> | { id: string };
}

const formatTimestamp = (value?: string | null) => {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString();
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
      requestSentinelForUser<SignalRecord>(user, `/signals/${id}`),
      requestSentinelForUser<SignalHistoryResponse>(user, `/signals/${id}/history?include_notifications=true`),
    ]);
  } catch (error) {
    if (error instanceof SentinelRequestError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <Link href="/signals" className="text-xs uppercase tracking-[0.3em] text-secondary no-underline transition-colors hover:text-foreground">
            Signals
          </Link>
          <h1 className="font-zen text-3xl sm:text-4xl">{signal.name}</h1>
          <p className="text-secondary mt-2 max-w-3xl">Review the raw DSL, the recent evaluation history, and delivery attempts for this signal.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/signals" className="no-underline">
            <Button variant="secondary">Back to inventory</Button>
          </Link>
          <Link href="/signals/new" className="no-underline">
            <Button>Create another</Button>
          </Link>
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
                  {evaluation.error_message && <p className="text-xs text-red-400 mt-3">{evaluation.error_message}</p>}
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-sm">{renderNotificationLabel(notification)}</p>
                    <p className="text-xs text-secondary">{formatTimestamp(notification.triggered_at)}</p>
                  </div>
                  <div className="text-xs text-secondary">Retry count {notification.retry_count}</div>
                </div>
                {notification.error_message && <p className="text-xs text-red-400 mt-3">{notification.error_message}</p>}
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
