import Link from 'next/link';
import { SignalRowMenu } from '@/components/app/SignalRowMenu';
import { describeSignalDefinition, getPrimaryScheduleSummary, getSignalScopeSummary } from '@/lib/signals/templates';
import { SignalRecord } from '@/lib/types/signal';

interface SignalRowProps {
  signal: SignalRecord;
}

export function SignalRow({ signal }: SignalRowProps) {
  const summary = describeSignalDefinition(signal.definition);
  const scopeSummary = getSignalScopeSummary(signal.definition);
  const scheduleSummary = getPrimaryScheduleSummary(signal.triggers);
  const updatedAt = new Date(signal.updated_at).toLocaleString();
  const lastTriggeredAt = signal.last_triggered_at ? new Date(signal.last_triggered_at).toLocaleString() : '—';

  return (
    <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-[minmax(0,2fr)_0.8fr_0.95fr_0.95fr_auto] sm:items-start">
      <div className="min-w-0">
        <Link
          href={`/signals/${signal.id}`}
          className="font-display text-[1.3rem] leading-none text-foreground transition-colors hover:text-[color:var(--signal-ember)] no-underline"
        >
          {signal.name}
        </Link>
        <p className="mt-2 text-sm leading-relaxed text-secondary">{summary}</p>
        <p className="mt-2 text-xs text-secondary">{scopeSummary}</p>
        <p className="mt-1 text-xs text-secondary">{scheduleSummary}</p>
      </div>
      <div>
        <p className="ui-stat-label">Status</p>
        <span className="mt-2 inline-flex">
          <span className="ui-chip" data-tone={signal.is_active ? 'accent' : undefined}>
            {signal.is_active ? 'Active' : 'Paused'}
          </span>
        </span>
      </div>
      <div>
        <p className="ui-stat-label">Last Trigger</p>
        <p className="mt-2 text-sm text-secondary">{lastTriggeredAt}</p>
      </div>
      <div>
        <p className="ui-stat-label">Updated</p>
        <p className="mt-2 text-sm text-secondary">{updatedAt}</p>
      </div>
      <div className="sm:justify-self-end">
        <SignalRowMenu signalId={signal.id} signalName={signal.name} />
      </div>
    </div>
  );
}
