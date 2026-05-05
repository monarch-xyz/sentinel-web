import Link from 'next/link';
import type { SignalPlanLimits } from '@/lib/types/signal';

interface SignalComplexityIndicatorProps {
  limits: SignalPlanLimits | null;
}

const formatPercent = (used: number, limit: number) => {
  if (limit <= 0) {
    return '—';
  }

  return `${Math.min(999, Math.round((used / limit) * 100))}%`;
};

export function SignalComplexityIndicator({ limits }: SignalComplexityIndicatorProps) {
  if (!limits) {
    return null;
  }

  const { used, limit } = limits.active_complexity;
  const isOverLimit = used > limit;

  return (
    <div className="ui-panel-ghost max-w-xl px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="ui-stat-label">Signal Credits</p>
          <p className="mt-2 text-sm text-secondary">
            {used} / {limit} active complexity units · {limits.plan.name}
          </p>
        </div>
        <span className="ui-chip" data-tone={isOverLimit ? 'danger' : 'accent'}>
          {formatPercent(used, limit)} used
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-secondary">
        Scheduled signals use credits based on interval and provider work.{' '}
        <Link href={limits.complexity_formula.docs_url} className="ui-link no-underline">
          Usage limits
        </Link>
      </p>
    </div>
  );
}
