import { RiAlarmWarningLine, RiFlashlightLine, RiPulseLine } from 'react-icons/ri';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/app/StatCard';
import { SignalRow } from '@/components/app/SignalRow';

const mockSignals = [
  {
    id: 'sig_abc123',
    name: 'Net Supply Drop',
    is_active: true,
    last_triggered: '2026-02-18T15:30:00Z',
    trigger_count: 3,
  },
  {
    id: 'sig_def456',
    name: 'High Utilization',
    is_active: true,
    last_triggered: '2026-02-18T11:05:00Z',
    trigger_count: 1,
  },
  {
    id: 'sig_ghi789',
    name: 'Liquidation Spike',
    is_active: false,
    last_triggered: null,
    trigger_count: 0,
  },
];

export default function AppHome() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-secondary mb-2">Overview</p>
          <h1 className="font-zen text-3xl sm:text-4xl font-semibold">Signal Command</h1>
          <p className="text-secondary mt-2 max-w-xl">
            Monitor live alerts, tune thresholds, and keep your triggers aligned with the market.
          </p>
        </div>
        <Link href="/app/signals/new" className="no-underline">
          <Button size="lg" className="gap-2">
            <RiAlarmWarningLine className="w-5 h-5" />
            New Signal
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Active Signals" value="2" icon={<RiFlashlightLine className="w-5 h-5" />} />
        <StatCard label="Total Triggers" value="4" icon={<RiPulseLine className="w-5 h-5" />} />
        <StatCard label="Chains" value="7" icon={<RiAlarmWarningLine className="w-5 h-5" />} />
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="font-zen text-xl font-semibold">Your Signals</h2>
            <p className="text-secondary text-sm">Keep watch over the signals that power your alerts.</p>
          </div>
          <Button variant="secondary">Filter</Button>
        </div>

        <div className="space-y-4">
          {mockSignals.map((signal) => (
            <SignalRow key={signal.id} signal={signal} />
          ))}
        </div>
      </div>
    </div>
  );
}
