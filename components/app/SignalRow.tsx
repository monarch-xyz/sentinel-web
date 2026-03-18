import Link from 'next/link';
import { SignalRowMenu } from '@/components/app/SignalRowMenu';
import { countTrackedWallets, describeSignalDefinition, getSignalMarketId } from '@/lib/signals/templates';
import { SignalRecord } from '@/lib/types/signal';

interface SignalRowProps {
  signal: SignalRecord;
}

export function SignalRow({ signal }: SignalRowProps) {
  const trackedWallets = countTrackedWallets(signal.definition);
  const marketId = getSignalMarketId(signal.definition);
  const summary = describeSignalDefinition(signal.definition);
  const updatedAt = new Date(signal.updated_at).toLocaleString();
  const lastTriggeredAt = signal.last_triggered_at ? new Date(signal.last_triggered_at).toLocaleString() : '—';

  return (
    <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-[minmax(0,2fr)_0.8fr_0.95fr_0.95fr_auto] sm:items-start">
      <div className="min-w-0">
        <Link
          href={`/signals/${signal.id}`}
          className="font-zen text-lg text-foreground transition-colors hover:text-[#ff6b35] no-underline"
        >
          {signal.name}
        </Link>
        <p className="text-sm text-secondary mt-1">{summary}</p>
        <p className="text-xs text-secondary mt-2">
          Market: <span className="font-mono">{marketId}</span> {trackedWallets > 0 ? `· ${trackedWallets} wallets` : ''}
        </p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-secondary">Status</p>
        <p className={signal.is_active ? 'text-[#ff6b35]' : 'text-secondary'}>
          {signal.is_active ? 'Active' : 'Paused'}
        </p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-secondary">Last Trigger</p>
        <p className="text-sm text-secondary">{lastTriggeredAt}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-secondary">Updated</p>
        <p className="text-sm text-secondary">{updatedAt}</p>
      </div>
      <div className="sm:justify-self-end">
        <SignalRowMenu signalId={signal.id} signalName={signal.name} />
      </div>
    </div>
  );
}
