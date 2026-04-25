import { Card } from '@/components/ui/Card';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { describeSignalRepeatPolicy } from '@/lib/signals/repeat-policy';
import { cn } from '@/lib/utils';
import {
  describeSignalDefinition,
  getPrimaryScheduleSummary,
  getSignalFocusDetails,
  getSignalPrimaryChainId,
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
  const primaryChainId = getSignalPrimaryChainId(signal.definition);
  const focus = getSignalFocusDetails(signal.definition);
  const trackingSummary = getSignalTrackingSummary(signal.definition);
  const repeatPolicySummary = describeSignalRepeatPolicy(signal.metadata?.repeat_policy);
  const scheduleSummary = getPrimaryScheduleSummary(signal.triggers);
  const signalDescription = signal.metadata?.description;

  return (
    <Card className={cn('space-y-5', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="ui-kicker">{eyebrow}</div>
          <h2 className="mt-4 font-display text-[1.9rem] leading-none text-foreground">{title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-secondary">{(description ?? signalDescription) || summary}</p>
        </div>
        <span className="ui-chip" data-tone={signal.is_active ? 'accent' : undefined}>
          {signal.is_active ? 'Active' : 'Paused'}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="ui-stat">
          <p className="ui-stat-label">Targeting</p>
          <p className="mt-2 text-sm text-foreground">{primaryChainId !== null ? `Chain ${primaryChainId}` : 'Explicit per-condition targeting'}</p>
          <p className="mt-1 text-xs text-secondary">Target fields live on each condition, not on `definition.scope`.</p>
        </div>
        <div className="ui-stat">
          <p className="ui-stat-label">Wake-up</p>
          <p className="mt-2 text-sm text-foreground">{scheduleSummary}</p>
          <p className="mt-1 text-xs text-secondary">{repeatPolicySummary}</p>
        </div>
        <div className="ui-stat">
          <p className="ui-stat-label">{focus.label}</p>
          <p className="mt-2 break-all font-mono text-xs text-foreground">{focus.value}</p>
          {focus.href ? (
            <a
              href={focus.href}
              target="_blank"
              rel="noreferrer"
              className="ui-link mt-3 inline-flex text-xs no-underline"
            >
              Open monitored market
            </a>
          ) : focus.hint ? (
            <p className="mt-3 text-xs text-secondary">{focus.hint}</p>
          ) : null}
        </div>
        <div className="ui-stat">
          <p className="ui-stat-label">Trigger Logic</p>
          <p className="mt-2 text-sm text-foreground">{logic}</p>
          <p className="mt-1 text-xs text-secondary">{conditionCount} top-level conditions</p>
        </div>
        <div className="ui-stat xl:col-span-4">
          <p className="ui-stat-label">Tracking</p>
          <p className="mt-2 text-sm text-foreground">{trackingSummary}</p>
          <p className="mt-1 text-xs text-secondary">Window {signal.definition.window.duration}</p>
        </div>
      </div>

      {showTimestamps ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="ui-stat">
            <p className="ui-stat-label">Created</p>
            <p className="mt-2 text-sm text-foreground">{formatTimestamp(signal.created_at)}</p>
          </div>
          <div className="ui-stat">
            <p className="ui-stat-label">Updated</p>
            <p className="mt-2 text-sm text-foreground">{formatTimestamp(signal.updated_at)}</p>
          </div>
          <div className="ui-stat">
            <p className="ui-stat-label">Last Trigger</p>
            <p className="mt-2 text-sm text-foreground">{formatTimestamp(signal.last_triggered_at)}</p>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-foreground">Raw DSL</p>
          <span className="text-xs text-secondary">JSON definition sent to Iruka</span>
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
