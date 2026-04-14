import { Card } from '@/components/ui/Card';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { describeSignalRepeatPolicy } from '@/lib/signals/repeat-policy';
import { cn } from '@/lib/utils';
import {
  describeSignalDefinition,
  getSignalFocusDetails,
  getSignalTrackingSummary,
} from '@/lib/signals/templates';
import type { SignalRecord } from '@/lib/types/signal';

interface SignalDslPanelProps {
  signal: SignalRecord;
  eyebrow?: string;
  title?: string;
  description?: string;
  compact?: boolean;
  className?: string;
  showTimestamps?: boolean;
}

const formatTimestamp = (value?: string | null) => {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString();
};

export function SignalDslPanel({
  signal,
  eyebrow = 'DSL Structure',
  title = 'Signal definition',
  description,
  compact = false,
  className,
  showTimestamps = true,
}: SignalDslPanelProps) {
  const summary = describeSignalDefinition(signal.definition);
  const conditionCount = signal.definition.conditions.length;
  const logic = signal.definition.logic ?? 'AND';
  const protocol = signal.definition.scope.protocol ?? 'all';
  const chainList = signal.definition.scope.chains.join(', ');
  const focus = getSignalFocusDetails(signal.definition);
  const trackingSummary = getSignalTrackingSummary(signal.definition);
  const repeatPolicySummary = describeSignalRepeatPolicy(signal.repeat_policy, signal.cooldown_minutes);

  return (
    <Card className={cn('space-y-5', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-secondary">{eyebrow}</p>
          <h2 className="mt-2 font-zen text-2xl">{title}</h2>
          <p className="mt-2 text-sm text-secondary">{(description ?? signal.description) || summary}</p>
        </div>
        <div className="inline-flex h-fit items-center rounded-sm border border-border bg-background/70 px-3 py-1 text-xs uppercase tracking-[0.25em] text-secondary">
          {signal.is_active ? 'Active' : 'Paused'}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-md border border-border/80 bg-background/50 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-secondary">Scope</p>
          <p className="mt-2 text-sm text-foreground">{protocol.toUpperCase()}</p>
          <p className="mt-1 text-xs text-secondary">Chains {chainList || '—'}</p>
        </div>
        <div className="rounded-md border border-border/80 bg-background/50 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-secondary">{focus.label}</p>
          <p className="mt-2 break-all font-mono text-xs text-foreground">{focus.value}</p>
          {focus.href ? (
            <a
              href={focus.href}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-xs text-foreground no-underline transition-colors hover:text-[#ff6b35]"
            >
              Open monitored market
            </a>
          ) : focus.hint ? (
            <p className="mt-3 text-xs text-secondary">{focus.hint}</p>
          ) : null}
        </div>
        <div className="rounded-md border border-border/80 bg-background/50 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-secondary">Trigger Logic</p>
          <p className="mt-2 text-sm text-foreground">{logic}</p>
          <p className="mt-1 text-xs text-secondary">{conditionCount} top-level conditions</p>
        </div>
        <div className="rounded-md border border-border/80 bg-background/50 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-secondary">Tracking</p>
          <p className="mt-2 text-sm text-foreground">{trackingSummary}</p>
          <p className="mt-1 text-xs text-secondary">
            Window {signal.definition.window.duration} · {repeatPolicySummary}
          </p>
        </div>
      </div>

      {showTimestamps ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-border/80 bg-background/50 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-secondary">Created</p>
            <p className="mt-2 text-sm text-foreground">{formatTimestamp(signal.created_at)}</p>
          </div>
          <div className="rounded-md border border-border/80 bg-background/50 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-secondary">Updated</p>
            <p className="mt-2 text-sm text-foreground">{formatTimestamp(signal.updated_at)}</p>
          </div>
          <div className="rounded-md border border-border/80 bg-background/50 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-secondary">Last Trigger</p>
            <p className="mt-2 text-sm text-foreground">{formatTimestamp(signal.last_triggered_at)}</p>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-foreground">Raw DSL</p>
          <span className="text-xs text-secondary">JSON definition sent to Sentinel</span>
        </div>
        <div className={cn(compact ? 'max-h-[360px] overflow-auto' : '')}>
          <CodeBlock
            code={JSON.stringify(signal.definition, null, 2)}
            language="json"
            tone="light"
            showHeader={false}
            className="rounded-md"
          />
        </div>
      </div>
    </Card>
  );
}
