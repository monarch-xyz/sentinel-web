import Link from 'next/link';
import { SignalRowMenu } from '@/components/app/SignalRowMenu';
import { describeSignalDefinition, getPrimaryScheduleSummary, getSignalTargetingSummary } from '@/lib/signals/templates';
import { SignalRecord } from '@/lib/types/signal';

interface SignalRowProps {
  signal: SignalRecord;
}

export function SignalRow({ signal }: SignalRowProps) {
  const summary = describeSignalDefinition(signal.definition);
  const targetingSummary = getSignalTargetingSummary(signal.definition);
  const scheduleSummary = getPrimaryScheduleSummary(signal.triggers);
  const updatedAt = new Date(signal.updated_at).toLocaleString();
  const lastFiredAt = signal.last_fired_at ? new Date(signal.last_fired_at).toLocaleString() : '—';
  const complexityScore = typeof signal.complexity_score === 'number' ? signal.complexity_score : null;

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
        <p className="mt-2 text-xs text-secondary">{targetingSummary}</p>
        <p className="mt-1 text-xs text-secondary">{scheduleSummary}</p>
        {complexityScore !== null ? <p className="mt-1 text-xs text-secondary">{complexityScore} credit units</p> : null}
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
        <p className="mt-2 text-sm text-secondary">{lastFiredAt}</p>
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
